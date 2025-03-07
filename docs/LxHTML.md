# LxHTML

The LxHTML node is an advanced HTML processing node that provides powerful functionality for working with HTML content in your workflows. It offers four main operations:

## Operations

### Extract

The Extract operation allows you to extract specific content from HTML using selectors. You can:

- Use CSS selectors, XPath, or Smart selectors to target elements
- Extract text content, HTML content, or specific attributes
- Extract tables as structured data
- Fetch HTML from a URL or use HTML provided directly

**Example Use Case**: Extract product prices and descriptions from an e-commerce website.

### Generate

The Generate operation allows you to create HTML content using templates. You can:

- Use Handlebars, EJS, or raw HTML templating
- Populate templates with input data or custom data
- Add responsive design elements automatically
- Create consistent HTML for emails, reports, or web content

**Example Use Case**: Generate HTML email templates with dynamic content from your workflow data.

### Transform

The Transform operation converts HTML to different formats or optimizes it. You can:

- Convert HTML to Markdown
- Extract plain text from HTML
- Optimize HTML (minify, fix broken tags, clean attributes)
- Enhance accessibility by adding appropriate attributes and structure

**Example Use Case**: Convert web content to Markdown for documentation or content management systems.

### Analyze

The Analyze operation examines HTML structure and quality. You can:

- Analyze HTML structure (element counts, nesting levels)
- Check SEO aspects (meta tags, headings, alt attributes)
- Evaluate accessibility compliance
- Identify potential performance issues

**Example Use Case**: Analyze website pages for SEO issues or accessibility compliance.

## Examples

### Extracting Text from HTML

1. Set Operation to "Extract"
2. Select Source: "HTML"
3. Enter your HTML content
4. Set Selector Type to "CSS Selector"
5. Enter a selector (e.g., ".product-price")
6. Set Extraction Type to "Text"

### Generating an HTML Email

1. Set Operation to "Generate"
2. Choose Template Type: "Handlebars"
3. Enter your template with placeholders (e.g., `<h1>{{subject}}</h1><p>{{body}}</p>`)
4. Select Data Source: "Input Data" (or provide custom data)
5. Enable Responsive Design

### Converting HTML to Markdown

1. Set Operation to "Transform"
2. Enter your HTML content
3. Set Transformation Type to "To Markdown"

### Analyzing a Website for SEO

1. Set Operation to "Analyze"
2. Enter your HTML content
3. Set Analysis Type to "SEO Analysis"

## Notes

- The node uses the Cheerio library for parsing and manipulating HTML
- For XPath selection, ensure your XPath expressions are compatible with the library
- When extracting tables, the node attempts to convert them to structured JSON data
- Template generation follows standard Handlebars/EJS syntax with some additional helpers

## Resources

- [Cheerio Documentation](https://cheerio.js.org/)
- [CSS Selectors Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [XPath Reference](https://developer.mozilla.org/en-US/docs/Web/XPath)
- [Handlebars Documentation](https://handlebarsjs.com/) 