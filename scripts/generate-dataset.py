#!/usr/bin/env python3
"""
Billion Row Challenge Dataset Generator
Creates tournament datasets with realistic weather station data

Usage: python3 scripts/generate-dataset.py [--rows 1000000000] [--output data/measurements.txt]
"""

import random
import argparse
import os
import sys
from pathlib import Path
from datetime import datetime
import time

# Try to import tqdm for progress bars, fallback to simple progress if not available
try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False

# List of ~400 real weather station cities with realistic temperature ranges
STATIONS = [
    # Africa
    ("Abéché", -5, 45), ("Abidjan", 20, 35), ("Abuja", 18, 38), ("Accra", 22, 32),
    ("Addis Ababa", 8, 28), ("Alexandria", 8, 32), ("Algiers", 5, 35), ("Bamako", 18, 40),
    ("Bangui", 18, 35), ("Banjul", 18, 35), ("Brazzaville", 18, 32), ("Cairo", 8, 38),
    ("Casablanca", 8, 32), ("Dakar", 18, 35), ("Dar es Salaam", 18, 32), ("Djibouti", 22, 42),
    ("Durban", 8, 32), ("Freetown", 20, 32), ("Gaborone", 5, 35), ("Harare", 5, 32),
    ("Johannesburg", 2, 30), ("Kampala", 15, 30), ("Khartoum", 15, 42), ("Kigali", 12, 28),
    ("Kinshasa", 18, 32), ("Lagos", 20, 35), ("Luanda", 18, 32), ("Lusaka", 8, 32),
    ("Maputo", 12, 32), ("Marrakech", 5, 42), ("Mogadishu", 20, 35), ("Mombasa", 20, 32),
    ("Monrovia", 20, 32), ("Nairobi", 8, 28), ("Niamey", 18, 42), ("Nouakchott", 15, 38),
    ("Ouagadougou", 18, 40), ("Port Louis", 15, 30), ("Rabat", 8, 32), ("Sfax", 8, 38),
    ("Tunis", 8, 38), ("Windhoek", 2, 35), ("Yaoundé", 18, 32), ("Zanzibar", 20, 32),
    
    # Asia
    ("Abu Dhabi", 15, 45), ("Ahmedabad", 12, 42), ("Almaty", -25, 35), ("Amman", 5, 38),
    ("Ankara", -5, 35), ("Ashgabat", -10, 42), ("Astana", -35, 35), ("Baku", -5, 38),
    ("Bangkok", 18, 38), ("Beijing", -15, 35), ("Beirut", 8, 35), ("Bishkek", -20, 35),
    ("Busan", -8, 32), ("Chengdu", 2, 35), ("Chongqing", 2, 38), ("Colombo", 20, 32),
    ("Dacca", 15, 38), ("Damascus", 2, 38), ("Delhi", 8, 45), ("Dhaka", 15, 38),
    ("Dushanbe", -15, 38), ("Fukuoka", -2, 35), ("Guangzhou", 8, 38), ("Hanoi", 12, 38),
    ("Harbin", -30, 30), ("Ho Chi Minh City", 18, 38), ("Hong Kong", 8, 35), ("Hyderabad", 15, 42),
    ("Islamabad", 2, 42), ("Istanbul", -5, 35), ("Jakarta", 20, 35), ("Karachi", 12, 42),
    ("Kathmandu", -5, 30), ("Kolkata", 12, 42), ("Kuala Lumpur", 20, 35), ("Kuwait City", 8, 48),
    ("Kyoto", -5, 35), ("Lahore", 8, 45), ("Manila", 20, 35), ("Mumbai", 18, 38),
    ("Nagoya", -5, 35), ("Nanjing", -5, 38), ("New Delhi", 8, 45), ("Osaka", -5, 35),
    ("Phnom Penh", 18, 38), ("Pune", 15, 38), ("Pyongyang", -15, 32), ("Qingdao", -8, 32),
    ("Riyadh", 8, 48), ("Sapporo", -15, 28), ("Seoul", -12, 32), ("Shanghai", -5, 38),
    ("Shenzhen", 8, 35), ("Singapore", 22, 32), ("Srinagar", -8, 32), ("Surabaya", 20, 35),
    ("Taipei", 8, 35), ("Tashkent", -10, 38), ("Tehran", -5, 40), ("Tel Aviv", 8, 35),
    ("Tianjin", -10, 35), ("Tokyo", -5, 35), ("Ulaanbaatar", -35, 30), ("Vientiane", 15, 38),
    ("Vladivostok", -20, 28), ("Wuhan", -2, 38), ("Xi'an", -8, 38), ("Yangon", 15, 38),
    ("Yekaterinburg", -25, 30), ("Yerevan", -10, 35), ("Zhengzhou", -5, 38),
    
    # Europe
    ("Amsterdam", -5, 28), ("Athens", 2, 38), ("Barcelona", 2, 35), ("Belgrade", -8, 35),
    ("Berlin", -10, 32), ("Birmingham", -8, 28), ("Bratislava", -10, 32), ("Brussels", -8, 28),
    ("Bucharest", -12, 35), ("Budapest", -10, 32), ("Copenhagen", -12, 25), ("Dublin", -5, 25),
    ("Edinburgh", -8, 22), ("Frankfurt", -10, 32), ("Glasgow", -8, 22), ("Hamburg", -10, 28),
    ("Helsinki", -20, 25), ("Istanbul", -5, 35), ("Kiev", -15, 30), ("Krakow", -12, 30),
    ("Lisbon", 2, 32), ("London", -5, 28), ("Madrid", -5, 38), ("Manchester", -8, 25),
    ("Marseille", 2, 35), ("Milan", -5, 35), ("Moscow", -25, 30), ("Munich", -12, 30),
    ("Naples", 2, 35), ("Oslo", -15, 25), ("Paris", -5, 32), ("Prague", -12, 30),
    ("Riga", -20, 25), ("Rome", 2, 35), ("Rotterdam", -8, 28), ("Saint Petersburg", -20, 25),
    ("Sofia", -12, 32), ("Stockholm", -15, 25), ("Strasbourg", -8, 30), ("Tallinn", -20, 25),
    ("Thessaloniki", 2, 35), ("Tirana", -5, 35), ("Vienna", -10, 30), ("Vilnius", -20, 25),
    ("Warsaw", -15, 30), ("Wroclaw", -12, 30), ("Zagreb", -8, 32), ("Zurich", -8, 30),
    
    # North America
    ("Albuquerque", -8, 38), ("Anchorage", -25, 22), ("Atlanta", -5, 35), ("Austin", 2, 40),
    ("Baltimore", -8, 35), ("Boston", -12, 32), ("Calgary", -25, 25), ("Charlotte", -5, 35),
    ("Chicago", -15, 32), ("Cincinnati", -10, 32), ("Cleveland", -12, 30), ("Columbus", -10, 32),
    ("Dallas", 2, 40), ("Denver", -15, 35), ("Detroit", -15, 32), ("Edmonton", -25, 25),
    ("Fort Worth", 2, 40), ("Fresno", 2, 42), ("Houston", 5, 38), ("Indianapolis", -10, 32),
    ("Jacksonville", 2, 35), ("Kansas City", -12, 35), ("Las Vegas", 2, 45), ("Long Beach", 8, 32),
    ("Los Angeles", 8, 32), ("Louisville", -8, 35), ("Memphis", -5, 38), ("Mesa", 2, 45),
    ("Miami", 8, 35), ("Milwaukee", -15, 30), ("Minneapolis", -20, 30), ("Montreal", -20, 28),
    ("Nashville", -8, 35), ("New Orleans", 2, 38), ("New York", -8, 35), ("Oakland", 8, 28),
    ("Oklahoma City", -8, 38), ("Omaha", -15, 32), ("Orlando", 5, 35), ("Philadelphia", -8, 35),
    ("Phoenix", 2, 45), ("Pittsburgh", -10, 30), ("Portland", -2, 32), ("Quebec", -20, 25),
    ("Raleigh", -5, 35), ("Sacramento", 2, 40), ("San Antonio", 2, 40), ("San Diego", 8, 30),
    ("San Francisco", 8, 25), ("San Jose", 5, 32), ("Seattle", -2, 28), ("St. Louis", -10, 35),
    ("Tampa", 5, 35), ("Toronto", -15, 30), ("Tucson", 2, 42), ("Vancouver", -5, 25),
    ("Virginia Beach", -2, 35), ("Washington", -8, 35), ("Winnipeg", -25, 25),
    
    # South America
    ("Asuncion", 5, 38), ("Belo Horizonte", 8, 32), ("Bogota", 8, 25), ("Brasilia", 8, 32),
    ("Buenos Aires", -2, 35), ("Caracas", 15, 32), ("Cordoba", -2, 35), ("Curitiba", 5, 30),
    ("Fortaleza", 20, 32), ("Guayaquil", 18, 32), ("Lima", 12, 28), ("Manaus", 20, 35),
    ("Medellin", 12, 28), ("Montevideo", 2, 30), ("Porto Alegre", 5, 32), ("Quito", 8, 22),
    ("Recife", 20, 32), ("Rio de Janeiro", 15, 35), ("Salvador", 18, 32), ("Santiago", -2, 32),
    ("Sao Paulo", 8, 32), ("Valencia", 18, 35),
    
    # Oceania
    ("Adelaide", 5, 35), ("Auckland", 5, 25), ("Brisbane", 8, 32), ("Canberra", -2, 32),
    ("Christchurch", 2, 25), ("Darwin", 15, 35), ("Gold Coast", 8, 32), ("Hobart", 2, 25),
    ("Melbourne", 5, 30), ("Newcastle", 8, 30), ("Perth", 8, 35), ("Sydney", 5, 30),
    ("Wellington", 5, 22),
    
    # Additional cities for variety
    ("Barcelona", 2, 35), ("Berlin", -10, 32), ("Birmingham", -8, 28), ("Bratislava", -10, 32),
    ("Brussels", -8, 28), ("Bucharest", -12, 35), ("Budapest", -10, 32), ("Copenhagen", -12, 25),
    ("Dublin", -5, 25), ("Edinburgh", -8, 22), ("Frankfurt", -10, 32), ("Glasgow", -8, 22),
    ("Hamburg", -10, 28), ("Helsinki", -20, 25), ("Istanbul", -5, 35), ("Kiev", -15, 30),
    ("Krakow", -12, 30), ("Lisbon", 2, 32), ("London", -5, 28), ("Madrid", -5, 38),
    ("Manchester", -8, 25), ("Marseille", 2, 35), ("Milan", -5, 35), ("Moscow", -25, 30),
    ("Munich", -12, 30), ("Naples", 2, 35), ("Oslo", -15, 25), ("Paris", -5, 32),
    ("Prague", -12, 30), ("Riga", -20, 25), ("Rome", 2, 35), ("Rotterdam", -8, 28),
    ("Saint Petersburg", -20, 25), ("Sofia", -12, 32), ("Stockholm", -15, 25), ("Strasbourg", -8, 30),
    ("Tallinn", -20, 25), ("Thessaloniki", 2, 35), ("Tirana", -5, 35), ("Vienna", -10, 30),
    ("Vilnius", -20, 25), ("Warsaw", -15, 30), ("Wroclaw", -12, 30), ("Zagreb", -8, 32),
    ("Zurich", -8, 30)
]

def generate_measurements(num_rows, output_file, seed=None, compress=False):
    """Generate random temperature measurements with realistic distribution"""
    
    if seed is not None:
        random.seed(seed)
    
    # Create output directory if it doesn't exist
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"🌍 Generating {num_rows:,} temperature measurements...")
    print(f"📍 Using {len(STATIONS)} weather stations")
    print(f"📁 Output file: {output_file}")
    print(f"🔒 Seed: {seed if seed else 'Random'}")
    print(f"🗜️  Compression: {'Yes' if compress else 'No'}")
    print()
    
    start_time = time.time()
    
    # Generate measurements
    with open(output_file, 'w', encoding='utf-8') as f:
        if HAS_TQDM:
            # Use tqdm for progress bar
            for _ in tqdm(range(num_rows), desc="Generating measurements", unit="rows"):
                station, min_temp, max_temp = random.choice(STATIONS)
                temp = round(random.uniform(min_temp, max_temp), 1)
                f.write(f"{station}={temp}\n")
        else:
            # Simple progress indicator
            for i in range(num_rows):
                if i % (num_rows // 100) == 0:
                    progress = (i / num_rows) * 100
                    print(f"Progress: {progress:.1f}% ({i:,}/{num_rows:,} rows)")
                
                station, min_temp, max_temp = random.choice(STATIONS)
                temp = round(random.uniform(min_temp, max_temp), 1)
                f.write(f"{station}={temp}\n")
    
    end_time = time.time()
    generation_time = end_time - start_time
    
    # Get file size
    file_size = os.path.getsize(output_file)
    file_size_mb = file_size / (1024 * 1024)
    file_size_gb = file_size_mb / 1024
    
    print()
    print(f"✅ Dataset generation completed!")
    print(f"📊 Statistics:")
    print(f"  • Total rows: {num_rows:,}")
    print(f"  • File size: {file_size_mb:.2f} MB ({file_size_gb:.3f} GB)")
    print(f"  • Generation time: {generation_time:.2f} seconds")
    print(f"  • Speed: {num_rows / generation_time:,.0f} rows/second")
    print(f"  • Stations used: {len(STATIONS)}")
    
    return output_file

def generate_sample_datasets():
    """Generate sample datasets of different sizes for testing"""
    
    sample_sizes = [
        (1000, "data/sample-1k.txt"),
        (10000, "data/sample-10k.txt"),
        (100000, "data/sample-100k.txt"),
        (1000000, "data/sample-1m.txt"),
        (10000000, "data/sample-10m.txt")
    ]
    
    print("📁 Generating sample datasets for testing...")
    print()
    
    for rows, filename in sample_sizes:
        print(f"🔧 Creating {filename} with {rows:,} rows...")
        try:
            generate_measurements(rows, filename, seed=42)
            print(f"✅ {filename} created successfully")
        except Exception as e:
            print(f"❌ Failed to create {filename}: {e}")
        print()

def validate_dataset(file_path):
    """Validate the generated dataset format and content"""
    
    print(f"🔍 Validating dataset: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        print(f"📊 Dataset statistics:")
        print(f"  • Total lines: {len(lines):,}")
        
        # Check format
        valid_lines = 0
        invalid_lines = 0
        stations = set()
        temperatures = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Check format: StationName=Temperature
            if '=' in line:
                parts = line.split('=', 1)
                if len(parts) == 2:
                    station, temp_str = parts
                    try:
                        temp = float(temp_str)
                        if -100 <= temp <= 100:  # Reasonable temperature range
                            valid_lines += 1
                            stations.add(station)
                            temperatures.append(temp)
                        else:
                            invalid_lines += 1
                            print(f"⚠️  Line {i+1}: Temperature {temp} out of range")
                    except ValueError:
                        invalid_lines += 1
                        print(f"⚠️  Line {i+1}: Invalid temperature format: {temp_str}")
                else:
                    invalid_lines += 1
                    print(f"⚠️  Line {i+1}: Invalid format: {line}")
            else:
                invalid_lines += 1
                print(f"⚠️  Line {i+1}: Missing '=' separator: {line}")
        
        print(f"  • Valid lines: {valid_lines:,}")
        print(f"  • Invalid lines: {invalid_lines:,}")
        print(f"  • Unique stations: {len(stations):,}")
        
        if temperatures:
            print(f"  • Temperature range: {min(temperatures):.1f}°C to {max(temperatures):.1f}°C")
            print(f"  • Average temperature: {sum(temperatures) / len(temperatures):.1f}°C")
        
        # Show some sample stations
        sample_stations = list(stations)[:10]
        print(f"  • Sample stations: {', '.join(sample_stations)}")
        
        if invalid_lines == 0:
            print("✅ Dataset validation passed!")
            return True
        else:
            print(f"⚠️  Dataset has {invalid_lines} invalid lines")
            return False
            
    except Exception as e:
        print(f"❌ Validation error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Generate tournament datasets for Billion Row Challenge",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate 1 billion row dataset
  python3 scripts/generate-dataset.py --rows 1000000000 --output data/measurements.txt
  
  # Generate 10 million row test dataset
  python3 scripts/generate-dataset.py --rows 10000000 --output data/test-10m.txt
  
  # Generate with specific seed for reproducibility
  python3 scripts/generate-dataset.py --rows 1000000 --seed 42 --output data/reproducible.txt
  
  # Generate sample datasets for testing
  python3 scripts/generate-dataset.py --samples
        """
    )
    
    parser.add_argument(
        "--rows", 
        type=int, 
        default=1000000000,
        help="Number of rows to generate (default: 1,000,000,000)"
    )
    
    parser.add_argument(
        "--output", 
        default="data/measurements.txt",
        help="Output file path (default: data/measurements.txt)"
    )
    
    parser.add_argument(
        "--seed", 
        type=int,
        help="Random seed for reproducible results"
    )
    
    parser.add_argument(
        "--samples",
        action="store_true",
        help="Generate sample datasets of various sizes for testing"
    )
    
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Validate the generated dataset after creation"
    )
    
    parser.add_argument(
        "--compress",
        action="store_true",
        help="Enable compression (not implemented yet)"
    )
    
    args = parser.parse_args()
    
    try:
        if args.samples:
            generate_sample_datasets()
        else:
            # Generate main dataset
            output_file = generate_measurements(
                args.rows, 
                args.output, 
                seed=args.seed,
                compress=args.compress
            )
            
            # Validate if requested
            if args.validate:
                print()
                validate_dataset(output_file)
        
        print()
        print("🎉 Dataset generation completed successfully!")
        
    except KeyboardInterrupt:
        print("\n❌ Dataset generation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error during dataset generation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()










