FROM python:3.11-slim

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

# Install Python packages for performance optimization
RUN pip install --no-cache-dir \
    pandas \
    numpy \
    numba \
    line_profiler \
    memory_profiler

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


