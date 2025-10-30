#!/usr/bin/env python3
"""
Script to update JSON fixtures with consumer_location field
"""

import json
import os
import sys

# Add the project root to the path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def update_fixture_file(file_path):
    """Update a fixture file with the new consumer_location field"""
    print(f"Updating {file_path}...")
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    updated_count = 0
    for item in data:
        if item.get('model') == 'main.parameterset':
            fields = item.get('fields', {})
            if 'consumer_location' not in fields:
                fields['consumer_location'] = "250,350"  # Default value
                updated_count += 1
    
    # Write back to file
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Updated {updated_count} ParameterSet records in {file_path}")
    return updated_count

def main():
    """Main function to update all fixture files"""
    fixture_files = [
        'main/fixtures/main.json',
        'main/fixtures/main_sample.json'
    ]
    
    total_updated = 0
    for fixture_file in fixture_files:
        file_path = os.path.join(project_root, fixture_file)
        if os.path.exists(file_path):
            try:
                count = update_fixture_file(file_path)
                total_updated += count
            except Exception as e:
                print(f"Error updating {file_path}: {e}")
        else:
            print(f"Fixture file not found: {file_path}")
    
    print(f"\nTotal ParameterSet records updated: {total_updated}")

if __name__ == '__main__':
    main()