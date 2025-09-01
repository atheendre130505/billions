# GitHub Workflows Tutorial

## Understanding the Tournament System

This tournament uses GitHub's powerful workflow system to automatically test and evaluate your submissions.

## How It Works

1. **Fork the Repository**: Create your own copy
2. **Clone Locally**: Download to your machine
3. **Create a Branch**: Work on your solution
4. **Submit via PR**: Create a Pull Request
5. **Automatic Testing**: GitHub Actions runs your code
6. **Results**: Get feedback and see your ranking

## Step-by-Step Guide

### 1. Fork the Repository
- Click the "Fork" button on GitHub
- Choose your account as the destination

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/billion-rows.git
cd billion-rows
```

### 3. Create a Feature Branch
```bash
git checkout -b my-solution
```

### 4. Add Your Solution
- Place your code in the appropriate language folder
- Follow the naming conventions
- Ensure it meets the requirements

### 5. Commit and Push
```bash
git add .
git commit -m "Add my optimized solution"
git push origin my-solution
```

### 6. Create a Pull Request
- Go to your fork on GitHub
- Click "Compare & pull request"
- Add description of your approach
- Submit the PR

## Understanding GitHub Actions

The tournament system automatically:
- Compiles your code
- Runs it against test data
- Measures performance
- Validates output format
- Updates the leaderboard

## Best Practices

1. **Clear Commit Messages**: Describe what you changed
2. **Small, Focused Changes**: One optimization per commit
3. **Test Locally**: Verify your code works before submitting
4. **Documentation**: Explain your optimization approach
5. **Iterative Improvement**: Submit multiple versions

## Troubleshooting

- **Build Failures**: Check the Actions tab for error details
- **Test Failures**: Verify your output format matches requirements
- **Performance Issues**: Check if you're within time/memory limits
