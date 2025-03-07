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
        const returnMultiple = executeFunctions.getNodeParameter('returnMultiple', itemIndex, true);
        const elements = $(selector);
        if (extractAttribute) {
            const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex);
            if (returnMultiple) {
                elements.each((_, el) => {
                    results.push({
                        json: {
                            value: $(el).attr(attributeName) || '',
                            selector: selector
                        },
                    });
                });
            }
            else if (elements.length > 0) {
                results.push({
                    json: {
                        value: $(elements[0]).attr(attributeName) || '',
                        selector: selector
                    },
                });
            }
        }
        else {
            const extractionFormat = executeFunctions.getNodeParameter('extractionFormat', itemIndex, 'text');
            if (returnMultiple) {
                elements.each((_, el) => {
                    if (extractionFormat === 'text') {
                        results.push({
                            json: {
                                value: $(el).text().trim(),
                                selector: selector
                            },
                        });
                    }
                    else if (extractionFormat === 'html') {
                        results.push({
                            json: {
                                value: $(el).html() || '',
                                selector: selector
                            },
                        });
                    }
                });
            }
            else if (elements.length > 0) {
                if (extractionFormat === 'text') {
                    results.push({
                        json: {
                            value: $(elements[0]).text().trim(),
                            selector: selector
                        },
                    });
                }
                else if (extractionFormat === 'html') {
                    results.push({
                        json: {
                            value: $(elements[0]).html() || '',
                            selector: selector
                        },
                    });
                }
            }
        }
    }
    else if (extractionType === 'xpath') {
        const selector = executeFunctions.getNodeParameter('selector', itemIndex);
        const extractAttribute = executeFunctions.getNodeParameter('extractAttribute', itemIndex, false);
        const returnMultiple = executeFunctions.getNodeParameter('returnMultiple', itemIndex, true);
        const elements = $(selector);
        if (extractAttribute) {
            const attributeName = executeFunctions.getNodeParameter('attributeName', itemIndex);
            if (returnMultiple) {
                elements.each((_, el) => {
                    results.push({
                        json: {
                            value: $(el).attr(attributeName) || '',
                            selector: selector
                        },
                    });
                });
            }
            else if (elements.length > 0) {
                results.push({
                    json: {
                        value: $(elements[0]).attr(attributeName) || '',
                        selector: selector
                    },
                });
            }
        }
        else {
            const extractionFormat = executeFunctions.getNodeParameter('extractionFormat', itemIndex, 'text');
            if (returnMultiple) {
                elements.each((_, el) => {
                    if (extractionFormat === 'text') {
                        results.push({
                            json: {
                                value: $(el).text().trim(),
                                selector: selector
                            },
                        });
                    }
                    else if (extractionFormat === 'html') {
                        results.push({
                            json: {
                                value: $(el).html() || '',
                                selector: selector
                            },
                        });
                    }
                });
            }
            else if (elements.length > 0) {
                if (extractionFormat === 'text') {
                    results.push({
                        json: {
                            value: $(elements[0]).text().trim(),
                            selector: selector
                        },
                    });
                }
                else if (extractionFormat === 'html') {
                    results.push({
                        json: {
                            value: $(elements[0]).html() || '',
                            selector: selector
                        },
                    });
                }
            }
        }
    }
    else if (extractionType === 'regex') {
        const pattern = executeFunctions.getNodeParameter('pattern', itemIndex);
        const regexFlags = executeFunctions.getNodeParameter('regexFlags', itemIndex, 'g');
        const captureGroups = executeFunctions.getNodeParameter('captureGroups', itemIndex, false);
        try {
            const regex = new RegExp(pattern, regexFlags);
            let match;
            const text = $('body').text();
            if (captureGroups) {
                while ((match = regex.exec(text)) !== null) {
                    if (match.length > 1) {
                        const groups = {};
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
                    }
                    else {
                        results.push({
                            json: {
                                value: match[0],
                                pattern: pattern
                            },
                        });
                    }
                    if (!regexFlags.includes('g'))
                        break;
                }
            }
            else {
                while ((match = regex.exec(text)) !== null) {
                    results.push({
                        json: {
                            value: match[0],
                            pattern: pattern
                        },
                    });
                    if (!regexFlags.includes('g'))
                        break;
                }
            }
        }
        catch (error) {
            throw new Error(`Invalid regular expression: ${error.message}`);
        }
    }
    else if (extractionType === 'table') {
        const tableSelector = executeFunctions.getNodeParameter('tableSelector', itemIndex, 'table');
        const includeHeaders = executeFunctions.getNodeParameter('includeHeaders', itemIndex, true);
        const tables = $(tableSelector);
        if (tables.length > 0) {
            const tableIndex = executeFunctions.getNodeParameter('tableIndex', itemIndex, 0);
            const table = tables.eq(Math.min(tableIndex, tables.length - 1));
            const data = [];
            let headers = [];
            if (includeHeaders) {
                table.find('thead tr').first().find('th, td').each((_, el) => {
                    headers.push($(el).text().trim());
                });
                if (headers.length === 0) {
                    table.find('tr').first().find('th, td').each((_, el) => {
                        headers.push($(el).text().trim());
                    });
                }
            }
            let rowsSelector = 'tbody tr';
            if (table.find('tbody').length === 0) {
                rowsSelector = 'tr';
                if (includeHeaders && headers.length > 0) {
                    rowsSelector = 'tr:not(:first-child)';
                }
            }
            table.find(rowsSelector).each((_, row) => {
                const rowData = {};
                $(row).find('td, th').each((colIndex, cell) => {
                    if (includeHeaders && headers[colIndex]) {
                        rowData[headers[colIndex]] = $(cell).text().trim();
                    }
                    else {
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
    }
    else if (extractionType === 'smartSelector') {
        const smartType = executeFunctions.getNodeParameter('smartType', itemIndex);
        if (smartType === 'article') {
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
            }
            else {
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
        }
        else if (smartType === 'headings') {
            const headings = [];
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
        }
        else if (smartType === 'navigation') {
            const navigationSelectors = [
                'nav',
                '.nav',
                '.navigation',
                '.menu',
                '#menu',
                'header .links',
                '[role="navigation"]',
            ];
            const navLinks = [];
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
        }
        else if (smartType === 'contact') {
            const emails = [];
            const phones = [];
            const addresses = [];
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
            const bodyText = $('body').text();
            let match;
            while ((match = emailRegex.exec(bodyText)) !== null) {
                if (!emails.includes(match[0])) {
                    emails.push(match[0]);
                }
            }
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
            const phoneRegex = /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g;
            while ((match = phoneRegex.exec(bodyText)) !== null) {
                if (!phones.includes(match[0])) {
                    phones.push(match[0]);
                }
            }
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
        const useResponsiveDesign = executeFunctions.getNodeParameter('useResponsiveDesign', itemIndex, false);
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
            if (!template.includes('<html') && !template.includes('<body')) {
                template = responsiveHeader + template + responsiveFooter;
            }
            else if (!template.includes('<meta name="viewport"')) {
                template = template.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
            }
        }
        generatedHtml = template;
    }
    else if (templateType === 'handlebars') {
        const template = executeFunctions.getNodeParameter('htmlTemplate', itemIndex);
        const dataSource = executeFunctions.getNodeParameter('dataSource', itemIndex);
        let templateData = {};
        if (dataSource === 'inputData') {
            templateData = item.json;
        }
        else if (dataSource === 'custom') {
            const customData = executeFunctions.getNodeParameter('customData', itemIndex, '{}');
            try {
                templateData = JSON.parse(customData);
            }
            catch (error) {
                throw new Error(`Invalid JSON in custom data: ${error.message}`);
            }
        }
        let result = template;
        const keyPattern = /{{([^{}]+)}}/g;
        let match;
        while ((match = keyPattern.exec(template)) !== null) {
            const key = match[1].trim();
            let value = '';
            if (key.includes('.')) {
                const parts = key.split('.');
                let current = templateData;
                for (const part of parts) {
                    if (current && typeof current === 'object') {
                        current = current[part];
                    }
                    else {
                        current = '';
                        break;
                    }
                }
                value = String(current || '');
            }
            else {
                value = String(templateData[key] || '');
            }
            const specificMatchRegex = new RegExp(match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(specificMatchRegex, value);
        }
        generatedHtml = result;
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
    const $ = cheerio.load(html);
    if (transformationType === 'addClass' ||
        transformationType === 'removeClass' ||
        transformationType === 'modifyAttribute' ||
        transformationType === 'replaceContent') {
        const selector = executeFunctions.getNodeParameter('selector', itemIndex);
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
    else if (transformationType === 'toMarkdown') {
        let markdown = html;
        markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
        markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
        markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
        markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
        markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
        markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
        markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
        markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
        markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
        markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
        markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
        markdown = markdown.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
        markdown = markdown.replace(/<img[^>]*src="(.*?)"[^>]*alt="(.*?)"[^>]*>/gi, '![$2]($1)');
        markdown = markdown.replace(/<img[^>]*alt="(.*?)"[^>]*src="(.*?)"[^>]*>/gi, '![$1]($2)');
        markdown = markdown.replace(/<img[^>]*src="(.*?)"[^>]*>/gi, '![]($1)');
        markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, function (match, content) {
            return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
        });
        markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, function (match, content) {
            let index = 1;
            return content.replace(/<li[^>]*>(.*?)<\/li>/gi, function (match, item) {
                return `${index++}. ${item}\n`;
            });
        });
        markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');
        markdown = markdown.replace(/<[^>]+>/g, '');
        markdown = markdown.replace(/\s+/g, ' ');
        markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
        return [
            {
                json: {
                    markdown,
                },
            },
        ];
    }
    else if (transformationType === 'minify') {
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
    }
    else if (transformationType === 'enhanceAccessibility') {
        const languageCode = executeFunctions.getNodeParameter('languageCode', itemIndex, 'en');
        if (!$('html').attr('lang')) {
            $('html').attr('lang', languageCode);
        }
        $('img:not([alt]), img[alt=""]').attr('alt', 'Image');
        $('a[target="_blank"]').each((_, el) => {
            var _a;
            if (!$(el).attr('title')) {
                $(el).attr('title', 'Opens in a new window');
            }
            if (!$(el).attr('rel') || !((_a = $(el).attr('rel')) === null || _a === void 0 ? void 0 : _a.includes('noopener'))) {
                $(el).attr('rel', 'noopener noreferrer');
            }
        });
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
    var _a, _b;
    const html = executeFunctions.getNodeParameter('html', itemIndex);
    const analysisType = executeFunctions.getNodeParameter('analysisType', itemIndex);
    const $ = cheerio.load(html);
    if (analysisType === 'seo') {
        const title = $('title').text().trim();
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        const h1Count = $('h1').length;
        const h2Count = $('h2').length;
        const imgWithoutAlt = $('img:not([alt]), img[alt=""]').length;
        const wordCount = $('body').text().trim().split(/\s+/).length;
        const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
        const metaRobots = $('meta[name="robots"]').attr('content') || '';
        const ogTitle = $('meta[property="og:title"]').attr('content') || '';
        const ogDescription = $('meta[property="og:description"]').attr('content') || '';
        const ogImage = $('meta[property="og:image"]').attr('content') || '';
        const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
        const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
        const headings = [];
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
        const hasStructuredData = $('script[type="application/ld+json"]').length > 0;
        const keywords = $('meta[name="keywords"]').attr('content') || '';
        const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
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
    }
    else if (analysisType === 'structure') {
        const elementCounts = {};
        const tags = ['div', 'p', 'span', 'a', 'img', 'ul', 'ol', 'li', 'table', 'form', 'input', 'button', 'header', 'footer', 'nav', 'section', 'article', 'aside', 'main'];
        tags.forEach(tag => {
            elementCounts[tag] = $(tag).length;
        });
        const nestingLevels = [];
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
        const classes = {};
        const ids = [];
        $('[class]').each((_, el) => {
            var _a;
            const classList = ((_a = $(el).attr('class')) === null || _a === void 0 ? void 0 : _a.split(/\s+/)) || [];
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
    }
    else if (analysisType === 'links') {
        const internalLinks = [];
        const externalLinks = [];
        const brokenLinks = [];
        const socialLinks = [];
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
            if (href === '#' || href === 'javascript:void(0)' || href === '') {
                brokenLinks.push({ href, text });
                return;
            }
            const socialMatch = socialDomains.find(({ domain }) => href.includes(domain));
            if (socialMatch) {
                socialLinks.push({ href, text, platform: socialMatch.platform });
            }
            if (href.startsWith('http')) {
                externalLinks.push({ href, text });
            }
            else {
                internalLinks.push({ href, text });
            }
        });
        const domainGroups = {};
        externalLinks.forEach(({ href }) => {
            try {
                const url = new URL(href);
                const domain = url.hostname;
                domainGroups[domain] = (domainGroups[domain] || 0) + 1;
            }
            catch {
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
    }
    else if (analysisType === 'images') {
        const images = [];
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
        const elementsWithBackgroundImage = $('[style*="background-image"]').length;
        const formatCounts = {};
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
    }
    else if (analysisType === 'performance') {
        const scripts = $('script[src]').length;
        const styles = $('link[rel="stylesheet"]').length;
        const inlineStyles = $('style').length;
        const inlineScripts = $('script:not([src])').length;
        const iframes = $('iframe').length;
        const images = $('img').length;
        const scriptSize = ((_a = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi)) === null || _a === void 0 ? void 0 : _a.join('').length) || 0;
        const styleSize = ((_b = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi)) === null || _b === void 0 ? void 0 : _b.join('').length) || 0;
        const usesAsync = $('script[async]').length;
        const usesDefer = $('script[defer]').length;
        const lazyImages = $('img[loading="lazy"]').length;
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
                            largeMediaElements: $('img[width][height]').filter(function () {
                                const width = parseInt($(this).attr('width') || '0');
                                const height = parseInt($(this).attr('height') || '0');
                                return width * height > 100000;
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
    }
    else if (analysisType === 'accessibility') {
        const hasLang = $('html').attr('lang') !== undefined;
        const lang = $('html').attr('lang') || '';
        const headingOrder = [];
        $('h1, h2, h3, h4, h5, h6').each((_, el) => {
            headingOrder.push(parseInt(el.tagName.substring(1), 10));
        });
        const skippedHeadings = [];
        for (let i = 1; i < headingOrder.length; i++) {
            if (headingOrder[i] > headingOrder[i - 1] + 1) {
                skippedHeadings.push(`Skipped from h${headingOrder[i - 1]} to h${headingOrder[i]}`);
            }
        }
        const imagesWithoutAlt = $('img:not([alt])').length;
        const imagesWithEmptyAlt = $('img[alt=""]').length;
        let inputsWithoutLabels = 0;
        $('input, textarea, select').each((_, el) => {
            const id = $(el).attr('id');
            if (id && $(`label[for="${id}"]`).length === 0) {
                inputsWithoutLabels++;
            }
        });
        const elementsWithARIA = $('[aria-label], [aria-labelledby], [aria-describedby], [role]').length;
        let hasContrastIssues = 0;
        $('[style*="color"]').each((_, el) => {
            const style = $(el).attr('style') || '';
            if (style.includes('color: #fff') || style.includes('color: white') ||
                style.includes('color: #FFF') || style.includes('color: rgb(255, 255, 255)')) {
                hasContrastIssues++;
            }
        });
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
                            decorativeImages: imagesWithEmptyAlt,
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
                                    if (tabindex > 0)
                                        count++;
                                });
                                return count;
                            })(),
                            tabIndexNegative: (() => {
                                let count = 0;
                                $('[tabindex]').each((_, el) => {
                                    const tabindex = parseInt($(el).attr('tabindex') || '0');
                                    if (tabindex < 0)
                                        count++;
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