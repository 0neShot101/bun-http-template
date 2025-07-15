#!/bin/bash

# Docker development setup script for Linux/macOS

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Build and start development environment
setup_dev() {
    print_status "Setting up development environment with Docker..."
    
    # Build the image
    print_status "Building Docker image..."
    docker build -t bun-http-template .
    
    # Start the container
    print_status "Starting development container..."
    docker-compose up --build -d
    
    print_status "Development environment is ready!"
    print_status "App running at: http://localhost:3000"
    print_status "Health check: http://localhost:3000/health"
    print_status ""
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop: docker-compose down"
}

# Main execution
check_docker
setup_dev
