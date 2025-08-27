import * as vscode from 'vscode';
import puppeteer, { Browser, Page, LaunchOptions, HTTPRequest, HTTPResponse, ElementHandle } from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

export interface BrowserInstance {
    id: string;
    browser: Browser;
    pages: Map<string, Page>;
    createdAt: Date;
    lastUsed: Date;
    networkInterceptionEnabled: boolean;
    requestLog: NetworkRequest[];
}

export interface NetworkRequest {
    id: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    timestamp: Date;
    status?: number;
    responseSize?: number;
    blocked?: boolean;
    modified?: boolean;
}

export interface FormData {
    [fieldName: string]: string | boolean | string[];
}

export interface ElementActionOptions {
    timeout?: number;
    waitForSelector?: boolean;
    scrollIntoView?: boolean;
    force?: boolean;
}

export interface AdvancedSelectorOptions {
    selectorType?: 'css' | 'xpath' | 'text' | 'aria';
    exact?: boolean;
    caseSensitive?: boolean;
    timeout?: number;
}

export interface NetworkInterceptionRule {
    id: string;
    urlPattern: string | RegExp;
    action: 'block' | 'modify' | 'log';
    modifyHeaders?: Record<string, string>;
    modifyResponse?: string;
    priority: number;
}

export interface ScreenshotOptions {
    fullPage?: boolean;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    width?: number;
    path?: string; // Optional path to save screenshot
    optimizeForSpeed?: boolean; // Optimize for speed or quality
    captureBeyondViewport?: boolean; // Capture beyond viewport
    encoding?: 'base64' | 'binary';
    height?: number;
    clip?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface NavigationOptions {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    timeout?: number;
}

export interface BrowserConfig {
    headless?: boolean;
    devtools?: boolean;
    width?: number;
    height?: number;
    userAgent?: string;
    timeout?: number;
}

export interface IntroSpectionOptions {

    browserInstanceId: string;
    pageId: string;
}

export class PuppeteerService {
    private _browserInstances: Map<string, BrowserInstance> = new Map();
    private _defaultConfig: BrowserConfig = {
        headless: false, // Show browser for better user experience
        devtools: false,
        width: 1920,
        height: 1080,
        timeout: 7000
    };
    private _disposables: vscode.Disposable[] = [];

    constructor(private outputChannel: vscode.OutputChannel) {
        // Clean up browser instances on extension deactivation
        this._disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('siba-ai')) {
                    this.updateConfigFromSettings();
                }
            })
        );

        this.updateConfigFromSettings();
    }

    private updateConfigFromSettings(): void {
        const config = vscode.workspace.getConfiguration('siba-ai.browser');
        this._defaultConfig = {
            headless: config.get<boolean>('headless', false),
            devtools: config.get<boolean>('devtools', false),
            width: config.get<number>('defaultWidth', 1920),
            height: config.get<number>('defaultHeight', 1080),
            timeout: config.get<number>('timeout', 7000)
        };
    }

    private getUniqueXPath(el: Element): string {
        if (!(el instanceof Element)) return '';

        const parts: string[] = [];

        while (el && el.nodeType === Node.ELEMENT_NODE) {
            let tag = el.nodeName.toLowerCase();
            let siblingIndex = 1;
            let sibling = el.previousElementSibling;
            while (sibling) {
            if (sibling.nodeName.toLowerCase() === tag) siblingIndex++;
            sibling = sibling.previousElementSibling;
            }

            const part =
            siblingIndex > 1
                ? `${tag}[${siblingIndex}]`
                : tag;
            parts.unshift(part);

            el = el.parentElement!;
        }

        return '/' + parts.join('/');
    }

    private async getUniqueXPathFromHandle(handle: ElementHandle<Element> | null): Promise<string> {
        if (!handle) return '';
        return await handle.evaluate((el) => {
            const getXPath = (el: Element): string => {
            const parts: string[] = [];
            while (el && el.nodeType === Node.ELEMENT_NODE) {
                const tag = el.nodeName.toLowerCase();
                let index = 1;
                let sibling = el.previousElementSibling;
                while (sibling) {
                if (sibling.nodeName.toLowerCase() === tag) {
                    index++;
                }
                sibling = sibling.previousElementSibling;
                }
                const part = index > 1 ? `${tag}[${index}]` : tag;
                parts.unshift(part);
                el = el.parentElement!;
            }
            return '/' + parts.join('/');
            };
            return getXPath(el);
        });
    }


    /**
     * Specialized select dropdown interaction with comprehensive support for different dropdown types
     */
    async selectDropdown(
        browserId: string,
        pageId: string,
        selector: string,
        values: string | string[],
        options?: {
            method?: 'value' | 'text' | 'index' | 'auto';
            waitForOptions?: boolean;
            allowPartialMatch?: boolean;
            timeout?: number;
            triggerEvents?: boolean;
        }
    ): Promise<{
        selected: string[];
        available: Array<{value: string, text: string, selected: boolean}>;
        method: string;
        isMultiple: boolean;
    }> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Advanced select dropdown interaction on: ${selector}`);

            const finalOptions = {
                method: 'auto',
                waitForOptions: true,
                allowPartialMatch: false,
                timeout: this._defaultConfig.timeout || 7000,
                triggerEvents: true,
                ...options
            };

            // Ensure values is an array
            const targetValues = Array.isArray(values) ? values : [values];

            // Wait for the select element
            await page.waitForSelector(selector, { timeout: finalOptions.timeout });

            // Get comprehensive information about the select element
            const selectInfo = await page.evaluate((sel) => {
                const selectElement = document.querySelector(sel) as HTMLSelectElement;
                if (!selectElement) {
                    throw new Error(`Select element not found: ${sel}`);
                }

                if (selectElement.tagName.toLowerCase() !== 'select') {
                    throw new Error(`Element is not a select dropdown: ${sel}`);
                }

                const options = Array.from(selectElement.options).map(option => ({
                    value: option.value,
                    text: option.text.trim(),
                    index: option.index,
                    selected: option.selected,
                    disabled: option.disabled
                }));

                return {
                    isMultiple: selectElement.multiple,
                    disabled: selectElement.disabled,
                    selectedIndex: selectElement.selectedIndex,
                    options,
                    hasOptgroups: selectElement.querySelectorAll('optgroup').length > 0
                };
            }, selector);

            if (selectInfo.disabled) {
                throw new Error(`Select element is disabled: ${selector}`);
            }

            //this.outputChannel.appendLine(`[PuppeteerService] Found select with ${selectInfo.options.length} options, multiple: ${selectInfo.isMultiple}`);

            // Auto-detect selection method if not specified
            let selectionMethod = finalOptions.method;
            if (selectionMethod === 'auto') {
                selectionMethod = this.detectSelectionMethod(targetValues, selectInfo.options);
                //this.outputChannel.appendLine(`[PuppeteerService] Auto-detected selection method: ${selectionMethod}`);
            }

            // Find matching options
            const matchingOptions = this.findMatchingOptions(
                targetValues,
                selectInfo.options,
                selectionMethod as 'value' | 'text' | 'index',
                finalOptions.allowPartialMatch
            );

            if (matchingOptions.length === 0) {
                throw new Error(`No matching options found for: ${targetValues.join(', ')}`);
            }

            if (!selectInfo.isMultiple && matchingOptions.length > 1) {
                //this.outputChannel.appendLine(`[PuppeteerService] Single select detected, using first match only`);
                matchingOptions.splice(1); // Keep only the first match
            }

            // Perform the selection using Puppeteer's native select method
            const selectedValues = matchingOptions.map(opt => opt.value);
            const puppeteerResult = await page.select(selector, ...selectedValues);

            // Trigger additional events if requested
            if (finalOptions.triggerEvents) {
                await page.evaluate((sel) => {
                    const element = document.querySelector(sel) as HTMLSelectElement;
                    if (element) {
                        // Trigger additional events that some frameworks expect
                        element.dispatchEvent(new Event('focus', { bubbles: true }));
                        element.dispatchEvent(new Event('blur', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, selector);
            }

            // Get final state
            const finalState = await page.evaluate((sel) => {
                const selectElement = document.querySelector(sel) as HTMLSelectElement;
                return Array.from(selectElement.options).map(option => ({
                    value: option.value,
                    text: option.text.trim(),
                    selected: option.selected
                }));
            }, selector);

            browserInstance.lastUsed = new Date();

            const result = {
                selected: puppeteerResult,
                available: finalState,
                method: selectionMethod,
                isMultiple: selectInfo.isMultiple
            };

            //this.outputChannel.appendLine(`[PuppeteerService] Successfully selected ${result.selected.length} options using ${selectionMethod} method`);
            return result;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to interact with select dropdown: ${error}`);
            throw new Error(`Failed to interact with select dropdown: ${error}`);
        }
    }

    /**
     * Detect the best selection method based on the target values and available options
     */
    private detectSelectionMethod(
        targetValues: string[],
        availableOptions: Array<{value: string, text: string, index: number}>
    ): 'value' | 'text' | 'index' {
        for (const target of targetValues) {
            // Check if it's a numeric index
            if (/^\d+$/.test(target)) {
                const index = parseInt(target, 10);
                if (index >= 0 && index < availableOptions.length) {
                    return 'index';
                }
            }

            // Check for exact value matches
            if (availableOptions.some(opt => opt.value === target)) {
                return 'value';
            }

            // Check for exact text matches
            if (availableOptions.some(opt => opt.text === target)) {
                return 'text';
            }
        }

        // Default to value-based selection
        return 'value';
    }

    /**
     * Find matching options based on the selection method
     */
    private findMatchingOptions(
        targetValues: string[],
        availableOptions: Array<{value: string, text: string, index: number}>,
        method: 'value' | 'text' | 'index',
        allowPartialMatch: boolean
    ): Array<{value: string, text: string, index: number}> {
        const matches: Array<{value: string, text: string, index: number}> = [];

        for (const target of targetValues) {
            let matchFound = false;

            switch (method) {
                case 'value':
                    const valueMatch = availableOptions.find(opt => 
                        allowPartialMatch 
                            ? opt.value.toLowerCase().includes(target.toLowerCase())
                            : opt.value === target
                    );
                    if (valueMatch) {
                        matches.push(valueMatch);
                        matchFound = true;
                    }
                    break;

                case 'text':
                    const textMatch = availableOptions.find(opt => 
                        allowPartialMatch 
                            ? opt.text.toLowerCase().includes(target.toLowerCase())
                            : opt.text === target
                    );
                    if (textMatch) {
                        matches.push(textMatch);
                        matchFound = true;
                    }
                    break;

                case 'index':
                    const index = parseInt(target, 10);
                    if (!isNaN(index) && index >= 0 && index < availableOptions.length) {
                        matches.push(availableOptions[index]);
                        matchFound = true;
                    }
                    break;
            }

            if (!matchFound && !allowPartialMatch) {
                // If no exact match found and partial matching is disabled, throw error
                throw new Error(`No matching option found for "${target}" using ${method} method`);
            }
        }

        return matches;
    }

    /**
     * Get comprehensive information about a select dropdown
     */
    async getSelectInfo(
        browserId: string,
        pageId: string,
        selector: string
    ): Promise<{
        isMultiple: boolean;
        disabled: boolean;
        selectedValues: string[];
        selectedTexts: string[];
        selectedIndexes: number[];
        options: Array<{
            value: string;
            text: string;
            index: number;
            selected: boolean;
            disabled: boolean;
        }>;
        optgroups: Array<{
            label: string;
            options: Array<{value: string, text: string, index: number}>;
        }>;
    }> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Getting select info for: ${selector}`);

            await page.waitForSelector(selector, { timeout: 5000 });

            const selectInfo = await page.evaluate((sel) => {
                const selectElement = document.querySelector(sel) as HTMLSelectElement;
                if (!selectElement) {
                    throw new Error(`Select element not found: ${sel}`);
                }

                if (selectElement.tagName.toLowerCase() !== 'select') {
                    throw new Error(`Element is not a select dropdown: ${sel}`);
                }

                const options = Array.from(selectElement.options).map(option => ({
                    value: option.value,
                    text: option.text.trim(),
                    index: option.index,
                    selected: option.selected,
                    disabled: option.disabled
                }));

                const selectedOptions = options.filter(opt => opt.selected);

                // Get optgroup information
                const optgroups = Array.from(selectElement.querySelectorAll('optgroup')).map(optgroup => ({
                    label: optgroup.label,
                    options: Array.from(optgroup.querySelectorAll('option')).map(option => ({
                        value: option.value,
                        text: option.text.trim(),
                        index: Array.from(selectElement.options).indexOf(option)
                    }))
                }));

                return {
                    isMultiple: selectElement.multiple,
                    disabled: selectElement.disabled,
                    selectedValues: selectedOptions.map(opt => opt.value),
                    selectedTexts: selectedOptions.map(opt => opt.text),
                    selectedIndexes: selectedOptions.map(opt => opt.index),
                    options,
                    optgroups
                };
            }, selector);

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Select info retrieved successfully`);
            
            return selectInfo;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to get select info: ${error}`);
            throw new Error(`Failed to get select info: ${error}`);
        }
    }

    async pageIntrospect(browserId: string, pageId: string): Promise<any> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Deep introspecting page ${pageId}...`);

            // Get all elements on the page
            const elements = await page.$$('*');
            const introspectionData: any[] = [];

            for (const element of elements) {
                const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                const classes = await element.evaluate(el => Array.from(el.classList).join(' '));
                const id = await element.evaluate(el => el.id);
                const textContent = await element.evaluate(el => el.textContent?.trim() || '');
                const attributes = await element.evaluate(el => {
                    return Array.from(el.attributes).reduce((acc, attr) => {
                        acc[attr.name] = attr.value;
                        return acc;
                    }, {} as Record<string, string>);
                });

                introspectionData.push({
                    tagName,
                    classes,
                    id,
                    textContent,
                    xpath: await this.getUniqueXPathFromHandle(element),
                    attributes
                });
            }

            //this.outputChannel.appendLine(`[PuppeteerService] Deep introspection completed`);
            return introspectionData;


            // const els = await page.$$('*');

            // return els.map(async el => ({
            //     tag: el.evaluate(el => el.tagName.toLowerCase()),
            //     id: el.evaluate(el => el.id || null),
            //     attributes: el.evaluate(el => {
            //         return Array.from(el.attributes).reduce((acc, attr) => {
            //             acc[attr.name] = attr.value;
            //             return acc;
            //         }, {} as Record<string, string>);
            //     }),
            //     class: await el.evaluate(el => Array.from(el.classList).join(' ')),
            //     xpath: this.getUniqueXPathFromHandle(el)
            // }))

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to deep introspect: ${error}`);
            throw new Error(`Failed to deep introspect: ${error}`);
        }
    }

    async pageElementIntrospect(
        browserId: string, 
        pageId: string, 
        selector: string
    ): Promise<any> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Introspecting element with selector ${selector}...`);

            const element = await page.$(selector);
            if (!element) {
                throw new Error(`Element with selector ${selector} not found`);
            }

            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const classes = await element.evaluate(el => Array.from(el.classList).join(' '));
            const id = await element.evaluate(el => el.id);
            const textContent = await element.evaluate(el => el.textContent?.trim() || '');
            const attributes = await element.evaluate(el => {
                return Array.from(el.attributes).reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                }, {} as Record<string, string>);
            });

            const xpath = await this.getUniqueXPathFromHandle(element);

            //this.outputChannel.appendLine(`[PuppeteerService] Element introspection completed`);
            return {
                tagName,
                classes,
                id,
                textContent,
                xpath,
                attributes
            };

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to introspect element: ${error}`);
            throw new Error(`Failed to introspect element: ${error}`);
        }
    }


    async launchBrowser(config?: Partial<BrowserConfig>): Promise<string> {
        const browserId = this.generateBrowserId();
        const finalConfig = { ...this._defaultConfig, ...config };

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Launching browser ${browserId}...`);

            const launchOptions: LaunchOptions = {
                headless: finalConfig.headless,
                devtools: finalConfig.devtools,
                defaultViewport: {
                    width: finalConfig.width!,
                    height: finalConfig.height!
                },
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    `--window-size=${finalConfig.width},${finalConfig.height}`
                ]
            };

            // Add user agent if specified
            if (finalConfig.userAgent) {
                launchOptions.args!.push(`--user-agent="${finalConfig.userAgent}"`);
            }

            const browser = await puppeteer.launch(launchOptions);

            const browserInstance: BrowserInstance = {
                id: browserId,
                browser,
                pages: new Map(),
                createdAt: new Date(),
                lastUsed: new Date(),
                networkInterceptionEnabled: false,
                requestLog: []
            };

            this._browserInstances.set(browserId, browserInstance);

            //this.outputChannel.appendLine(`[PuppeteerService] Browser ${browserId} launched successfully`);
            return browserId;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to launch browser: ${error}`);
            throw new Error(`Failed to launch browser: ${error}`);
        }
    }

    async navigateToUrl(browserId: string, url: string, options?: NavigationOptions): Promise<string> {
        const browserInstance = this.getBrowserInstance(browserId);
        const pageId = this.generatePageId();

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Creating new page ${pageId} for URL: ${url}`);

            const page = await browserInstance.browser.newPage();
            
            // Set default timeouts
            page.setDefaultTimeout(options?.timeout || this._defaultConfig.timeout!);
            page.setDefaultNavigationTimeout(options?.timeout || this._defaultConfig.timeout!);

            // Navigate to URL
            await page.goto(url, {
                waitUntil: options?.waitUntil || 'domcontentloaded',
                timeout: options?.timeout || this._defaultConfig.timeout!
            });

            // Store page reference
            browserInstance.pages.set(pageId, page);
            browserInstance.lastUsed = new Date();

            //this.outputChannel.appendLine(`[PuppeteerService] Successfully navigated to ${url} on page ${pageId}`);
            return pageId;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to navigate to ${url}: ${error}`);
            throw new Error(`Failed to navigate to ${url}: ${error}`);
        }
    }

    async takeScreenshot(browserId: string, pageId: string, options?: ScreenshotOptions): Promise<string> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Taking screenshot of page ${pageId}...`);

            const screenshotOptions: any = {
                type: options?.format || 'png',
                fullPage: options?.fullPage !== false, // Default to true
                encoding: 'base64',
                optimizeForSpeed: options?.optimizeForSpeed !== false, // Default to true
            };

            // Add quality for JPEG
            if (options?.format === 'jpeg' && options?.quality) {
                screenshotOptions.quality = options.quality;
            }

            // Add clip region if specified
            if (options?.clip) {
                screenshotOptions.clip = options.clip;
                screenshotOptions.fullPage = false; // Can't use fullPage with clip
            }

            // Set viewport if width/height specified
            if (options?.width && options?.height) {
                await page.setViewport({
                    width: options.width,
                    height: options.height
                });
            }

            const screenshot = await page.screenshot(screenshotOptions);
            browserInstance.lastUsed = new Date();

            //this.outputChannel.appendLine(`[PuppeteerService] Screenshot captured successfully (${(screenshot as string).length} characters)`);
            return screenshot as string;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to take screenshot: ${error}`);
            throw new Error(`Failed to take screenshot: ${error}`);
        }
    }

    async elementScreenshot(selector: string, browserId: string, pageId: string, screenShotptions?: ScreenshotOptions): Promise<string> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Taking screenshot of element with selector ${selector}...`);

            const screenshotOptions: any = {
                type: screenShotptions?.format || 'png',
                fullPage: screenShotptions?.fullPage !== false, // Default to true
                encoding: 'base64',
                optimizeForSpeed: screenShotptions?.optimizeForSpeed !== false, // Default to true
            };

            // Add quality for JPEG
            if (screenShotptions?.format === 'jpeg' && screenShotptions?.quality) {
                screenshotOptions.quality = screenShotptions.quality;
            }

            // Add clip region if specified
            if (screenShotptions?.clip) {
                screenshotOptions.clip = screenShotptions.clip;
                screenshotOptions.fullPage = false; // Can't use fullPage with clip
            }

            // Set viewport if width/height specified
            if (screenShotptions?.width && screenShotptions?.height) {
                await page.setViewport({
                    width: screenShotptions.width,
                    height: screenShotptions.height
                });
            }

            const element = await page.waitForSelector(selector);

            if (!element) {
                //this.outputChannel.appendLine(`[PuppeteerService] Element with selector ${selector} not found`);
                throw new Error(`Failed to take screenshot: Element with selector ${selector} not found`);
            }

            const screenshot = await element.screenshot(screenshotOptions);
            browserInstance.lastUsed = new Date();

            //this.outputChannel.appendLine(`[PuppeteerService] Screenshot captured successfully (${(screenshot as string).length} characters)`);
            element.dispose();
            return screenshot as string;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to take screenshot: ${error}`);
            throw new Error(`Failed to take screenshot: ${error}`);
        }
    }

    async clickElement(browserId: string, pageId: string, selector: string): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Clicking element: ${selector}`);

            await page.waitForSelector(selector, { timeout: 5000 });
            await page.click(selector);
            
            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Successfully clicked element: ${selector}`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to click element ${selector}: ${error}`);
            throw new Error(`Failed to click element ${selector}: ${error}`);
        }
    }

    async typeText(browserId: string, pageId: string, selector: string, text: string): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Typing text into element: ${selector}`);

            await page.waitForSelector(selector, { timeout: 5000 });
            await page.focus(selector);
            // Clear existing text by selecting all and then typing
            await page.keyboard.down('Meta'); // Cmd on Mac
            await page.keyboard.press('KeyA');
            await page.keyboard.up('Meta');
            await page.type(selector, text);
            
            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Successfully typed text into element: ${selector}`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to type text into ${selector}: ${error}`);
            throw new Error(`Failed to type text into ${selector}: ${error}`);
        }
    }

    async executeJavaScript(browserId: string, pageId: string, script: string): Promise<any> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Executing JavaScript...`);

            const result = await page.evaluate(script);
            
            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] JavaScript executed successfully`);
            
            return result;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to execute JavaScript: ${error}`);
            throw new Error(`Failed to execute JavaScript: ${error}`);
        }
    }

    async closePage(browserId: string, pageId: string): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            await page.close();
            browserInstance.pages.delete(pageId);
            browserInstance.lastUsed = new Date();

            //this.outputChannel.appendLine(`[PuppeteerService] Page ${pageId} closed successfully`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to close page ${pageId}: ${error}`);
            throw new Error(`Failed to close page ${pageId}: ${error}`);
        }
    }

    async closeBrowser(browserId: string): Promise<void> {
        const browserInstance = this._browserInstances.get(browserId);
        if (!browserInstance) {
            throw new Error(`Browser ${browserId} not found`);
        }

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Closing browser ${browserId}...`);

            // Close all pages first
            for (const [pageId, page] of browserInstance.pages) {
                try {
                    await page.close();
                } catch (error) {
                    //this.outputChannel.appendLine(`[PuppeteerService] Warning: Failed to close page ${pageId}: ${error}`);
                }
            }

            // Close browser
            await browserInstance.browser.close();
            this._browserInstances.delete(browserId);

            //this.outputChannel.appendLine(`[PuppeteerService] Browser ${browserId} closed successfully`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to close browser ${browserId}: ${error}`);
            throw new Error(`Failed to close browser ${browserId}: ${error}`);
        }
    }

    getBrowserInfo(browserId: string): any {
        const browserInstance = this._browserInstances.get(browserId);
        if (!browserInstance) {
            throw new Error(`Browser ${browserId} not found`);
        }

        return {
            id: browserId,
            connected: browserInstance.browser.isConnected(),
            pageCount: browserInstance.pages.size,
            pageIds: Array.from(browserInstance.pages.keys()),
            createdAt: browserInstance.createdAt,
            lastUsed: browserInstance.lastUsed
        };
    }

    getAllBrowsers(): any[] {
        return Array.from(this._browserInstances.values()).map(instance => ({
            id: instance.id,
            connected: instance.browser.isConnected(),
            pageCount: instance.pages.size,
            pageIds: Array.from(instance.pages.keys()),
            createdAt: instance.createdAt,
            lastUsed: instance.lastUsed
        }));
    }

    async closeAllBrowsers(): Promise<{ closed: number; errors: string[] }> {
        const browserIds = Array.from(this._browserInstances.keys());
        const errors: string[] = [];
        let closed = 0;

        if (browserIds.length === 0) {
            return { closed: 0, errors: [] };
        }

        //this.outputChannel.appendLine(`[PuppeteerService] Closing all browsers (${browserIds.length} total)...`);

        // Close all browsers in parallel for faster execution
        await Promise.allSettled(
            browserIds.map(async (browserId) => {
                try {
                    await this.closeBrowser(browserId);
                    closed++;
                    //this.outputChannel.appendLine(`[PuppeteerService] Successfully closed browser ${browserId}`);
                } catch (error) {
                    const errorMsg = `Failed to close browser ${browserId}: ${error}`;
                    errors.push(errorMsg);
                    //this.outputChannel.appendLine(`[PuppeteerService] ${errorMsg}`);
                }
            })
        );

        //this.outputChannel.appendLine(`[PuppeteerService] Close all browsers completed: ${closed} closed, ${errors.length} errors`);
        
        return { closed, errors };
    }

    private getBrowserInstance(browserId: string): BrowserInstance {
        const browserInstance = this._browserInstances.get(browserId);
        if (!browserInstance) {
            throw new Error(`Browser ${browserId} not found`);
        }
        if (!browserInstance.browser.isConnected()) {
            throw new Error(`Browser ${browserId} is disconnected`);
        }
        return browserInstance;
    }

    private getPage(browserInstance: BrowserInstance, pageId: string): Page {
        const page = browserInstance.pages.get(pageId);
        if (!page) {
            throw new Error(`Page ${pageId} not found`);
        }
        if (page.isClosed()) {
            throw new Error(`Page ${pageId} is closed`);
        }
        return page;
    }

    private generateBrowserId(): string {
        return `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generatePageId(): string {
        return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async dispose(): Promise<void> {
        //this.outputChannel.appendLine(`[PuppeteerService] Disposing service and closing all browsers...`);

        // Close all browser instances
        const closePromises = Array.from(this._browserInstances.keys()).map(browserId => 
            this.closeBrowser(browserId).catch(error => {throw new Error(`[PuppeteerService] Error closing browser ${browserId}: ${error}`)} )
        );

        await Promise.all(closePromises);

        // Dispose of VS Code disposables
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];

        //this.outputChannel.appendLine(`[PuppeteerService] Service disposed successfully`);
    }

    // =============================================
    // ENHANCED FEATURES - PHASE 2 IMPLEMENTATION
    // =============================================

    /**
     * Fill out a form with advanced capabilities using Puppeteer locators
     */
    async fillForm(browserId: string, pageId: string, formData: FormData, options?: ElementActionOptions): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Filling form with ${Object.keys(formData).length} fields`);

            for (const [fieldName, value] of Object.entries(formData)) {
                try {
                    // Use Puppeteer locators for reliable element interaction
                    const locator = page.locator(`[name="${fieldName}"], #${fieldName}, [data-testid="${fieldName}"]`);
                    
                    // Set timeout if specified
                    if (options?.timeout) {
                        locator.setTimeout(options.timeout);
                    }

                    // Wait for element to be available and stable
                    await locator.wait();

                    if (typeof value === 'boolean') {
                        // Handle checkboxes and radio buttons
                        const element = await locator.waitHandle();
                        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                        const inputType = await element.evaluate(el => (el as HTMLInputElement).type);
                        
                        if (tagName === 'input' && (inputType === 'checkbox' || inputType === 'radio')) {
                            const isChecked = await element.evaluate(el => (el as HTMLInputElement).checked);
                            if (isChecked !== value) {
                                await locator.click();
                            }
                        }
                    } else if (Array.isArray(value)) {
                        // Handle multi-select dropdowns
                        const element = await locator.waitHandle();
                        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                        
                        if (tagName === 'select') {
                            // Clear existing selections
                            await element.evaluate(el => {
                                const select = el as HTMLSelectElement;
                                for (let i = 0; i < select.options.length; i++) {
                                    select.options[i].selected = false;
                                }
                            });
                            
                            // Select specified values
                            for (const val of value) {
                                await element.evaluate((el, v) => {
                                    const select = el as HTMLSelectElement;
                                    for (let i = 0; i < select.options.length; i++) {
                                        if (select.options[i].value === v || select.options[i].text === v) {
                                            select.options[i].selected = true;
                                            break;
                                        }
                                    }
                                }, val);
                            }
                        }
                    } else {
                        // Handle text inputs, textareas, and single-select dropdowns
                        await locator.fill(value.toString());
                    }

                    //this.outputChannel.appendLine(`[PuppeteerService] Successfully filled field: ${fieldName}`);
                } catch (fieldError) {
                    //this.outputChannel.appendLine(`[PuppeteerService] Warning: Failed to fill field ${fieldName}: ${fieldError}`);
                    // Continue with other fields instead of failing the entire operation
                    throw new Error(`Failed to fill form: ${fieldError}`);
                }
            }

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Form filling completed`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to fill form: ${error}`);
            throw new Error(`Failed to fill form: ${error}`);
        }
    }

    /**
     * Advanced element interaction with multiple selector strategies
     */
    async interactWithElement(
        browserId: string, 
        pageId: string, 
        selector: string, 
        action: 'click' | 'hover' | 'scroll' | 'focus' | 'doubleClick' | 'rightClick',
        options?: ElementActionOptions & AdvancedSelectorOptions
    ): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Performing ${action} on element: ${selector}`);

            let locator;
            
            // Handle different selector types based on Puppeteer API guide
            switch (options?.selectorType) {
                case 'xpath':
                    locator = page.locator(`::-p-xpath(${selector})`);
                    break;
                case 'text':
                    const textSelector = options?.exact 
                        ? `::-p-text("${selector.replace(/"/g, '\\"')}")` 
                        : `::-p-text(${selector})`;
                    locator = page.locator(textSelector);
                    break;
                case 'aria':
                    locator = page.locator(`::-p-aria(${selector})`);
                    break;
                default:
                    locator = page.locator(selector);
            }

            // Set timeout if specified
            if (options?.timeout) {
                locator.setTimeout(options.timeout);
            }

            // Configure locator behavior
            if (options?.scrollIntoView !== false) {
                locator.setEnsureElementIsInTheViewport(true);
            }

            if (options?.waitForSelector !== false) {
                locator.setVisibility('visible');
                locator.setWaitForEnabled(true);
                locator.setWaitForStableBoundingBox(true);
            }

            // Perform the specified action
            switch (action) {
                case 'click':
                    await locator.click();
                    break;
                case 'hover':
                    await locator.hover();
                    break;
                case 'scroll':
                    await locator.scroll({ scrollTop: 100 });
                    break;
                case 'focus':
                    const element = await locator.waitHandle();
                    await element.focus();
                    break;
                case 'doubleClick':
                    await locator.click({ count: 2 });
                    break;
                case 'rightClick':
                    await locator.click({ button: 'right' });
                    break;
                default:
                    throw new Error(`Unsupported action: ${action}`);
            }

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Successfully performed ${action} on element`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to perform ${action} on element: ${error}`);
            throw new Error(`Failed to perform ${action} on element: ${error}`);
        }
    }

    /**
     * Advanced text input with sophisticated typing simulation
     */
    async advancedTypeText(
        browserId: string, 
        pageId: string, 
        selector: string, 
        text: string, 
        options?: {
            clear?: boolean;
            delay?: number;
            pressEnter?: boolean;
            pressTab?: boolean;
        }
    ): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Advanced typing into element: ${selector}`);

            const locator = page.locator(selector);
            await locator.wait();

            if (options?.clear !== false) {
                // Clear existing content using select all + delete
                await locator.click();
                await page.keyboard.down('Meta'); // Cmd on Mac, Ctrl on Windows/Linux
                await page.keyboard.press('KeyA');
                await page.keyboard.up('Meta');
                await page.keyboard.press('Backspace');
            }

            // Type with optional delay between characters
            if (options?.delay) {
                for (const char of text) {
                    await page.keyboard.type(char);
                    await new Promise(resolve => setTimeout(resolve, options.delay));
                }
            } else {
                await locator.fill(text);
            }

            // Optional key presses after typing
            if (options?.pressEnter) {
                await page.keyboard.press('Enter');
            }

            if (options?.pressTab) {
                await page.keyboard.press('Tab');
            }

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Successfully typed text with advanced options`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to type text: ${error}`);
            throw new Error(`Failed to type text: ${error}`);
        }
    }

    /**
     * Enhanced JavaScript execution with better error handling and return value support
     */
    async evaluateJavaScript(
        browserId: string, 
        pageId: string, 
        script: string | Function, 
        args?: any[]
    ): Promise<any> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Evaluating JavaScript with enhanced support`);

            let result;
            
            if (typeof script === 'function') {
                // Use function with arguments support - cast to proper type
                result = await page.evaluate(script as any, ...(args || []));
            } else {
                // Clean and analyze the script
                const cleanScript = script.trim();
                
                // Check for various patterns that need wrapping
                const hasReturn = /\breturn\b/.test(cleanScript);
                const hasAwait = /\bawait\b/.test(cleanScript);
                const isExpression = !cleanScript.includes(';') && !cleanScript.includes('{') && !cleanScript.includes('const ') && !cleanScript.includes('let ') && !cleanScript.includes('var ');
                
                if (hasAwait && hasReturn) {
                    // Has both await and return - wrap in async function
                    const wrappedScript = `(async () => { ${cleanScript} })()`;
                    result = await page.evaluate(wrappedScript);
                } else if (hasReturn && !isExpression) {
                    // Has return statement but not a simple expression - wrap in function
                    const wrappedScript = `(() => { ${cleanScript} })()`;
                    result = await page.evaluate(wrappedScript);
                } else if (hasAwait) {
                    // Has await but no return - wrap in async function
                    const wrappedScript = `(async () => { ${cleanScript} })()`;
                    result = await page.evaluate(wrappedScript);
                } else {
                    // Use script directly for simple expressions and statements
                    result = await page.evaluate(cleanScript);
                }
            }

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] JavaScript evaluation completed successfully`);
            
            return result;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] JavaScript evaluation failed: ${error}`);
            throw new Error(`JavaScript evaluation failed: ${error}`);
        }
    }

    /**
     * Get element handle for advanced manipulation
     */
    async getElementHandle(
        browserId: string, 
        pageId: string, 
        selector: string,
        options?: AdvancedSelectorOptions
    ): Promise<ElementHandle<Element> | null> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Getting element handle for: ${selector}`);

            let locator;
            
            // Handle different selector types
            switch (options?.selectorType) {
                case 'xpath':
                    locator = page.locator(`::-p-xpath(${selector})`);
                    break;
                case 'text':
                    locator = page.locator(`::-p-text(${selector})`);
                    break;
                case 'aria':
                    locator = page.locator(`::-p-aria(${selector})`);
                    break;
                default:
                    locator = page.locator(selector);
            }

            if (options?.timeout) {
                locator.setTimeout(options.timeout);
            }

            const handle = await locator.waitHandle();
            browserInstance.lastUsed = new Date();
            
            //this.outputChannel.appendLine(`[PuppeteerService] Successfully obtained element handle`);
            return handle;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to get element handle: ${error}`);
            return null;
        }
    }

    /**
     * File upload functionality
     */
    async uploadFile(
        browserId: string, 
        pageId: string, 
        fileInputSelector: string, 
        filePath: string
    ): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Uploading file: ${filePath}`);

            // Verify file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const fileInput = await page.$(fileInputSelector) as ElementHandle<HTMLInputElement>;
            if (!fileInput) {
                throw new Error(`File input element not found: ${fileInputSelector}`);
            }

            await fileInput.uploadFile(filePath);
            
            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] File uploaded successfully`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to upload file: ${error}`);
            throw new Error(`Failed to upload file: ${error}`);
        }
    }

    /**
     * Drag and drop functionality
     */
    async dragAndDrop(
        browserId: string, 
        pageId: string, 
        sourceSelector: string, 
        targetSelector: string
    ): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Performing drag and drop from ${sourceSelector} to ${targetSelector}`);

            const source = await page.$(sourceSelector);
            const target = await page.$(targetSelector);

            if (!source || !target) {
                throw new Error('Source or target element not found');
            }

            const sourceBoundingBox = await source.boundingBox();
            const targetBoundingBox = await target.boundingBox();

            if (!sourceBoundingBox || !targetBoundingBox) {
                throw new Error('Could not get bounding boxes for drag and drop');
            }

            // Perform drag and drop
            await page.mouse.move(
                sourceBoundingBox.x + sourceBoundingBox.width / 2,
                sourceBoundingBox.y + sourceBoundingBox.height / 2
            );
            await page.mouse.down();
            
            await page.mouse.move(
                targetBoundingBox.x + targetBoundingBox.width / 2,
                targetBoundingBox.y + targetBoundingBox.height / 2,
                { steps: 10 }
            );
            await page.mouse.up();

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Drag and drop completed successfully`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to perform drag and drop: ${error}`);
            throw new Error(`Failed to perform drag and drop: ${error}`);
        }
    }

    /**
     * Enable network interception with advanced request/response modification
     */
    async enableNetworkInterception(browserId: string, pageId: string): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Enabling network interception for page ${pageId}`);

            await page.setRequestInterception(true);
            browserInstance.networkInterceptionEnabled = true;

            // Set up request interceptor with logging
            page.on('request', (request: HTTPRequest) => {
                const networkRequest: NetworkRequest = {
                    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers(),
                    timestamp: new Date(),
                    blocked: false,
                    modified: false
                };

                browserInstance.requestLog.push(networkRequest);

                // Default behavior: continue request
                if (!request.isInterceptResolutionHandled()) {
                    request.continue();
                }
            });

            // Log responses
            page.on('response', (response: HTTPResponse) => {
                const url = response.url();
                const status = response.status();
                
                // Find corresponding request and update it
                const requestEntry = browserInstance.requestLog.find(req => 
                    req.url === url && !req.status
                );
                
                if (requestEntry) {
                    requestEntry.status = status;
                    requestEntry.responseSize = parseInt(response.headers()['content-length'] || '0');
                }
            });

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Network interception enabled successfully`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to enable network interception: ${error}`);
            throw new Error(`Failed to enable network interception: ${error}`);
        }
    }

    /**
     * Add network interception rule
     */
    async addNetworkRule(
        browserId: string, 
        pageId: string, 
        rule: NetworkInterceptionRule
    ): Promise<void> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Adding network rule: ${rule.id}`);

            if (!browserInstance.networkInterceptionEnabled) {
                await this.enableNetworkInterception(browserId, pageId);
            }

            // Add cooperative interceptor with priority
            page.on('request', (request: HTTPRequest) => {
                if (request.isInterceptResolutionHandled()) return;

                const url = request.url();
                const matches = typeof rule.urlPattern === 'string' 
                    ? url.includes(rule.urlPattern)
                    : rule.urlPattern.test(url);

                if (matches) {
                    const networkRequest = browserInstance.requestLog.find(req => 
                        req.url === url && req.timestamp.getTime() > Date.now() - 1000
                    );

                    switch (rule.action) {
                        case 'block':
                            if (networkRequest) networkRequest.blocked = true;
                            request.abort('blockedbyclient', rule.priority);
                            break;
                        case 'modify':
                            if (networkRequest) networkRequest.modified = true;
                            const overrides: any = {};
                            if (rule.modifyHeaders) {
                                overrides.headers = { ...request.headers(), ...rule.modifyHeaders };
                            }
                            request.continue(overrides, rule.priority);
                            break;
                        case 'log':
                            // Just continue with logging (already handled above)
                            request.continue({}, rule.priority);
                            break;
                        default:
                            request.continue({}, rule.priority);
                    }
                } else {
                    // Continue other requests with default priority
                    request.continue({}, 0);
                }
            });

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Network rule added successfully`);

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to add network rule: ${error}`);
            throw new Error(`Failed to add network rule: ${error}`);
        }
    }

    /**
     * Get network request logs
     */
    getNetworkLogs(browserId: string): NetworkRequest[] {
        const browserInstance = this.getBrowserInstance(browserId);
        return [...browserInstance.requestLog];
    }

    /**
     * Clear network request logs
     */
    clearNetworkLogs(browserId: string): void {
        const browserInstance = this.getBrowserInstance(browserId);
        browserInstance.requestLog = [];
        //this.outputChannel.appendLine(`[PuppeteerService] Network logs cleared for browser ${browserId}`);
    }

    /**
     * Wait for element with advanced options
     */
    async waitForElement(
        browserId: string, 
        pageId: string, 
        selector: string, 
        options?: {
            visible?: boolean;
            hidden?: boolean;
            timeout?: number;
            polling?: number;
        }
    ): Promise<ElementHandle<Element> | null> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Waiting for element: ${selector}`);

            const waitOptions: any = {
                timeout: options?.timeout || this._defaultConfig.timeout
            };

            if (options?.visible) {
                waitOptions.visible = true;
            }
            if (options?.hidden) {
                waitOptions.hidden = true;
            }

            const element = await page.waitForSelector(selector, waitOptions);
            
            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Element found successfully`);
            
            return element;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to find element: ${error}`);
            return null;
        }
    }

    /**
     * Get element text content
     */
    async getElementText(
        browserId: string, 
        pageId: string, 
        selector: string
    ): Promise<string | null> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Getting text for selector: ${selector}`);
            
            // Wait for element to be available first
            await page.waitForSelector(selector, { timeout: 10000 });
            
            // Get the text content using evaluate for more reliable access
            const text = await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (!element) {
                    throw new Error(`Element not found: ${sel}`);
                }
                return element.textContent || (element as HTMLElement).innerText || '';
            }, selector);
            
            //this.outputChannel.appendLine(`[PuppeteerService] Successfully got text: ${text}`);
            browserInstance.lastUsed = new Date();
            return text;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to get element text: ${error}`);
            return null;
        }
    }

    /**
     * Get element attribute value
     */
    async getElementAttribute(
        browserId: string, 
        pageId: string, 
        selector: string, 
        attributeName: string
    ): Promise<string | null> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Getting attribute "${attributeName}" for selector: ${selector}`);
            
            // Wait for element to be available first
            await page.waitForSelector(selector, { timeout: 10000 });
            
            // Get the attribute value using evaluate for more reliable access
            const value = await page.evaluate((sel, attr) => {
                const element = document.querySelector(sel);
                if (!element) {
                    throw new Error(`Element not found: ${sel}`);
                }
                return element.getAttribute(attr);
            }, selector, attributeName);
            
            //this.outputChannel.appendLine(`[PuppeteerService] Successfully got attribute "${attributeName}": ${value}`);
            browserInstance.lastUsed = new Date();
            return value;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to get element attribute: ${error}`);
            return null;
        }
    }

    /**
     * Advanced DOM interaction for React/Vue apps with Shadow DOM, XPath, Text, and ARIA selector support
     */
    async advancedDomInteraction(
        browserId: string,
        pageId: string,
        selector: string,
        action: 'click' | 'type' | 'hover' | 'focus' | 'getAttribute' | 'getText' | 'scroll',
        options?: {
            text?: string;
            attributeName?: string;
            scrollIntoView?: boolean;
            delay?: number;
            timeout?: number;
        }
    ): Promise<any> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Advanced DOM interaction - Action: ${action}, Selector: ${selector}`);
            
            const defaultTimeout = options?.timeout || 10000;
            
            // Handle different selector types and find element
            let element;
            
            if (selector.includes('>>>') || selector.includes('>>>>')) {
                // Shadow DOM selector - use pierce selector
                //this.outputChannel.appendLine(`[PuppeteerService] Using Shadow DOM piercing selector`);
                await page.waitForSelector(selector, { timeout: defaultTimeout });
                element = await page.$(selector);
            } else if (selector.startsWith('::-p-xpath(')) {
                // XPath selector - convert to CSS equivalent or use evaluate
                const xpathQuery = selector.replace('::-p-xpath(', '').replace(')', '');
                //this.outputChannel.appendLine(`[PuppeteerService] Using XPath selector: ${xpathQuery}`);
                
                // Use evaluate to find element with XPath
                element = await page.evaluateHandle((xpath) => {
                    const result = document.evaluate(
                        xpath,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    );
                    return result.singleNodeValue;
                }, xpathQuery);
                
                if (!element) {
                    throw new Error(`No element found for XPath: ${xpathQuery}`);
                }
            } else if (selector.startsWith('::-p-text(')) {
                // Text selector
                const textQuery = selector.replace('::-p-text(', '').replace(')', '');
                //this.outputChannel.appendLine(`[PuppeteerService] Using text selector: ${textQuery}`);
                
                element = await page.evaluateHandle((text) => {
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT
                    );
                    let node;
                    while (node = walker.nextNode()) {
                        if (node.textContent?.includes(text)) {
                            return node.parentElement;
                        }
                    }
                    return null;
                }, textQuery);
            } else if (selector.startsWith('::-p-aria(')) {
                // ARIA selector
                const ariaQuery = selector.replace('::-p-aria(', '').replace(')', '');
                //this.outputChannel.appendLine(`[PuppeteerService] Using ARIA selector: ${ariaQuery}`);
                
                const ariaSelector = `[aria-label*="${ariaQuery}"], [aria-labelledby*="${ariaQuery}"], [role*="${ariaQuery}"]`;
                await page.waitForSelector(ariaSelector, { timeout: defaultTimeout });
                element = await page.$(ariaSelector);
            } else {
                // Regular CSS selector or Pierce selector
                //this.outputChannel.appendLine(`[PuppeteerService] Using regular CSS/Pierce selector`);
                await page.waitForSelector(selector, { timeout: defaultTimeout });
                element = await page.$(selector);
            }

            if (!element) {
                throw new Error(`Element not found with selector: ${selector}`);
            }

            // Scroll into view if requested
            if (options?.scrollIntoView !== false) {
                await page.evaluate((el) => {
                    if (el && 'scrollIntoView' in el) {
                        (el as Element).scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, element);
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait for scroll to complete
            }

            // Perform the requested action
            let result;
            switch (action) {
                case 'click':
                    //this.outputChannel.appendLine(`[PuppeteerService] Clicking element`);
                    if ('click' in element) {
                        await (element as any).click();
                    } else {
                        await page.evaluate((el) => {
                            if (el && 'click' in el) {
                                (el as HTMLElement).click();
                            }
                        }, element);
                    }
                    result = { success: true, action: 'click' };
                    break;

                case 'type':
                    if (!options?.text) {
                        throw new Error('Text is required for type action');
                    }
                    //this.outputChannel.appendLine(`[PuppeteerService] Typing text: ${options.text}`);
                    
                    // Focus first, then type
                    if ('click' in element) {
                        await (element as any).click();
                        await (element as any).type(options.text, { delay: options?.delay || 50 });
                    } else {
                        await page.evaluate((el, text, delay) => {
                            if (el && 'focus' in el) {
                                (el as HTMLElement).focus();
                                if ('value' in el) {
                                    (el as HTMLInputElement).value = text;
                                    (el as HTMLElement).dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            }
                        }, element, options.text, options?.delay || 50);
                    }
                    result = { success: true, action: 'type', text: options.text };
                    break;

                case 'hover':
                    //this.outputChannel.appendLine(`[PuppeteerService] Hovering over element`);
                    if ('hover' in element) {
                        await (element as any).hover();
                    } else {
                        await page.evaluate((el) => {
                            if (el) {
                                (el as HTMLElement).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                            }
                        }, element);
                    }
                    result = { success: true, action: 'hover' };
                    break;

                case 'focus':
                    //this.outputChannel.appendLine(`[PuppeteerService] Focusing element`);
                    if ('focus' in element) {
                        await (element as any).focus();
                    } else {
                        await page.evaluate((el) => {
                            if (el && 'focus' in el) {
                                (el as HTMLElement).focus();
                            }
                        }, element);
                    }
                    result = { success: true, action: 'focus' };
                    break;

                case 'getAttribute':
                    if (!options?.attributeName) {
                        throw new Error('Attribute name is required for getAttribute action');
                    }
                    //this.outputChannel.appendLine(`[PuppeteerService] Getting attribute: ${options.attributeName}`);
                    
                    const attributeValue = await page.evaluate((el, attr) => {
                        if (el && 'getAttribute' in el) {
                            return (el as Element).getAttribute(attr);
                        }
                        return null;
                    }, element, options.attributeName);
                    
                    result = { success: true, action: 'getAttribute', attribute: options.attributeName, value: attributeValue };
                    break;

                case 'getText':
                    //this.outputChannel.appendLine(`[PuppeteerService] Getting text content`);
                    
                    const textContent = await page.evaluate((el) => {
                        if (el && 'textContent' in el) {
                            return (el as Element).textContent?.trim();
                        }
                        return null;
                    }, element);
                    
                    result = { success: true, action: 'getText', text: textContent };
                    break;

                case 'scroll':
                    //this.outputChannel.appendLine(`[PuppeteerService] Scrolling to element`);
                    await page.evaluate((el) => {
                        if (el && 'scrollIntoView' in el) {
                            (el as Element).scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, element);
                    result = { success: true, action: 'scroll' };
                    break;

                default:
                    throw new Error(`Unsupported action: ${action}`);
            }

            //this.outputChannel.appendLine(`[PuppeteerService] Advanced DOM interaction completed successfully`);
            browserInstance.lastUsed = new Date();
            return result;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Advanced DOM interaction failed: ${error}`);
            throw error;
        }
    }

    /**
     * Get comprehensive page structure for analysis and debugging
     */
    async getPageStructure(
        browserId: string,
        pageId: string,
        options?: {
            includeStyles?: boolean;
            includeAttributes?: boolean;
            includeText?: boolean;
            maxDepth?: number;
            includeHidden?: boolean;
            includeShadowDOM?: boolean;
            selector?: string; // Optional root selector to analyze specific element
        }
    ): Promise<any> {
        const browserInstance = this.getBrowserInstance(browserId);
        const page = this.getPage(browserInstance, pageId);

        try {
            //this.outputChannel.appendLine(`[PuppeteerService] Analyzing page structure...`);

            const defaultOptions = {
                includeStyles: options?.includeStyles ?? false,
                includeAttributes: options?.includeAttributes ?? true,
                includeText: options?.includeText ?? true,
                maxDepth: options?.maxDepth ?? 10,
                includeHidden: options?.includeHidden ?? false,
                includeShadowDOM: options?.includeShadowDOM ?? true,
                selector: options?.selector ?? 'body'
            };

            const structure = await page.evaluate((opts) => {
                function analyzeElement(element: Element, depth = 0): any {
                    if (depth > opts.maxDepth) {
                        return { truncated: true, reason: 'max_depth_reached' };
                    }

                    const elementData: any = {
                        tagName: element.tagName.toLowerCase(),
                        depth: depth
                    };

                    // Include attributes if requested
                    if (opts.includeAttributes && element.attributes.length > 0) {
                        elementData.attributes = {};
                        for (let i = 0; i < element.attributes.length; i++) {
                            const attr = element.attributes[i];
                            elementData.attributes[attr.name] = attr.value;
                        }
                    }

                    // Include computed styles if requested
                    if (opts.includeStyles) {
                        const computedStyle = window.getComputedStyle(element);
                        elementData.styles = {
                            display: computedStyle.display,
                            visibility: computedStyle.visibility,
                            opacity: computedStyle.opacity,
                            position: computedStyle.position,
                            zIndex: computedStyle.zIndex,
                            width: computedStyle.width,
                            height: computedStyle.height
                        };
                    }

                    // Include text content if requested
                    if (opts.includeText) {
                        const textContent = element.textContent?.trim();
                        if (textContent && textContent.length > 0) {
                            elementData.textContent = textContent.substring(0, 200); // Limit text length
                        }
                    }

                    // Check if element is visible
                    const rect = element.getBoundingClientRect();
                    elementData.isVisible = rect.width > 0 && rect.height > 0;
                    elementData.boundingBox = {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    };

                    // Get child elements
                    const children: any[] = [];
                    const childElements = Array.from(element.children);

                    for (const child of childElements) {
                        // Skip hidden elements if not requested
                        if (!opts.includeHidden) {
                            const childRect = child.getBoundingClientRect();
                            const childStyles = window.getComputedStyle(child);
                            if (childStyles.display === 'none' || 
                                childStyles.visibility === 'hidden' || 
                                (childRect.width === 0 && childRect.height === 0)) {
                                continue;
                            }
                        }

                        children.push(analyzeElement(child, depth + 1));
                    }

                    // Include Shadow DOM if requested and available
                    if (opts.includeShadowDOM && (element as any).shadowRoot) {
                        elementData.shadowDOM = {
                            mode: (element as any).shadowRoot.mode,
                            children: Array.from((element as any).shadowRoot.children).map((child: unknown) => 
                                analyzeElement(child as Element, depth + 1)
                            )
                        };
                    }

                    if (children.length > 0) {
                        elementData.children = children;
                    }

                    // Add useful selectors
                    elementData.selectors = {
                        id: element.id ? `#${element.id}` : null,
                        classes: element.className ? element.className.split(' ').filter(c => c).map(c => `.${c}`) : [],
                        tagName: element.tagName.toLowerCase()
                    };

                    return elementData;
                }

                // Get the root element to analyze
                const rootElement = opts.selector === 'body' 
                    ? document.body 
                    : document.querySelector(opts.selector);

                if (!rootElement) {
                    throw new Error(`Root element not found: ${opts.selector}`);
                }

                return {
                    url: window.location.href,
                    title: document.title,
                    timestamp: new Date().toISOString(),
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    structure: analyzeElement(rootElement),
                    meta: {
                        totalElements: document.querySelectorAll('*').length,
                        scripts: Array.from(document.scripts).map(script => ({
                            src: script.src,
                            type: script.type
                        })),
                        stylesheets: Array.from(document.styleSheets).map(sheet => ({
                            href: sheet.href,
                            type: 'text/css'
                        }))
                    }
                };
            }, defaultOptions);

            browserInstance.lastUsed = new Date();
            //this.outputChannel.appendLine(`[PuppeteerService] Page structure analysis completed`);

            return structure;

        } catch (error) {
            //this.outputChannel.appendLine(`[PuppeteerService] Failed to analyze page structure: ${error}`);
            throw new Error(`Failed to analyze page structure: ${error}`);
        }
    }
}
