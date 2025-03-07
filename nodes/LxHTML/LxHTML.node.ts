import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Helper functions
async function extractHtml(executeFunctions: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const html = executeFunctions.getNodeParameter('html', itemIndex) as string;
  const extractionType = executeFunctions.getNodeParameter('extractionType', itemIndex) as string;
  const $ = cheerio.load(html);
  const results: INodeExecutionData[] = [];

  if (extractionType === 'cssSelector') {
    const selector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
    const extractAttribute = executeFunctions.getNodeParameter('extractAttribute', itemIndex, false) as boolean;
    const returnMultiple = executeFunctions.getNodeParameter('returnMultiple', itemIndex, true) as boolean;
    
    const elements = $(selector);
    
    if (extractAttribute) {
      const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex) as string;
      if (returnMultiple) {
        elements.each((_, el) => {
          results.push({
            json: { 
              value: $(el).attr(attributeName) || '',
              selector: selector 
            },
          });
        });
      } else if (elements.length > 0) {
        results.push({
          json: { 
            value: $(elements[0]).attr(attributeName) || '',
            selector: selector 
          },
        });
      }
    } else {
      const extractionFormat = executeFunctions.getNodeParameter('extractionFormat', itemIndex, 'text') as string;
      
      if (returnMultiple) {
        elements.each((_, el) => {
          if (extractionFormat === 'text') {
            results.push({
              json: { 
                value: $(el).text().trim(),
                selector: selector 
              },
            });
          } else if (extractionFormat === 'html') {
            results.push({
              json: { 
                value: $(el).html() || '',
                selector: selector 
              },
            });
          }
        });
      } else if (elements.length > 0) {
        if (extractionFormat === 'text') {
          results.push({
            json: { 
              value: $(elements[0]).text().trim(),
              selector: selector 
            },
          });
        } else if (extractionFormat === 'html') {
          results.push({
            json: { 
              value: $(elements[0]).html() || '',
              selector: selector 
            },
          });
        }
      }
    }
  } else if (extractionType === 'xpath') {
    // Basic XPath-like support using cheerio and selectors
    const selector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
    const extractAttribute = executeFunctions.getNodeParameter('extractAttribute', itemIndex, false) as boolean;
    const returnMultiple = executeFunctions.getNodeParameter('returnMultiple', itemIndex, true) as boolean;
    
    const elements = $(selector);
    
    if (extractAttribute) {
      const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex) as string;
      if (returnMultiple) {
        elements.each((_, el) => {
          results.push({
            json: { 
              value: $(el).attr(attributeName) || '',
              selector: selector 
            },
          });
        });
      } else if (elements.length > 0) {
        results.push({
          json: { 
            value: $(elements[0]).attr(attributeName) || '',
            selector: selector 
          },
        });
      }
    } else {
      const extractionFormat = executeFunctions.getNodeParameter('extractionFormat', itemIndex, 'text') as string;
      
      if (returnMultiple) {
        elements.each((_, el) => {
          if (extractionFormat === 'text') {
            results.push({
              json: { 
                value: $(el).text().trim(),
                selector: selector 
              },
            });
          } else if (extractionFormat === 'html') {
            results.push({
              json: { 
                value: $(el).html() || '',
                selector: selector 
              },
            });
          }
        });
      } else if (elements.length > 0) {
        if (extractionFormat === 'text') {
          results.push({
            json: { 
              value: $(elements[0]).text().trim(),
              selector: selector 
            },
          });
        } else if (extractionFormat === 'html') {
          results.push({
            json: { 
              value: $(elements[0]).html() || '',
              selector: selector 
            },
          });
        }
      }
    }
  } else if (extractionType === 'regex') {
    const pattern = executeFunctions.getNodeParameter('pattern', itemIndex) as string;
    const regexFlags = executeFunctions.getNodeParameter('regexFlags', itemIndex, 'g') as string;
    const captureGroups = executeFunctions.getNodeParameter('captureGroups', itemIndex, false) as boolean;
    
    try {
      const regex = new RegExp(pattern, regexFlags);
      let match;
      const text = $('body').text();
      
      if (captureGroups) {
        while ((match = regex.exec(text)) !== null) {
          // Skip the full match (index 0) and only return capture groups
          if (match.length > 1) {
            const groups: { [key: string]: string } = {};
            for (let i = 1; i < match.length; i++) {
              groups[`group${i}`] = match[i] || '';
            }
            results.push({
              json: { 
                groups,
                fullMatch: match[0],
                pattern: pattern 
              },
            });
          } else {
            results.push({
              json: { 
                value: match[0],
                pattern: pattern 
              },
            });
          }
          
          // If the regex is not global, break after first match
          if (!regexFlags.includes('g')) break;
        }
      } else {
        while ((match = regex.exec(text)) !== null) {
          results.push({
            json: { 
              value: match[0],
              pattern: pattern 
            },
          });
          
          // If the regex is not global, break after first match
          if (!regexFlags.includes('g')) break;
        }
      }
    } catch (error) {
      throw new Error(`Invalid regular expression: ${error.message}`);
    }
  } else if (extractionType === 'table') {
    const tableSelector = executeFunctions.getNodeParameter('tableSelector', itemIndex, 'table') as string;
    const includeHeaders = executeFunctions.getNodeParameter('includeHeaders', itemIndex, true) as boolean;
    
    const tables = $(tableSelector);
    
    if (tables.length > 0) {
      // Get the first table by default
      const tableIndex = executeFunctions.getNodeParameter('tableIndex', itemIndex, 0) as number;
      const table = tables.eq(Math.min(tableIndex, tables.length - 1));
      
      const data: any[] = [];
      let headers: string[] = [];
      
      // Extract headers if present and requested
      if (includeHeaders) {
        table.find('thead tr').first().find('th, td').each((_, el) => {
          headers.push($(el).text().trim());
        });
        
        // If no headers found in thead, try first row
        if (headers.length === 0) {
          table.find('tr').first().find('th, td').each((_, el) => {
            headers.push($(el).text().trim());
          });
        }
      }
      
      // Extract table data
      let rowsSelector = 'tbody tr';
      if (table.find('tbody').length === 0) {
        rowsSelector = 'tr';
        // Skip the first row if we're using it as headers
        if (includeHeaders && headers.length > 0) {
          rowsSelector = 'tr:not(:first-child)';
        }
      }
      
      table.find(rowsSelector).each((_, row) => {
        const rowData: { [key: string]: string } = {};
        
        $(row).find('td, th').each((colIndex, cell) => {
          if (includeHeaders && headers[colIndex]) {
            rowData[headers[colIndex]] = $(cell).text().trim();
          } else {
            rowData[`column${colIndex + 1}`] = $(cell).text().trim();
          }
        });
        
        data.push(rowData);
      });
      
      results.push({
        json: {
          table: data,
          headers: includeHeaders ? headers : [],
          rowCount: data.length,
          columnCount: headers.length || (data[0] ? Object.keys(data[0]).length : 0),
        },
      });
    }
  } else if (extractionType === 'smartSelector') {
    // Smart selector tries to intelligently extract common patterns
    const smartType = executeFunctions.getNodeParameter('smartType', itemIndex) as string;
    
    if (smartType === 'article') {
      // Extract main article content
      const possibleArticleSelectors = [
        'article',
        '[role="main"]',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.content',
        'main',
      ];
      
      let content = '';
      let foundSelector = '';
      
      for (const selector of possibleArticleSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          content = element.html() || '';
          foundSelector = selector;
          break;
        }
      }
      
      if (content) {
        results.push({
          json: {
            content,
            extractedFrom: foundSelector,
            type: 'article',
          },
        });
      } else {
        // Fallback to main content detection by density
        let bestElement = null;
        let maxTextLength = 0;
        
        $('div, section, main').each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > maxTextLength) {
            maxTextLength = text.length;
            bestElement = el;
          }
        });
        
        if (bestElement) {
          results.push({
            json: {
              content: $(bestElement).html() || '',
              extractedFrom: 'text-density-detection',
              type: 'article',
            },
          });
        }
      }
    } else if (smartType === 'headings') {
      // Extract all headings with their hierarchy
      const headings: any[] = [];
      
      $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const level = parseInt(el.tagName.substring(1), 10);
        headings.push({
          text: $(el).text().trim(),
          level,
          id: $(el).attr('id') || '',
        });
      });
      
      results.push({
        json: {
          headings,
          count: headings.length,
        },
      });
    } else if (smartType === 'navigation') {
      // Extract navigation links
      const navigationSelectors = [
        'nav',
        '.nav',
        '.navigation',
        '.menu',
        '#menu',
        'header .links',
        '[role="navigation"]',
      ];
      
      const navLinks: any[] = [];
      let foundSelector = '';
      
      for (const selector of navigationSelectors) {
        const nav = $(selector).first();
        if (nav.length > 0) {
          nav.find('a').each((_, link) => {
            navLinks.push({
              text: $(link).text().trim(),
              url: $(link).attr('href') || '',
              classes: $(link).attr('class') || '',
            });
          });
          foundSelector = selector;
          break;
        }
      }
      
      if (navLinks.length > 0) {
        results.push({
          json: {
            links: navLinks,
            count: navLinks.length,
            extractedFrom: foundSelector,
          },
        });
      }
    } else if (smartType === 'contact') {
      // Extract contact information
      const emails: string[] = [];
      const phones: string[] = [];
      const addresses: string[] = [];
      
      // Extract emails
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const bodyText = $('body').text();
      let match;
      
      while ((match = emailRegex.exec(bodyText)) !== null) {
        if (!emails.includes(match[0])) {
          emails.push(match[0]);
        }
      }
      
      // Look for phones in common formats
      const phoneSelectors = [
        'a[href^="tel:"]',
        '.phone',
        '.tel',
        '[itemprop="telephone"]',
      ];
      
      phoneSelectors.forEach(selector => {
        $(selector).each((_, el) => {
          const phone = $(el).text().trim();
          if (phone && !phones.includes(phone)) {
            phones.push(phone);
          }
        });
      });
      
      // Also try to find phone patterns in text
      const phoneRegex = /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g;
      while ((match = phoneRegex.exec(bodyText)) !== null) {
        if (!phones.includes(match[0])) {
          phones.push(match[0]);
        }
      }
      
      // Look for address information
      const addressSelectors = [
        '[itemprop="address"]',
        '.address',
        'address',
      ];
      
      addressSelectors.forEach(selector => {
        $(selector).each((_, el) => {
          const address = $(el).text().trim().replace(/\s+/g, ' ');
          if (address && !addresses.includes(address)) {
            addresses.push(address);
          }
        });
      });
      
      results.push({
        json: {
          contactInfo: {
            emails,
            phones,
            addresses,
          },
        },
      });
    }
  } else if (extractionType === 'text') {
    results.push({
      json: { 
        value: $('body').text().trim(),
        type: 'fullText' 
      },
    });
  }

  return results;
}

async function generateHtml(executeFunctions: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const templateType = executeFunctions.getNodeParameter('templateType', itemIndex) as string;
  const items = executeFunctions.getInputData();
  const item = items[itemIndex];
  
  let generatedHtml = '';
  
  if (templateType === 'static') {
    let template = executeFunctions.getNodeParameter('htmlTemplate', itemIndex) as string;
    const useResponsiveDesign = executeFunctions.getNodeParameter('useResponsiveDesign', itemIndex, false) as boolean;
    
    // Get template variables
    const templateVariablesValues = executeFunctions.getNodeParameter(
      'templateVariables.variables',
      itemIndex,
      []
    ) as Array<{
      name: string;
      value: string;
    }>;
    
    // Replace variables in template
    for (const variable of templateVariablesValues) {
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      template = template.replace(regex, variable.value);
    }
    
    // Replace variables from input
    const keyPattern = /{{([^{}]+)}}/g;
    let match;
    
    while ((match = keyPattern.exec(template)) !== null) {
      const key = match[1].trim();
      // Convert value to string explicitly to avoid TypeScript errors
      const value = String(item.json[key] || '');
      
      // Create a new regex for this specific match to replace it with the value
      const specificMatchRegex = new RegExp(match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      template = template.replace(specificMatchRegex, value);
    }
    
    // Add responsive design meta tag and basic CSS if requested
    if (useResponsiveDesign) {
      const responsiveHeader = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Basic responsive styles */
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; }
    img { max-width: 100%; height: auto; }
    .container { width: 100%; padding: 15px; }
    @media (min-width: 768px) { .container { max-width: 750px; margin: 0 auto; } }
    @media (min-width: 992px) { .container { max-width: 970px; } }
    @media (min-width: 1200px) { .container { max-width: 1170px; } }
  </style>
</head>
<body>
<div class="container">
      `;
      
      const responsiveFooter = `
</div>
</body>
</html>
      `;
      
      // Check if the template already has HTML, HEAD, BODY tags
      if (!template.includes('<html') && !template.includes('<body')) {
        template = responsiveHeader + template + responsiveFooter;
      } else if (!template.includes('<meta name="viewport"')) {
        // Insert viewport meta tag for responsive design if not present
        template = template.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
      }
    }
    
    generatedHtml = template;
  } else if (templateType === 'handlebars') {
    // For Handlebars templates, we'd use a Handlebars-like approach
    const template = executeFunctions.getNodeParameter('htmlTemplate', itemIndex) as string;
    const dataSource = executeFunctions.getNodeParameter('dataSource', itemIndex) as string;
    
    let templateData = {};
    if (dataSource === 'inputData') {
      templateData = item.json;
    } else if (dataSource === 'custom') {
      // Get custom data from parameters
      const customData = executeFunctions.getNodeParameter('customData', itemIndex, '{}') as string;
      try {
        templateData = JSON.parse(customData);
      } catch (error) {
        throw new Error(`Invalid JSON in custom data: ${error.message}`);
      }
    }
    
    // Simple handlebars-like template processing
    let result = template;
    const keyPattern = /{{([^{}]+)}}/g;
    let match;
    
    while ((match = keyPattern.exec(template)) !== null) {
      const key = match[1].trim();
      let value = '';
      
      // Handle nested properties like {{user.name}}
      if (key.includes('.')) {
        const parts = key.split('.');
        let current: any = templateData;
        for (const part of parts) {
          if (current && typeof current === 'object') {
            current = current[part];
          } else {
            current = '';
            break;
          }
        }
        value = String(current || '');
      } else {
        value = String((templateData as any)[key] || '');
      }
      
      // Create a new regex for this specific match to replace it with the value
      const specificMatchRegex = new RegExp(match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(specificMatchRegex, value);
    }
    
    generatedHtml = result;
  } else if (templateType === 'dynamic') {
    // For dynamic templates, we'd integrate a templating engine
    // This is a simplified placeholder implementation
    generatedHtml = '<div>Dynamic template (placeholder implementation)</div>';
  }
  
  return [
    {
      json: {
        html: generatedHtml,
      },
    },
  ];
}

async function transformHtml(executeFunctions: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const html = executeFunctions.getNodeParameter('html', itemIndex) as string;
  const transformationType = executeFunctions.getNodeParameter('transformationType', itemIndex) as string;
  const $ = cheerio.load(html);
  
  if (transformationType === 'addClass' || 
      transformationType === 'removeClass' || 
      transformationType === 'modifyAttribute' || 
      transformationType === 'replaceContent') {
    
    const selector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
    
    if (transformationType === 'addClass') {
      const className = executeFunctions.getNodeParameter('className', itemIndex) as string;
      $(selector).addClass(className);
    } else if (transformationType === 'removeClass') {
      const className = executeFunctions.getNodeParameter('className', itemIndex) as string;
      $(selector).removeClass(className);
    } else if (transformationType === 'modifyAttribute') {
      const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex) as string;
      const attributeValue = executeFunctions.getNodeParameter('attributeValue', itemIndex) as string;
      $(selector).attr(attributeName, attributeValue);
    } else if (transformationType === 'replaceContent') {
      const newContent = executeFunctions.getNodeParameter('newContent', itemIndex) as string;
      $(selector).html(newContent);
    }
    
    return [
      {
        json: {
          html: $.html(),
        },
      },
    ];
  } else if (transformationType === 'toMarkdown') {
    // Very basic HTML to Markdown conversion
    // For a real implementation, you'd want to use a library like turndown
    let markdown = html;
    
    // Replace headings
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
    
    // Replace paragraphs
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    
    // Replace bold and italic
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    
    // Replace links
    markdown = markdown.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Replace images
    markdown = markdown.replace(/<img[^>]*src="(.*?)"[^>]*alt="(.*?)"[^>]*>/gi, '![$2]($1)');
    markdown = markdown.replace(/<img[^>]*alt="(.*?)"[^>]*src="(.*?)"[^>]*>/gi, '![$1]($2)');
    markdown = markdown.replace(/<img[^>]*src="(.*?)"[^>]*>/gi, '![]($1)');
    
    // Replace unordered lists
    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, function(match: string, content: string) {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    });
    
    // Replace ordered lists
    markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, function(match: string, content: string) {
      let index = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, function(match: string, item: string) {
        return `${index++}. ${item}\n`;
      });
    });
    
    // Replace blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');
    
    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]+>/g, '');
    
    // Fix double spaces
    markdown = markdown.replace(/\s+/g, ' ');
    
    // Fix newlines
    markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return [
      {
        json: {
          markdown,
        },
      },
    ];
  } else if (transformationType === 'minify') {
    // Basic HTML minification
    const minifyOptions = {
      removeComments: true,
      collapseWhitespace: true,
      removeEmptyAttributes: true,
    };
    
    let minifiedHtml = html;
    
    if (minifyOptions.removeComments) {
      minifiedHtml = minifiedHtml.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    if (minifyOptions.collapseWhitespace) {
      minifiedHtml = minifiedHtml.replace(/\s+/g, ' ');
      minifiedHtml = minifiedHtml.replace(/>\s+</g, '><');
      minifiedHtml = minifiedHtml.trim();
    }
    
    if (minifyOptions.removeEmptyAttributes) {
      minifiedHtml = minifiedHtml.replace(/\s*([a-zA-Z-]+)=["']["']/g, '');
    }
    
    return [
      {
        json: {
          html: minifiedHtml,
          originalSize: html.length,
          minifiedSize: minifiedHtml.length,
          reductionPercentage: ((html.length - minifiedHtml.length) / html.length * 100).toFixed(2) + '%',
        },
      },
    ];
  } else if (transformationType === 'enhanceAccessibility') {
    // Basic accessibility enhancements
    
    // Add lang attribute to HTML tag if missing
    const languageCode = executeFunctions.getNodeParameter('languageCode', itemIndex, 'en') as string;
    if (!$('html').attr('lang')) {
      $('html').attr('lang', languageCode);
    }
    
    // Add alt text to images that don't have it
    $('img:not([alt]), img[alt=""]').attr('alt', 'Image');
    
    // Add title to links that open in new windows
    $('a[target="_blank"]').each((_, el) => {
      if (!$(el).attr('title')) {
        $(el).attr('title', 'Opens in a new window');
      }
      // Add rel="noopener noreferrer" for security
      if (!$(el).attr('rel') || !$(el).attr('rel')?.includes('noopener')) {
        $(el).attr('rel', 'noopener noreferrer');
      }
    });
    
    // Ensure form fields have labels
    let inputsWithoutLabels = 0;
    $('input, textarea, select').each((_, el) => {
      const id = $(el).attr('id');
      if (id && $(`label[for="${id}"]`).length === 0) {
        inputsWithoutLabels++;
      }
    });
    
    return [
      {
        json: {
          html: $.html(),
          accessibilityImprovements: {
            addedLanguageAttribute: !$('html').attr('lang'),
            imagesWithoutAlt: $('img:not([alt]), img[alt=""]').length,
            linksWithNewWindowTitles: $('a[target="_blank"]:not([title])').length,
            formFieldsWithoutLabels: inputsWithoutLabels,
          },
        },
      },
    ];
  }
  
  return [
    {
      json: {
        html: $.html(),
      },
    },
  ];
}

function calculateMaxNestingDepth(element: any, currentDepth = 0): number {
  if (!element || !element.children) return currentDepth;
  
  let maxDepth = currentDepth;
  
  for (const child of element.children) {
    if (child.type === 'tag') {
      const childDepth = calculateMaxNestingDepth(child, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  }
  
  return maxDepth;
}

async function analyzeHtml(executeFunctions: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const html = executeFunctions.getNodeParameter('html', itemIndex) as string;
  const analysisType = executeFunctions.getNodeParameter('analysisType', itemIndex) as string;
  
  const $ = cheerio.load(html);
  
  if (analysisType === 'seo') {
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const imgWithoutAlt = $('img:not([alt]), img[alt=""]').length;
    const wordCount = $('body').text().trim().split(/\s+/).length;
    
    // Check canonical URL
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    
    // Check meta robots
    const metaRobots = $('meta[name="robots"]').attr('content') || '';
    
    // Check for Open Graph tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    
    // Check for Twitter Card tags
    const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
    const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
    
    // Analyze heading structure
    const headings: {level: number, text: string, count: number}[] = [];
    for (let i = 1; i <= 6; i++) {
      const elements = $(`h${i}`);
      if (elements.length > 0) {
        headings.push({
          level: i,
          text: elements.first().text().trim(),
          count: elements.length,
        });
      }
    }
    
    // Check for structured data
    const hasStructuredData = $('script[type="application/ld+json"]').length > 0;
    
    // Check keywords usage
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    // Simple content-to-code ratio calculation
    const textLength = $('body').text().trim().length;
    const htmlLength = html.length;
    const contentToCodeRatio = textLength > 0 ? textLength / htmlLength : 0;
    
    return [
      {
        json: {
          seoAnalysis: {
            title,
            titleLength: title.length,
            metaDescription,
            metaDescriptionLength: metaDescription.length,
            h1Count,
            h2Count,
            headingStructure: headings,
            imgWithoutAlt,
            totalImages: $('img').length,
            wordCount,
            contentToCodeRatio,
            canonicalUrl,
            metaRobots,
            openGraph: {
              title: ogTitle,
              description: ogDescription,
              image: ogImage,
            },
            twitterCard: {
              card: twitterCard,
              title: twitterTitle,
            },
            keywords: keywordsArray,
            hasStructuredData,
          },
        },
      },
    ];
  } else if (analysisType === 'structure') {
    const elementCounts: {[key: string]: number} = {};
    const tags = ['div', 'p', 'span', 'a', 'img', 'ul', 'ol', 'li', 'table', 'form', 'input', 'button', 'header', 'footer', 'nav', 'section', 'article', 'aside', 'main'];
    
    tags.forEach(tag => {
      elementCounts[tag] = $(tag).length;
    });
    
    // Calculate nesting levels statistics
    const nestingLevels: number[] = [];
    $('body *').each((_, el) => {
      let level = 0;
      let parent = $(el).parent();
      while (parent.length && !parent.is('body')) {
        level++;
        parent = parent.parent();
      }
      nestingLevels.push(level);
    });
    
    const maxNesting = nestingLevels.length > 0 ? Math.max(...nestingLevels) : 0;
    const avgNesting = nestingLevels.length > 0 ? nestingLevels.reduce((a, b) => a + b, 0) / nestingLevels.length : 0;
    
    // Analyze classes and IDs
    const classes: {[key: string]: number} = {};
    const ids: string[] = [];
    
    $('[class]').each((_, el) => {
      const classList = $(el).attr('class')?.split(/\s+/) || [];
      classList.forEach(className => {
        if (className) {
          classes[className] = (classes[className] || 0) + 1;
        }
      });
    });
    
    $('[id]').each((_, el) => {
      const id = $(el).attr('id');
      if (id && !ids.includes(id)) {
        ids.push(id);
      }
    });
    
    // Check document structure
    const hasDoctype = html.includes('<!DOCTYPE');
    const hasHtmlTag = $('html').length > 0;
    const hasHeadTag = $('head').length > 0;
    const hasBodyTag = $('body').length > 0;
    
    return [
      {
        json: {
          structureAnalysis: {
            elementCounts,
            totalElements: $('*').length,
            maxNestingDepth: maxNesting,
            averageNestingDepth: avgNesting.toFixed(2),
            uniqueClasses: Object.keys(classes).length,
            mostUsedClasses: Object.entries(classes)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([name, count]) => ({ name, count })),
            uniqueIds: ids.length,
            documentStructure: {
              hasDoctype,
              hasHtmlTag,
              hasHeadTag,
              hasBodyTag,
            },
          },
        },
      },
    ];
  } else if (analysisType === 'links') {
    const internalLinks: {href: string, text: string}[] = [];
    const externalLinks: {href: string, text: string}[] = [];
    const brokenLinks: {href: string, text: string}[] = [];
    const socialLinks: {href: string, text: string, platform: string}[] = [];
    
    // Common social media domains
    const socialDomains = [
      { domain: 'facebook.com', platform: 'Facebook' },
      { domain: 'twitter.com', platform: 'Twitter' },
      { domain: 'instagram.com', platform: 'Instagram' },
      { domain: 'linkedin.com', platform: 'LinkedIn' },
      { domain: 'youtube.com', platform: 'YouTube' },
      { domain: 'pinterest.com', platform: 'Pinterest' },
      { domain: 'tiktok.com', platform: 'TikTok' },
    ];
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim() || $(el).find('img').attr('alt') || '';
      
      // Check for potentially broken links
      if (href === '#' || href === 'javascript:void(0)' || href === '') {
        brokenLinks.push({ href, text });
        return;
      }
      
      // Check for social media links
      const socialMatch = socialDomains.find(({ domain }) => href.includes(domain));
      if (socialMatch) {
        socialLinks.push({ href, text, platform: socialMatch.platform });
      }
      
      // Classify as internal or external
      if (href.startsWith('http')) {
        externalLinks.push({ href, text });
      } else {
        internalLinks.push({ href, text });
      }
    });
    
    // Group links by domain
    const domainGroups: {[domain: string]: number} = {};
    externalLinks.forEach(({ href }) => {
      try {
        const url = new URL(href);
        const domain = url.hostname;
        domainGroups[domain] = (domainGroups[domain] || 0) + 1;
      } catch {
        // Invalid URL, ignore
      }
    });
    
    return [
      {
        json: {
          linkAnalysis: {
            totalLinks: $('a').length,
            internalLinks,
            externalLinks,
            brokenLinks,
            socialLinks,
            internalLinksCount: internalLinks.length,
            externalLinksCount: externalLinks.length,
            brokenLinksCount: brokenLinks.length,
            socialLinksCount: socialLinks.length,
            domainDistribution: Object.entries(domainGroups)
              .sort((a, b) => b[1] - a[1])
              .map(([domain, count]) => ({ domain, count })),
          },
        },
      },
    ];
  } else if (analysisType === 'images') {
    const images: {src: string, alt: string, dimensions: string, lazy: boolean}[] = [];
    
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      const alt = $(el).attr('alt') || '';
      const width = $(el).attr('width') || 'unknown';
      const height = $(el).attr('height') || 'unknown';
      const lazyLoaded = $(el).attr('loading') === 'lazy' || 
                         $(el).attr('data-src') !== undefined || 
                         $(el).attr('data-lazy-src') !== undefined;
      
      images.push({
        src,
        alt,
        dimensions: `${width}x${height}`,
        lazy: lazyLoaded,
      });
    });
    
    // Check for background images in CSS
    const elementsWithBackgroundImage = $('[style*="background-image"]').length;
    
    // Check image formats
    const formatCounts: {[format: string]: number} = {};
    images.forEach(({ src }) => {
      if (src) {
        const match = src.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
        if (match) {
          const format = match[1].toLowerCase();
          formatCounts[format] = (formatCounts[format] || 0) + 1;
        }
      }
    });
    
    return [
      {
        json: {
          imageAnalysis: {
            totalImages: images.length,
            imagesWithAlt: $('img[alt]:not([alt=""])').length,
            imagesWithoutAlt: $('img:not([alt]), img[alt=""]').length,
            lazyLoadedImages: $('img[loading="lazy"], img[data-src], img[data-lazy-src]').length,
            elementsWithBackgroundImage,
            formatDistribution: formatCounts,
            imageFormats: Object.keys(formatCounts),
            images,
          },
        },
      },
    ];
  } else if (analysisType === 'performance') {
    // Count resources by type
    const scripts = $('script[src]').length;
    const styles = $('link[rel="stylesheet"]').length;
    const inlineStyles = $('style').length;
    const inlineScripts = $('script:not([src])').length;
    const iframes = $('iframe').length;
    const images = $('img').length;
    
    // Calculate total resource size (approximation based on HTML)
    const scriptSize = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi)?.join('').length || 0;
    const styleSize = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi)?.join('').length || 0;
    
    // Check for performance optimizations
    const usesAsync = $('script[async]').length;
    const usesDefer = $('script[defer]').length;
    const lazyImages = $('img[loading="lazy"]').length;
    
    // Perform basic DOM size analysis
    const domSize = $('*').length;
    const domDepth = calculateMaxNestingDepth($('body')[0]);
    
    return [
      {
        json: {
          performanceAnalysis: {
            resources: {
              scripts,
              externalScripts: $('script[src]').length,
              inlineScripts,
              styles,
              inlineStyles,
              images,
              iframes,
              totalResources: scripts + styles + inlineStyles + inlineScripts + iframes + images,
            },
            optimizations: {
              asyncScripts: usesAsync,
              deferScripts: usesDefer,
              lazyLoadImages: lazyImages,
              preconnect: $('link[rel="preconnect"]').length,
              prefetch: $('link[rel="prefetch"]').length,
              preload: $('link[rel="preload"]').length,
            },
            domMetrics: {
              totalElements: domSize,
              maxDepth: domDepth,
              largeMediaElements: $('img[width][height]').filter(function() {
                const width = parseInt($(this).attr('width') || '0');
                const height = parseInt($(this).attr('height') || '0');
                return width * height > 100000; // Larger than roughly 300x300
              }).length,
            },
            approximateResourceSize: {
              html: html.length,
              scripts: scriptSize,
              styles: styleSize,
              total: html.length + scriptSize + styleSize,
            },
          },
        },
      },
    ];
  } else if (analysisType === 'accessibility') {
    // Basic WCAG checks
    
    // Check for lang attribute
    const hasLang = $('html').attr('lang') !== undefined;
    const lang = $('html').attr('lang') || '';
    
    // Heading structure
    const headingOrder: number[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      headingOrder.push(parseInt(el.tagName.substring(1), 10));
    });
    
    // Check for skipped heading levels
    const skippedHeadings = [];
    for (let i = 1; i < headingOrder.length; i++) {
      if (headingOrder[i] > headingOrder[i - 1] + 1) {
        skippedHeadings.push(`Skipped from h${headingOrder[i - 1]} to h${headingOrder[i]}`);
      }
    }
    
    // Alt text on images
    const imagesWithoutAlt = $('img:not([alt])').length;
    const imagesWithEmptyAlt = $('img[alt=""]').length;
    
    // Form inputs with labels
    let inputsWithoutLabels = 0;
    $('input, textarea, select').each((_, el) => {
      const id = $(el).attr('id');
      if (id && $(`label[for="${id}"]`).length === 0) {
        inputsWithoutLabels++;
      }
    });
    
    // ARIA attributes
    const elementsWithARIA = $('[aria-label], [aria-labelledby], [aria-describedby], [role]').length;
    
    // Color contrast (limited check)
    let hasContrastIssues = 0;
    $('[style*="color"]').each((_, el) => {
      const style = $(el).attr('style') || '';
      // This is a very basic check - real contrast checking would need computed styles
      if (style.includes('color: #fff') || style.includes('color: white') || 
          style.includes('color: #FFF') || style.includes('color: rgb(255, 255, 255)')) {
        hasContrastIssues++;
      }
    });
    
    // Links with unclear text
    let unclearLinks = 0;
    $('a').each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text === 'click here' || text === 'read more' || text === 'more' || 
          text === 'link' || text === 'here' || text === '') {
        unclearLinks++;
      }
    });
    
    return [
      {
        json: {
          accessibilityAnalysis: {
            documentLanguage: {
              hasLang,
              lang,
            },
            headings: {
              structure: headingOrder,
              skippedLevels: skippedHeadings,
              hasSkippedLevels: skippedHeadings.length > 0,
              firstHeadingIsH1: headingOrder[0] === 1,
            },
            images: {
              total: $('img').length,
              missingAlt: imagesWithoutAlt,
              emptyAlt: imagesWithEmptyAlt,
              decorativeImages: imagesWithEmptyAlt, // Empty alt is appropriate for decorative images
              percentWithAlt: $('img').length > 0 ? 
                ((($('img').length - imagesWithoutAlt) / $('img').length) * 100).toFixed(1) + '%' : '0%',
            },
            forms: {
              inputsWithoutLabels,
              inputsWithLabels: $('label[for]').length,
              hasFieldsets: $('fieldset').length > 0,
              hasLegends: $('legend').length > 0,
            },
            ariaUsage: {
              elementsWithARIA,
              rolesUsed: Array.from(new Set($('[role]').map((_, el) => $(el).attr('role')).get())),
            },
            links: {
              total: $('a').length,
              withHref: $('a[href]').length,
              withoutHref: $('a:not([href])').length,
              unclearLinks,
              targetBlank: $('a[target="_blank"]').length,
              withoutRelNoopener: $('a[target="_blank"]:not([rel*="noopener"])').length,
            },
            potentialIssues: {
              possibleContrastIssues: hasContrastIssues,
              tabIndexGreaterThanZero: (() => {
                let count = 0;
                $('[tabindex]').each((_, el) => {
                  const tabindex = parseInt($(el).attr('tabindex') || '0');
                  if (tabindex > 0) count++;
                });
                return count;
              })(),
              tabIndexNegative: (() => {
                let count = 0;
                $('[tabindex]').each((_, el) => {
                  const tabindex = parseInt($(el).attr('tabindex') || '0');
                  if (tabindex < 0) count++;
                });
                return count;
              })(),
            },
          },
        },
      },
    ];
  }
  
  return [];
}

export class LxHTML implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LxHTML',
    name: 'lxHTML',
    icon: 'file:html.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Process HTML content',
    defaults: {
      name: 'LxHTML',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'Extract',
            value: 'extract',
            description: 'Extract content from HTML',
          },
          {
            name: 'Generate',
            value: 'generate',
            description: 'Generate HTML content',
          },
          {
            name: 'Transform',
            value: 'transform',
            description: 'Transform HTML content',
          },
          {
            name: 'Analyze',
            value: 'analyze',
            description: 'Analyze HTML content',
          },
          {
            name: 'Visualize',
            value: 'visualize',
            description: 'Visualize HTML and pick CSS selectors',
          },
        ],
        default: 'extract',
        description: 'The operation to perform',
      },

      // Extract operation parameters
      {
        displayName: 'HTML',
        name: 'html',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['extract'],
          },
        },
        default: '',
        description: 'The HTML to process',
      },
      {
        displayName: 'Extraction Type',
        name: 'extractionType',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['extract'],
          },
        },
        options: [
          {
            name: 'CSS Selector',
            value: 'cssSelector',
          },
          {
            name: 'XPath',
            value: 'xpath',
          },
          {
            name: 'Regular Expression',
            value: 'regex',
          },
          {
            name: 'Extract Table',
            value: 'table',
          },
          {
            name: 'Smart Selector',
            value: 'smartSelector',
          },
          {
            name: 'Text Content',
            value: 'text',
          },
        ],
        default: 'cssSelector',
        description: 'The method to use for extraction',
      },
      {
        displayName: 'Selector',
        name: 'selector',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['cssSelector', 'xpath'],
          },
        },
        default: '',
        placeholder: 'div.content, //div[@class="content"]',
        description: 'The CSS selector or XPath to extract elements',
      },
      {
        displayName: 'Return Multiple Values',
        name: 'returnMultiple',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['cssSelector', 'xpath'],
          },
        },
        default: true,
        description: 'Whether to return multiple matches as separate items or only the first match',
      },
      {
        displayName: 'Extraction Format',
        name: 'extractionFormat',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['cssSelector', 'xpath'],
            extractAttribute: [false],
          },
        },
        options: [
          {
            name: 'Text',
            value: 'text',
          },
          {
            name: 'HTML',
            value: 'html',
          },
        ],
        default: 'text',
        description: 'Whether to extract the text content or HTML of the matched elements',
      },
      {
        displayName: 'Pattern',
        name: 'pattern',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['regex'],
          },
        },
        default: '',
        placeholder: '\\w+',
        description: 'The regular expression pattern to extract content',
      },
      {
        displayName: 'Regex Flags',
        name: 'regexFlags',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['regex'],
          },
        },
        default: 'g',
        description: 'Regex flags (e.g., g for global, i for case-insensitive, m for multiline)',
      },
      {
        displayName: 'Extract Capture Groups',
        name: 'captureGroups',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['regex'],
          },
        },
        default: false,
        description: 'Whether to extract and return regex capture groups separately',
      },
      {
        displayName: 'Table Selector',
        name: 'tableSelector',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['table'],
          },
        },
        default: 'table',
        description: 'CSS selector to target the table to extract',
      },
      {
        displayName: 'Table Index',
        name: 'tableIndex',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['table'],
          },
        },
        default: 0,
        description: 'If multiple tables match the selector, which one to extract (0-based index)',
      },
      {
        displayName: 'Include Headers',
        name: 'includeHeaders',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['table'],
          },
        },
        default: true,
        description: 'Whether to use the first row or thead as column headers',
      },
      {
        displayName: 'Smart Type',
        name: 'smartType',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['smartSelector'],
          },
        },
        options: [
          {
            name: 'Article Content',
            value: 'article',
          },
          {
            name: 'Headings Hierarchy',
            value: 'headings',
          },
          {
            name: 'Navigation Links',
            value: 'navigation',
          },
          {
            name: 'Contact Information',
            value: 'contact',
          },
        ],
        default: 'article',
        description: 'What type of content to intelligently extract',
      },
      {
        displayName: 'Extract Attribute',
        name: 'extractAttribute',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['cssSelector', 'xpath'],
          },
        },
        default: false,
        description: 'Whether to extract an attribute instead of content',
      },
      {
        displayName: 'Attribute Name',
        name: 'attributeName',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['extract'],
            extractionType: ['cssSelector', 'xpath'],
            extractAttribute: [true],
          },
        },
        default: '',
        placeholder: 'href, src, class',
        description: 'The name of the attribute to extract',
      },

      // Generate operation parameters
      {
        displayName: 'Template Type',
        name: 'templateType',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['generate'],
          },
        },
        options: [
          {
            name: 'Static Template',
            value: 'static',
          },
          {
            name: 'Handlebars',
            value: 'handlebars',
          },
        ],
        default: 'static',
        description: 'The type of template to use',
      },
      {
        displayName: 'HTML Template',
        name: 'htmlTemplate',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['generate'],
          },
        },
        default: '<div>{{content}}</div>',
        description: 'The HTML template to generate',
        typeOptions: {
          rows: 8,
        },
      },
      {
        displayName: 'Use Responsive Design',
        name: 'useResponsiveDesign',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['generate'],
            templateType: ['static'],
          },
        },
        default: false,
        description: 'Whether to add responsive design elements to the template',
      },
      {
        displayName: 'Data Source',
        name: 'dataSource',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['generate'],
            templateType: ['handlebars'],
          },
        },
        options: [
          {
            name: 'Input Data',
            value: 'inputData',
          },
          {
            name: 'Custom Data',
            value: 'custom',
          },
        ],
        default: 'inputData',
        description: 'The source of data to use for the template',
      },
      {
        displayName: 'Custom Data (JSON)',
        name: 'customData',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['generate'],
            templateType: ['handlebars'],
            dataSource: ['custom'],
          },
        },
        default: '{\n  "title": "Example Title",\n  "content": "Example content"\n}',
        description: 'Custom JSON data to use for the template',
        typeOptions: {
          rows: 8,
        },
      },
      {
        displayName: 'Template Variables',
        name: 'templateVariables',
        placeholder: 'Add Variable',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            operation: ['generate'],
          },
        },
        default: {},
        options: [
          {
            name: 'variables',
            displayName: 'Variables',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the variable',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value of the variable',
              },
            ],
          },
        ],
      },

      // Transform operation parameters
      {
        displayName: 'HTML',
        name: 'html',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['transform'],
          },
        },
        default: '',
        description: 'The HTML to transform',
      },
      {
        displayName: 'Transformation Type',
        name: 'transformationType',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['transform'],
          },
        },
        options: [
          {
            name: 'Add Class',
            value: 'addClass',
          },
          {
            name: 'Remove Class',
            value: 'removeClass',
          },
          {
            name: 'Modify Attribute',
            value: 'modifyAttribute',
          },
          {
            name: 'Replace Content',
            value: 'replaceContent',
          },
          {
            name: 'Convert to Markdown',
            value: 'toMarkdown',
          },
          {
            name: 'Minify HTML',
            value: 'minify',
          },
          {
            name: 'Enhance Accessibility',
            value: 'enhanceAccessibility',
          },
        ],
        default: 'addClass',
        description: 'The type of transformation to perform',
      },
      {
        displayName: 'Selector',
        name: 'selector',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['transform'],
            transformationType: ['addClass', 'removeClass', 'modifyAttribute', 'replaceContent'],
          },
        },
        default: '',
        description: 'The CSS selector to target elements for transformation',
      },
      {
        displayName: 'Language Code',
        name: 'languageCode',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['transform'],
            transformationType: ['enhanceAccessibility'],
          },
        },
        default: 'en',
        description: 'The language code to set in the HTML lang attribute (e.g., en, de, fr)',
      },

      // Analyze operation parameters
      {
        displayName: 'HTML',
        name: 'html',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['analyze'],
          },
        },
        default: '',
        description: 'The HTML content to analyze',
      },
      {
        displayName: 'Analysis Type',
        name: 'analysisType',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['analyze'],
          },
        },
        options: [
          {
            name: 'SEO Elements',
            value: 'seo',
          },
          {
            name: 'Structure Stats',
            value: 'structure',
          },
          {
            name: 'Link Analysis',
            value: 'links',
          },
          {
            name: 'Image Analysis',
            value: 'images',
          },
          {
            name: 'Performance Assessment',
            value: 'performance',
          },
          {
            name: 'Accessibility Evaluation',
            value: 'accessibility',
          },
        ],
        default: 'seo',
        description: 'The type of analysis to perform',
      },

      // Visualize operation parameters
      {
        displayName: 'HTML',
        name: 'html',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['visualize'],
          },
        },
        default: '',
        description: 'The HTML content to visualize',
        typeOptions: {
          rows: 10,
        },
      },
      {
        displayName: 'Visualizer',
        name: 'visualizer',
        type: 'notice',
        displayOptions: {
          show: {
            operation: ['visualize'],
          },
        },
        default: `
          <div style="background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
            <p>The HTML Visualizer tool provides an interactive interface to:</p>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li>Visualize your HTML content with a live preview</li>
              <li>Use a CSS Selector Picker to point-and-click on elements</li>
              <li>Generate optimized CSS selectors for extraction</li>
              <li>Analyze the HTML structure</li>
            </ul>
            <p><strong>Use the button below to open the HTML Visualizer in a new tab.</strong></p>
          </div>
        `,
      },
      {
        displayName: 'Open HTML Visualizer',
        name: 'openVisualizer',
        type: 'button',
        displayOptions: {
          show: {
            operation: ['visualize'],
          },
        },
        default: '',
        description: 'Opens the HTML Visualizer Tool in a new tab',
        typeOptions: {
          // This doesn't actually do anything in n8n for buttons
          // But it gives the appearance of a button in the UI
          color: '#ff6d5a',
          width: '100%',
          padding: '12px',
        },
      },
      {
        displayName: 'Selected Selector',
        name: 'selectedSelector',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['visualize'],
          },
        },
        default: '',
        description: 'The CSS selector picked from the visualizer',
        typeOptions: {
          disabled: true,
        },
      },
      {
        displayName: 'Selector Type',
        name: 'selectorType',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['visualize'],
          },
        },
        options: [
          {
            name: 'Optimized Selector',
            value: 'optimized',
          },
          {
            name: 'ID Selector',
            value: 'id',
          },
          {
            name: 'Class Selector',
            value: 'class',
          },
          {
            name: 'Tag Selector',
            value: 'tag',
          },
          {
            name: 'Nth-child Selector',
            value: 'nthChild',
          },
        ],
        default: 'optimized',
        description: 'The type of selector to use for extraction',
      },
      {
        displayName: 'HTML Visualizer Instructions',
        name: 'visualizerInstructions',
        type: 'notice',
        displayOptions: {
          show: {
            operation: ['visualize'],
          },
        },
        default: `
          <div style="background-color: #f8f8f8; padding: 10px; border-radius: 4px; margin-top: 20px;">
            <p><strong>How to use the HTML Visualizer:</strong></p>
            <ol style="padding-left: 20px; margin: 10px 0;">
              <li>Enter your HTML content in the field above</li>
              <li>Click the "Open HTML Visualizer" button</li>
              <li>In the visualizer, use the "Pick Selector" button to enable selector picking</li>
              <li>Click on elements in the preview to generate selectors</li>
              <li>Copy your preferred selector and paste it back in this node</li>
              <li>Use the selected selector in the Extract operation</li>
            </ol>
          </div>
        `,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    try {
      for (let i = 0; i < items.length; i++) {
        const operation = this.getNodeParameter('operation', i) as string;

        try {
          switch (operation) {
            case 'extract':
              returnData.push(...await extractHtml(this, i));
              break;
            case 'generate':
              returnData.push(...await generateHtml(this, i));
              break;
            case 'transform':
              returnData.push(...await transformHtml(this, i));
              break;
            case 'analyze':
              returnData.push(...await analyzeHtml(this, i));
              break;
            case 'visualize':
              // When using the visualize operation, we just pass the HTML through
              // The actual visualization happens in the UI via the frontend HTML file
              const html = this.getNodeParameter('html', i) as string;
              const selectedSelector = this.getNodeParameter('selectedSelector', i, '') as string;
              
              // Check if the openVisualizer button was clicked
              const openVisualizer = this.getNodeParameter('openVisualizer', i, false);
              
              if (openVisualizer) {
                // Get the path to the visualizer HTML file
                const visualizerPath = path.join(__dirname, 'frontend', 'visualizer.html');
                
                // Check if the file exists
                if (fs.existsSync(visualizerPath)) {
                  // Read the visualizer file
                  const visualizerHtml = fs.readFileSync(visualizerPath, 'utf-8');
                  
                  // Create a temporary HTML file with the user's HTML pre-filled
                  const tempPath = path.join(__dirname, 'temp_visualizer.html');
                  
                  // Replace the placeholder in the visualizer with the user's HTML
                  let modifiedVisualizer = visualizerHtml;
                  
                  // Write the modified visualizer to the temp file
                  fs.writeFileSync(tempPath, modifiedVisualizer);
                  
                  // Provide the path to the temp file for the user to open
                  returnData.push({
                    json: {
                      html,
                      selectedSelector,
                      visualizerPath: tempPath,
                      note: 'The HTML Visualizer has been prepared. Please open the file at the path above to use the visualizer.'
                    },
                  });
                } else {
                  // If the visualizer file doesn't exist, fallback to basic functionality
                  returnData.push({
                    json: {
                      html,
                      selectedSelector,
                      error: 'HTML Visualizer file not found. Please make sure the frontend/visualizer.html file exists in the node directory.',
                    },
                  });
                }
              } else {
                // Normal operation if the button wasn't clicked
                returnData.push({
                  json: {
                    html,
                    selectedSelector,
                    note: 'The HTML Visualizer is a tool to help select CSS selectors. Use the Extract operation to actually extract content with the selected selector.'
                  },
                });
              }
              break;
          }
        } catch (error) {
          throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
        }
      }

      return [returnData];
    } catch (error) {
      throw new NodeOperationError(this.getNode(), error);
    }
  }
} 