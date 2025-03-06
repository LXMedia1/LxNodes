# WebRequest Pro Node

The WebRequestPro node is a premium n8n node that uses a headless browser (Puppeteer) to make advanced web requests with powerful features not available in the basic version.

## 🌟 Premium Features

- **JavaScript Selectors**: Extract content using JavaScript DOM selectors copied directly from browser DevTools
- **Authentication Support**: Basic Auth and custom authentication methods
- **Cookie Management**: Set and manage cookies for authenticated sessions
- **Screenshot Capability**: Take full-page or visible area screenshots
- **Custom JavaScript Execution**: Run your own scripts on the page for complex interactions
- **Multiple Element Selection**: Return single elements or arrays of matched elements

## Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| URL | String | The URL to request |
| Authentication | Options | Authentication method to use (None, Basic Auth, Custom) |
| Username | String | Username for custom authentication |
| Password | String | Password for custom authentication |
| Use JavaScript Selector | Boolean | Whether to extract content using a JavaScript selector |
| JavaScript Selector | String | JavaScript selector to extract specific content |
| Return Multiple Elements | Boolean | Whether to return multiple elements as an array |
| User Agent | String | The user agent to use for the request |
| Cookies | Collection | Cookies to include with the request |
| Take Screenshot | Boolean | Whether to take a screenshot of the page |
| Screenshot Type | Options | Type of screenshot to take (Full Page or Visible Area) |
| Wait Before Extraction | Number | Time to wait in seconds before extracting content |
| Execute Custom JavaScript | Boolean | Whether to execute custom JavaScript on the page |
| Custom JavaScript | String | JavaScript code to execute on the page |

## Example Usage

### Basic JavaScript Selector

To extract content using a JavaScript selector:

1. Add the WebRequestPro node to your workflow
2. Enter the URL (e.g., `https://example.com`)
3. Enable "Use JavaScript Selector"
4. Enter a JavaScript selector (e.g., `document.querySelector("body > div.wrapper > div.maincontainer")`)
5. Execute the workflow

### Taking a Screenshot

To capture a screenshot of the webpage:

1. Configure the node with a URL
2. Enable "Take Screenshot"
3. Select either "Full Page" or "Visible Area"
4. Execute the workflow
5. The output will include a base64-encoded screenshot in the `screenshot` property

### Using Cookies

To include cookies with your request:

1. Configure the node with a URL
2. Add one or more cookies in the Cookies section:
   - Name: `session`
   - Value: `your-session-token`
   - Domain: `example.com`
3. Execute the workflow

### Authentication Example

To authenticate with a website:

1. Configure the node with a URL
2. Set Authentication to "Basic Auth" or "Custom"
3. If using Basic Auth, configure the credentials in n8n
4. If using Custom, enter the username and password
5. Execute the workflow

### Advanced: Custom JavaScript Execution

To interact with a page using custom JavaScript:

1. Configure the node with a URL
2. Enable "Execute Custom JavaScript"
3. Enter your JavaScript code, for example:
```javascript
// Click a button
document.querySelector("#submit-button").click();
// Wait for content to load
await new Promise(r => setTimeout(r, 2000));
// Fill a form
document.querySelector("#username").value = "test";
```
4. Execute the workflow

## Example Workflow

```javascript
[
  {
    "name": "Start",
    "type": "n8n-nodes-base.start",
    "position": [250, 300]
  },
  {
    "name": "WebRequestPro",
    "type": "n8n-nodes-webrequest.webRequestPro",
    "position": [450, 300],
    "parameters": {
      "url": "https://example.com",
      "useJsSelector": true,
      "jsSelector": "document.querySelector('body > div.wrapper > div.maincontainer')",
      "returnMultiple": false,
      "takeScreenshot": true,
      "screenshotType": "fullPage",
      "authentication": "none",
      "executeCustomJs": false,
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
  "content": "<div class=\"maincontainer\">...</div>",
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## Comparison with Basic WebRequest Node

| Feature | WebRequest | WebRequestPro |
|---------|-----------|---------------|
| Headless Browser | ✅ | ✅ |
| CSS Selectors | ✅ | ❌ |
| JavaScript Selectors | ❌ | ✅ |
| User Agent Customization | ✅ | ✅ |
| Authentication | ❌ | ✅ |
| Cookie Management | ❌ | ✅ |
| Screenshots | ❌ | ✅ |
| Custom JavaScript | ❌ | ✅ | 