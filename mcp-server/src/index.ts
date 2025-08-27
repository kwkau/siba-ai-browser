#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const server = new Server(
  {
    name: 'siba-ai-mcp-server',
    version: '1.2.1',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool schemas using siba_ai_ prefix as per conventions
const LaunchBrowserSchema = {
  type: 'object' as const,
  properties: {
    headless: { type: 'boolean', description: 'Whether to run browser in headless mode' },
    width: { type: 'number', description: 'Browser width in pixels' },
    height: { type: 'number', description: 'Browser height in pixels' },
  },
  additionalProperties: false,
};

const NavigateToUrlSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    url: { type: 'string', description: 'URL to navigate to' },
    waitUntil: { type: 'string', enum: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'] },
    timeout: { type: 'number', description: 'Navigation timeout in milliseconds' },
  },
  required: ['url'],
  additionalProperties: false,
};

const TakeScreenshotSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    fullPage: { type: 'boolean', description: 'Whether to capture full page' },
    format: { type: 'string', enum: ['png', 'jpeg', 'webp'] },
    quality: { type: 'number', minimum: 0, maximum: 100, description: 'JPEG quality (0-100)' },
    width: { type: 'number', description: 'Viewport width' },
    height: { type: 'number', description: 'Viewport height' },
  },
  additionalProperties: false,
};

const TakeElementScreenshotSchema = {
  type: 'object' as const,
  properties: {
    selector: { type: 'string', description: 'Element selector (CSS selectors, XPath selectors (-p-xpath), pseudo-elements prefixed with a -p vendor prefix)' },
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    format: { type: 'string', enum: ['png', 'jpeg', 'webp'] },
    quality: { type: 'number', minimum: 0, maximum: 100, description: 'JPEG quality (0-100)' }
  },
  additionalProperties: false,
};

const GetBrowserStatusSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Specific browser ID (if not provided, returns all browsers)' },
  },
  additionalProperties: false,
};

const CloseBrowserSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
  },
  additionalProperties: false,
};

const CloseAllBrowsersSchema = {
  type: 'object' as const,
  properties: {
    // No properties needed - closes all browsers
  },
  additionalProperties: false,
};

const FillFormSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    formData: {
        type: 'object',
        description: 'Form data as key-value pairs where keys are field names only and not selectors, use the same field names as in the form',
        additionalProperties: true
    },
    timeout: { type: 'number', description: 'Timeout in milliseconds' },
  },
  required: ['formData'] as string[],
  additionalProperties: false,
};

const InteractWithElementSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    selector: { type: 'string', description: 'Element selector (CSS, XPath, text, or ARIA), CSS selectors, XPath selectors (-p-xpath), pseudo-elements prefixed with a -p vendor prefix' },
    action: { 
      type: 'string', 
      enum: ['click', 'hover', 'scroll', 'focus', 'doubleClick', 'rightClick'],
      description: 'Action to perform on the element'
    },
    selectorType: { 
      type: 'string', 
      enum: ['css', 'xpath', 'text', 'aria', 'pseudo'],
      description: 'Type of selector being used'
    },
    timeout: { type: 'number', description: 'Timeout in milliseconds' },
    scrollIntoView: { type: 'boolean', description: 'Whether to scroll element into view' },
  },
  required: ['selector', 'action'] as string[],
  additionalProperties: false,
};

const AdvancedTypeTextSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    selector: { type: 'string', description: 'Input element selector (CSS selectors, XPath selectors (-p-xpath), pseudo-elements prefixed with a -p vendor prefix)' },
    text: { type: 'string', description: 'Text to type' },
    clear: { type: 'boolean', description: 'Whether to clear existing text first' },
    delay: { type: 'number', description: 'Delay between keystrokes in milliseconds' },
    pressEnter: { type: 'boolean', description: 'Whether to press Enter after typing' },
    pressTab: { type: 'boolean', description: 'Whether to press Tab after typing' },
  },
  required: ['selector', 'text'] as string[],
  additionalProperties: false,
};

const EvaluateJavaScriptSchema = {
  type: "object" as const,
  properties: {
    browserId: { type: "string", description: "Browser instance ID" },
    pageId:    { type: "string", description: "Page ID" },
    script:    { type: "string", description: "JavaScript code to execute" },
    argsJson:  { type: "string", description: "JSON‑stringified array of args" }
  },
  
  required: ["browserId", "pageId", "script"]
};

const UploadFileSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    fileInputSelector: { type: 'string', description: 'File input element selector' },
    filePath: { type: 'string', description: 'Absolute path to file to upload' },
  },
  required: ['fileInputSelector', 'filePath'] as string[],
  additionalProperties: false,
};

const GetElementTextSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    selector: { type: 'string', description: 'Element selector' },
  },
  required: ['selector'] as string[],
  additionalProperties: false,
};

const GetElementAttributeSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    selector: { type: 'string', description: 'Element selector, (CSS selectors, XPath selectors (-p-xpath), pseudo-elements prefixed with a -p vendor prefix)' },
    attributeName: { type: 'string', description: 'Name of attribute to get' },
  },
  required: ['selector', 'attributeName'] as string[],
  additionalProperties: false,
};

const AdvancedDomInteractionSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    selector: { 
      type: 'string', 
      description: 'Advanced selector supporting Shadow DOM (>>> combinator), XPath (::-p-xpath), Text (::-p-text), ARIA (::-p-aria), and Pierce selectors for React/Vue apps' 
    },
    action: { 
      type: 'string', 
      enum: ['click', 'type', 'hover', 'focus', 'getAttribute', 'getText', 'scroll'],
      description: 'Action to perform on the element' 
    },
    options: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to type (required for type action)' },
        attributeName: { type: 'string', description: 'Attribute name to get (required for getAttribute action)' },
        scrollIntoView: { type: 'boolean', description: 'Whether to scroll element into view (default: true)' },
        delay: { type: 'number', description: 'Typing delay in milliseconds (default: 50)' },
        timeout: { type: 'number', description: 'Operation timeout in milliseconds (default: 10000)' }
      },
      additionalProperties: false
    }
  },
  required: ['selector', 'action'] as string[],
  additionalProperties: false,
};

const GetPageStructureSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    options: {
      type: 'object',
      properties: {
        includeStyles: { type: 'boolean', description: 'Include computed styles (default: false)' },
        includeAttributes: { type: 'boolean', description: 'Include element attributes (default: true)' },
        includeText: { type: 'boolean', description: 'Include text content (default: true)' },
        maxDepth: { type: 'number', description: 'Maximum depth to analyze (default: 10)' },
        includeHidden: { type: 'boolean', description: 'Include hidden elements (default: false)' },
        includeShadowDOM: { type: 'boolean', description: 'Include Shadow DOM elements (default: true)' },
        selector: { type: 'string', description: 'Root selector to analyze (default: "body")' }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false,
};

const PageIntrospectSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
  },
  additionalProperties: false,
};

const PageElementIntrospectSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    selector: { type: 'string', description: 'Element selector (CSS, ID, class, data attributes, etc.)' },
  },
  required: ['selector'] as string[],
  additionalProperties: false,
};

const SelectDropdownSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    selector: { type: 'string', description: 'Select dropdown element selector' },
    values: { 
      oneOf: [
        { type: 'string', description: 'Single value to select' },
        { type: 'array', items: { type: 'string' }, description: 'Multiple values to select' }
      ],
      description: 'Value(s) to select - can be a single string or array of strings'
    },
    options: {
      type: 'object',
      properties: {
        method: { 
          type: 'string', 
          enum: ['value', 'text', 'index', 'auto'],
          description: 'Selection method - auto tries value first, then text'
        },
        allowPartialMatch: { type: 'boolean', description: 'Allow partial text matching' },
        waitForOptions: { type: 'number', description: 'Wait time for dynamic options to load (ms)' },
        triggerEvents: { type: 'boolean', description: 'Trigger change/input events after selection' }
      },
      additionalProperties: false
    }
  },
  required: ['selector', 'values'] as string[],
  additionalProperties: false,
};

const GetSelectInfoSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    selector: { type: 'string', description: 'Select dropdown element selector to analyze' },
  },
  required: ['selector'] as string[],
  additionalProperties: false,
};

// VS Code Command Executor using file-based communication
class VSCodeCommandExecutor {
  private commandId = 0;
  private bridgeDir = '/tmp/siba-ai-mcp-direct';

  constructor() {
    // Ensure bridge directory exists
    if (!fs.existsSync(this.bridgeDir)) {
      fs.mkdirSync(this.bridgeDir, { recursive: true });
    }
  }


  private async executeCommand(command: string, ...args: any[]): Promise<any> {
      const requestId = `cmd_${Date.now()}_${++this.commandId}`;
      const requestFile = path.join(this.bridgeDir, `${requestId}.json`);
      const responseFile = path.join(this.bridgeDir, `${requestId}_response.json`);
      
      // Write command request
      const request = {
        id: requestId,
        command,
        args,
        timestamp: Date.now()
      };
      
      fs.writeFileSync(requestFile, JSON.stringify(request, null, 2));
      
      // Wait for response with timeout
      const timeout = 7000; // 7 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        if (fs.existsSync(responseFile)) {
          try {
            const responseContent = fs.readFileSync(responseFile, 'utf8');
            const response = JSON.parse(responseContent);
            
            // Clean up files
            try {
              fs.unlinkSync(requestFile);
              fs.unlinkSync(responseFile);
            } catch (cleanupError) {
              // Ignore cleanup errors
            }
            
            if (response.error) {
              throw new Error(response.error);
            }
            
            return response.result;
          } catch (parseError) {
            // Response file might be incomplete, continue waiting
          }
        }
        
        // Wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Cleanup on timeout
      try {
        if (fs.existsSync(requestFile)) fs.unlinkSync(requestFile);
        if (fs.existsSync(responseFile)) fs.unlinkSync(responseFile);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      throw new Error(`Command execution timed out after ${timeout}ms: ${command}`);
    }
  

  async launchBrowser(options: any = {}): Promise<string> {
    const command = options.headless ? 
      'siba-ai-extensions.launchBrowserHeadless' : 
      'siba-ai-extensions.launchBrowser';
    return await this.executeCommand(command);
  }

  async navigateToUrl(browserId: string | undefined, url: string): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.navigateToUrl', browserId, url);
  }

  async takeScreenshot(browserId?: string, pageId?: string): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.takeScreenshot', browserId, pageId);
  }

  async takeElementScreenshot(selector: string, browserId?: string, pageId?: string, options?:object): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.takeElementScreenshot',selector, browserId, pageId, options);
  }

  async getBrowserStatus(browserId?: string): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.getBrowserStatus', browserId);
  }

  async closeBrowser(browserId?: string): Promise<void> {
    return await this.executeCommand('siba-ai-extensions.closeBrowser', browserId);
  }

  async closeAllBrowsers(): Promise<{closed: number, errors: string[]}> {
    return await this.executeCommand('siba-ai-extensions.closeAllBrowsers');
  }

  async fillForm(browserId:string, pageId: string, formData: any): Promise<void> {
    
    return await this.executeCommand('siba-ai-extensions.fillForm', browserId, pageId, formData);
  }

  async interactWithElement(browserId: string, pageId: string, selector: string, action: string): Promise<void> {
   
    return await this.executeCommand('siba-ai-extensions.interactWithElement', browserId, pageId, selector, action);
  }

  async advancedTypeText(browserId: string, pageId: string, selector: string, text: string): Promise<void> {
    return await this.executeCommand('siba-ai-extensions.advancedTypeText', browserId, pageId, selector, text);
  }

  async evaluateJavaScript(browserId: string, pageId: string, script: string, args?: any[]): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.evaluateJavaScript', browserId, pageId, script, args);
  }

  async uploadFile(browserId: string, pageId: string, fileInputSelector: string, filePath: string): Promise<void> {
    return await this.executeCommand('siba-ai-extensions.uploadFile', browserId, pageId, fileInputSelector, filePath);
  }

  async getElementText(browserId: string, pageId: string, selector: string): Promise<string> {
    return await this.executeCommand('siba-ai-extensions.getElementText', browserId, pageId, selector);
  }

  async getElementAttribute(browserId: string, pageId: string, selector: string, attributeName: string): Promise<string> {
    return await this.executeCommand('siba-ai-extensions.getElementAttribute', browserId, pageId, selector, attributeName);
  }

  async advancedDomInteraction(browserId: string, pageId: string, selector: string, action: string, options?: any): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.advancedDomInteraction', browserId, pageId, selector, action, options);
  }

  

  async pageIntrospect(browserId: string, pageId: string): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.pageIntrospect', browserId, pageId);
  }

  async pageElementIntrospect(browserId: string, pageId: string, selector: string): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.pageElementIntrospect', browserId, pageId, selector);
  }

  async selectDropdown(browserId: string, pageId: string, selector: string, values: string | string[], options?: any): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.selectDropdown', browserId, pageId, selector, values, options);
  }

  async getSelectInfo(browserId: string, pageId: string, selector: string): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.getSelectInfo', browserId, pageId, selector);
  }
}

// Initialize VS Code command executor
const commandExecutor = new VSCodeCommandExecutor();

// Define available tools
const tools: Tool[] = [
  {
    name: 'siba_ai_launch_browser',
    description: 'Launch a new Puppeteer browser instance (visible)',
    inputSchema: LaunchBrowserSchema,
  },
  {
    name: 'siba_ai_launch_browser_headless',
    description: 'Launch a new Puppeteer browser instance in headless mode (background)',
    inputSchema: LaunchBrowserSchema,
  },
  {
    name: 'siba_ai_navigate_to_url',
    description: 'Navigate to a URL in a browser page',
    inputSchema: NavigateToUrlSchema,
  },
  {
    name: 'siba_ai_take_screenshot',
    description: 'Take a screenshot of a browser page',
    inputSchema: TakeScreenshotSchema,
  },
  {
    name: 'siba_ai_take_element_screenshot',
    description: 'Take a screenshot of a specific element by using an appropriate selector within a browser page',
    inputSchema: TakeElementScreenshotSchema
  },
  {
    name: 'siba_ai_get_browser_status',
    description: 'Get status of browser instances',
    inputSchema: GetBrowserStatusSchema,
  },
  {
    name: 'siba_ai_close_browser',
    description: 'Close a browser instance',
    inputSchema: CloseBrowserSchema,
  },
  {
    name: 'siba_ai_close_all_browsers',
    description: 'Close all browser instances',
    inputSchema: CloseAllBrowsersSchema,
  },
  {
    name: 'siba_ai_fill_form',
    description: 'Fill out a web form with multiple fields using advanced locators and automatic input type detection',
    inputSchema: FillFormSchema,
  },
  {
    name: 'siba_ai_interact_with_element',
    description: 'Perform advanced interactions with elements using CSS, XPath, text, or ARIA selectors',
    inputSchema: InteractWithElementSchema,
  },
  {
    name: 'siba_ai_advanced_type_text',
    description: 'Type text with advanced options like keystroke delay, auto-clear, and post-typing actions',
    inputSchema: AdvancedTypeTextSchema,
  },
  {
    name: 'siba_ai_evaluate_javascript',
    description: 'Execute JavaScript with enhanced error handling, function support, and argument passing',
    inputSchema: EvaluateJavaScriptSchema,
  },
  {
    name: 'siba_ai_upload_file',
    description: 'Upload files to file input elements with path validation',
    inputSchema: UploadFileSchema,
  },
  {
    name: 'siba_ai_get_element_text',
    description: 'Extract text content from an element',
    inputSchema: GetElementTextSchema,
  },
  {
    name: 'siba_ai_get_element_attribute',
    description: 'Get the value of a specific attribute from an element',
    inputSchema: GetElementAttributeSchema,
  },
  {
    name: 'siba_ai_advanced_dom_interaction',
    description: 'Advanced DOM interaction for React/Vue apps with Shadow DOM, XPath, Text, and ARIA selector support',
    inputSchema: AdvancedDomInteractionSchema,
  },
  {
    name: 'siba_ai_get_page_structure',
    description: 'Analyze DOM structure for dynamic content, debugging, and element discovery',
    inputSchema: GetPageStructureSchema,
  },
  {
    name: 'siba_ai_page_introspect',
    description: 'Deep introspection of all elements on a page with comprehensive metadata',
    inputSchema: PageIntrospectSchema,
  },
  {
    name: 'siba_ai_page_element_introspect', 
    description: 'Detailed introspection of a specific element with tag, attributes, text, and XPath',
    inputSchema: PageElementIntrospectSchema,
  },
  {
    name: 'siba_ai_select_dropdown',
    description: 'Advanced select dropdown interaction with intelligent option detection and multiple selection methods',
    inputSchema: SelectDropdownSchema,
  },
  {
    name: 'siba_ai_get_select_info',
    description: 'Get comprehensive information about a select dropdown including options, selected values, and properties',
    inputSchema: GetSelectInfoSchema,
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error('Missing arguments');
  }

  try {
    switch (name) {
      case 'siba_ai_launch_browser': {
        const result = await commandExecutor.launchBrowser({ headless: false, ...args });
        return {
          content: [
            {
              type: 'text',
              text: `Visible browser launched successfully with ID: ${result}`,
            },
          ],
        };
      }

      case 'siba_ai_launch_browser_headless': {
        const result = await commandExecutor.launchBrowser({ headless: true, ...args });
        return {
          content: [
            {
              type: 'text',
              text: `Headless browser launched successfully with ID: ${result}`,
            },
          ],
        };
      }

      case 'siba_ai_navigate_to_url': {
        const result = await commandExecutor.navigateToUrl((args as any).browserId, (args as any).url);
        return {
          content: [
            {
              type: 'text',
              text: `Successfully navigated to ${(args as any).url}. Result: ${JSON.stringify(result)}`,
            },
          ],
        };
      }

      case "siba_ai_take_screenshot":{
        const result = await commandExecutor.takeScreenshot(args.browserId as string, args.pageId as string);
        if (typeof result === 'string') {
          // Handle raw base64 data
          return {
            content: [
              {
                type: "text",
                text: `Screenshot captured successfully (Screenshot (jpeg, ~${((result.length * 3) / 4 / 1024).toFixed(3)} KB):`
              },
              {
                type: "image",
                data: result.replace(/\r?\n/g, ""),  // pure base64, no "data:image" prefix
                mimeType: "image/jpeg"  // or "image/jpeg"
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: 'Screenshot capture failed - invalid data format returned',
              },
            ],
          };
        }
      }

      case "siba_ai_take_element_screenshot":{

        const result = await commandExecutor.takeElementScreenshot(args.selector as string, args.browserId as string, args.pageId as string, {
          format: args.format,
          quality: args.quality
        });
        
         if (typeof result === 'string') {
          // Handle raw base64 data
          return {
            content: [
              {
                type: "text",
                text: `Screenshot captured successfully (Screenshot (png, ~${((result.length * 3) / 4 / 1024).toFixed(3)} KB):`
              },
              {
                type: "image",
                data: result.replace(/\r?\n/g, ""),  // pure base64, no "data:image" prefix
                mimeType: `image/${args.format || "jpeg"}`  // or "image/jpeg"
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: 'Screenshot capture failed - invalid data format returned',
              },
            ],
          };
        }
      }

      case 'siba_ai_get_browser_status': {
        const result = await commandExecutor.getBrowserStatus((args as any).browserId);
        return {
          content: [
            {
              type: 'text',
              text: `Browser status: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'siba_ai_close_browser': {
        await commandExecutor.closeBrowser((args as any).browserId);
        return {
          content: [
            {
              type: 'text',
              text: `Browser ${(args as any).browserId || 'default'} closed successfully`,
            },
          ],
        };
      }

      case 'siba_ai_close_all_browsers': {
        const result = await commandExecutor.closeAllBrowsers();
        return {
          content: [
            {
              type: 'text',
              text: `Closed ${result.closed} browsers${result.errors.length > 0 ? ` (errors: ${result.errors.join(', ')})` : ''}`,
            },
          ],
        };
      }

      case 'siba_ai_fill_form': {
        await commandExecutor.fillForm(args.browserId as string, args.pageId as string, args.formData);
        return {
          content: [
            {
              type: 'text',
              text: `Form filled successfully with ${Object.keys((args as any).formData || {}).length} fields`,
            },
          ],
        };
      }

      case 'siba_ai_interact_with_element': {
        await commandExecutor.interactWithElement(args.browserId as string, args.pageId as string, args.selector as string, args.action as string);
        return {
          content: [
            {
              type: 'text',
              text: `Successfully performed ${args.action} on element: ${args.selector}`,
            },
          ],
        };
      }

      case 'siba_ai_advanced_type_text': {
        await commandExecutor.advancedTypeText(args.browserId as string, args.pageId as string, args.selector as string, args.text as string);
        return {
          content: [
            {
              type: 'text',
              text: `Advanced text typing completed for element: ${args.selector}`,
            },
          ],
        };
      }

      case 'siba_ai_evaluate_javascript': {

        // Parse argsJson if provided
        let argsArray: any[] = [];
        if (args.argsJson) {
          try {
            argsArray = JSON.parse(args.argsJson as string);
            if (!Array.isArray(argsArray)) {
              throw new Error('argsJson must be a JSON‑stringified array');
            }
          } catch (parseError: Error | any) {
            throw new Error(`Failed to parse argsJson: ${parseError.message}`);
          }
        }

        const result = await commandExecutor.evaluateJavaScript(args.browserId as string, args.pageId as string, args.script as string, argsArray);
        return {
          content: [
            {
              type: 'text',
              text: `JavaScript evaluation completed. Result: ${JSON.stringify(result)}`,
            },
          ],
        };
      }

      case 'siba_ai_upload_file': {
        await commandExecutor.uploadFile(args.browserId as string, args.pageId as string, (args as any).fileInputSelector, (args as any).filePath);
        return {
          content: [
            {
              type: 'text',
              text: `File uploaded successfully: ${(args as any).filePath}`,
            },
          ],
        };
      }

      case 'siba_ai_get_element_text': {
        const result = await commandExecutor.getElementText(args.browserId as string, args.pageId as string, args.selector as string);
        return {
          content: [
            {
              type: 'text',
              text: `Element text: "${result || 'No text found'}"`,
            },
          ],
        };
      }

      case 'siba_ai_get_element_attribute': {
        const result = await commandExecutor.getElementAttribute(args.browserId as string, args.pageId as string, args.selector as string, args.attributeName as string);
        return {
          content: [
            {
              type: 'text',
              text: `Attribute "${(args as any).attributeName}" value: "${result || 'Not found'}"`,
            },
          ],
        };
      }

      case 'siba_ai_advanced_dom_interaction': {
        const result = await commandExecutor.advancedDomInteraction(
          args.browserId as string, 
          args.pageId as string, 
          args.selector as string, 
          args.action as string,
          args.options as any
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }



      case 'siba_ai_page_introspect': {
        const result = await commandExecutor.pageIntrospect(args.browserId as string, args.pageId as string);
        return {
          content: [
            {
              type: 'text',
              text: `Page introspection completed. Found ${Array.isArray(result) ? result.length : 0} elements. Results: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'siba_ai_page_element_introspect': {
        const result = await commandExecutor.pageElementIntrospect(
          args.browserId as string, 
          args.pageId as string, 
          args.selector as string
        );
        return {
          content: [
            {
              type: 'text',
              text: `Element introspection for "${(args as any).selector}": ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'siba_ai_select_dropdown': {
        const result = await commandExecutor.selectDropdown(
          args.browserId as string,
          args.pageId as string,
          args.selector as string,
          args.values as string | string[],
          args.options as any
        );
        return {
          content: [
            {
              type: 'text',
              text: `Select dropdown interaction completed. Selected: ${result.selected.join(', ')}. Method: ${result.method}. Multiple: ${result.isMultiple}. Results: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'siba_ai_get_select_info': {
        const result = await commandExecutor.getSelectInfo(
          args.browserId as string,
          args.pageId as string,
          args.selector as string
        );
        return {
          content: [
            {
              type: 'text',
              text: `Select dropdown info for "${(args as any).selector}": Multiple=${result.isMultiple}, Disabled=${result.disabled}, Selected=${result.selectedValues.join(', ')}, Options=${result.options.length}. Details: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server started silently - no console output
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
