#!/usr/bin/env python3
"""
Tournament Data Management Script
Handles dataset creation, validation, cleanup, and organization

Usage: python3 scripts/manage-data.py [command] [options]
"""

import argparse
import os
import sys
import shutil
import json
from pathlib import Path
from datetime import datetime
import subprocess

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

class DataManager:
    def __init__(self):
        self.data_dir = Path("data")
        self.submissions_dir = Path("submissions")
        self.results_dir = Path("results")
        self.reports_dir = Path("reports")
        
        # Ensure directories exist
        self.data_dir.mkdir(exist_ok=True)
        self.results_dir.mkdir(exist_ok=True)
        self.reports_dir.mkdir(exist_ok=True)
    
    def create_sample_datasets(self, force=False):
        """Create sample datasets for testing"""
        print_header("Creating Sample Datasets")
        print("📁 This will create datasets of various sizes for testing")
        
        if not force:
            response = input("Continue? (y/N): ")
            if response.lower() != 'y':
                print("Operation cancelled")
                return
        
        sample_sizes = [
            (1000, "sample-1k.txt"),
            (10000, "sample-10k.txt"),
            (100000, "sample-100k.txt"),
            (1000000, "sample-1m.txt"),
            (10000000, "sample-10m.txt")
        ]
        
        for rows, filename in sample_sizes:
            filepath = self.data_dir / filename
            if filepath.exists() and not force:
                print_warning(f"{filename} already exists, skipping")
                continue
            
            print_status(f"Creating {filename} with {rows:,} rows...")
            try:
                subprocess.run([
                    sys.executable, "scripts/generate-dataset.py",
                    "--rows", str(rows),
                    "--output", str(filepath),
                    "--seed", "42"
                ], check=True, capture_output=True, text=True)
                print_success(f"{filename} created successfully")
            except subprocess.CalledProcessError as e:
                print_error(f"Failed to create {filename}: {e.stderr}")
        
        print_success("Sample dataset creation completed")
    
    def create_tournament_dataset(self, rows=1000000000, force=False):
        """Create the main tournament dataset"""
        print_header("Creating Tournament Dataset")
        print(f"🌍 This will create a {rows:,} row dataset for the tournament")
        print(f"💾 Expected size: ~{rows * 25 / (1024**3):.1f} GB")
        
        if not force:
            response = input("Continue? (y/N): ")
            if response.lower() != 'y':
                print("Operation cancelled")
                return
        
        filepath = self.data_dir / "measurements.txt"
        if filepath.exists() and not force:
            print_warning("Tournament dataset already exists")
            response = input("Overwrite? (y/N): ")
            if response.lower() != 'y':
                print("Operation cancelled")
                return
        
        print_status("Creating tournament dataset...")
        try:
            subprocess.run([
                sys.executable, "scripts/generate-dataset.py",
                "--rows", str(rows),
                "--output", str(filepath),
                "--seed", "42"
            ], check=True)
            print_success("Tournament dataset created successfully")
        except subprocess.CalledProcessError as e:
            print_error(f"Failed to create tournament dataset: {e}")
    
    def validate_datasets(self):
        """Validate all datasets in the data directory"""
        print_header("Validating Datasets")
        
        data_files = list(self.data_dir.glob("*.txt"))
        if not data_files:
            print_warning("No data files found in data/ directory")
            return
        
        print(f"🔍 Found {len(data_files)} data files to validate")
        
        for filepath in data_files:
            print(f"\n📊 Validating {filepath.name}...")
            try:
                result = subprocess.run([
                    sys.executable, "scripts/validate-output.py",
                    str(filepath), "--no-color"
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print_success(f"{filepath.name} validation passed")
                else:
                    print_error(f"{filepath.name} validation failed")
                    if result.stderr:
                        print(f"Error: {result.stderr}")
            except Exception as e:
                print_error(f"Failed to validate {filepath.name}: {e}")
    
    def cleanup_old_data(self, days=30, force=False):
        """Clean up old data files and reports"""
        print_header("Cleaning Up Old Data")
        print(f"🗑️  This will remove files older than {days} days")
        
        if not force:
            response = input("Continue? (y/N): ")
            if response.lower() != 'y':
                print("Operation cancelled")
                return
        
        cutoff_time = datetime.now().timestamp() - (days * 24 * 60 * 60)
        removed_count = 0
        removed_size = 0
        
        # Clean up old reports
        for filepath in self.reports_dir.glob("*"):
            if filepath.is_file():
                if filepath.stat().st_mtime < cutoff_time:
                    try:
                        file_size = filepath.stat().st_size
                        filepath.unlink()
                        removed_count += 1
                        removed_size += file_size
                        print_status(f"Removed old report: {filepath.name}")
                    except Exception as e:
                        print_error(f"Failed to remove {filepath.name}: {e}")
        
        # Clean up old results (keep recent ones)
        for filepath in self.results_dir.glob("results_*.json"):
            if filepath.stat().st_mtime < cutoff_time:
                try:
                    file_size = filepath.stat().st_size
                    filepath.unlink()
                    removed_count += 1
                    removed_size += file_size
                    print_status(f"Removed old result: {filepath.name}")
                except Exception as e:
                    print_error(f"Failed to remove {filepath.name}: {e}")
        
        if removed_count > 0:
            removed_size_mb = removed_size / (1024 * 1024)
            print_success(f"Cleanup completed: {removed_count} files removed ({removed_size_mb:.1f} MB)")
        else:
            print_success("No old files found to remove")
    
    def analyze_data_usage(self):
        """Analyze data directory usage and provide statistics"""
        print_header("Data Usage Analysis")
        
        total_size = 0
        file_count = 0
        file_types = {}
        
        # Analyze data directory
        for filepath in self.data_dir.rglob("*"):
            if filepath.is_file():
                file_size = filepath.stat().st_size
                total_size += file_size
                file_count += 1
                
                # Count file types
                ext = filepath.suffix.lower()
                file_types[ext] = file_types.get(ext, 0) + 1
        
        # Analyze results directory
        results_size = 0
        results_count = 0
        for filepath in self.results_dir.glob("*"):
            if filepath.is_file():
                results_size += filepath.stat().st_size
                results_count += 1
        
        # Analyze reports directory
        reports_size = 0
        reports_count = 0
        for filepath in self.reports_dir.glob("*"):
            if filepath.is_file():
                reports_size += filepath.stat().st_size
                reports_count += 1
        
        print(f"📊 Directory Statistics:")
        print(f"  📁 Data directory:")
        print(f"    • Files: {file_count}")
        print(f"    • Size: {total_size / (1024**3):.2f} GB")
        print(f"    • File types: {dict(file_types)}")
        
        print(f"  📊 Results directory:")
        print(f"    • Files: {results_count}")
        print(f"    • Size: {results_size / (1024**2):.2f} MB")
        
        print(f"  📋 Reports directory:")
        print(f"    • Files: {reports_count}")
        print(f"    • Size: {reports_size / (1024**2):.2f} MB")
        
        total_usage = total_size + results_size + reports_size
        print(f"\n💾 Total Usage: {total_usage / (1024**3):.2f} GB")
        
        # Check disk space
        try:
            disk_usage = shutil.disk_usage(self.data_dir)
            free_space = disk_usage.free / (1024**3)
            total_space = disk_usage.total / (1024**3)
            used_percentage = ((total_space - free_space) / total_space) * 100
            
            print(f"\n💽 Disk Space:")
            print(f"  • Total: {total_space:.1f} GB")
            print(f"  • Free: {free_space:.1f} GB")
            print(f"  • Used: {used_percentage:.1f}%")
            
            if free_space < 10:  # Less than 10GB free
                print_warning("⚠️  Low disk space! Consider cleaning up old files.")
            
        except Exception as e:
            print_warning(f"Could not check disk space: {e}")
    
    def backup_data(self, backup_dir="backups"):
        """Create a backup of important data files"""
        print_header("Creating Data Backup")
        
        backup_path = Path(backup_dir)
        backup_path.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"tournament_backup_{timestamp}"
        backup_full_path = backup_path / backup_name
        backup_full_path.mkdir()
        
        # Backup important files
        backup_items = [
            ("data", "data"),
            ("results", "results"),
            ("reports", "reports"),
            ("config", "config"),
            ("submissions", "submissions")
        ]
        
        backed_up_count = 0
        total_size = 0
        
        for source, dest in backup_items:
            source_path = Path(source)
            if source_path.exists():
                try:
                    dest_path = backup_full_path / dest
                    if source_path.is_file():
                        shutil.copy2(source_path, dest_path)
                        backed_up_count += 1
                        total_size += source_path.stat().st_size
                    elif source_path.is_dir():
                        shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
                        backed_up_count += 1
                        # Calculate directory size
                        for file_path in source_path.rglob("*"):
                            if file_path.is_file():
                                total_size += file_path.stat().st_size
                    
                    print_success(f"Backed up {source}")
                except Exception as e:
                    print_error(f"Failed to backup {source}: {e}")
        
        # Create backup manifest
        manifest = {
            "backup_timestamp": datetime.now().isoformat(),
            "backup_name": backup_name,
            "items_backed_up": backed_up_count,
            "total_size_bytes": total_size,
            "total_size_gb": total_size / (1024**3)
        }
        
        manifest_path = backup_full_path / "backup_manifest.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print_success(f"Backup completed: {backup_name}")
        print(f"📁 Location: {backup_full_path}")
        print(f"📊 Items: {backed_up_count}")
        print(f"💾 Size: {total_size / (1024**3):.2f} GB")
    
    def restore_data(self, backup_name):
        """Restore data from a backup"""
        print_header("Restoring Data from Backup")
        print(f"🔄 This will restore data from backup: {backup_name}")
        
        response = input("This will overwrite existing data. Continue? (y/N): ")
        if response.lower() != 'y':
            print("Operation cancelled")
            return
        
        backup_path = Path("backups") / backup_name
        if not backup_path.exists():
            print_error(f"Backup not found: {backup_path}")
            return
        
        # Check for manifest
        manifest_path = backup_path / "backup_manifest.json"
        if not manifest_path.exists():
            print_warning("No backup manifest found, proceeding with basic restore")
        else:
            try:
                with open(manifest_path, 'r') as f:
                    manifest = json.load(f)
                print(f"📋 Backup info: {manifest['backup_timestamp']}")
                print(f"📊 Items: {manifest['items_backed_up']}")
                print(f"💾 Size: {manifest['total_size_gb']:.2f} GB")
            except Exception as e:
                print_warning(f"Could not read manifest: {e}")
        
        # Restore data
        restored_count = 0
        for item in backup_path.iterdir():
            if item.is_dir() and item.name in ["data", "results", "reports", "config", "submissions"]:
                try:
                    if Path(item.name).exists():
                        shutil.rmtree(item.name)
                    shutil.copytree(item, item.name)
                    restored_count += 1
                    print_success(f"Restored {item.name}")
                except Exception as e:
                    print_error(f"Failed to restore {item.name}: {e}")
        
        print_success(f"Restore completed: {restored_count} items restored")
    
    def list_backups(self):
        """List available backups"""
        print_header("Available Backups")
        
        backup_path = Path("backups")
        if not backup_path.exists():
            print_warning("No backups directory found")
            return
        
        backups = []
        for backup_dir in backup_path.iterdir():
            if backup_dir.is_dir() and backup_dir.name.startswith("tournament_backup_"):
                manifest_path = backup_dir / "backup_manifest.json"
                if manifest_path.exists():
                    try:
                        with open(manifest_path, 'r') as f:
                            manifest = json.load(f)
                        backups.append((backup_dir.name, manifest))
                    except Exception:
                        backups.append((backup_dir.name, None))
                else:
                    backups.append((backup_dir.name, None))
        
        if not backups:
            print_warning("No backups found")
            return
        
        backups.sort(key=lambda x: x[0], reverse=True)
        
        print(f"📁 Found {len(backups)} backups:")
        for backup_name, manifest in backups:
            if manifest:
                timestamp = manifest.get('backup_timestamp', 'Unknown')
                size_gb = manifest.get('total_size_gb', 0)
                items = manifest.get('items_backed_up', 0)
                print(f"  • {backup_name}")
                print(f"    📅 {timestamp}")
                print(f"    📊 {items} items, {size_gb:.2f} GB")
            else:
                print(f"  • {backup_name} (no manifest)")

def main():
    parser = argparse.ArgumentParser(
        description="Tournament Data Management Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  samples          Create sample datasets for testing
  tournament       Create main tournament dataset (1B rows)
  validate         Validate all datasets
  cleanup          Clean up old files
  analyze          Analyze data usage
  backup           Create data backup
  restore <name>   Restore from backup
  list-backups     List available backups

Examples:
  # Create sample datasets
  python3 scripts/manage-data.py samples
  
  # Create tournament dataset
  python3 scripts/manage-data.py tournament
  
  # Validate all datasets
  python3 scripts/manage-data.py validate
  
  # Clean up files older than 30 days
  python3 scripts/manage-data.py cleanup --days 30
  
  # Analyze data usage
  python3 scripts/manage-data.py analyze
  
  # Create backup
  python3 scripts/manage-data.py backup
  
  # List backups
  python3 scripts/manage-data.py list-backups
  
  # Restore from backup
  python3 scripts/manage-data.py restore tournament_backup_20250831_143022
        """
    )
    
    parser.add_argument("command", help="Command to execute")
    parser.add_argument("--force", "-f", action="store_true", help="Force operation without confirmation")
    parser.add_argument("--days", type=int, default=30, help="Days threshold for cleanup (default: 30)")
    parser.add_argument("--rows", type=int, default=1000000000, help="Number of rows for tournament dataset (default: 1B)")
    
    args = parser.parse_args()
    
    manager = DataManager()
    
    try:
        if args.command == "samples":
            manager.create_sample_datasets(force=args.force)
        elif args.command == "tournament":
            manager.create_tournament_dataset(rows=args.rows, force=args.force)
        elif args.command == "validate":
            manager.validate_datasets()
        elif args.command == "cleanup":
            manager.cleanup_old_data(days=args.days, force=args.force)
        elif args.command == "analyze":
            manager.analyze_data_usage()
        elif args.command == "backup":
            manager.backup_data()
        elif args.command == "list-backups":
            manager.list_backups()
        elif args.command == "restore":
            if len(sys.argv) < 3:
                print_error("Restore command requires backup name")
                print("Usage: python3 scripts/manage-data.py restore <backup-name>")
                sys.exit(1)
            backup_name = sys.argv[2]
            manager.restore_data(backup_name)
        else:
            print_error(f"Unknown command: {args.command}")
            parser.print_help()
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n❌ Operation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Operation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()






