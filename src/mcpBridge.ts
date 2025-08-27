/**
 * MCP Bridge - Communication between VS Code Extension and MCP Server
 * Implements file-based IPC for AI assistant integration
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface MCPRequest {
  id: string;
  method: string;
  params: any;
  timestamp: number;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  timestamp: number;
}

export class MCPBridge {
  private static instance: MCPBridge;
  private bridgeDir: string;
  private requestQueue: Map<string, (response: MCPResponse) => void> = new Map();
  private isWatching = false;
  private responseWatcher?: vscode.FileSystemWatcher;

  private constructor() {
    // Create bridge directory in OS temp directory
    this.bridgeDir = path.join(os.tmpdir(), 'siba-ai-mcp-bridge');
    this.ensureBridgeDirectory();
  }

  public static getInstance(): MCPBridge {
    if (!MCPBridge.instance) {
      MCPBridge.instance = new MCPBridge();
    }
    return MCPBridge.instance;
  }

  private ensureBridgeDirectory(): void {
    try {
      if (!fs.existsSync(this.bridgeDir)) {
        fs.mkdirSync(this.bridgeDir, { recursive: true });
      }
      
      // Clean up old files
      const files = fs.readdirSync(this.bridgeDir);
      files.forEach(file => {
        const filePath = path.join(this.bridgeDir, file);
        const stats = fs.statSync(filePath);
        const isOld = Date.now() - stats.mtime.getTime() > 60000; // 1 minute old
        if (isOld) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Failed to setup bridge directory:', error);
    }
  }

  public async sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const request: MCPRequest = {
        id: requestId,
        method,
        params,
        timestamp: Date.now()
      };

      // Store resolver for response handling
      this.requestQueue.set(requestId, (response: MCPResponse) => {
        if (response.error) {
          reject(new Error(`MCP Error ${response.error.code}: ${response.error.message}`));
        } else {
          resolve(response.result);
        }
      });

      // Write request file
      const requestFile = path.join(this.bridgeDir, `${requestId}.request.json`);
      try {
        fs.writeFileSync(requestFile, JSON.stringify(request, null, 2));
        this.startResponseWatching();
        
        // Set timeout for request
        setTimeout(() => {
          if (this.requestQueue.has(requestId)) {
            this.requestQueue.delete(requestId);
            reject(new Error(`MCP request timeout for method: ${method}`));
          }
        }, 30000); // 30 second timeout
      } catch (error) {
        this.requestQueue.delete(requestId);
        reject(error);
      }
    });
  }

  private startResponseWatching(): void {
    if (this.isWatching) return;

    this.isWatching = true;
    const responsePattern = path.join(this.bridgeDir, '*.response.json');
    
    this.responseWatcher = vscode.workspace.createFileSystemWatcher(responsePattern);
    
    this.responseWatcher.onDidCreate(async (uri) => {
      try {
        // Small delay to ensure file is fully written
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const content = fs.readFileSync(uri.fsPath, 'utf8');
        const response: MCPResponse = JSON.parse(content);
        
        // Process response
        const resolver = this.requestQueue.get(response.id);
        if (resolver) {
          resolver(response);
          this.requestQueue.delete(response.id);
        }
        
        // Clean up response file
        fs.unlinkSync(uri.fsPath);
        
        // Stop watching if no pending requests
        if (this.requestQueue.size === 0) {
          this.stopResponseWatching();
        }
      } catch (error) {
        console.error('Error processing MCP response:', error);
      }
    });
  }

  private stopResponseWatching(): void {
    if (this.responseWatcher) {
      this.responseWatcher.dispose();
      this.responseWatcher = undefined;
    }
    this.isWatching = false;
  }

  public getBridgeInfo(): { directory: string; pendingRequests: number } {
    return {
      directory: this.bridgeDir,
      pendingRequests: this.requestQueue.size
    };
  }

  public dispose(): void {
    this.stopResponseWatching();
    this.requestQueue.clear();
    
    // Clean up bridge directory
    try {
      if (fs.existsSync(this.bridgeDir)) {
        const files = fs.readdirSync(this.bridgeDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(this.bridgeDir, file));
        });
      }
    } catch (error) {
      console.error('Error cleaning up bridge directory:', error);
    }
  }
}

/**
 * MCP Tool Interface - Simplified interface for common MCP operations
 */
export class MCPTools {
  private bridge: MCPBridge;

  constructor() {
    this.bridge = MCPBridge.getInstance();
  }

  // Browser Management Tools
  async launchBrowser(headless: boolean = false, width?: number, height?: number): Promise<string> {
    return this.bridge.sendRequest('siba_ai_launch_browser', {
      headless,
      width: width || 1200,
      height: height || 800
    });
  }

  async navigateToUrl(browserId: string, url: string, waitUntil?: string): Promise<void> {
    return this.bridge.sendRequest('siba_ai_navigate_to_url', {
      browserId,
      url,
      waitUntil: waitUntil || 'load'
    });
  }

  async takeScreenshot(browserId: string, pageId: string, fullPage?: boolean): Promise<string> {
    return this.bridge.sendRequest('siba_ai_take_screenshot', {
      browserId,
      pageId,
      fullPage: fullPage !== false
    });
  }

  async getBrowserStatus(browserId?: string): Promise<any> {
    return this.bridge.sendRequest('siba_ai_get_browser_status', { browserId });
  }

  async closeBrowser(browserId?: string): Promise<void> {
    return this.bridge.sendRequest('siba_ai_close_browser', { browserId });
  }

  // Advanced Automation Tools
  async fillForm(browserId: string, pageId: string, formData: Record<string, any>): Promise<void> {
    return this.bridge.sendRequest('siba_ai_fill_form', {
      browserId,
      pageId,
      formData
    });
  }

  async clickElement(browserId: string, pageId: string, selector: string): Promise<void> {
    return this.bridge.sendRequest('siba_ai_click_element', {
      browserId,
      pageId,
      selector
    });
  }

  async typeText(browserId: string, pageId: string, selector: string, text: string): Promise<void> {
    return this.bridge.sendRequest('siba_ai_type_text', {
      browserId,
      pageId,
      selector,
      text
    });
  }

  async evaluateJavaScript(browserId: string, pageId: string, script: string): Promise<any> {
    return this.bridge.sendRequest('siba_ai_evaluate_javascript', {
      browserId,
      pageId,
      script
    });
  }

  // Network Interception Tools
  async enableNetworkInterception(browserId: string, pageId: string): Promise<void> {
    return this.bridge.sendRequest('siba_ai_enable_network_interception', {
      browserId,
      pageId
    });
  }

  async addNetworkRule(browserId: string, pageId: string, rule: any): Promise<void> {
    return this.bridge.sendRequest('siba_ai_add_network_rule', {
      browserId,
      pageId,
      rule
    });
  }

  // Utility Tools
  async getElementText(browserId: string, pageId: string, selector: string): Promise<string> {
    return this.bridge.sendRequest('siba_ai_get_element_text', {
      browserId,
      pageId,
      selector
    });
  }

  async uploadFile(browserId: string, pageId: string, selector: string, filePath: string): Promise<void> {
    return this.bridge.sendRequest('siba_ai_upload_file', {
      browserId,
      pageId,
      selector,
      filePath
    });
  }

  async dragAndDrop(browserId: string, pageId: string, fromSelector: string, toSelector: string): Promise<void> {
    return this.bridge.sendRequest('siba_ai_drag_and_drop', {
      browserId,
      pageId,
      fromSelector,
      toSelector
    });
  }

  // Complete workflow for AI assistants
  async openUrlAndScreenshot(url: string, options?: {
    headless?: boolean;
    fullPage?: boolean;
    width?: number;
    height?: number;
  }): Promise<{ browserId: string; pageId: string; screenshotPath: string }> {
    const browserId = await this.launchBrowser(
      options?.headless || false,
      options?.width,
      options?.height
    );
    
    // Get page ID from browser status
    const status = await this.getBrowserStatus(browserId);
    const pageId = status.pages?.[0]?.id || 'page_0';
    
    await this.navigateToUrl(browserId, url);
    const screenshotPath = await this.takeScreenshot(browserId, pageId, options?.fullPage);
    
    return { browserId, pageId, screenshotPath };
  }
}
