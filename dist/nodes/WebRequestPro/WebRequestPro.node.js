"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRequestPro = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const puppeteer_1 = __importDefault(require("puppeteer"));
class WebRequestPro {
    constructor() {
        this.description = {
            displayName: 'Web Request Pro',
            name: 'webRequestPro',
            group: ['input'],
            version: 1,
            description: 'Makes advanced web requests using a headless browser with premium features',
            defaults: {
                name: 'Web Request Pro',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'httpBasicAuth',
                    required: false,
                    displayOptions: {
                        show: {
                            authentication: ['basicAuth'],
                        },
                    },
                },
            ],
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
                    displayName: 'Authentication',
                    name: 'authentication',
                    type: 'options',
                    options: [
                        {
                            name: 'None',
                            value: 'none',
                        },
                        {
                            name: 'Basic Auth',
                            value: 'basicAuth',
                        },
                        {
                            name: 'Custom',
                            value: 'custom',
                        },
                    ],
                    default: 'none',
                    description: 'The authentication method to use',
                },
                {
                    displayName: 'Username',
                    name: 'username',
                    type: 'string',
                    default: '',
                    displayOptions: {
                        show: {
                            authentication: ['custom'],
                        },
                    },
                    description: 'Username for authentication',
                },
                {
                    displayName: 'Password',
                    name: 'password',
                    type: 'string',
                    typeOptions: {
                        password: true,
                    },
                    default: '',
                    displayOptions: {
                        show: {
                            authentication: ['custom'],
                        },
                    },
                    description: 'Password for authentication',
                },
                {
                    displayName: 'Use JavaScript Selector',
                    name: 'useJsSelector',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to extract content using a JavaScript selector',
                },
                {
                    displayName: 'JavaScript Selector',
                    name: 'jsSelector',
                    type: 'string',
                    default: '',
                    placeholder: 'document.querySelector("body > div.wrapper > div.container")',
                    description: 'JavaScript selector to extract specific content (copy from browser DevTools)',
                    displayOptions: {
                        show: {
                            useJsSelector: [true],
                        },
                    },
                },
                {
                    displayName: 'Return Multiple Elements',
                    name: 'returnMultiple',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to return multiple elements as an array',
                    displayOptions: {
                        show: {
                            useJsSelector: [true],
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
                    displayName: 'Cookies',
                    name: 'cookies',
                    placeholder: 'Add Cookie',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    default: {},
                    options: [
                        {
                            name: 'cookie',
                            displayName: 'Cookie',
                            values: [
                                {
                                    displayName: 'Name',
                                    name: 'name',
                                    type: 'string',
                                    default: '',
                                    description: 'Name of the cookie',
                                },
                                {
                                    displayName: 'Value',
                                    name: 'value',
                                    type: 'string',
                                    default: '',
                                    description: 'Value of the cookie',
                                },
                                {
                                    displayName: 'Domain',
                                    name: 'domain',
                                    type: 'string',
                                    default: '',
                                    description: 'Domain of the cookie',
                                },
                            ],
                        },
                    ],
                    description: 'Cookies to include with the request',
                },
                {
                    displayName: 'Take Screenshot',
                    name: 'takeScreenshot',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to take a screenshot of the page',
                },
                {
                    displayName: 'Screenshot Type',
                    name: 'screenshotType',
                    type: 'options',
                    options: [
                        {
                            name: 'Full Page',
                            value: 'fullPage',
                        },
                        {
                            name: 'Visible Area',
                            value: 'visibleArea',
                        },
                    ],
                    default: 'visibleArea',
                    description: 'Type of screenshot to take',
                    displayOptions: {
                        show: {
                            takeScreenshot: [true],
                        },
                    },
                },
                {
                    displayName: 'Wait Before Extraction (Seconds)',
                    name: 'waitTime',
                    type: 'number',
                    default: 0,
                    description: 'Time to wait in seconds before extracting the content (useful for pages that load content dynamically)',
                },
                {
                    displayName: 'Execute Custom JavaScript',
                    name: 'executeCustomJs',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to execute custom JavaScript on the page',
                },
                {
                    displayName: 'Custom JavaScript',
                    name: 'customJavaScript',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    default: '// Example: document.querySelector("button").click();',
                    description: 'JavaScript code to execute on the page',
                    displayOptions: {
                        show: {
                            executeCustomJs: [true],
                        },
                    },
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
                const authentication = this.getNodeParameter('authentication', itemIndex);
                const useJsSelector = this.getNodeParameter('useJsSelector', itemIndex);
                const waitTime = this.getNodeParameter('waitTime', itemIndex);
                const takeScreenshot = this.getNodeParameter('takeScreenshot', itemIndex);
                const executeCustomJs = this.getNodeParameter('executeCustomJs', itemIndex);
                let jsSelector = '';
                let returnMultiple = false;
                let screenshotType = 'visibleArea';
                let customJavaScript = '';
                if (useJsSelector) {
                    jsSelector = this.getNodeParameter('jsSelector', itemIndex);
                    returnMultiple = this.getNodeParameter('returnMultiple', itemIndex);
                }
                if (takeScreenshot) {
                    screenshotType = this.getNodeParameter('screenshotType', itemIndex);
                }
                if (executeCustomJs) {
                    customJavaScript = this.getNodeParameter('customJavaScript', itemIndex);
                }
                const userAgent = this.getNodeParameter('userAgent', itemIndex);
                const cookiesUi = this.getNodeParameter('cookies', itemIndex);
                const cookies = cookiesUi.cookie || [];
                const browser = await puppeteer_1.default.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });
                try {
                    const page = await browser.newPage();
                    if (userAgent) {
                        await page.setUserAgent(userAgent);
                    }
                    if (cookies.length > 0) {
                        for (const cookie of cookies) {
                            await page.setCookie({
                                name: cookie.name,
                                value: cookie.value,
                                domain: cookie.domain || undefined,
                            });
                        }
                    }
                    if (authentication === 'basicAuth') {
                        const credentials = await this.getCredentials('httpBasicAuth');
                        if (credentials === undefined) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No credentials got returned!');
                        }
                        await page.authenticate({
                            username: credentials.username,
                            password: credentials.password,
                        });
                    }
                    else if (authentication === 'custom') {
                        const username = this.getNodeParameter('username', itemIndex);
                        const password = this.getNodeParameter('password', itemIndex);
                        await page.authenticate({
                            username,
                            password,
                        });
                    }
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    if (waitTime > 0) {
                        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                    }
                    if (executeCustomJs && customJavaScript) {
                        await page.evaluate(customJs => {
                            return eval(customJs);
                        }, customJavaScript);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    let screenshot;
                    if (takeScreenshot) {
                        const screenshotBuffer = await page.screenshot({
                            fullPage: screenshotType === 'fullPage',
                            type: 'png',
                        });
                        screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
                    }
                    let content = null;
                    if (useJsSelector && jsSelector) {
                        if (returnMultiple) {
                            content = await page.evaluate((selector) => {
                                var _a, _b;
                                try {
                                    let actualSelector = selector;
                                    if (selector.includes('document.querySelector')) {
                                        actualSelector = ((_a = selector.match(/document\.querySelector\(['"](.+)['"]\)/)) === null || _a === void 0 ? void 0 : _a[1]) || selector;
                                    }
                                    else if (selector.includes('document.querySelectorAll')) {
                                        actualSelector = ((_b = selector.match(/document\.querySelectorAll\(['"](.+)['"]\)/)) === null || _b === void 0 ? void 0 : _b[1]) || selector;
                                    }
                                    const elements = document.querySelectorAll(actualSelector);
                                    return Array.from(elements).map(el => el.outerHTML);
                                }
                                catch (error) {
                                    return { error: error.message };
                                }
                            }, jsSelector);
                        }
                        else {
                            content = await page.evaluate((selector) => {
                                var _a;
                                try {
                                    let actualSelector = selector;
                                    if (selector.includes('document.querySelector')) {
                                        actualSelector = ((_a = selector.match(/document\.querySelector\(['"](.+)['"]\)/)) === null || _a === void 0 ? void 0 : _a[1]) || selector;
                                    }
                                    const element = document.querySelector(actualSelector);
                                    return element ? element.outerHTML : null;
                                }
                                catch (error) {
                                    return { error: error.message };
                                }
                            }, jsSelector);
                        }
                    }
                    else {
                        content = await page.content();
                    }
                    const newItem = {
                        json: {
                            url,
                            content,
                            ...(screenshot ? { screenshot } : {}),
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
exports.WebRequestPro = WebRequestPro;
//# sourceMappingURL=WebRequestPro.node.js.map