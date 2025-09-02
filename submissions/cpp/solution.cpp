#include <iostream>
#include <fstream>
#include <string>
#include <map>
#include <vector>
#include <algorithm>
#include <numeric>
#include <iomanip>

int main() {
    std::map<std::string, std::vector<double>> stations;
    // Try different input files
    std::vector<std::string> input_files = {"data/measurements_1m.txt", "data/measurements.txt", "data/test_measurements.txt"};
    std::ifstream file;
    
    for (const auto& filename : input_files) {
        file.open(filename);
        if (file.is_open()) {
            break;
        }
    }
    std::string line;
    
    if (!file.is_open()) {
        std::cerr << "Error: Could not open file" << std::endl;
        return 1;
    }
    
    while (std::getline(file, line)) {
        size_t pos = line.find('=');
        if (pos != std::string::npos) {
            std::string station = line.substr(0, pos);
            double temp = std::stod(line.substr(pos + 1));
            stations[station].push_back(temp);
        }
    }
    
    for (const auto& [station, temps] : stations) {
        auto [min_it, max_it] = std::minmax_element(temps.begin(), temps.end());
        double mean = std::accumulate(temps.begin(), temps.end(), 0.0) / temps.size();
        
        std::cout << station << "=" << std::fixed << std::setprecision(1)
                  << *min_it << "/" << mean << "/" << *max_it << std::endl;
    }
    
    return 0;
}
