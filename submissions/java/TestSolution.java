import java.io.*;
import java.util.*;

/**
 * Test Solution for Billion Row Challenge
 * Optimized for million-row testing and leaderboard demonstration
 */
public class TestSolution {
    
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
    }
    
    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();
        Map<String, StationData> stations = new HashMap<>();
        
        try {
            // Determine input source
            BufferedReader reader = null;
            String inputType = "unknown";
            
            if (args.length > 0 && new java.io.File(args[0]).exists()) {
                // File input provided
                reader = new BufferedReader(new FileReader(args[0]));
                inputType = "file";
            } else {
                // Try to find test file
                String[] testFiles = {"data/measurements_1m.txt", "data/measurements.txt", "data/test_measurements.txt"};
                for (String filePath : testFiles) {
                    if (new java.io.File(filePath).exists()) {
                        reader = new BufferedReader(new FileReader(filePath));
                        inputType = "file";
                        break;
                    }
                }
                
                if (reader == null) {
                    // Fallback to stdin
                    reader = new BufferedReader(new InputStreamReader(System.in));
                    inputType = "stdin";
                }
            }
            
            // Process input
            String line;
            int lineCount = 0;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                
                int equalIndex = line.indexOf('=');
                if (equalIndex == -1) continue;
                
                String station = line.substring(0, equalIndex);
                String tempStr = line.substring(equalIndex + 1);
                
                try {
                    double temp = Double.parseDouble(tempStr);
                    stations.computeIfAbsent(station, k -> new StationData()).update(temp);
                    lineCount++;
                    
                    // Progress indicator for large datasets
                    if (lineCount % 100000 == 0) {
                        System.err.println("Processed " + String.format("%,d", lineCount) + " lines...");
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid temperature values
                }
            }
            
            reader.close();
            
            // Calculate processing time
            long processingTime = System.currentTimeMillis() - startTime;
            
            // Output results in alphabetical order
            stations.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(entry -> {
                        StationData data = entry.getValue();
                        System.out.printf("%s=%.1f/%.1f/%.1f%n", 
                            entry.getKey(), 
                            data.min, 
                            data.getMean(), 
                            data.max);
                    });
            
            // Output performance stats to stderr for leaderboard
            System.err.printf("# Performance: %.3fs, %,d lines, %d stations%n", 
                processingTime / 1000.0, lineCount, stations.size());
            
        } catch (IOException e) {
            System.err.println("Error processing input: " + e.getMessage());
            System.exit(1);
        }
    }
}
