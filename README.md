[# LxNodes for n8n

<div align="center">
  <img src="./logo.svg" alt="LxNodes Premium Web Automation Tools" width="200" />
  <h3>Premium Web Automation Nodes for n8n</h3>
</div>

This repository contains powerful custom nodes for [n8n](https://n8n.io) that enable advanced web automation and HTML processing:

- **WebRequest**: Basic headless browser requests with CSS selector support
- **WebRequestPro**: Premium version with advanced features including JavaScript selectors, authentication, screenshots, and more
- **LxHTML**: Advanced HTML processing with extraction, generation, transformation, and analysis capabilities

## Features Overview

### WebRequest (Basic)
- Makes web requests using a headless Chrome browser
- Simulates a real browser with configurable user agent
- Extract specific content using CSS selectors
- Wait for dynamically loaded content

### WebRequestPro (Premium)
- **JavaScript Selectors**: Copy selectors directly from browser DevTools
- **Authentication**: Basic and custom authentication methods
- **Cookie Management**: Set cookies for authenticated sessions
- **Screenshots**: Capture full-page or visible area screenshots
- **Custom JavaScript**: Execute scripts on the page for complex interactions
- **Multiple Selection**: Return all matching elements as an array

### LxHTML (Advanced HTML Processing)
- **Extract**: Extract content from HTML using CSS selectors, XPath, or Smart selectors
- **Generate**: Create HTML content using template engines with responsive design support
- **Transform**: Convert HTML to different formats or optimize existing HTML
- **Analyze**: Examine HTML structure and quality for SEO, accessibility, and performance

## Quick Installation

### Windows (PowerShell)
```powershell
# Install using the script
.\install.ps1
```

### Linux/Mac
```bash
# Make the script executable
chmod +x ./install.sh

# Install using the script
./install.sh
```

## Manual Installation

### Prerequisites
- [n8n](https://n8n.io/) (version 0.171.0 or newer)
- [Node.js](https://nodejs.org/en/) (version 18 or newer)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Steps
1. Clone this repository:
```bash
git clone https://github.com/yourusername/n8n-nodes-lx.git
```

2. Install dependencies:
```bash
cd n8n-nodes-lx
pnpm install
```

3. Build the nodes:
```bash
pnpm build
```

4. Create a symbolic link to your n8n custom nodes directory:
```bash
# Linux/Mac
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-lx

# Windows (in PowerShell as Administrator)
mkdir -Force -Path $env:USERPROFILE\.n8n\custom
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.n8n\custom\n8n-nodes-lx" -Target "$(pwd)"
```

5. Restart n8n

## Usage Examples

### Basic Web Request
```javascript
// Example workflow using the WebRequest node
[
  {
    "name": "Start",
    "type": "n8n-nodes-base.start",
    "position": [
      250,
      300
    ]
  },
  {
    "name": "WebRequest",
    "type": "n8n-nodes-lx.webRequest",
    "position": [
      450,
      300
    ],
    "parameters": {
      "url": "https://example.com",
      "useCssSelector": true,
      "cssSelector": "h1, p"
    }
  }
]
```

### Advanced Web Request with JavaScript Selector
```javascript
// Example workflow using the WebRequestPro node
[
  {
    "name": "Start",
    "type": "n8n-nodes-base.start",
    "position": [
      250,
      300
    ]
  },
  {
    "name": "WebRequestPro",
    "type": "n8n-nodes-lx.webRequestPro",
    "position": [
      450,
      300
    ],
    "parameters": {
      "url": "https://example.com",
      "useJsSelector": true,
      "jsSelector": "document.querySelector('body > div.wrapper > div.maincontainer')",
      "returnMultiple": false,
      "takeScreenshot": true,
      "screenshotType": "fullPage"
    }
  }
]
```

### HTML Analysis for SEO
```javascript
// Example workflow using the LxHTML node for SEO analysis
[
  {
    "name": "Start",
    "type": "n8n-nodes-base.start",
    "position": [
      250,
      300
    ]
  },
  {
    "name": "HTTP Request",
    "type": "n8n-nodes-base.httpRequest",
    "position": [
      450,
      300
    ],
    "parameters": {
      "url": "https://example.com",
      "method": "GET"
    }
  },
  {
    "name": "LxHTML",
    "type": "n8n-nodes-lx.lxHtml",
    "position": [
      650,
      300
    ],
    "parameters": {
      "operation": "analyze",
      "htmlAnalyze": "={{ $json.data }}",
      "analysisType": "seo"
    }
  }
]
```

## Documentation

- [WebRequest Node](./docs/WebRequest.md)
- [WebRequestPro Node](./docs/WebRequestPro.md)
- [LxHTML Node](./docs/LxHTML.md)
- [Publishing Guide](./docs/PUBLISHING.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
](https://github.com/LXMedia1/LxNodes)
