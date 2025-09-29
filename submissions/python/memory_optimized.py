#!/usr/bin/env python3
"""
Billion Row Challenge - Memory Optimized Python Solution
Uses minimal memory footprint with streaming approach
"""

import sys
import os
from collections import defaultdict

def main():
    # Use defaultdict with tuple for minimal memory overhead
    stations = defaultdict(lambda: (float('inf'), float('-inf'), 0.0, 0))
    
    # Try to find input file automatically
    input_files = ['data/measurements_1m.txt', 'data/measurements.txt', 'data/test_measurements.txt']
    input_file = None
    
    for file_path in input_files:
        if os.path.exists(file_path):
            input_file = file_path
            break
    
    if input_file:
        # Read from file
        with open(input_file, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or '=' not in line:
                    continue
                    
                station, temp_str = line.split('=', 1)
                try:
                    temp = float(temp_str)
                except ValueError:
                    continue
                
                # Update statistics efficiently
                min_temp, max_temp, sum_temp, count = stations[station]
                
                if temp < min_temp:
                    min_temp = temp
                if temp > max_temp:
                    max_temp = temp
                
                stations[station] = (min_temp, max_temp, sum_temp + temp, count + 1)
    else:
        # Fallback: read from stdin
        for line in sys.stdin:
            line = line.strip()
            if not line or '=' not in line:
                continue
                
            station, temp_str = line.split('=', 1)
            try:
                temp = float(temp_str)
            except ValueError:
                continue
            
            # Update statistics efficiently
            min_temp, max_temp, sum_temp, count = stations[station]
            
            if temp < min_temp:
                min_temp = temp
            if temp > max_temp:
                max_temp = temp
            
            stations[station] = (min_temp, max_temp, sum_temp + temp, count + 1)
    
    # Output results in alphabetical order
    for station in sorted(stations.keys()):
        min_temp, max_temp, sum_temp, count = stations[station]
        mean_temp = sum_temp / count
        
        # Format output as required: station=min/mean/max
        print(f"{station}={min_temp:.1f}/{mean_temp:.1f}/{max_temp:.1f}")

if __name__ == "__main__":
    main()
