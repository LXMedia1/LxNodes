import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';
import * as cheerio from 'cheerio';

// Helper functions
async function extractHtml(executeFunctions: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const html = executeFunctions.getNodeParameter('html', itemIndex) as string;
  const extractionType = executeFunctions.getNodeParameter('extractionType', itemIndex) as string;
  const $ = cheerio.load(html);
  const results: INodeExecutionData[] = [];

  if (extractionType === 'cssSelector') {
    const selector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
    const extractAttribute = executeFunctions.getNodeParameter('extractAttribute', itemIndex, false) as boolean;
    
    const elements = $(selector);
    
    if (extractAttribute) {
      const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex) as string;
      elements.each((_, el) => {
        results.push({
          json: { 
            value: $(el).attr(attributeName) || '',
            selector: selector 
          },
        });
      });
    } else {
      elements.each((_, el) => {
        results.push({
          json: { 
            value: $(el).text().trim(),
            selector: selector 
          },
        });
      });
    }
  } else if (extractionType === 'xpath') {
    // Basic XPath-like support using cheerio and selectors
    const selector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
    const extractAttribute = executeFunctions.getNodeParameter('extractAttribute', itemIndex, false) as boolean;
    
    const elements = $(selector);
    
    if (extractAttribute) {
      const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex) as string;
      elements.each((_, el) => {
        results.push({
          json: { 
            value: $(el).attr(attributeName) || '',
            selector: selector 
          },
        });
      });
    } else {
      elements.each((_, el) => {
        results.push({
          json: { 
            value: $(el).text().trim(),
            selector: selector 
          },
        });
      });
    }
  } else if (extractionType === 'regex') {
    const pattern = executeFunctions.getNodeParameter('pattern', itemIndex) as string;
    const regex = new RegExp(pattern, 'g');
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      results.push({
        json: { 
          value: match[0],
          pattern: pattern 
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
    
    generatedHtml = template;
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
  const selector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
  
  const $ = cheerio.load(html);
  
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
            imgWithoutAlt,
          },
        },
      },
    ];
  } else if (analysisType === 'structure') {
    const elementCounts: {[key: string]: number} = {};
    const tags = ['div', 'p', 'span', 'a', 'img', 'ul', 'ol', 'li', 'table', 'form', 'input'];
    
    tags.forEach(tag => {
      elementCounts[tag] = $(tag).length;
    });
    
    return [
      {
        json: {
          structureAnalysis: {
            elementCounts,
            totalElements: $('*').length,
            nestingDepth: calculateMaxNestingDepth($('body')[0]),
          },
        },
      },
    ];
  } else if (analysisType === 'links') {
    const internalLinks: {href: string, text: string}[] = [];
    const externalLinks: {href: string, text: string}[] = [];
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      
      if (href.startsWith('http')) {
        externalLinks.push({ href, text });
      } else {
        internalLinks.push({ href, text });
      }
    });
    
    return [
      {
        json: {
          linkAnalysis: {
            totalLinks: $('a').length,
            internalLinks,
            externalLinks,
            internalLinksCount: internalLinks.length,
            externalLinksCount: externalLinks.length,
          },
        },
      },
    ];
  } else if (analysisType === 'images') {
    const images: {src: string, alt: string, dimensions: string}[] = [];
    
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      const alt = $(el).attr('alt') || '';
      const width = $(el).attr('width') || 'unknown';
      const height = $(el).attr('height') || 'unknown';
      
      images.push({
        src,
        alt,
        dimensions: `${width}x${height}`,
      });
    });
    
    return [
      {
        json: {
          imageAnalysis: {
            totalImages: images.length,
            imagesWithAlt: $('img[alt]:not([alt=""])').length,
            imagesWithoutAlt: $('img:not([alt]), img[alt=""]').length,
            images,
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
            name: 'Dynamic Template',
            value: 'dynamic',
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
            templateType: ['static'],
          },
        },
        default: '<div>{{content}}</div>',
        description: 'The HTML template to generate',
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
          },
        },
        default: '',
        description: 'The CSS selector to target elements for transformation',
      },
      {
        displayName: 'Class Name',
        name: 'className',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['transform'],
            transformationType: ['addClass', 'removeClass'],
          },
        },
        default: '',
        description: 'The class name to add or remove',
      },
      {
        displayName: 'Attribute Name',
        name: 'attributeName',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['transform'],
            transformationType: ['modifyAttribute'],
          },
        },
        default: '',
        description: 'The name of the attribute to modify',
      },
      {
        displayName: 'Attribute Value',
        name: 'attributeValue',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['transform'],
            transformationType: ['modifyAttribute'],
          },
        },
        default: '',
        description: 'The new value for the attribute',
      },
      {
        displayName: 'New Content',
        name: 'newContent',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['transform'],
            transformationType: ['replaceContent'],
          },
        },
        default: '',
        description: 'The new content to replace with',
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
        ],
        default: 'seo',
        description: 'The type of analysis to perform',
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