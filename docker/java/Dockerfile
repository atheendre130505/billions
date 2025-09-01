FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /workspace

# Install essential tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    time \
    bc \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Create non-root user for security
RUN useradd -m -u 1000 tournament && \
    chown -R tournament:tournament /workspace

# Switch to non-root user
USER tournament

# Copy tournament runner script
COPY --chown=tournament:tournament scripts/run_tournament.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/run_tournament.sh

# Set default command
CMD ["/bin/bash"]


