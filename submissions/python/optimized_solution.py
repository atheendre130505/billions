#!/usr/bin/env python3
"""
Billion Row Challenge - Highly Optimized Python Solution
Uses memory-efficient approach with minimal overhead
"""

import sys
from collections import defaultdict

def main():
    # Use defaultdict for efficient storage with tuple (min, max, sum, count)
    stations = defaultdict(lambda: [float('inf'), float('-inf'), 0.0, 0])
    
    # Read from stdin (standard input)
    try:
        for line in sys.stdin:
            line = line.strip()
            if not line or '=' not in line:
                continue
                
            station, temp_str = line.split('=', 1)
            try:
                temp = float(temp_str)
            except ValueError:
                continue
            
            # Update statistics efficiently using list unpacking
            min_temp, max_temp, sum_temp, count = stations[station]
            
            if temp < min_temp:
                min_temp = temp
            if temp > max_temp:
                max_temp = temp
            
            stations[station] = [min_temp, max_temp, sum_temp + temp, count + 1]
    
    except (EOFError, KeyboardInterrupt):
        pass  # End of input
    
    # Calculate and output results in alphabetical order
    for station in sorted(stations.keys()):
        min_temp, max_temp, sum_temp, count = stations[station]
        mean_temp = sum_temp / count
        
        # Format output as required: station=min/mean/max
        print(f"{station}={min_temp:.1f}/{mean_temp:.1f}/{max_temp:.1f}")

if __name__ == "__main__":
    main()
