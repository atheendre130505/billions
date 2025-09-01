#!/usr/bin/env python3

import sys

def main():
    stations = {}
    
    try:
        with open('data/test_measurements.txt', 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                    
                parts = line.split('=')
                if len(parts) == 2:
                    station = parts[0]
                    temp = float(parts[1])
                    
                    if station not in stations:
                        stations[station] = []
                    stations[station].append(temp)
        
        # Sort stations alphabetically
        for station in sorted(stations.keys()):
            temps = stations[station]
            min_temp = min(temps)
            max_temp = max(temps)
            mean_temp = sum(temps) / len(temps)
            
            print(f"{station}={min_temp:.1f}/{mean_temp:.1f}/{max_temp:.1f}")
            
    except FileNotFoundError:
        print("Error: data file not found", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
