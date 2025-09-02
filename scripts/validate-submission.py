#!/usr/bin/env python3
"""
Strict Submission Validation for Billion Row Challenge
Validates submissions for format compliance and correctness
"""

import sys
import re
import json
import argparse
import os
import subprocess
import time
from pathlib import Path
from collections import defaultdict
import math

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class SubmissionValidator:
    def __init__(self, strict_mode=True):
        self.strict_mode = strict_mode
        self.errors = []
        self.warnings = []
        
    def add_error(self, message):
        """Add a validation error"""
        self.errors.append(message)
        if self.strict_mode:
            raise ValidationError(message)
    
    def add_warning(self, message):
        """Add a validation warning"""
        self.warnings.append(message)
    
    def validate_output_format(self, output_content):
        """Validate the exact output format required"""
        lines = output_content.strip().split('\n')
        
        if not lines or lines == ['']:
            self.add_error("Output is empty")
            return False
        
        # Check format: {station}={min}/{mean}/{max}
        format_pattern = re.compile(r'^([^=]+)=(-?\d+\.?\d*)/(-?\d+\.?\d*)/(-?\d+\.?\d*)$')
        
        valid_lines = 0
        stations = []
        seen_stations = set()
        
        for i, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                self.add_error(f"Line {i}: Empty line not allowed")
                continue
            
            match = format_pattern.match(line)
            if not match:
                self.add_error(f"Line {i}: Invalid format '{line}'. Expected: station=min/mean/max")
                continue
            
            station, min_str, mean_str, max_str = match.groups()
            
            # Check for duplicate stations
            if station in seen_stations:
                self.add_error(f"Line {i}: Duplicate station '{station}'")
                continue
            seen_stations.add(station)
            stations.append(station)
            
            # Validate temperature values
            try:
                min_temp = float(min_str)
                mean_temp = float(mean_str)
                max_temp = float(max_str)
                
                # Check temperature relationships
                if min_temp > mean_temp:
                    self.add_error(f"Line {i}: min ({min_temp}) > mean ({mean_temp}) for station '{station}'")
                    continue
                if mean_temp > max_temp:
                    self.add_error(f"Line {i}: mean ({mean_temp}) > max ({max_temp}) for station '{station}'")
                    continue
                if min_temp > max_temp:
                    self.add_error(f"Line {i}: min ({min_temp}) > max ({max_temp}) for station '{station}'")
                    continue
                
                # Check temperature ranges (reasonable bounds)
                if min_temp < -100 or max_temp > 100:
                    self.add_warning(f"Line {i}: Extreme temperature values for station '{station}'")
                
                valid_lines += 1
                
            except ValueError:
                self.add_error(f"Line {i}: Invalid temperature values for station '{station}'")
                continue
        
        # Check if we have any valid output
        if valid_lines == 0:
            self.add_error("No valid output lines found")
            return False
        
        # Check alphabetical ordering
        station_list = sorted(stations)
        if list(stations) != station_list:
            self.add_error(f"Stations are not in alphabetical order. Got: {list(stations)}, Expected: {station_list}")
            return False
        
        return True
    
    def validate_against_input(self, output_content, input_file):
        """Validate output against input data"""
        if not os.path.exists(input_file):
            self.add_warning(f"Input file not found: {input_file}")
            return True
        
        # Parse input data
        input_stations = defaultdict(list)
        try:
            with open(input_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if '=' in line:
                        station, temp_str = line.split('=', 1)
                        try:
                            temp = float(temp_str)
                            input_stations[station].append(temp)
                        except ValueError:
                            continue
        except Exception as e:
            self.add_warning(f"Could not read input file: {e}")
            return True
        
        # Parse output data
        output_stations = {}
        for line in output_content.strip().split('\n'):
            if '=' in line and '/' in line:
                parts = line.split('=')
                if len(parts) == 2:
                    station = parts[0]
                    temp_parts = parts[1].split('/')
                    if len(temp_parts) == 3:
                        try:
                            min_temp, mean_temp, max_temp = map(float, temp_parts)
                            output_stations[station] = {
                                'min': min_temp,
                                'mean': mean_temp,
                                'max': max_temp
                            }
                        except ValueError:
                            continue
        
        # Validate each station
        for station, temps in input_stations.items():
            if station not in output_stations:
                self.add_error(f"Station '{station}' missing from output")
                continue
            
            expected_min = min(temps)
            expected_max = max(temps)
            expected_mean = sum(temps) / len(temps)
            
            output_data = output_stations[station]
            
            # Check with small tolerance for floating point precision
            tolerance = 0.1
            
            if abs(output_data['min'] - expected_min) > tolerance:
                self.add_error(f"Station '{station}': min mismatch. Expected {expected_min}, got {output_data['min']}")
            
            if abs(output_data['max'] - expected_max) > tolerance:
                self.add_error(f"Station '{station}': max mismatch. Expected {expected_max}, got {output_data['max']}")
            
            if abs(output_data['mean'] - expected_mean) > tolerance:
                self.add_error(f"Station '{station}': mean mismatch. Expected {expected_mean:.1f}, got {output_data['mean']:.1f}")
        
        # Check for extra stations in output
        for station in output_stations:
            if station not in input_stations:
                self.add_error(f"Station '{station}' in output but not in input")
        
        return len(self.errors) == 0
    
    def validate_solution_execution(self, solution_file, language, timeout=30):
        """Validate that solution can be executed"""
        try:
            start_time = time.time()
            
            if language == "python":
                result = subprocess.run([sys.executable, solution_file], 
                                      capture_output=True, text=True, timeout=timeout)
            elif language == "java":
                # Compile first
                compile_result = subprocess.run(["javac", solution_file], 
                                              capture_output=True, text=True)
                if compile_result.returncode != 0:
                    self.add_error(f"Java compilation failed: {compile_result.stderr}")
                    return False, 0
                
                # Run compiled class
                class_name = os.path.splitext(os.path.basename(solution_file))[0]
                class_dir = os.path.dirname(solution_file)
                result = subprocess.run(["java", "-cp", class_dir, class_name], 
                                      capture_output=True, text=True, timeout=timeout)
            elif language == "cpp":
                # Compile first
                output_file = solution_file.replace('.cpp', '.out')
                compile_result = subprocess.run(["g++", "-O2", "-o", output_file, solution_file], 
                                              capture_output=True, text=True)
                if compile_result.returncode != 0:
                    self.add_error(f"C++ compilation failed: {compile_result.stderr}")
                    return False, 0
                
                # Run compiled binary
                result = subprocess.run([f"./{output_file}"], 
                                      capture_output=True, text=True, timeout=timeout)
            elif language == "go":
                result = subprocess.run(["go", "run", solution_file], 
                                      capture_output=True, text=True, timeout=timeout)
            else:
                self.add_error(f"Unsupported language: {language}")
                return False, 0
            
            execution_time = time.time() - start_time
            
            if result.returncode != 0:
                self.add_error(f"Solution execution failed with return code {result.returncode}")
                if result.stderr:
                    self.add_error(f"Error output: {result.stderr}")
                return False, 0
            
            return True, execution_time
            
        except subprocess.TimeoutExpired:
            self.add_error(f"Solution timed out after {timeout} seconds")
            return False, 0
        except Exception as e:
            self.add_error(f"Error executing solution: {e}")
            return False, 0
    
    def validate_submission(self, solution_file, language, input_file=None):
        """Complete submission validation"""
        print(f"🔍 Validating {language} submission: {solution_file}")
        
        # Check file exists
        if not os.path.exists(solution_file):
            self.add_error(f"Solution file not found: {solution_file}")
            return False
        
        # Execute solution
        success, execution_time = self.validate_solution_execution(solution_file, language)
        if not success:
            return False
        
        # Get output
        try:
            if language == "python":
                result = subprocess.run([sys.executable, solution_file], 
                                      capture_output=True, text=True, timeout=30)
            elif language == "java":
                class_name = os.path.splitext(os.path.basename(solution_file))[0]
                class_dir = os.path.dirname(solution_file)
                result = subprocess.run(["java", "-cp", class_dir, class_name], 
                                      capture_output=True, text=True, timeout=30)
            elif language == "cpp":
                output_file = solution_file.replace('.cpp', '.out')
                result = subprocess.run([f"./{output_file}"], 
                                      capture_output=True, text=True, timeout=30)
            elif language == "go":
                result = subprocess.run(["go", "run", solution_file], 
                                      capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                self.add_error(f"Solution execution failed")
                return False
            
            output_content = result.stdout
            
        except Exception as e:
            self.add_error(f"Error getting solution output: {e}")
            return False
        
        # Validate output format
        if not self.validate_output_format(output_content):
            return False
        
        # Validate against input if provided
        if input_file and os.path.exists(input_file):
            if not self.validate_against_input(output_content, input_file):
                return False
        
        print(f"✅ Validation passed! Execution time: {execution_time:.3f}s")
        return True

def main():
    parser = argparse.ArgumentParser(description="Validate Billion Row Challenge submissions")
    parser.add_argument("solution_file", help="Path to solution file")
    parser.add_argument("--language", required=True, choices=["python", "java", "cpp", "go"],
                       help="Programming language")
    parser.add_argument("--input", help="Input data file for validation")
    parser.add_argument("--strict", action="store_true", default=True,
                       help="Strict validation mode (default: True)")
    parser.add_argument("--timeout", type=int, default=30,
                       help="Execution timeout in seconds (default: 30)")
    
    args = parser.parse_args()
    
    validator = SubmissionValidator(strict_mode=args.strict)
    
    try:
        success = validator.validate_submission(
            args.solution_file, 
            args.language, 
            args.input
        )
        
        if success:
            print("🎉 Submission validation PASSED!")
            sys.exit(0)
        else:
            print("❌ Submission validation FAILED!")
            for error in validator.errors:
                print(f"  ERROR: {error}")
            for warning in validator.warnings:
                print(f"  WARNING: {warning}")
            sys.exit(1)
            
    except ValidationError as e:
        print(f"❌ Validation error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
