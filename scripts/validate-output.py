#!/usr/bin/env python3
"""
Tournament Output Validation Script
Validates submission outputs for correctness and format compliance

Usage: python3 scripts/validate-output.py <output-file> [--input <input-file>] [--verbose]
"""

import sys
import re
import json
import argparse
import os
from pathlib import Path
from collections import defaultdict
import math

# Colors for output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

def print_status(message):
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {message}")

def print_success(message):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")

def print_warning(message):
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")

def print_error(message):
    print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")

def print_header(message):
    print(f"{Colors.PURPLE}[HEADER]{Colors.NC} {message}")

def print_result(message):
    print(f"{Colors.CYAN}[RESULT]{Colors.NC} {message}")

def load_input_data(input_file):
    """Load and parse input data file"""
    if not input_file or not os.path.exists(input_file):
        return None
    
    print_status(f"Loading input data from: {input_file}")
    
    stations = defaultdict(list)
    total_measurements = 0
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                
                # Parse: StationName=Temperature
                if '=' in line:
                    parts = line.split('=', 1)
                    if len(parts) == 2:
                        station, temp_str = parts
                        try:
                            temp = float(temp_str)
                            stations[station].append(temp)
                            total_measurements += 1
                        except ValueError:
                            print_warning(f"Invalid temperature in input line {line_num}: {temp_str}")
                    else:
                        print_warning(f"Invalid format in input line {line_num}: {line}")
                else:
                    print_warning(f"Missing separator in input line {line_num}: {line}")
        
        print_success(f"Loaded {total_measurements:,} measurements from {len(stations)} stations")
        return stations, total_measurements
        
    except Exception as e:
        print_error(f"Error loading input data: {e}")
        return None

def parse_output_format(output_content):
    """Parse the output format and extract station statistics"""
    
    print_status("Parsing output format...")
    
    # Remove whitespace and check basic structure
    content = output_content.strip()
    
    # Check if output is wrapped in curly braces
    if not content.startswith('{') or not content.endswith('}'):
        print_error("Output must be wrapped in curly braces")
        return None
    
    # Remove braces and split by commas
    try:
        entries = content[1:-1].split(', ')
    except Exception as e:
        print_error(f"Failed to parse output structure: {e}")
        return None
    
    if not entries or entries[0] == '':
        print_error("Output contains no valid entries")
        return None
    
    print_success(f"Found {len(entries)} station entries")
    
    # Parse each entry
    station_stats = {}
    parse_errors = 0
    
    for i, entry in enumerate(entries):
        # Each entry should be: StationName=min/mean/max
        if not re.match(r'^[^=]+=[-+]?\d+\.\d+/[-+]?\d+\.\d+/[-+]?\d+\.\d+$', entry):
            print_error(f"Invalid entry format at position {i+1}: {entry}")
            parse_errors += 1
            continue
        
        try:
            station, values = entry.split('=', 1)
            min_val, mean_val, max_val = map(float, values.split('/'))
            
            # Validate statistical relationships
            if min_val > mean_val:
                print_error(f"Invalid statistics for {station}: min ({min_val}) > mean ({mean_val})")
                parse_errors += 1
                continue
            
            if mean_val > max_val:
                print_error(f"Invalid statistics for {station}: mean ({mean_val}) > max ({max_val})")
                parse_errors += 1
                continue
            
            station_stats[station] = {
                'min': min_val,
                'mean': mean_val,
                'max': max_val
            }
            
        except Exception as e:
            print_error(f"Failed to parse entry {i+1}: {entry} - {e}")
            parse_errors += 1
    
    if parse_errors > 0:
        print_warning(f"Found {parse_errors} parsing errors")
    
    return station_stats

def validate_statistical_correctness(station_stats, input_data=None):
    """Validate that the output statistics are mathematically correct"""
    
    print_status("Validating statistical correctness...")
    
    if not input_data:
        print_warning("No input data provided, skipping statistical validation")
        return True
    
    stations, total_measurements = input_data
    validation_errors = 0
    
    for station, stats in station_stats.items():
        if station not in stations:
            print_warning(f"Station '{station}' in output not found in input data")
            continue
        
        input_temps = stations[station]
        expected_min = min(input_temps)
        expected_max = max(input_temps)
        expected_mean = sum(input_temps) / len(input_temps)
        
        # Check min value
        if abs(stats['min'] - expected_min) > 0.1:
            print_error(f"Min value mismatch for {station}: expected {expected_min}, got {stats['min']}")
            validation_errors += 1
        
        # Check max value
        if abs(stats['max'] - expected_max) > 0.1:
            print_error(f"Max value mismatch for {station}: expected {expected_max}, got {stats['max']}")
            validation_errors += 1
        
        # Check mean value (allow small floating point differences)
        if abs(stats['mean'] - expected_mean) > 0.01:
            print_error(f"Mean value mismatch for {station}: expected {expected_mean:.3f}, got {stats['mean']}")
            validation_errors += 1
    
    if validation_errors == 0:
        print_success("Statistical validation passed")
        return True
    else:
        print_error(f"Statistical validation failed with {validation_errors} errors")
        return False

def validate_format_compliance(station_stats):
    """Validate output format compliance with tournament rules"""
    
    print_status("Validating format compliance...")
    
    compliance_errors = 0
    
    # Check if we have any stations
    if not station_stats:
        print_error("No valid station entries found")
        return False
    
    # Check temperature ranges (reasonable bounds)
    for station, stats in station_stats.items():
        if not (-100 <= stats['min'] <= 100):
            print_warning(f"Min temperature for {station} ({stats['min']}) outside reasonable range")
        
        if not (-100 <= stats['max'] <= 100):
            print_warning(f"Max temperature for {station} ({stats['max']}) outside reasonable range")
        
        if not (-100 <= stats['mean'] <= 100):
            print_warning(f"Mean temperature for {station} ({stats['mean']}) outside reasonable range")
    
    # Check decimal precision (should be 1 decimal place)
    for station, stats in station_stats.items():
        for stat_name, value in stats.items():
            decimal_places = len(str(value).split('.')[-1]) if '.' in str(value) else 0
            if decimal_places > 1:
                print_warning(f"{stat_name} for {station} has {decimal_places} decimal places: {value}")
    
    print_success("Format compliance validation passed")
    return True

def generate_validation_report(station_stats, input_data=None, output_file=None):
    """Generate a comprehensive validation report"""
    
    print_status("Generating validation report...")
    
    report = {
        "validation_timestamp": None,  # Will be set below
        "output_file": output_file,
        "input_file": input_data[0] if input_data else None,
        "summary": {
            "total_stations": len(station_stats),
            "total_input_measurements": input_data[1] if input_data else None,
            "validation_status": "PASSED"
        },
        "station_details": {},
        "statistics": {
            "temperature_ranges": {},
            "station_coverage": {}
        }
    }
    
    # Add station details
    for station, stats in station_stats.items():
        report["station_details"][station] = {
            "min": stats['min'],
            "mean": stats['mean'],
            "max": stats['max'],
            "range": stats['max'] - stats['min']
        }
    
    # Calculate overall statistics
    if station_stats:
        all_temps = []
        for stats in station_stats.values():
            all_temps.extend([stats['min'], stats['mean'], stats['max'])
        
        report["statistics"]["temperature_ranges"] = {
            "global_min": min(all_temps),
            "global_max": max(all_temps),
            "global_mean": sum(all_temps) / len(all_temps)
        }
        
        if input_data:
            input_stations = set(input_data[0].keys())
            output_stations = set(station_stats.keys())
            report["statistics"]["station_coverage"] = {
                "input_stations": len(input_stations),
                "output_stations": len(output_stations),
                "coverage_percentage": (len(output_stations) / len(input_stations)) * 100 if input_stations else 0,
                "missing_stations": list(input_stations - output_stations),
                "extra_stations": list(output_stations - input_stations)
            }
    
    # Set timestamp
    from datetime import datetime
    report["validation_timestamp"] = datetime.utcnow().isoformat() + "Z"
    
    return report

def display_validation_summary(station_stats, input_data=None):
    """Display a summary of validation results"""
    
    print_header("Validation Summary")
    print("=" * 50)
    
    if not station_stats:
        print_error("No valid output data to summarize")
        return
    
    print(f"📊 Output Statistics:")
    print(f"  • Total stations: {len(station_stats):,}")
    
    if input_data:
        stations, total_measurements = input_data
        print(f"  • Input measurements: {total_measurements:,}")
        print(f"  • Input stations: {len(stations):,}")
        
        # Calculate coverage
        input_stations = set(stations.keys())
        output_stations = set(station_stats.keys())
        coverage = (len(output_stations) / len(input_stations)) * 100 if input_stations else 0
        print(f"  • Station coverage: {coverage:.1f}%")
        
        # Show missing/extra stations
        missing = input_stations - output_stations
        extra = output_stations - input_stations
        
        if missing:
            print(f"  • Missing stations: {len(missing)}")
            if len(missing) <= 5:
                print(f"    {', '.join(sorted(missing))}")
        
        if extra:
            print(f"  • Extra stations: {len(extra)}")
            if len(extra) <= 5:
                print(f"    {', '.join(sorted(extra))}")
    
    # Temperature statistics
    if station_stats:
        all_temps = []
        for stats in station_stats.values():
            all_temps.extend([stats['min'], stats['mean'], stats['max'])
        
        print(f"  • Temperature range: {min(all_temps):.1f}°C to {max(all_temps):.1f}°C")
        print(f"  • Average temperature: {sum(all_temps) / len(all_temps):.1f}°C")
    
    print()
    
    # Show sample stations
    print(f"📍 Sample Stations (first 5):")
    for i, (station, stats) in enumerate(list(station_stats.items())[:5]):
        print(f"  {i+1}. {station}: min={stats['min']:.1f}, mean={stats['mean']:.1f}, max={stats['max']:.1f}")
    
    if len(station_stats) > 5:
        print(f"  ... and {len(station_stats) - 5} more stations")

def main():
    parser = argparse.ArgumentParser(
        description="Validate tournament submission output format and correctness",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic validation
  python3 scripts/validate-output.py output.txt
  
  # Validation with input data comparison
  python3 scripts/validate-output.py output.txt --input input.txt
  
  # Verbose validation with detailed output
  python3 scripts/validate-output.py output.txt --input input.txt --verbose
  
  # Generate validation report
  python3 scripts/validate-output.py output.txt --input input.txt --report report.json
        """
    )
    
    parser.add_argument("output_file", help="Output file to validate")
    parser.add_argument("--input", "-i", help="Input data file for statistical validation")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    parser.add_argument("--report", "-r", help="Generate validation report JSON file")
    parser.add_argument("--no-color", action="store_true", help="Disable colored output")
    
    args = parser.parse_args()
    
    # Disable colors if requested
    if args.no_color:
        for attr in dir(Colors):
            if not attr.startswith('_'):
                setattr(Colors, attr, '')
    
    # Check if output file exists
    if not os.path.exists(args.output_file):
        print_error(f"Output file not found: {args.output_file}")
        sys.exit(1)
    
    print_header("Tournament Output Validation")
    print(f"🔍 Validating: {args.output_file}")
    if args.input:
        print(f"📊 Comparing with: {args.input}")
    print()
    
    try:
        # Load input data if provided
        input_data = None
        if args.input:
            input_data = load_input_data(args.input)
            if input_data is None:
                print_warning("Input data loading failed, continuing with format-only validation")
        
        # Read output file
        with open(args.output_file, 'r', encoding='utf-8') as f:
            output_content = f.read()
        
        # Parse output format
        station_stats = parse_output_format(output_content)
        if station_stats is None:
            print_error("Output format validation failed")
            sys.exit(1)
        
        # Validate format compliance
        if not validate_format_compliance(station_stats):
            print_error("Format compliance validation failed")
            sys.exit(1)
        
        # Validate statistical correctness if input data is available
        if input_data:
            if not validate_statistical_correctness(station_stats, input_data):
                print_warning("Statistical validation failed, but format is correct")
        
        # Display validation summary
        print()
        display_validation_summary(station_stats, input_data)
        
        # Generate validation report if requested
        if args.report:
            report = generate_validation_report(station_stats, input_data, args.output_file)
            
            try:
                with open(args.report, 'w', encoding='utf-8') as f:
                    json.dump(report, f, indent=2)
                print_success(f"Validation report saved to: {args.report}")
            except Exception as e:
                print_error(f"Failed to save validation report: {e}")
        
        print()
        print_success("Output validation completed successfully!")
        
        # Exit with appropriate code
        if input_data and not validate_statistical_correctness(station_stats, input_data):
            sys.exit(1)  # Statistical validation failed
        else:
            sys.exit(0)  # All validations passed
            
    except KeyboardInterrupt:
        print("\n❌ Validation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Validation error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()









