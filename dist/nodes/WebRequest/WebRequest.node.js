"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const puppeteer_1 = __importDefault(require("puppeteer"));
class WebRequest {
    constructor() {
        this.description = {
            displayName: 'Web Request',
            name: 'webRequest',
            icon: 'file:browser.svg',
            group: ['transform'],
            version: 1,
            description: 'Make a web request to any URL',
            defaults: {
                name: 'Web Request',
            },
            inputs: ["main"],
            outputs: ["main"],
            properties: [
                {
                    displayName: 'URL',
                    name: 'url',
                    type: 'string',
                    default: '',
                    placeholder: 'https://example.com',
                    description: 'The URL to request',
                    required: true,
                },
                {
                    displayName: 'Use CSS Selector',
                    name: 'useCssSelector',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to extract content using a CSS selector',
                },
                {
                    displayName: 'CSS Selector',
                    name: 'cssSelector',
                    type: 'string',
                    default: '',
                    placeholder: '.content, #main-content',
                    description: 'CSS selector to extract specific content',
                    displayOptions: {
                        show: {
                            useCssSelector: [true],
                        },
                    },
                },
                {
                    displayName: 'User Agent',
                    name: 'userAgent',
                    type: 'string',
                    default: '',
                    placeholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
                    description: 'The user agent to use for the request. If empty, a default one will be used.',
                },
                {
                    displayName: 'Wait Before Extraction (Seconds)',
                    name: 'waitTime',
                    type: 'number',
                    default: 0,
                    description: 'Time to wait in seconds before extracting the content (useful for pages that load content dynamically)',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const url = this.getNodeParameter('url', itemIndex);
                const useCssSelector = this.getNodeParameter('useCssSelector', itemIndex);
                const waitTime = this.getNodeParameter('waitTime', itemIndex);
                let cssSelector = '';
                if (useCssSelector) {
                    cssSelector = this.getNodeParameter('cssSelector', itemIndex);
                }
                const userAgent = this.getNodeParameter('userAgent', itemIndex);
                const browser = await puppeteer_1.default.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });
                try {
                    const page = await browser.newPage();
                    if (userAgent) {
                        await page.setUserAgent(userAgent);
                    }
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    if (waitTime > 0) {
                        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                    }
                    let content;
                    if (useCssSelector && cssSelector) {
                        content = await page.evaluate((selector) => {
                            const elements = document.querySelectorAll(selector);
                            return Array.from(elements).map(el => el.outerHTML).join('\n');
                        }, cssSelector);
                    }
                    else {
                        content = await page.content();
                    }
                    const newItem = {
                        json: {
                            url,
                            content,
                        },
                    };
                    returnData.push(newItem);
                }
                finally {
                    await browser.close();
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                        },
                        pairedItem: itemIndex,
                    });
                    continue;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, { itemIndex });
            }
        }
        return [returnData];
    }
}
exports.WebRequest = WebRequest;
//# sourceMappingURL=WebRequest.node.js.map