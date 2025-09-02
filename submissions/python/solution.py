#!/usr/bin/env python3
"""
Billion Row Challenge - Optimized Python Solution
Processes temperature measurements and calculates min, mean, max for each station.
"""

import sys
import os
from collections import defaultdict

def main():
    # Use defaultdict for efficient storage
    stations = defaultdict(lambda: {'min': float('inf'), 'max': float('-inf'), 'sum': 0.0, 'count': 0})
    
    # Check if stdin has data (for testing with pipes/redirection)
    import select
    has_stdin_data = False
    if sys.stdin.isatty() == False:  # Not a terminal, likely has input
        has_stdin_data = True
    
    if has_stdin_data:
        # Read from stdin (when input is piped/redirected)
        try:
            for line in sys.stdin:
                line = line.strip()
                if not line:
                    continue
                    
                # Parse station=temperature format
                if '=' not in line:
                    continue
                    
                station, temp_str = line.split('=', 1)
                try:
                    temp = float(temp_str)
                except ValueError:
                    continue
                
                # Update statistics efficiently
                if temp < stations[station]['min']:
                    stations[station]['min'] = temp
                if temp > stations[station]['max']:
                    stations[station]['max'] = temp
                stations[station]['sum'] += temp
                stations[station]['count'] += 1
        except (EOFError, KeyboardInterrupt):
            pass  # End of input
    else:
        # Read from file (when run directly)
        input_files = ['data/measurements_1m.txt', 'data/measurements.txt', 'data/test_measurements.txt']
        input_file = None
        
        for file_path in input_files:
            if os.path.exists(file_path):
                input_file = file_path
                break
        
        if input_file:
            try:
                with open(input_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if not line:
                            continue
                            
                        # Parse station=temperature format
                        if '=' not in line:
                            continue
                            
                        station, temp_str = line.split('=', 1)
                        try:
                            temp = float(temp_str)
                        except ValueError:
                            continue
                        
                        # Update statistics efficiently
                        if temp < stations[station]['min']:
                            stations[station]['min'] = temp
                        if temp > stations[station]['max']:
                            stations[station]['max'] = temp
                        stations[station]['sum'] += temp
                        stations[station]['count'] += 1
            except Exception as e:
                print(f"Error reading file: {e}", file=sys.stderr)
                sys.exit(1)
        else:
            print("Error: No input file found and no stdin data", file=sys.stderr)
            sys.exit(1)
    
    # Calculate and output results in alphabetical order
    for station in sorted(stations.keys()):
        data = stations[station]
        min_temp = data['min']
        max_temp = data['max']
        mean_temp = data['sum'] / data['count']
        
        # Format output as required: station=min/mean/max
        print(f"{station}={min_temp:.1f}/{mean_temp:.1f}/{max_temp:.1f}")

if __name__ == "__main__":
    main()
