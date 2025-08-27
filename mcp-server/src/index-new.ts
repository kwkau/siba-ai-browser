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
  required: ['url'] as string[],
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

const BrowserWorkflowSchema = {
  type: 'object' as const,
  properties: {
    url: { type: 'string', description: 'URL to navigate to' },
    takeScreenshot: { type: 'boolean', description: 'Whether to take screenshot after navigation' },
    headless: { type: 'boolean', description: 'Whether to run browser in headless mode' },
  },
  required: ['url'] as string[],
  additionalProperties: false,
};

const FillFormSchema = {
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    formData: { 
      type: 'object', 
      description: 'Form data as key-value pairs where keys are field names/selectors',
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
    selector: { type: 'string', description: 'Element selector (CSS, XPath, text, or ARIA)' },
    action: { 
      type: 'string', 
      enum: ['click', 'hover', 'scroll', 'focus', 'doubleClick', 'rightClick'],
      description: 'Action to perform on the element'
    },
    selectorType: { 
      type: 'string', 
      enum: ['css', 'xpath', 'text', 'aria'],
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
    selector: { type: 'string', description: 'Input element selector' },
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
  type: 'object' as const,
  properties: {
    browserId: { type: 'string', description: 'Browser instance ID' },
    pageId: { type: 'string', description: 'Page ID' },
    script: { type: 'string', description: 'JavaScript code to execute' },
    args: { 
      type: 'array', 
      items: {
        oneOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
          { type: 'null' },
          { type: 'object' }
        ]
      },
      description: 'Arguments to pass to the script function' 
    },
  },
  required: ['script'] as string[],
  additionalProperties: false,
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
    selector: { type: 'string', description: 'Element selector' },
    attributeName: { type: 'string', description: 'Name of attribute to get' },
  },
  required: ['selector', 'attributeName'] as string[],
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
    const timeout = 30000; // 30 seconds
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

  async navigateToUrl(browserId: string | undefined, url: string, options: any = {}): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.navigateToUrl', browserId, url);
  }

  async takeScreenshot(browserId?: string, options: any = {}): Promise<any> {
    const pageId = options.pageId;
    return await this.executeCommand('siba-ai-extensions.takeScreenshot', browserId, pageId);
  }

  async getBrowserStatus(browserId?: string): Promise<any> {
    return await this.executeCommand('siba-ai-extensions.getBrowserStatus', browserId);
  }

  async closeBrowser(browserId?: string): Promise<void> {
    return await this.executeCommand('siba-ai-extensions.closeBrowser', browserId);
  }

  async fillForm(formData: any, options: any = {}): Promise<void> {
    const browserId = options.browserId;
    const pageId = options.pageId;
    return await this.executeCommand('siba-ai-extensions.fillForm', browserId, pageId, formData);
  }

  async interactWithElement(selector: string, action: string, options: any = {}): Promise<void> {
    const browserId = options.browserId;
    const pageId = options.pageId;
    return await this.executeCommand('siba-ai-extensions.interactWithElement', browserId, pageId, selector, action);
  }

  async advancedTypeText(selector: string, text: string, options: any = {}): Promise<void> {
    const browserId = options.browserId;
    const pageId = options.pageId;
    return await this.executeCommand('siba-ai-extensions.advancedTypeText', browserId, pageId, selector, text, options);
  }

  async evaluateJavaScript(script: string, args: any[] = [], options: any = {}): Promise<any> {
    const browserId = options.browserId;
    const pageId = options.pageId;
    return await this.executeCommand('siba-ai-extensions.evaluateJavaScript', browserId, pageId, script, args);
  }

  async uploadFile(fileInputSelector: string, filePath: string, options: any = {}): Promise<void> {
    const browserId = options.browserId;
    const pageId = options.pageId;
    return await this.executeCommand('siba-ai-extensions.uploadFile', browserId, pageId, fileInputSelector, filePath);
  }

  async getElementText(selector: string, options: any = {}): Promise<string> {
    const browserId = options.browserId;
    const pageId = options.pageId;
    return await this.executeCommand('siba-ai-extensions.getElementText', browserId, pageId, selector);
  }

  async getElementAttribute(selector: string, attributeName: string, options: any = {}): Promise<string> {
    const browserId = options.browserId;
    const pageId = options.pageId;
    return await this.executeCommand('siba-ai-extensions.getElementAttribute', browserId, pageId, selector, attributeName);
  }
}

// Initialize the MCP server
const server = new Server(
  {
    name: 'siba-ai-browser',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

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
    name: 'siba_ai_browser_workflow',
    description: 'Complete workflow: launch browser, navigate to URL, and optionally take screenshot',
    inputSchema: BrowserWorkflowSchema,
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

      case 'siba_ai_take_screenshot': {
        const result = await commandExecutor.takeScreenshot((args as any).browserId, args);
        if (typeof result === 'string' && result.startsWith('data:image/')) {
          return {
            content: [
              {
                type: 'text',
                text: `Screenshot captured successfully`,
              },
              {
                type: 'image',
                data: result.split(',')[1], // Remove data:image/png;base64, prefix
                mimeType: 'image/png',
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Screenshot result: ${JSON.stringify(result)}`,
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

      case 'siba_ai_browser_workflow': {
        // Launch browser
        const browserId = await commandExecutor.launchBrowser({
          headless: (args as any).headless || false,
        });
        
        // Navigate to URL
        const navResult = await commandExecutor.navigateToUrl(browserId, (args as any).url);
        
        let screenshotResult = null;
        if ((args as any).takeScreenshot !== false) {
          screenshotResult = await commandExecutor.takeScreenshot(browserId);
        }
        
        const content: any[] = [
          {
            type: 'text',
            text: `Workflow completed successfully:\n- Browser ID: ${browserId}\n- Navigation: ${JSON.stringify(navResult)}\n- URL: ${(args as any).url}`,
          },
        ];
        
        if (screenshotResult && typeof screenshotResult === 'string' && screenshotResult.startsWith('data:image/')) {
          content.push({
            type: 'image',
            data: screenshotResult.split(',')[1],
            mimeType: 'image/png',
          });
        }
        
        return { content };
      }

      case 'siba_ai_fill_form': {
        await commandExecutor.fillForm((args as any).formData, args);
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
        await commandExecutor.interactWithElement((args as any).selector, (args as any).action, args);
        return {
          content: [
            {
              type: 'text',
              text: `Successfully performed ${(args as any).action} on element: ${(args as any).selector}`,
            },
          ],
        };
      }

      case 'siba_ai_advanced_type_text': {
        await commandExecutor.advancedTypeText((args as any).selector, (args as any).text, args);
        return {
          content: [
            {
              type: 'text',
              text: `Advanced text typing completed for element: ${(args as any).selector}`,
            },
          ],
        };
      }

      case 'siba_ai_evaluate_javascript': {
        const result = await commandExecutor.evaluateJavaScript((args as any).script, (args as any).args || [], args);
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
        await commandExecutor.uploadFile((args as any).fileInputSelector, (args as any).filePath, args);
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
        const result = await commandExecutor.getElementText((args as any).selector, args);
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
        const result = await commandExecutor.getElementAttribute((args as any).selector, (args as any).attributeName, args);
        return {
          content: [
            {
              type: 'text',
              text: `Attribute "${(args as any).attributeName}" value: "${result || 'Not found'}"`,
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
  console.error('SIBA AI MCP Server v2.0.0 running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
