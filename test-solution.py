#!/usr/bin/env python3
"""
Simple test script for Billion Row Challenge solutions
"""

import subprocess
import sys
import os
import time

def test_solution(language, solution_file):
    """Test a solution and measure execution time"""
    print(f"🧪 Testing {language} solution: {solution_file}")
    
    if not os.path.exists(solution_file):
        print(f"❌ Solution file not found: {solution_file}")
        return False
    
    # Check if data file exists
    data_file = "data/test_measurements.txt"
    if not os.path.exists(data_file):
        print(f"❌ Data file not found: {data_file}")
        return False
    
    try:
        # Run the solution and measure time
        start_time = time.time()
        
        if language == "python":
            result = subprocess.run([sys.executable, solution_file], 
                                  capture_output=True, text=True, timeout=30)
        elif language == "java":
            # Compile first
            compile_result = subprocess.run(["javac", solution_file], 
                                          capture_output=True, text=True)
            if compile_result.returncode != 0:
                print(f"❌ Compilation failed: {compile_result.stderr}")
                return False
            
            # Run compiled class
            class_name = os.path.splitext(os.path.basename(solution_file))[0]
            class_dir = os.path.dirname(solution_file)
            result = subprocess.run(["java", "-cp", class_dir, class_name], 
                                  capture_output=True, text=True, timeout=30)
        elif language == "cpp":
            # Compile first
            output_file = solution_file.replace('.cpp', '.out')
            compile_result = subprocess.run(["g++", "-o", output_file, solution_file], 
                                          capture_output=True, text=True)
            if compile_result.returncode != 0:
                print(f"❌ Compilation failed: {compile_result.stderr}")
                return False
            
            # Run compiled binary
            result = subprocess.run([f"./{output_file}"], 
                                  capture_output=True, text=True, timeout=30)
        elif language == "go":
            result = subprocess.run(["go", "run", solution_file], 
                                  capture_output=True, text=True, timeout=30)
        else:
            print(f"❌ Unsupported language: {language}")
            return False
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        if result.returncode != 0:
            print(f"❌ Solution failed with return code {result.returncode}")
            print(f"Error: {result.stderr}")
            return False
        
        # Validate output format
        output_lines = result.stdout.strip().split('\n')
        valid_lines = 0
        
        for line in output_lines:
            if '=' in line and '/' in line:
                parts = line.split('=')
                if len(parts) == 2:
                    station = parts[0]
                    temp_parts = parts[1].split('/')
                    if len(temp_parts) == 3:
                        try:
                            min_temp = float(temp_parts[0])
                            mean_temp = float(temp_parts[1])
                            max_temp = float(temp_parts[2])
                            if min_temp <= mean_temp <= max_temp:
                                valid_lines += 1
                        except ValueError:
                            pass
        
        print(f"✅ Solution executed successfully!")
        print(f"⏱️  Execution time: {execution_time:.3f} seconds")
        print(f"📊 Valid output lines: {valid_lines}/{len(output_lines)}")
        print(f"📝 Output preview:")
        for line in output_lines[:5]:  # Show first 5 lines
            print(f"   {line}")
        if len(output_lines) > 5:
            print(f"   ... and {len(output_lines) - 5} more lines")
        
        return True
        
    except subprocess.TimeoutExpired:
        print(f"❌ Solution timed out after 30 seconds")
        return False
    except Exception as e:
        print(f"❌ Error running solution: {e}")
        return False

def main():
    print("🏆 Billion Row Challenge - Solution Tester")
    print("=" * 50)
    
    # Test Python solution
    test_solution("python", "submissions/python/solution.py")
    print()
    
    # Test Java solution
    test_solution("java", "submissions/java/Solution.java")
    print()
    
    # Test C++ solution
    test_solution("cpp", "submissions/cpp/solution.cpp")
    print()
    
    # Test Go solution
    test_solution("go", "submissions/go/solution.go")

if __name__ == "__main__":
    main()
