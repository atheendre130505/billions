package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
)

func main() {
	stations := make(map[string][]float64)
	
	file, err := os.Open("data/test_measurements.txt")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error opening file: %v\n", err)
		os.Exit(1)
	}
	defer file.Close()
	
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		parts := strings.Split(scanner.Text(), "=")
		if len(parts) == 2 {
			station := parts[0]
			temp, err := strconv.ParseFloat(parts[1], 64)
			if err == nil {
				stations[station] = append(stations[station], temp)
			}
		}
	}
	
	// Sort station names
	var stationNames []string
	for station := range stations {
		stationNames = append(stationNames, station)
	}
	sort.Strings(stationNames)
	
	for _, station := range stationNames {
		temps := stations[station]
		min := temps[0]
		max := temps[0]
		sum := temps[0]
		
		for _, temp := range temps[1:] {
			if temp < min {
				min = temp
			}
			if temp > max {
				max = temp
			}
			sum += temp
		}
		
		mean := sum / float64(len(temps))
		fmt.Printf("%s=%.1f/%.1f/%.1f\n", station, min, mean, max)
	}
}
