/**
 * Language Model Tools for SIBA AI Browser Extensions
 * Provides simplified tools for VS Code's built-in Language Model chat interface
 * 
 * NOTE: This is a secondary integration layer. The primary MCP integration 
 * with 16+ tools is handled by VSCodeMCPProvider in vscodeMP.ts
 * 
 * Purpose:
 * - Language Model Tools: Simple screenshot tool for VS Code's native chat
 * - MCP Integration: Full browser automation suite for Copilot agent mode
 */

import * as vscode from 'vscode';

export class SibaLanguageModelTools {
  private static instance: SibaLanguageModelTools;
  private registeredTools: vscode.Disposable[] = [];

  public static getInstance(): SibaLanguageModelTools {
    if (!SibaLanguageModelTools.instance) {
      SibaLanguageModelTools.instance = new SibaLanguageModelTools();
    }
    return SibaLanguageModelTools.instance;
  }

  public activate(context: vscode.ExtensionContext) {
    // Register simplified screenshot tool for VS Code's built-in Language Model chat
    // Note: Full MCP integration with 16+ tools is handled by VSCodeMCPProvider
    const screenshotTool = vscode.lm.registerTool('siba_screenshot', {
      invoke: async (options: vscode.LanguageModelToolInvocationOptions<{
        url: string;
        fullPage?: boolean;
        width?: number;
        height?: number;
      }>, token: vscode.CancellationToken) => {
        return await this.handleScreenshotTool(options, token);
      }
    } as vscode.LanguageModelTool<{
      url: string;
      fullPage?: boolean;
      width?: number;
      height?: number;
    }>);

    this.registeredTools.push(screenshotTool);
    context.subscriptions.push(...this.registeredTools);
  }

  private async handleScreenshotTool(
    options: vscode.LanguageModelToolInvocationOptions<{
      url: string;
      fullPage?: boolean;
      width?: number;
      height?: number;
    }>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      const { url, fullPage = true, width, height } = options.input;

      // Launch browser
      const browserId = await vscode.commands.executeCommand('siba-ai-extensions.launchBrowser');
      
      if (token.isCancellationRequested) {
        await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', { browserId });
        throw new vscode.CancellationError();
      }

      // Wait for browser to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to URL
      await vscode.commands.executeCommand('siba-ai-extensions.navigateToUrl', {
        browserId,
        url
      });

      if (token.isCancellationRequested) {
        await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', { browserId });
        throw new vscode.CancellationError();
      }

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take screenshot
      const screenshot = await vscode.commands.executeCommand('siba-ai-extensions.takeScreenshot', {
        browserId,
        fullPage,
        width,
        height
      });

      // Close browser
      //await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', { browserId });

      // Process screenshot data for vision model consumption
      if (typeof screenshot === 'string') {
        const base64Data = screenshot.startsWith('data:image/') 
          ? screenshot.split(',')[1] 
          : screenshot;
        
        const mimeType = screenshot.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Create data URL for the image
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        
        // Return text description and hint about the image data
        // Note: In future VS Code versions, this should use LanguageModelDataPart when available
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(
            `Screenshot captured from ${url} (${Math.round(buffer.length / 1024)}KB, ${mimeType}). ` +
            `The image shows the current state of the webpage and can be analyzed for UI elements, ` +
            `text content, layout, colors, and visual issues. ` +
            `Image data: ${dataUrl}`
          )
        ]);
      } else {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(`Failed to capture screenshot from ${url} - invalid data returned`)
        ]);
      }

    } catch (error) {
      if (error instanceof vscode.CancellationError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`Screenshot capture failed: ${errorMessage}`)
      ]);
    }
  }

  public dispose() {
    this.registeredTools.forEach(tool => tool.dispose());
    this.registeredTools = [];
  }
}
