# 🏆 Billion Row Challenge Tournament

Welcome to the **One Billion Row Challenge Tournament** - a competitive programming event where participants optimize code to process massive datasets while learning modern GitHub workflows!

## 🎯 What is this?

This tournament challenges participants to write the fastest possible code to process a **13GB file containing 1 billion temperature measurements**. The twist? You'll learn both **performance optimization** AND **professional GitHub workflows** simultaneously!

## 🏗️ How it Works

1. **Fork & Clone**: Fork this repository and clone it locally
2. **Optimize**: Add your solution to the `submissions/{language}/` folder
3. **Submit**: Create a Pull Request with your optimized code
4. **Compete**: GitHub Actions automatically runs your code and measures performance
5. **Leaderboard**: Results appear on our live leaderboard at [GitHub Pages URL]
6. **Learn**: Master both coding optimization and professional development practices!

## 🚀 Getting Started

### Prerequisites
- Git and GitHub account
- Docker (for local testing)
- Your preferred programming language

### Quick Start
```bash
# 1. Fork this repository on GitHub
# 2. Clone your fork locally
git clone https://github.com/YOUR_USERNAME/billion-rows.git
cd billion-rows

# 3. Create a new branch for your solution
git checkout -b my-optimized-solution

# 4. Add your solution file
# (See submission guidelines below)

# 5. Commit and push
git add .
git commit -m "Add my optimized solution"
git push origin my-optimized-solution

# 6. Create a Pull Request on GitHub
```

## 📁 Project Structure

```
billion-rows/
├── submissions/           # Participant solutions
│   ├── java/            # Java solutions
│   ├── python/          # Python solutions
│   ├── cpp/             # C++ solutions
│   └── go/              # Go solutions
├── data/                 # Challenge data files
├── docker/               # Language-specific Docker environments
├── .github/              # GitHub Actions workflows
├── website/              # Leaderboard website
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## 🏆 Submission Guidelines

### File Naming
- **Java**: `Solution.java` (must contain `Solution` class with `main` method)
- **Python**: `solution.py` (must contain `main()` function)
- **C++**: `solution.cpp` (must contain `main()` function)
- **Go**: `solution.go` (must contain `main()` function)

### Requirements
- Your code must read from `data/measurements.txt`
- Output format: `{station}={min}/{mean}/{max}`
- One station per line, sorted alphabetically
- Must complete within 30 minutes on our test runner

### Example Output
```
Abha=-23.0/18.0/59.2
Bangkok=20.7/26.3/30.4
Cairo=7.2/20.7/33.9
```

## 🏅 Leaderboard

The live leaderboard shows:
- **Ranking**: Based on execution time
- **Language**: Programming language used
- **Participant**: GitHub username
- **Time**: Total execution time
- **Memory**: Peak memory usage
- **Last Updated**: When results were last refreshed

## 🔧 Local Development

### Running Locally
```bash
# Generate test data
./scripts/generate_data.sh

# Test your solution
./scripts/test_solution.sh submissions/java/Solution.java

# Run all tests
./scripts/run_tournament.sh
```

### Docker Development
```bash
# Build development environment
docker build -f docker/java/Dockerfile -t billion-rows-java .

# Run in container
docker run -v $(pwd):/workspace billion-rows-java
```

## 📊 Tournament Rules

1. **Fair Play**: No external network calls, must be self-contained
2. **Time Limit**: 30 minutes maximum execution time
3. **Memory**: 8GB RAM limit
4. **Languages**: Java, Python, C++, Go (more coming soon!)
5. **Updates**: You can submit multiple times, best result counts

## 🎓 Learning Outcomes

By participating, you'll master:
- **Performance Optimization**: Memory management, parallel processing, I/O optimization
- **GitHub Workflows**: Forking, branching, pull requests, CI/CD
- **Professional Development**: Code review, testing, documentation
- **Competitive Programming**: Algorithm optimization, benchmarking

## 🤝 Contributing

Found a bug? Want to add a new language? Have an idea for improvement?

1. Check existing issues
2. Create a new issue describing your idea
3. Fork and create a feature branch
4. Submit a pull request

## 📚 Resources

- [Original Billion Row Challenge](https://github.com/gunnarmorling/1brc)
- [Performance Optimization Guide](docs/optimization-guide.md)
- [GitHub Workflows Tutorial](docs/github-workflows.md)
- [Language-Specific Tips](docs/language-tips.md)

## 🏁 Ready to Compete?

1. **Star this repository** ⭐
2. **Fork and clone** your copy
3. **Add your solution** following the guidelines
4. **Submit a Pull Request** and watch the magic happen!
5. **Check the leaderboard** to see how you rank

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/billion-rows/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/billion-rows/discussions)
- **Wiki**: [Project Wiki](https://github.com/YOUR_USERNAME/billion-rows/wiki)

---

**Good luck, and may the fastest algorithm win!** 🚀

*Built with ❤️ for the programming community*


