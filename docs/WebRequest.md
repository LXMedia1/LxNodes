# WebRequest Node

The WebRequest node uses a headless browser (Puppeteer) to make web requests and return HTML content. It simulates a real browser with configurable user agent and can extract specific content using CSS selectors.

## Features

- Makes web requests using a headless Chrome browser
- Simulates a real browser with configurable user agent
- Extract specific content using CSS selectors
- Wait for dynamically loaded content

## Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| URL | String | The URL to request |
| Use CSS Selector | Boolean | Whether to extract content using a CSS selector |
| CSS Selector | String | CSS selector to extract specific content (e.g., `h1, p`) |
| User Agent | String | The user agent to use for the request |
| Wait Before Extraction | Number | Time to wait in seconds before extracting content |

## Example Usage

### Basic Request

To fetch the full HTML of a website:

1. Add the WebRequest node to your workflow
2. Enter the URL (e.g., `https://example.com`)
3. Leave "Use CSS Selector" disabled
4. Execute the workflow

### Extract Specific Content

To extract only specific elements from a website:

1. Add the WebRequest node to your workflow
2. Enter the URL (e.g., `https://example.com`)
3. Enable "Use CSS Selector"
4. Enter a CSS selector (e.g., `h1, .main-content p`)
5. Execute the workflow

### Wait for Dynamic Content

For websites that load content dynamically with JavaScript:

1. Configure as above
2. Set "Wait Before Extraction" to a value (e.g., `3` seconds)
3. Execute the workflow

## Example Workflow

```javascript
[
  {
    "name": "Start",
    "type": "n8n-nodes-base.start",
    "position": [250, 300]
  },
  {
    "name": "WebRequest",
    "type": "n8n-nodes-webrequest.webRequest",
    "position": [450, 300],
    "parameters": {
      "url": "https://example.com",
      "useCssSelector": true,
      "cssSelector": "h1, p",
      "waitTime": 2
    }
  }
]
```

## Output

The node outputs an object with the following properties:

```json
{
  "url": "https://example.com",
  "content": "<h1>Example Domain</h1><p>This domain is for use in illustrative examples in documents...</p>"
}
``` 