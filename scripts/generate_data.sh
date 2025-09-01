#!/bin/bash

# Generate Test Data Script
# Creates sample data files of various sizes for testing

set -e

echo "Generating test data..."

# Small test file (10 entries)
cat > data/test_10.txt << 'END'
Abha=-23.0/18.0/59.2
Bangkok=20.7/26.3/30.4
Cairo=7.2/20.7/33.9
Denver=-31.1/8.9/36.4
Edmonton=-49.1/4.1/23.1
Fresno=9.9/18.4/42.8
Geneva=1.2/10.8/24.3
Hamburg=-9.4/9.4/23.0
Istanbul=6.2/13.9/27.8
Jakarta=23.1/26.7/31.2
END

# Medium test file (1000 entries)
echo "Generating medium test file (1000 entries)..."
python3 -c "
import random
import string

stations = []
for i in range(1000):
    name = ''.join(random.choices(string.ascii_uppercase, k=6))
    temp = random.uniform(-50, 50)
    stations.append(f'{name}={temp:.1f}')

with open('data/test_1000.txt', 'w') as f:
    for station in sorted(stations):
        f.write(station + '\n')
"

# Large test file (100,000 entries)
echo "Generating large test file (100,000 entries)..."
python3 -c "
import random
import string

stations = []
for i in range(100000):
    name = ''.join(random.choices(string.ascii_uppercase, k=6))
    temp = random.uniform(-50, 50)
    stations.append(f'{name}={temp:.1f}')

with open('data/test_100k.txt', 'w') as f:
    for station in sorted(stations):
        f.write(station + '\n')
"

echo "Test data generated:"
echo "  - data/test_10.txt (10 entries)"
echo "  - data/test_1000.txt (1000 entries)"
echo "  - data/test_100k.txt (100,000 entries)"
