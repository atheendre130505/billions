FROM golang:1.21-alpine

# Set working directory
WORKDIR /workspace

# Install essential tools
RUN apk add --no-cache \
    curl \
    wget \
    git \
    time \
    bc \
    build-base

# Set environment variables
ENV GOOS=linux
ENV GOARCH=amd64
ENV CGO_ENABLED=1
ENV GO111MODULE=on

# Create non-root user for security
RUN adduser -D -u 1000 tournament && \
    chown -R tournament:tournament /workspace

# Switch to non-root user
USER tournament

# Copy tournament runner script
COPY --chown=tournament:tournament scripts/run_tournament.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/run_tournament.sh

# Set default command
CMD ["/bin/sh"]


