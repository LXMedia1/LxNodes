import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import puppeteer from 'puppeteer';

export class WebRequestPro implements INodeType {
	description: INodeTypeDescription = {
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				// Get parameters
				const url = this.getNodeParameter('url', itemIndex) as string;
				const authentication = this.getNodeParameter('authentication', itemIndex) as string;
				const useJsSelector = this.getNodeParameter('useJsSelector', itemIndex) as boolean;
				const waitTime = this.getNodeParameter('waitTime', itemIndex) as number;
				const takeScreenshot = this.getNodeParameter('takeScreenshot', itemIndex) as boolean;
				const executeCustomJs = this.getNodeParameter('executeCustomJs', itemIndex) as boolean;
				
				let jsSelector = '';
				let returnMultiple = false;
				let screenshotType = 'visibleArea';
				let customJavaScript = '';
				
				if (useJsSelector) {
					jsSelector = this.getNodeParameter('jsSelector', itemIndex) as string;
					returnMultiple = this.getNodeParameter('returnMultiple', itemIndex) as boolean;
				}
				
				if (takeScreenshot) {
					screenshotType = this.getNodeParameter('screenshotType', itemIndex) as string;
				}
				
				if (executeCustomJs) {
					customJavaScript = this.getNodeParameter('customJavaScript', itemIndex) as string;
				}
				
				const userAgent = this.getNodeParameter('userAgent', itemIndex) as string;
				
				// Extract cookies
				const cookiesUi = this.getNodeParameter('cookies', itemIndex) as {
					cookie: Array<{
						name: string;
						value: string;
						domain: string;
					}>;
				};
				
				const cookies = cookiesUi.cookie || [];

				// Launch browser
				const browser = await puppeteer.launch({
					headless: true,
					args: ['--no-sandbox', '--disable-setuid-sandbox'],
				});
				
				try {
					const page = await browser.newPage();
					
					// Set user agent if provided
					if (userAgent) {
						await page.setUserAgent(userAgent);
					}
					
					// Set cookies if provided
					if (cookies.length > 0) {
						for (const cookie of cookies) {
							await page.setCookie({
								name: cookie.name,
								value: cookie.value,
								domain: cookie.domain || undefined,
							});
						}
					}
					
					// Handle authentication
					if (authentication === 'basicAuth') {
						const credentials = await this.getCredentials('httpBasicAuth');
						
						if (credentials === undefined) {
							throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
						}
						
						await page.authenticate({
							username: credentials.username as string,
							password: credentials.password as string,
						});
					} else if (authentication === 'custom') {
						const username = this.getNodeParameter('username', itemIndex) as string;
						const password = this.getNodeParameter('password', itemIndex) as string;
						
						await page.authenticate({
							username,
							password,
						});
					}
					
					// Navigate to URL
					await page.goto(url, { waitUntil: 'networkidle2' });
					
					// Wait if specified
					if (waitTime > 0) {
						// Use setTimeout as an alternative to waitForTimeout
						await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
					}
					
					// Execute custom JavaScript if provided
					if (executeCustomJs && customJavaScript) {
						await page.evaluate(customJs => {
							// eslint-disable-next-line no-eval
							return eval(customJs);
						}, customJavaScript);
						
						// Wait a bit after executing custom JS
						await new Promise(resolve => setTimeout(resolve, 1000));
					}
					
					// Take screenshot if requested
					let screenshot: string | undefined;
					if (takeScreenshot) {
						const screenshotBuffer = await page.screenshot({
							fullPage: screenshotType === 'fullPage',
							type: 'png',
						});
						
						screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
					}
					
					let content: string | object | null = null;
					
					// Extract content based on JavaScript selector or get full HTML
					if (useJsSelector && jsSelector) {
						// Handle both single and multiple element selection
						if (returnMultiple) {
							// Return all matching elements
							// @ts-ignore - This code runs in browser context
							content = await page.evaluate((selector: string) => {
								try {
									// Extract the actual selector from the code (assuming document.querySelectorAll is used)
									let actualSelector = selector;
									if (selector.includes('document.querySelector')) {
										// @ts-ignore - This code runs in browser context
										actualSelector = selector.match(/document\.querySelector\(['"](.+)['"]\)/)?.[1] || selector;
									} else if (selector.includes('document.querySelectorAll')) {
										// @ts-ignore - This code runs in browser context
										actualSelector = selector.match(/document\.querySelectorAll\(['"](.+)['"]\)/)?.[1] || selector;
									}
									
									// @ts-ignore - This code runs in browser context
									const elements = document.querySelectorAll(actualSelector);
									// @ts-ignore - This code runs in browser context
									return Array.from(elements).map(el => el.outerHTML);
								} catch (error) {
									// @ts-ignore - This code runs in browser context
									return { error: error.message };
								}
							}, jsSelector);
						} else {
							// Return single element
							// @ts-ignore - This code runs in browser context
							content = await page.evaluate((selector: string) => {
								try {
									// Extract the actual selector from the code
									let actualSelector = selector;
									if (selector.includes('document.querySelector')) {
										// @ts-ignore - This code runs in browser context
										actualSelector = selector.match(/document\.querySelector\(['"](.+)['"]\)/)?.[1] || selector;
									}
									
									// @ts-ignore - This code runs in browser context
									const element = document.querySelector(actualSelector);
									// @ts-ignore - This code runs in browser context
									return element ? element.outerHTML : null;
								} catch (error) {
									// @ts-ignore - This code runs in browser context
									return { error: error.message };
								}
							}, jsSelector);
						}
					} else {
						content = await page.content();
					}
					
					// Return the result
					const newItem: INodeExecutionData = {
						json: {
							url,
							content,
							...(screenshot ? { screenshot } : {}),
						},
					};
					
					returnData.push(newItem);
				} finally {
					await browser.close();
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: itemIndex,
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}
		
		return [returnData];
	}
} 