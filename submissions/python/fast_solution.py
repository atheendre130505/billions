#!/usr/bin/env python3
"""
Billion Row Challenge - Fast Python Solution
Simple and efficient approach
"""

import sys
import os

def main():
    stations = {}
    
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
                
                if station not in stations:
                    stations[station] = {'min': temp, 'max': temp, 'sum': temp, 'count': 1}
                else:
                    data = stations[station]
                    if temp < data['min']:
                        data['min'] = temp
                    if temp > data['max']:
                        data['max'] = temp
                    data['sum'] += temp
                    data['count'] += 1
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
            
            if station not in stations:
                stations[station] = {'min': temp, 'max': temp, 'sum': temp, 'count': 1}
            else:
                data = stations[station]
                if temp < data['min']:
                    data['min'] = temp
                if temp > data['max']:
                    data['max'] = temp
                data['sum'] += temp
                data['count'] += 1
    
    # Output results
    for station in sorted(stations.keys()):
        data = stations[station]
        mean = data['sum'] / data['count']
        print(f"{station}={data['min']:.1f}/{mean:.1f}/{data['max']:.1f}")

if __name__ == "__main__":
    main()
