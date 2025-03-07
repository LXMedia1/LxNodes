"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LxHTML = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const cheerio = __importStar(require("cheerio"));
async function extractHtml(executeFunctions, itemIndex) {
    const html = executeFunctions.getNodeParameter('html', itemIndex);
    const extractionType = executeFunctions.getNodeParameter('extractionType', itemIndex);
    const $ = cheerio.load(html);
    const results = [];
    if (extractionType === 'cssSelector') {
        const selector = executeFunctions.getNodeParameter('selector', itemIndex);
        const extractAttribute = executeFunctions.getNodeParameter('extractAttribute', itemIndex, false);
        const elements = $(selector);
        if (extractAttribute) {
            const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex);
            elements.each((_, el) => {
                results.push({
                    json: {
                        value: $(el).attr(attributeName) || '',
                        selector: selector
                    },
                });
            });
        }
        else {
            elements.each((_, el) => {
                results.push({
                    json: {
                        value: $(el).text().trim(),
                        selector: selector
                    },
                });
            });
        }
    }
    else if (extractionType === 'xpath') {
        const selector = executeFunctions.getNodeParameter('selector', itemIndex);
        const extractAttribute = executeFunctions.getNodeParameter('extractAttribute', itemIndex, false);
        const elements = $(selector);
        if (extractAttribute) {
            const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex);
            elements.each((_, el) => {
                results.push({
                    json: {
                        value: $(el).attr(attributeName) || '',
                        selector: selector
                    },
                });
            });
        }
        else {
            elements.each((_, el) => {
                results.push({
                    json: {
                        value: $(el).text().trim(),
                        selector: selector
                    },
                });
            });
        }
    }
    else if (extractionType === 'regex') {
        const pattern = executeFunctions.getNodeParameter('pattern', itemIndex);
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
    }
    else if (extractionType === 'text') {
        results.push({
            json: {
                value: $('body').text().trim(),
                type: 'fullText'
            },
        });
    }
    return results;
}
async function generateHtml(executeFunctions, itemIndex) {
    const templateType = executeFunctions.getNodeParameter('templateType', itemIndex);
    const items = executeFunctions.getInputData();
    const item = items[itemIndex];
    let generatedHtml = '';
    if (templateType === 'static') {
        let template = executeFunctions.getNodeParameter('htmlTemplate', itemIndex);
        const templateVariablesValues = executeFunctions.getNodeParameter('templateVariables.variables', itemIndex, []);
        for (const variable of templateVariablesValues) {
            const regex = new RegExp(`{{${variable.name}}}`, 'g');
            template = template.replace(regex, variable.value);
        }
        const keyPattern = /{{([^{}]+)}}/g;
        let match;
        while ((match = keyPattern.exec(template)) !== null) {
            const key = match[1].trim();
            const value = String(item.json[key] || '');
            const specificMatchRegex = new RegExp(match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            template = template.replace(specificMatchRegex, value);
        }
        generatedHtml = template;
    }
    else if (templateType === 'dynamic') {
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
async function transformHtml(executeFunctions, itemIndex) {
    const html = executeFunctions.getNodeParameter('html', itemIndex);
    const transformationType = executeFunctions.getNodeParameter('transformationType', itemIndex);
    const selector = executeFunctions.getNodeParameter('selector', itemIndex);
    const $ = cheerio.load(html);
    if (transformationType === 'addClass') {
        const className = executeFunctions.getNodeParameter('className', itemIndex);
        $(selector).addClass(className);
    }
    else if (transformationType === 'removeClass') {
        const className = executeFunctions.getNodeParameter('className', itemIndex);
        $(selector).removeClass(className);
    }
    else if (transformationType === 'modifyAttribute') {
        const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex);
        const attributeValue = executeFunctions.getNodeParameter('attributeValue', itemIndex);
        $(selector).attr(attributeName, attributeValue);
    }
    else if (transformationType === 'replaceContent') {
        const newContent = executeFunctions.getNodeParameter('newContent', itemIndex);
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
function calculateMaxNestingDepth(element, currentDepth = 0) {
    if (!element || !element.children)
        return currentDepth;
    let maxDepth = currentDepth;
    for (const child of element.children) {
        if (child.type === 'tag') {
            const childDepth = calculateMaxNestingDepth(child, currentDepth + 1);
            maxDepth = Math.max(maxDepth, childDepth);
        }
    }
    return maxDepth;
}
async function analyzeHtml(executeFunctions, itemIndex) {
    const html = executeFunctions.getNodeParameter('html', itemIndex);
    const analysisType = executeFunctions.getNodeParameter('analysisType', itemIndex);
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
    }
    else if (analysisType === 'structure') {
        const elementCounts = {};
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
    }
    else if (analysisType === 'links') {
        const internalLinks = [];
        const externalLinks = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const text = $(el).text().trim();
            if (href.startsWith('http')) {
                externalLinks.push({ href, text });
            }
            else {
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
    }
    else if (analysisType === 'images') {
        const images = [];
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
class LxHTML {
    constructor() {
        this.description = {
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
            inputs: ["main"],
            outputs: ["main"],
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
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        try {
            for (let i = 0; i < items.length; i++) {
                const operation = this.getNodeParameter('operation', i);
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
                }
                catch (error) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, { itemIndex: i });
                }
            }
            return [returnData];
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), error);
        }
    }
}
exports.LxHTML = LxHTML;
//# sourceMappingURL=LxHTML.node.js.map