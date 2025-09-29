import java.io.*;
import java.util.*;

/**
 * Billion Row Challenge - Optimized Java Solution
 * Uses HashMap for efficient storage and single-pass processing
 */
public class Solution {
    public static void main(String[] args) {
        // Use HashMap for efficient storage
        Map<String, StationData> stations = new HashMap<>();
        
        // Read from stdin (standard input)
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(System.in))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                
                // Parse station=temperature format
                int equalIndex = line.indexOf('=');
                if (equalIndex == -1) continue;
                
                String station = line.substring(0, equalIndex);
                String tempStr = line.substring(equalIndex + 1);
                
                try {
                    double temp = Double.parseDouble(tempStr);
                    
                    // Update statistics efficiently
                    stations.computeIfAbsent(station, k -> new StationData())
                            .update(temp);
                } catch (NumberFormatException e) {
                    // Skip invalid temperature values
                    continue;
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading input: " + e.getMessage());
            System.exit(1);
        }
        
        // Output results in alphabetical order
        stations.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    StationData data = entry.getValue();
                    System.out.printf("%s=%.1f/%.1f/%.1f%n", 
                        entry.getKey(), 
                        data.min, 
                        data.mean, 
                        data.max);
                });
    }
    
    // Helper class to track station statistics
    static class StationData {
        double min = Double.POSITIVE_INFINITY;
        double max = Double.NEGATIVE_INFINITY;
        double sum = 0.0;
        int count = 0;
        
        void update(double temp) {
            min = Math.min(min, temp);
            max = Math.max(max, temp);
            sum += temp;
            count++;
        }
        
        double getMean() {
            return sum / count;
        }
        
        double getMin() {
            return min;
        }
        
        double getMax() {
            return max;
        }
    }
}