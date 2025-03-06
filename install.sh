#!/bin/bash
# LxNodes Installation Script for Linux/Mac
# This script installs the LxNodes package for n8n (WebRequest and WebRequestPro nodes)

# Text colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}Installing LxNodes for n8n...${NC}"

# Check if n8n is installed
if command -v n8n &> /dev/null; then
    N8N_VERSION=$(n8n --version)
    echo -e "${GREEN}Found n8n version $N8N_VERSION${NC}"
else
    echo -e "${RED}n8n is not installed! Please install n8n first.${NC}"
    echo -e "${YELLOW}You can install n8n globally with: npm install n8n -g${NC}"
    exit 1
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Found Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}Node.js is not installed! Please install Node.js first.${NC}"
    exit 1
fi

# Try to use pnpm, fall back to npm
PACKAGE_MANAGER="npm"
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}Found pnpm $PNPM_VERSION${NC}"
    PACKAGE_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}Found npm $NPM_VERSION${NC}"
else
    echo -e "${RED}Neither pnpm nor npm is installed! Please install a package manager.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${CYAN}Installing dependencies...${NC}"
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm install
else
    npm install
fi

# Build the nodes
echo -e "${CYAN}Building nodes...${NC}"
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm build
else
    npm run build
fi

# Create n8n custom directory if it doesn't exist
CUSTOM_DIR="$HOME/.n8n/custom"
if [ ! -d "$CUSTOM_DIR" ]; then
    echo -e "${CYAN}Creating n8n custom directory...${NC}"
    mkdir -p "$CUSTOM_DIR"
fi

# Create symbolic link
CURRENT_PATH=$(pwd)
LINK_PATH="$CUSTOM_DIR/n8n-nodes-lx"

# Remove existing link if it exists
if [ -e "$LINK_PATH" ]; then
    echo -e "${YELLOW}Removing existing installation...${NC}"
    rm -rf "$LINK_PATH"
fi

echo -e "${CYAN}Creating symbolic link...${NC}"
ln -s "$CURRENT_PATH" "$LINK_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Symbolic link created successfully!${NC}"
else
    echo -e "${YELLOW}Failed to create symbolic link. Trying to copy files instead...${NC}"
    cp -r "$CURRENT_PATH" "$LINK_PATH"
    echo -e "${GREEN}Files copied successfully!${NC}"
fi

echo -e "\n${GREEN}Installation completed!${NC}"
echo -e "${CYAN}Please restart n8n to use the LxNodes package.${NC}"
echo -e "${CYAN}You can start n8n with: n8n start${NC}" 