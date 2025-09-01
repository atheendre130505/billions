FROM ubuntu:22.04

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    tar \
    git \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy runner setup script
COPY scripts/setup-github-runner.sh /workspace/
RUN chmod +x /workspace/setup-github-runner.sh

# Expose ports
EXPOSE 8080

# Default command
CMD ["/bin/bash"]


