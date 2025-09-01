/**
 * Tournament System Main Test Runner
 * Integrates all testing frameworks and provides unified testing interface
 */

class TournamentTestRunner {
    constructor() {
        this.testSuites = new Map();
        this.testResults = new Map();
        this.currentSuite = null;
        this.currentTest = null;
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
        this.skipCount = 0;
        this.startTime = null;
        this.endTime = null;
        
        this.setupTestRunner();
    }

    /**
     * Setup test runner
     */
    setupTestRunner() {
        this.testSuites.set('unit', new TournamentUnitTests());
        this.testSuites.set('integration', new TournamentIntegrationTests());
        this.testSuites.set('performance', new TournamentPerformanceTests());
        this.testSuites.set('security', new TournamentSecurityTests());
        this.testSuites.set('coverage', new TournamentCoverageTests());
        
        this.testResults.set('unit', []);
        this.testResults.set('integration', []);
        this.testResults.set('performance', []);
        this.testResults.set('security', []);
        this.testResults.set('coverage', []);
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('\n🚀 Starting Tournament System Test Suite...\n');
        console.log('='.repeat(60));
        
        this.startTime = Date.now();
        
        // Run all test suites
        for (const [suiteName, suite] of this.testSuites) {
            await this.runTestSuite(suiteName, suite);
        }
        
        this.endTime = Date.now();
        
        // Generate comprehensive test report
        this.generateTestReport();
        
        console.log('\n🎉 All tests completed!\n');
    }

    /**
     * Run specific test suite
     */
    async runTestSuite(suiteName, suite) {
        console.log(`\n📋 Running ${suiteName.toUpperCase()} Tests...`);
        console.log('-'.repeat(40));
        
        this.currentSuite = suiteName;
        
        try {
            switch (suiteName) {
                case 'unit':
                    await suite.runUnitTests();
                    break;
                case 'integration':
                    await suite.runIntegrationTests();
                    break;
                case 'performance':
                    await suite.runPerformanceTests();
                    break;
                case 'security':
                    await suite.runSecurityTests();
                    break;
                case 'coverage':
                    await suite.runCoverageTests();
                    break;
                default:
                    console.log(`❌ Unknown test suite: ${suiteName}`);
            }
        } catch (error) {
            console.error(`❌ Error running ${suiteName} tests:`, error);
            this.recordTestResult(suiteName, 'error', error.message);
        }
    }

    /**
     * Run specific test type
     */
    async runTestType(testType) {
        if (!this.testSuites.has(testType)) {
            console.error(`❌ Unknown test type: ${testType}`);
            return;
        }
        
        console.log(`\n🎯 Running ${testType.toUpperCase()} tests only...`);
        await this.runTestSuite(testType, this.testSuites.get(testType));
    }

    /**
     * Record test result
     */
    recordTestResult(suite, status, details = '') {
        const result = {
            suite,
            status,
            details,
            timestamp: new Date().toISOString(),
            duration: this.currentTest ? Date.now() - this.currentTest.startTime : 0
        };
        
        this.testResults.get(suite).push(result);
        
        switch (status) {
            case 'pass':
                this.passCount++;
                break;
            case 'fail':
                this.failCount++;
                break;
            case 'skip':
                this.skipCount++;
                break;
            case 'error':
                this.failCount++;
                break;
        }
        
        this.testCount++;
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const duration = this.endTime - this.startTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(60));
        
        // Test execution summary
        console.log('\n⏱️  Test Execution Summary:');
        console.log(`  Total Duration: ${duration}ms`);
        console.log(`  Total Tests: ${this.testCount}`);
        console.log(`  Passed: ${this.passCount} ✅`);
        console.log(`  Failed: ${this.failCount} ❌`);
        console.log(`  Skipped: ${this.skipCount} ⏭️`);
        
        // Test suite results
        console.log('\n📋 Test Suite Results:');
        this.testSuites.forEach((suite, suiteName) => {
            const results = this.testResults.get(suiteName);
            const passed = results.filter(r => r.status === 'pass').length;
            const failed = results.filter(r => r.status === 'fail' || r.status === 'error').length;
            const skipped = results.filter(r => r.status === 'skip').length;
            
            const status = failed > 0 ? '❌' : passed > 0 ? '✅' : '⏭️';
            console.log(`  ${suiteName}: ${passed} passed, ${failed} failed, ${skipped} skipped ${status}`);
        });
        
        // Overall test status
        const successRate = this.testCount > 0 ? (this.passCount / this.testCount) * 100 : 0;
        const overallStatus = successRate >= 90 ? 'EXCELLENT' : 
                            successRate >= 80 ? 'GOOD' : 
                            successRate >= 70 ? 'FAIR' : 
                            successRate >= 60 ? 'NEEDS IMPROVEMENT' : 'POOR';
        
        console.log('\n🏆 Overall Test Status:');
        console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`  Status: ${overallStatus}`);
        console.log(`  Grade: ${this.calculateGrade(successRate)}`);
        
        // Recommendations
        this.generateRecommendations();
        
        console.log('='.repeat(60));
    }

    /**
     * Calculate test grade
     */
    calculateGrade(successRate) {
        if (successRate >= 95) return 'A+';
        if (successRate >= 90) return 'A';
        if (successRate >= 85) return 'A-';
        if (successRate >= 80) return 'B+';
        if (successRate >= 75) return 'B';
        if (successRate >= 70) return 'B-';
        if (successRate >= 65) return 'C+';
        if (successRate >= 60) return 'C';
        if (successRate >= 55) return 'C-';
        if (successRate >= 50) return 'D+';
        if (successRate >= 45) return 'D';
        if (successRate >= 40) return 'D-';
        return 'F';
    }

    /**
     * Generate test recommendations
     */
    generateRecommendations() {
        console.log('\n💡 Recommendations:');
        
        if (this.failCount > 0) {
            console.log('  • Fix failing tests to improve reliability');
            console.log('  • Review error logs for common patterns');
        }
        
        if (this.skipCount > 0) {
            console.log('  • Implement skipped tests for better coverage');
            console.log('  • Review test dependencies and setup');
        }
        
        const successRate = this.testCount > 0 ? (this.passCount / this.testCount) * 100 : 0;
        
        if (successRate < 80) {
            console.log('  • Focus on improving test quality and reliability');
            console.log('  • Consider adding more comprehensive test cases');
        }
        
        if (successRate >= 90) {
            console.log('  • Excellent test coverage! Maintain current standards');
            console.log('  • Consider adding performance and stress tests');
        }
        
        // Suite-specific recommendations
        this.testSuites.forEach((suite, suiteName) => {
            const results = this.testResults.get(suiteName);
            const failed = results.filter(r => r.status === 'fail' || r.status === 'error').length;
            
            if (failed > 0) {
                console.log(`  • Review ${suiteName} test failures for system issues`);
            }
        });
    }

    /**
     * Export test results
     */
    exportTestResults(format = 'json') {
        const exportData = {
            summary: {
                totalTests: this.testCount,
                passed: this.passCount,
                failed: this.failCount,
                skipped: this.skipCount,
                successRate: this.testCount > 0 ? (this.passCount / this.testCount) * 100 : 0,
                duration: this.endTime - this.startTime,
                timestamp: new Date().toISOString()
            },
            suites: {},
            details: this.testResults
        };
        
        // Add suite summaries
        this.testSuites.forEach((suite, suiteName) => {
            const results = this.testResults.get(suiteName);
            const passed = results.filter(r => r.status === 'pass').length;
            const failed = results.filter(r => r.status === 'fail' || r.status === 'error').length;
            const skipped = results.filter(r => r.status === 'skip').length;
            
            exportData.suites[suiteName] = {
                passed,
                failed,
                skipped,
                total: results.length,
                successRate: results.length > 0 ? (passed / results.length) * 100 : 0
            };
        });
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            case 'csv':
                return this.convertToCSV(exportData);
            case 'html':
                return this.convertToHTML(exportData);
            default:
                return exportData;
        }
    }

    /**
     * Convert results to CSV
     */
    convertToCSV(data) {
        let csv = 'Test Suite,Passed,Failed,Skipped,Total,Success Rate\n';
        
        Object.entries(data.suites).forEach(([suite, metrics]) => {
            csv += `${suite},${metrics.passed},${metrics.failed},${metrics.skipped},${metrics.total},${metrics.successRate.toFixed(1)}%\n`;
        });
        
        return csv;
    }

    /**
     * Convert results to HTML
     */
    convertToHTML(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Tournament System Test Results</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
                    .suite { margin: 10px 0; padding: 10px; border-left: 4px solid #007cba; }
                    .passed { color: #28a745; }
                    .failed { color: #dc3545; }
                    .skipped { color: #ffc107; }
                </style>
            </head>
            <body>
                <h1>Tournament System Test Results</h1>
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Total Tests: ${data.summary.totalTests}</p>
                    <p>Success Rate: ${data.summary.successRate.toFixed(1)}%</p>
                    <p>Duration: ${data.summary.duration}ms</p>
                </div>
                <h2>Test Suites</h2>
                ${Object.entries(data.suites).map(([suite, metrics]) => `
                    <div class="suite">
                        <h3>${suite}</h3>
                        <p class="passed">Passed: ${metrics.passed}</p>
                        <p class="failed">Failed: ${metrics.failed}</p>
                        <p class="skipped">Skipped: ${metrics.skipped}</p>
                        <p>Success Rate: ${metrics.successRate.toFixed(1)}%</p>
                    </div>
                `).join('')}
            </body>
            </html>
        `;
    }

    /**
     * Get test statistics
     */
    getTestStatistics() {
        return {
            total: this.testCount,
            passed: this.passCount,
            failed: this.failCount,
            skipped: this.skipCount,
            successRate: this.testCount > 0 ? (this.passCount / this.testCount) * 100 : 0,
            duration: this.endTime ? this.endTime - this.startTime : 0
        };
    }

    /**
     * Reset test runner
     */
    reset() {
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
        this.skipCount = 0;
        this.startTime = null;
        this.endTime = null;
        this.currentSuite = null;
        this.currentTest = null;
        
        this.testResults.forEach((results, suite) => {
            this.testResults.set(suite, []);
        });
    }

    /**
     * Run tests with specific configuration
     */
    async runTestsWithConfig(config) {
        const { includeSuites = [], excludeSuites = [], parallel = false, timeout = 30000 } = config;
        
        console.log('\n⚙️  Running tests with configuration:', config);
        
        if (includeSuites.length > 0) {
            // Run only specified suites
            for (const suiteName of includeSuites) {
                if (this.testSuites.has(suiteName)) {
                    await this.runTestSuite(suiteName, this.testSuites.get(suiteName));
                }
            }
        } else if (excludeSuites.length > 0) {
            // Run all suites except excluded ones
            for (const [suiteName, suite] of this.testSuites) {
                if (!excludeSuites.includes(suiteName)) {
                    await this.runTestSuite(suiteName, suite);
                }
            }
        } else {
            // Run all suites
            await this.runAllTests();
        }
    }
}

// Global test runner instance
window.TournamentTestRunner = TournamentTestRunner;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentTestRunner;
}
