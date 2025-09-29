#include <iostream>
#include <string>
#include <map>
#include <iomanip>

using namespace std;

int main() {
    map<string, pair<double, double>> minMax; // station -> (min, max)
    map<string, double> sums;                 // station -> sum
    map<string, int> counts;                  // station -> count
    
    string line;
    
    // Read from stdin
    while (getline(cin, line)) {
        if (line.empty()) continue;
        
        size_t pos = line.find('=');
        if (pos == string::npos) continue;
        
        string station = line.substr(0, pos);
        string tempStr = line.substr(pos + 1);
        
        double temp = stod(tempStr);
        
        if (minMax.find(station) == minMax.end()) {
            minMax[station] = {temp, temp};
            sums[station] = temp;
            counts[station] = 1;
        } else {
            minMax[station].first = min(minMax[station].first, temp);
            minMax[station].second = max(minMax[station].second, temp);
            sums[station] += temp;
            counts[station]++;
        }
    }
    
    // Output results
    cout << fixed << setprecision(1);
    for (const auto& entry : minMax) {
        string station = entry.first;
        double minTemp = entry.second.first;
        double maxTemp = entry.second.second;
        double meanTemp = sums[station] / counts[station];
        
        cout << station << "=" << minTemp << "/" << meanTemp << "/" << maxTemp << endl;
    }
    
    return 0;
}
