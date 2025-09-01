import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("data/test_measurements.txt"))) {
            Map<String, List<Double>> stations = new TreeMap<>();
            String line;
            
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("=");
                String station = parts[0];
                double temp = Double.parseDouble(parts[1]);
                
                stations.computeIfAbsent(station, k -> new ArrayList<>()).add(temp);
            }
            
            for (Map.Entry<String, List<Double>> entry : stations.entrySet()) {
                List<Double> temps = entry.getValue();
                double min = temps.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
                double max = temps.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
                double mean = temps.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                
                System.out.printf("%s=%.1f/%.1f/%.1f%n", entry.getKey(), min, mean, max);
            }
        } catch (IOException e) {
            System.err.println("Error reading file: " + e.getMessage());
            System.exit(1);
        }
    }
}
