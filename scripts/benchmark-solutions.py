#!/usr/bin/env python3
"""
Tournament Solution Benchmarking Script
Tests multiple solutions and provides performance analysis

Usage: python3 scripts/benchmark-solutions.py [--input <data-file>] [--iterations <n>] [--output <report-file>]
"""

import subprocess
import time
import json
import argparse
import os
import sys
from pathlib import Path
from datetime import datetime
import statistics
from collections import defaultdict

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

# Configuration
DEFAULT_ITERATIONS = 3
DEFAULT_TIMEOUT = 300  # 5 minutes
SUPPORTED_LANGUAGES = ['java', 'python', 'cpp', 'go']

class SolutionBenchmarker:
    def __init__(self, data_file, iterations=DEFAULT_ITERATIONS, timeout=DEFAULT_TIMEOUT):
        self.data_file = data_file
        self.iterations = iterations
        self.timeout = timeout
        self.results = defaultdict(list)
        self.errors = defaultdict(list)
        
    def check_solution_exists(self, language):
        """Check if a solution exists for the given language"""
        solution_dir = f"submissions/{language}"
        
        if not os.path.exists(solution_dir):
            return False
        
        # Check for language-specific files
        if language == 'java':
            return any(f.endswith('.java') for f in os.listdir(solution_dir))
        elif language == 'python':
            return any(f.endswith('.py') for f in os.listdir(solution_dir))
        elif language == 'cpp':
            return any(f.endswith('.cpp') for f in os.listdir(solution_dir))
        elif language == 'go':
            return any(f.endswith('.go') for f in os.listdir(solution_dir))
        
        return False
    
    def build_solution(self, language):
        """Build/compile the solution for the given language"""
        print_status(f"Building {language} solution...")
        
        try:
            if language == 'java':
                # Compile Java solution
                result = subprocess.run(
                    ['javac', f'submissions/java/*.java'],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                if result.returncode != 0:
                    print_error(f"Java compilation failed: {result.stderr}")
                    return False
                print_success("Java compilation successful")
                
            elif language == 'cpp':
                # Compile C++ solution
                result = subprocess.run([
                    'g++', '-std=c++20', '-O2', '-o', 'submissions/cpp/solution',
                    'submissions/cpp/*.cpp'
                ], capture_output=True, text=True, timeout=60)
                if result.returncode != 0:
                    print_error(f"C++ compilation failed: {result.stderr}")
                    return False
                print_success("C++ compilation successful")
                
            elif language == 'go':
                # Build Go solution
                result = subprocess.run([
                    'go', 'build', '-o', 'submissions/go/solution', 'submissions/go/'
                ], capture_output=True, text=True, timeout=60)
                if result.returncode != 0:
                    print_error(f"Go build failed: {result.stderr}")
                    return False
                print_success("Go build successful")
                
            elif language == 'python':
                # Python doesn't need compilation
                print_success("Python solution ready")
                
            return True
            
        except subprocess.TimeoutExpired:
            print_error(f"{language} build timed out")
            return False
        except Exception as e:
            print_error(f"{language} build error: {e}")
            return False
    
    def run_solution(self, language, iteration):
        """Run a single iteration of the solution"""
        print_status(f"Running {language} solution (iteration {iteration + 1}/{self.iterations})...")
        
        start_time = time.time()
        start_memory = self.get_memory_usage()
        
        try:
            # Prepare command based on language
            if language == 'java':
                cmd = ['java', '-Xmx8g', '-cp', 'submissions/java', 'Solution']
            elif language == 'python':
                cmd = ['python3', 'submissions/python/solution.py']
            elif language == 'cpp':
                cmd = ['./submissions/cpp/solution']
            elif language == 'go':
                cmd = ['./submissions/go/solution']
            else:
                print_error(f"Unsupported language: {language}")
                return None
            
            # Run solution with input data
            with open(self.data_file, 'r') as input_file:
                result = subprocess.run(
                    cmd,
                    stdin=input_file,
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
            
            end_time = time.time()
            end_memory = self.get_memory_usage()
            
            execution_time = end_time - start_time
            memory_usage = end_memory - start_memory
            
            # Check if solution succeeded
            if result.returncode == 0:
                print_success(f"{language} completed in {execution_time:.3f}s")
                
                # Validate output format
                if self.validate_output(result.stdout):
                    return {
                        'execution_time': execution_time,
                        'memory_usage': memory_usage,
                        'output_size': len(result.stdout),
                        'exit_code': result.returncode,
                        'stdout': result.stdout,
                        'stderr': result.stderr
                    }
                else:
                    print_warning(f"{language} output validation failed")
                    return None
            else:
                print_error(f"{language} failed with exit code {result.returncode}")
                if result.stderr:
                    print_error(f"Error: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            print_error(f"{language} execution timed out after {self.timeout}s")
            return None
        except Exception as e:
            print_error(f"{language} execution error: {e}")
            return None
    
    def get_memory_usage(self):
        """Get current memory usage (simplified)"""
        try:
            import psutil
            return psutil.Process().memory_info().rss / (1024 * 1024)  # MB
        except ImportError:
            return 0  # psutil not available
    
    def validate_output(self, output):
        """Basic output format validation"""
        output = output.strip()
        
        # Check basic format
        if not output.startswith('{') or not output.endswith('}'):
            return False
        
        # Check for station entries
        if '=' not in output or '/' not in output:
            return False
        
        return True
    
    def benchmark_solution(self, language):
        """Run multiple iterations of a solution and collect statistics"""
        print_header(f"Benchmarking {language.upper()} Solution")
        print(f"📊 Data file: {self.data_file}")
        print(f"🔄 Iterations: {self.iterations}")
        print(f"⏱️  Timeout: {self.timeout}s")
        print()
        
        # Check if solution exists
        if not self.check_solution_exists(language):
            print_warning(f"No {language} solution found, skipping")
            return False
        
        # Build solution
        if not self.build_solution(language):
            print_error(f"Failed to build {language} solution")
            return False
        
        # Run iterations
        successful_runs = 0
        
        for i in range(self.iterations):
            result = self.run_solution(language, i)
            if result:
                self.results[language].append(result)
                successful_runs += 1
            else:
                self.errors[language].append(f"Iteration {i + 1} failed")
        
        # Calculate statistics
        if successful_runs > 0:
            times = [r['execution_time'] for r in self.results[language]]
            memories = [r['memory_usage'] for r in self.results[language]]
            
            stats = {
                'successful_runs': successful_runs,
                'total_runs': self.iterations,
                'success_rate': successful_runs / self.iterations,
                'execution_time': {
                    'mean': statistics.mean(times),
                    'median': statistics.median(times),
                    'min': min(times),
                    'max': max(times),
                    'std': statistics.stdev(times) if len(times) > 1 else 0
                },
                'memory_usage': {
                    'mean': statistics.mean(memories),
                    'median': statistics.median(memories),
                    'min': min(memories),
                    'max': max(memories),
                    'std': statistics.stdev(memories) if len(memories) > 1 else 0
                }
            }
            
            print_result(f"{language.upper()} Benchmark Results:")
            print(f"  ✅ Successful runs: {successful_runs}/{self.iterations}")
            print(f"  ⏱️  Execution time: {stats['execution_time']['mean']:.3f}s ± {stats['execution_time']['std']:.3f}s")
            print(f"  💾 Memory usage: {stats['memory_usage']['mean']:.1f}MB ± {stats['memory_usage']['std']:.1f}MB")
            print(f"  📊 Best time: {stats['execution_time']['min']:.3f}s")
            print(f"  📊 Worst time: {stats['execution_time']['max']:.3f}s")
            
            return stats
        else:
            print_error(f"All {language} iterations failed")
            return None
    
    def run_all_benchmarks(self):
        """Run benchmarks for all available solutions"""
        print_header("Starting Tournament Solution Benchmarks")
        print(f"🌍 Data file: {self.data_file}")
        print(f"🔄 Iterations per solution: {self.iterations}")
        print(f"⏱️  Timeout per run: {self.timeout}s")
        print()
        
        start_time = time.time()
        benchmark_results = {}
        
        for language in SUPPORTED_LANGUAGES:
            print(f"{'='*60}")
            result = self.benchmark_solution(language)
            if result:
                benchmark_results[language] = result
            print()
        
        total_time = time.time() - start_time
        
        # Generate summary
        self.generate_summary(benchmark_results, total_time)
        
        return benchmark_results
    
    def generate_summary(self, benchmark_results, total_time):
        """Generate a comprehensive benchmark summary"""
        print_header("Benchmark Summary")
        print("=" * 60)
        
        if not benchmark_results:
            print_warning("No successful benchmarks to summarize")
            return
        
        # Sort solutions by average execution time
        sorted_solutions = sorted(
            benchmark_results.items(),
            key=lambda x: x[1]['execution_time']['mean']
        )
        
        print(f"🏆 Performance Ranking:")
        for i, (language, stats) in enumerate(sorted_solutions):
            medal = "🥇" if i == 0 else "🥈" if i == 1 else "🥉" if i == 2 else "  "
            time_mean = stats['execution_time']['mean']
            time_std = stats['execution_time']['std']
            memory_mean = stats['memory_usage']['mean']
            
            print(f"  {medal} {language.upper()}: {time_mean:.3f}s ± {time_std:.3f}s ({memory_mean:.1f}MB)")
        
        print()
        print(f"📊 Overall Statistics:")
        print(f"  • Total benchmark time: {total_time:.1f}s")
        print(f"  • Solutions tested: {len(benchmark_results)}")
        print(f"  • Total iterations: {len(benchmark_results) * self.iterations}")
        
        # Performance analysis
        if len(benchmark_results) > 1:
            fastest = sorted_solutions[0]
            slowest = sorted_solutions[-1]
            speedup = slowest[1]['execution_time']['mean'] / fastest[1]['execution_time']['mean']
            
            print(f"  • Fastest: {fastest[0].upper()} ({fastest[1]['execution_time']['mean']:.3f}s)")
            print(f"  • Slowest: {slowest[0].upper()} ({slowest[1]['execution_time']['mean']:.3f}s)")
            print(f"  • Speedup: {speedup:.1f}x")
        
        print()
        
        # Error summary
        total_errors = sum(len(errors) for errors in self.errors.values())
        if total_errors > 0:
            print(f"⚠️  Errors encountered:")
            for language, errors in self.errors.items():
                if errors:
                    print(f"  • {language.upper()}: {len(errors)} errors")
                    for error in errors[:3]:  # Show first 3 errors
                        print(f"    - {error}")
                    if len(errors) > 3:
                        print(f"    ... and {len(errors) - 3} more")
    
    def save_report(self, benchmark_results, output_file):
        """Save benchmark results to a JSON report file"""
        if not benchmark_results:
            print_warning("No results to save")
            return
        
        report = {
            "benchmark_info": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data_file": self.data_file,
                "iterations": self.iterations,
                "timeout": self.timeout,
                "total_solutions": len(benchmark_results)
            },
            "results": benchmark_results,
            "errors": dict(self.errors),
            "raw_results": dict(self.results)
        }
        
        try:
            # Create output directory if it doesn't exist
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2)
            
            print_success(f"Benchmark report saved to: {output_file}")
            
        except Exception as e:
            print_error(f"Failed to save report: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="Benchmark tournament solutions for performance analysis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Benchmark all solutions with default settings
  python3 scripts/benchmark-solutions.py
  
  # Benchmark with specific data file
  python3 scripts/benchmark-solutions.py --input data/sample-100k.txt
  
  # Run more iterations for better statistics
  python3 scripts/benchmark-solutions.py --iterations 5
  
  # Save detailed report
  python3 scripts/benchmark-solutions.py --output reports/benchmark-$(date +%Y%m%d).json
        """
    )
    
    parser.add_argument(
        "--input", "-i",
        default="data/test_measurements.txt",
        help="Input data file for benchmarking (default: data/test_measurements.txt)"
    )
    
    parser.add_argument(
        "--iterations", "-n",
        type=int,
        default=DEFAULT_ITERATIONS,
        help=f"Number of iterations per solution (default: {DEFAULT_ITERATIONS})"
    )
    
    parser.add_argument(
        "--timeout", "-t",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"Timeout per run in seconds (default: {DEFAULT_TIMEOUT})"
    )
    
    parser.add_argument(
        "--output", "-o",
        help="Output JSON report file (optional)"
    )
    
    parser.add_argument(
        "--languages", "-l",
        nargs='+',
        choices=SUPPORTED_LANGUAGES,
        help=f"Specific languages to benchmark (default: all from {SUPPORTED_LANGUAGES})"
    )
    
    args = parser.parse_args()
    
    # Check if input file exists
    if not os.path.exists(args.input):
        print_error(f"Input file not found: {args.input}")
        sys.exit(1)
    
    # Check if input file is readable
    try:
        with open(args.input, 'r') as f:
            first_line = f.readline().strip()
            if not first_line or '=' not in first_line:
                print_error(f"Input file format invalid. Expected format: StationName=Temperature")
                sys.exit(1)
    except Exception as e:
        print_error(f"Cannot read input file: {e}")
        sys.exit(1)
    
    try:
        # Create benchmarker
        benchmarker = SolutionBenchmarker(
            data_file=args.input,
            iterations=args.iterations,
            timeout=args.timeout
        )
        
        # Run benchmarks
        if args.languages:
            # Benchmark specific languages
            results = {}
            for language in args.languages:
                if benchmarker.check_solution_exists(language):
                    result = benchmarker.benchmark_solution(language)
                    if result:
                        results[language] = result
                else:
                    print_warning(f"No {language} solution found, skipping")
        else:
            # Benchmark all available solutions
            results = benchmarker.run_all_benchmarks()
        
        # Save report if requested
        if args.output and results:
            benchmarker.save_report(results, args.output)
        
        print()
        if results:
            print_success("Benchmarking completed successfully!")
            sys.exit(0)
        else:
            print_warning("No successful benchmarks completed")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n❌ Benchmarking interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Benchmarking error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()






