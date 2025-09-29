import java.io.*;
import java.util.*;

/**
 * Billion Row Challenge - Standalone Java Solution
 * 
 * This is a complete, standalone Java solution for the Billion Row Challenge.
 * It processes temperature measurements and calculates min, mean, max for each station.
 * 
 * Usage:
 *   javac BillionRowSolver.java
 *   java BillionRowSolver < input.txt
 * 
 * Or with file input:
 *   java BillionRowSolver input.txt
 */

public class BillionRowSolver {
    
    // Station data structure to track statistics
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
        Map<String, StationData> stations = new HashMap<>();
        
        try {
            // Check if input file is provided as argument
            if (args.length > 0) {
                // Read from file
                processFile(args[0], stations);
            } else {
                // Read from stdin
                processStdin(stations);
            }
        } catch (IOException e) {
            System.err.println("Error processing input: " + e.getMessage());
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
                        data.getMean(), 
                        data.max);
                });
    }
    
    private static void processFile(String filename, Map<String, StationData> stations) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                processLine(line, stations);
            }
        }
    }
    
    private static void processStdin(Map<String, StationData> stations) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(System.in))) {
            String line;
            while ((line = reader.readLine()) != null) {
                processLine(line, stations);
            }
        }
    }
    
    private static void processLine(String line, Map<String, StationData> stations) {
        line = line.trim();
        if (line.isEmpty()) return;
        
        // Parse station=temperature format
        int equalIndex = line.indexOf('=');
        if (equalIndex == -1) return;
        
        String station = line.substring(0, equalIndex);
        String tempStr = line.substring(equalIndex + 1);
        
        try {
            double temp = Double.parseDouble(tempStr);
            
            // Update statistics efficiently
            stations.computeIfAbsent(station, k -> new StationData())
                    .update(temp);
        } catch (NumberFormatException e) {
            // Skip invalid temperature values
        }
    }
}
