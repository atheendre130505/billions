package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
)

/**
 * Billion Row Challenge - Optimized Go Solution
 * Uses map for efficient storage and single-pass processing
 */

type StationData struct {
	min   float64
	max   float64
	sum   float64
	count int
}

func (s *StationData) update(temp float64) {
	if s.count == 0 {
		s.min = temp
		s.max = temp
	} else {
		if temp < s.min {
			s.min = temp
		}
		if temp > s.max {
			s.max = temp
		}
	}
	s.sum += temp
	s.count++
}

func (s *StationData) getMean() float64 {
	return s.sum / float64(s.count)
}

func main() {
	stations := make(map[string]*StationData)
	scanner := bufio.NewScanner(os.Stdin)

	// Read from stdin (standard input)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		// Parse station=temperature format
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		station := parts[0]
		tempStr := parts[1]

		temp, err := strconv.ParseFloat(tempStr, 64)
		if err != nil {
			// Skip invalid temperature values
			continue
		}

		// Update statistics efficiently
		if stations[station] == nil {
			stations[station] = &StationData{}
		}
		stations[station].update(temp)
	}

	// Get sorted station names
	var stationNames []string
	for station := range stations {
		stationNames = append(stationNames, station)
	}
	sort.Strings(stationNames)

	// Output results in alphabetical order
	for _, station := range stationNames {
		data := stations[station]
		fmt.Printf("%s=%.1f/%.1f/%.1f\n", 
			station, 
			data.min, 
			data.getMean(), 
			data.max)
	}
}