#include <iostream>
#include <string>
#include <map>
#include <algorithm>
#include <iomanip>

/**
 * Billion Row Challenge - Optimized C++ Solution
 * Uses std::map for efficient storage and single-pass processing
 */

struct StationData {
    double min = 999.0;
    double max = -999.0;
    double sum = 0.0;
    int count = 0;
    bool initialized = false;
    
    void update(double temp) {
        if (!initialized) {
            min = temp;
            max = temp;
            initialized = true;
        } else {
            min = std::min(min, temp);
            max = std::max(max, temp);
        }
        sum += temp;
        count++;
    }
    
    double getMean() const {
        return sum / count;
    }
};

int main() {
    std::map<std::string, StationData> stations;
    std::string line;
    
    // Read from stdin (standard input)
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;
        
        // Parse station=temperature format
        size_t equalPos = line.find('=');
        if (equalPos == std::string::npos) continue;
        
        std::string station = line.substr(0, equalPos);
        std::string tempStr = line.substr(equalPos + 1);
        
        try {
            double temp = std::stod(tempStr);
            stations[station].update(temp);
        } catch (...) {
            // Skip invalid temperature values
            continue;
        }
    }
    
    // Output results in alphabetical order (map is already sorted)
    std::cout << std::fixed << std::setprecision(1);
    for (const auto& entry : stations) {
        const StationData& data = entry.second;
        std::cout << entry.first << "=" 
                  << data.min << "/" 
                  << data.getMean() << "/" 
                  << data.max << std::endl;
    }
    
    return 0;
}