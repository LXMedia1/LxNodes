import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import puppeteer from 'puppeteer';

export class WebRequest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Web Request',
		name: 'webRequest',
		icon: 'file:browser.svg',
		group: ['transform'],
		version: 1,
		description: 'Make a web request to any URL',
		defaults: {
			name: 'Web Request',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				// Get parameters
				const url = this.getNodeParameter('url', itemIndex) as string;
				const useCssSelector = this.getNodeParameter('useCssSelector', itemIndex) as boolean;
				const waitTime = this.getNodeParameter('waitTime', itemIndex) as number;
				let cssSelector = '';
				
				if (useCssSelector) {
					cssSelector = this.getNodeParameter('cssSelector', itemIndex) as string;
				}
				
				const userAgent = this.getNodeParameter('userAgent', itemIndex) as string;

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
					
					// Navigate to URL
					await page.goto(url, { waitUntil: 'networkidle2' });
					
					// Wait if specified
					if (waitTime > 0) {
						// Use setTimeout as an alternative to waitForTimeout
						await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
					}
					
					let content: string;
					
					// Extract content based on CSS selector or get full HTML
					if (useCssSelector && cssSelector) {
						// @ts-ignore - Ignore type errors in browser context
						content = await page.evaluate((selector: string) => {
							// @ts-ignore - This code runs in browser context
							const elements = document.querySelectorAll(selector);
							// @ts-ignore - This code runs in browser context
							return Array.from(elements).map(el => el.outerHTML).join('\n');
						}, cssSelector);
					} else {
						content = await page.content();
					}
					
					// Return the result
					const newItem: INodeExecutionData = {
						json: {
							url,
							content,
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