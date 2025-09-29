#!/usr/bin/env python3
"""
Test Solution for Billion Row Challenge
Optimized for million-row testing and leaderboard demonstration
"""

import sys
import os
from collections import defaultdict
import time

def main():
    start_time = time.time()
    stations = defaultdict(lambda: {'min': float('inf'), 'max': float('-inf'), 'sum': 0.0, 'count': 0})
    
    # Determine input source
    input_source = None
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        # File input provided
        input_source = open(sys.argv[1], 'r')
        input_type = "file"
    elif not sys.stdin.isatty():
        # Stdin input
        input_source = sys.stdin
        input_type = "stdin"
    else:
        # Try to find test file
        test_files = ['data/measurements_1m.txt', 'data/measurements.txt', 'data/test_measurements.txt']
        for file_path in test_files:
            if os.path.exists(file_path):
                input_source = open(file_path, 'r')
                input_type = "file"
                break
        
        if input_source is None:
            print("Error: No input source found", file=sys.stderr)
            sys.exit(1)
    
    try:
        # Process input
        line_count = 0
        for line in input_source:
            line = line.strip()
            if not line or '=' not in line:
                continue
                
            station, temp_str = line.split('=', 1)
            try:
                temp = float(temp_str)
            except ValueError:
                continue
            
            # Update statistics
            data = stations[station]
            if temp < data['min']:
                data['min'] = temp
            if temp > data['max']:
                data['max'] = temp
            data['sum'] += temp
            data['count'] += 1
            line_count += 1
            
            # Progress indicator for large datasets
            if line_count % 100000 == 0:
                print(f"Processed {line_count:,} lines...", file=sys.stderr)
    
    except (EOFError, KeyboardInterrupt):
        pass
    finally:
        if input_source != sys.stdin:
            input_source.close()
    
    # Calculate and output results
    processing_time = time.time() - start_time
    
    # Output results in alphabetical order
    for station in sorted(stations.keys()):
        data = stations[station]
        mean_temp = data['sum'] / data['count']
        print(f"{station}={data['min']:.1f}/{mean_temp:.1f}/{data['max']:.1f}")
    
    # Output performance stats to stderr for leaderboard
    print(f"# Performance: {processing_time:.3f}s, {line_count:,} lines, {len(stations)} stations", file=sys.stderr)

if __name__ == "__main__":
    main()
