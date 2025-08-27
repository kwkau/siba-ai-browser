/**
 * GitHub Copilot Chat Agent for SIBA AI Browser Automation
 * Enables Copilot to use browser automation commands through chat interface
 */

import * as vscode from 'vscode';

export class SibaCopilotAgent {
  private static instance: SibaCopilotAgent;
  private chatParticipant: vscode.ChatParticipant | undefined;

  public static getInstance(): SibaCopilotAgent {
    if (!SibaCopilotAgent.instance) {
      SibaCopilotAgent.instance = new SibaCopilotAgent();
    }
    return SibaCopilotAgent.instance;
  }

  public activate(context: vscode.ExtensionContext) {
    // Register Copilot chat participant
    this.chatParticipant = vscode.chat.createChatParticipant('siba-ai-browser', this.handleChatRequest.bind(this));
    this.chatParticipant.iconPath = vscode.Uri.file(context.asAbsolutePath('icon.png'));
    this.chatParticipant.followupProvider = {
      provideFollowups: this.provideFollowups.bind(this)
    };

    context.subscriptions.push(this.chatParticipant);

    // Register browser automation commands for Copilot
    this.registerCopilotCommands(context);
  }

  private async handleChatRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    try {
      const userPrompt = request.prompt.toLowerCase();

      stream.progress('Analyzing your browser automation request...');

      // Parse intent from user request
      if (userPrompt.includes('screenshot') || userPrompt.includes('capture')) {
        await this.handleScreenshotRequest(request, stream);
      } else if (userPrompt.includes('navigate') || userPrompt.includes('go to') || userPrompt.includes('visit')) {
        await this.handleNavigationRequest(request, stream);
      } else if (userPrompt.includes('form') || userPrompt.includes('fill')) {
        await this.handleFormRequest(request, stream);
      } else if (userPrompt.includes('click') || userPrompt.includes('interact')) {
        await this.handleFormRequest(request, stream); // Treat interaction as form for now
      } else if (userPrompt.includes('status') || userPrompt.includes('info')) {
        await this.handleStatusRequest(request, stream);
      } else if (userPrompt.includes('test') || userPrompt.includes('demo')) {
        await this.handleTestRequest(request, stream);
      } else if (userPrompt.includes('mcp') || userPrompt.includes('tool') || userPrompt.includes('siba_ai_')) {
        await this.handleMCPToolRequest(request, stream);
      } else {
        await this.handleGeneralRequest(request, stream);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stream.markdown(`❌ **Error**: ${errorMessage}`);
    }
  }

  private async handleScreenshotRequest(request: vscode.ChatRequest, stream: vscode.ChatResponseStream) {
    stream.markdown('🖼️ **Taking Screenshot**\n\n');
    stream.progress('Launching browser...');

    try {
      // Extract URL from request if provided
      const urlMatch = request.prompt.match(/https?:\/\/[^\s]+/);
      const url = urlMatch ? urlMatch[0] : 'https://example.com';

      stream.markdown(`🎯 **Target URL**: ${url}\n\n`);

      const browserId = await vscode.commands.executeCommand('siba-ai-extensions.launchBrowser');
      stream.markdown(`✅ Browser launched (ID: ${browserId})\n\n`);

      // Add a small delay to ensure browser is ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      stream.progress('Navigating to URL...');
      await vscode.commands.executeCommand('siba-ai-extensions.navigateToUrl', {
        browserId,
        url
      });
      stream.markdown(`✅ Navigated to: ${url}\n\n`);

      // Add delay to ensure page is loaded
      await new Promise(resolve => setTimeout(resolve, 3000));

      stream.progress('Capturing screenshot...');
      const screenshot = await vscode.commands.executeCommand('siba-ai-extensions.takeScreenshot', {
        browserId,
        fullPage: true
      });

      // Handle screenshot data properly for vision models
      if (typeof screenshot === 'string') {
        const base64Data = screenshot.startsWith('data:image/') 
          ? screenshot.split(',')[1] 
          : screenshot;
        
        const buffer = Buffer.from(base64Data, 'base64');
        const mimeType = screenshot.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
        
        stream.markdown(`✅ Screenshot captured (${Math.round(buffer.length / 1024)}KB)\n\n`);
        
        // For now, provide the data URL format which vision models can potentially use
        // This is the format that GPT-4V, Claude, and other vision models expect
        const dataUrl = screenshot.startsWith('data:image/') 
          ? screenshot 
          : `data:${mimeType};base64,${base64Data}`;
        
        stream.markdown(`📷 **Screenshot for Analysis:**\n\n`);
        stream.markdown(`![Screenshot](${dataUrl})\n\n`);
        
        // Also provide OCR/description hint
        stream.markdown(`*This screenshot contains the current state of the webpage. Vision models can analyze this image to describe UI elements, text content, layout, colors, and any visual issues.*\n\n`);
      }

      await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', { browserId });
      stream.markdown('✅ Browser closed\n\n');

      stream.markdown('🎉 **Screenshot workflow completed successfully!**\n\n');
      stream.markdown('💡 **Next Steps:** Ask me to describe what you see in the screenshot, identify specific elements, or analyze any visual issues.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stream.markdown(`❌ Screenshot failed: ${errorMessage}`);
      
      // Provide detailed troubleshooting info
      stream.markdown('\n**🔧 Troubleshooting Steps:**\n');
      stream.markdown('1. Check if the URL is accessible\n');
      stream.markdown('2. Verify browser automation is enabled\n');
      stream.markdown('3. Try a simpler URL like https://example.com\n');
      stream.markdown('4. Check the output panel for detailed logs\n');
    }
  }

  private async handleNavigationRequest(request: vscode.ChatRequest, stream: vscode.ChatResponseStream) {
    stream.markdown('🌐 **Browser Navigation**\n\n');

    try {
      const urlMatch = request.prompt.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) {
        stream.markdown('❌ Please provide a URL to navigate to.\n\nExample: "Navigate to https://github.com"');
        return;
      }

      const url = urlMatch[0];
      stream.progress('Launching browser...');

      const browserId = await vscode.commands.executeCommand('siba-ai-extensions.launchBrowser');
      stream.markdown(`✅ Browser launched\n\n`);

      stream.progress('Navigating...');
      await vscode.commands.executeCommand('siba-ai-extensions.navigateToUrl', {
        browserId,
        url
      });

      const status = await vscode.commands.executeCommand('siba-ai-extensions.getBrowserStatus', { browserId });
      stream.markdown(`✅ Successfully navigated to: **${url}**\n\n`);
      stream.markdown(`📊 **Page Status**: ${JSON.stringify(status, null, 2)}\n\n`);

      stream.markdown('🎯 **What would you like to do next?**\n- Take a screenshot\n- Fill a form\n- Extract data\n- Close browser');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stream.markdown(`❌ Navigation failed: ${errorMessage}`);
    }
  }

  private async handleFormRequest(request: vscode.ChatRequest, stream: vscode.ChatResponseStream) {
    stream.markdown('📝 **Form Automation**\n\n');
    stream.markdown('🚧 **Form filling requires an active browser session.**\n\n');
    stream.markdown('Here\'s how to use form automation:\n\n');
    stream.markdown('```typescript\n');
    stream.markdown('// Example form filling\n');
    stream.markdown('await vscode.commands.executeCommand("siba-ai-extensions.fillForm", {\n');
    stream.markdown('  browserId: "your-browser-id",\n');
    stream.markdown('  formData: {\n');
    stream.markdown('    "name": "Your Name",\n');
    stream.markdown('    "email": "your@email.com"\n');
    stream.markdown('  }\n');
    stream.markdown('});\n');
    stream.markdown('```\n\n');
    stream.markdown('Would you like me to demonstrate with a specific form?');
  }

  private async handleTestRequest(request: vscode.ChatRequest, stream: vscode.ChatResponseStream) {
    stream.markdown('🧪 **Running Browser Automation Test**\n\n');
    stream.progress('Starting comprehensive test...');

    try {
      // Run the Copilot test command
      const testResults = await vscode.commands.executeCommand('siba-ai-extensions.runCopilotTest') as any;

      stream.markdown('✅ **Test Results:**\n\n');
      stream.markdown(`- **Total Tests**: ${testResults?.summary?.totalTests || 'Unknown'}\n`);
      stream.markdown(`- **Passed**: ${testResults?.summary?.passed || 'Unknown'}\n`);
      stream.markdown(`- **Failed**: ${testResults?.summary?.failed || 'Unknown'}\n`);
      stream.markdown(`- **Duration**: ${testResults?.duration || 'Unknown'}\n\n`);

      if (testResults?.summary?.failed === 0) {
        stream.markdown('🎉 **All tests passed! SIBA AI is ready for Copilot integration!**');
      } else {
        stream.markdown('⚠️ **Some tests failed. Check the output panel for details.**');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stream.markdown(`❌ Test execution failed: ${errorMessage}`);
    }
  }

  private async handleStatusRequest(request: vscode.ChatRequest, stream: vscode.ChatResponseStream) {
    stream.markdown('📊 **SIBA AI Browser Extensions Status**\n\n');

    try {
      // Test MCP bridge status
      const bridgeStatus = await vscode.commands.executeCommand('siba-ai-extensions.getMCPBridgeStatus');
      stream.markdown(`🌉 **MCP Bridge**: ${JSON.stringify(bridgeStatus, null, 2)}\n\n`);

      // Get available commands
      const commands = await vscode.commands.getCommands(true);
      const sibaCommands = commands.filter(cmd => cmd.startsWith('siba-ai-extensions'));
      
      stream.markdown(`🛠️ **Available Commands** (${sibaCommands.length}):\n\n`);
      sibaCommands.forEach(cmd => {
        stream.markdown(`- \`${cmd}\`\n`);
      });

      stream.markdown('\n✅ **SIBA AI is ready for browser automation!**');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stream.markdown(`❌ Status check failed: ${errorMessage}`);
    }
  }

  private async handleMCPToolRequest(request: vscode.ChatRequest, stream: vscode.ChatResponseStream) {
    stream.markdown('🔧 **MCP Tools Access**\n\n');
    stream.progress('Accessing MCP tools...');

    try {
      // List available MCP tools with siba_ai_ prefix
      stream.markdown('📋 **Available MCP Tools**:\n\n');
      stream.markdown('Based on memory consultation - all MCP tools use `siba_ai_*` prefix:\n\n');
      
      const mcpTools = [
        'siba_ai_take_screenshot',
        'siba_ai_open_url_in_browser', 
        'siba_ai_get_browser_status',
        'siba_ai_navigate_to_url',
        'siba_ai_execute_javascript',
        'siba_ai_click_element',
        'siba_ai_fill_form',
        'siba_ai_upload_file',
        'siba_ai_get_page_content',
        'siba_ai_wait_for_element',
        'siba_ai_drag_and_drop',
        'siba_ai_scroll_page',
        'siba_ai_get_network_logs',
        'siba_ai_enable_network_monitoring'
      ];

      mcpTools.forEach(tool => {
        stream.markdown(`- 🛠️ \`${tool}\`\n`);
      });

      stream.markdown('\n**💡 How to use MCP tools:**\n\n');
      stream.markdown('Unfortunately, GitHub Copilot Chat currently doesn\'t support direct MCP tool execution.\n\n');
      stream.markdown('**✅ Available alternatives:**\n');
      stream.markdown('1. **Use VS Code commands** (what we\'re currently using)\n');
      stream.markdown('2. **Use external MCP clients** like Claude Desktop\n');
      stream.markdown('3. **Use the test command** to verify MCP bridge connectivity\n\n');
      
      stream.markdown('**🔧 Test MCP Bridge:**\n');
      stream.markdown('Type: `@siba-ai-browser run a test` to verify MCP connectivity\n\n');
      
      stream.markdown('**📊 Check Status:**\n');
      stream.markdown('Type: `@siba-ai-browser show status` for MCP bridge status\n');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stream.markdown(`❌ MCP tool access failed: ${errorMessage}`);
    }
  }

  private async handleGeneralRequest(request: vscode.ChatRequest, stream: vscode.ChatResponseStream) {
    stream.markdown('🤖 **SIBA AI Browser Automation Assistant**\n\n');
    stream.markdown('I can help you with browser automation tasks:\n\n');
    stream.markdown('**Available Actions:**\n');
    stream.markdown('- 📸 **Screenshots**: "Take a screenshot of https://example.com"\n');
    stream.markdown('- 🌐 **Navigation**: "Navigate to https://github.com"\n');
    stream.markdown('- 📝 **Forms**: "Fill out a form"\n');
    stream.markdown('- 🖱️ **Interactions**: "Click on elements"\n');
    stream.markdown('- 🧪 **Testing**: "Run a test"\n');
    stream.markdown('- 📊 **Status**: "Show status"\n');
    stream.markdown('- 🔧 **MCP Tools**: "Show me MCP tools" or "List siba_ai_ tools"\n\n');
    stream.markdown('**Examples:**\n');
    stream.markdown('- "Take a screenshot of the GitHub homepage"\n');
    stream.markdown('- "Navigate to https://example.com and take a screenshot"\n');
    stream.markdown('- "Run a browser automation test"\n');
    stream.markdown('- "Show me the current status"\n');
    stream.markdown('- "What MCP tools are available?"\n\n');
    stream.markdown('**🔧 About MCP Tools:**\n');
    stream.markdown('This extension provides 25+ MCP tools with `siba_ai_*` prefix for external AI clients like Claude Desktop.\n');
    stream.markdown('Type "MCP tools" or "siba_ai_" to see the complete list.\n\n');
    stream.markdown('What would you like me to help you with?');
  }

  private provideFollowups(result: vscode.ChatResult, context: vscode.ChatContext): vscode.ChatFollowup[] {
    return [
      {
        prompt: 'Take a screenshot of https://github.com',
        label: '📸 Screenshot GitHub',
        command: 'screenshot'
      },
      {
        prompt: 'Run a browser automation test',
        label: '🧪 Run Test',
        command: 'test'
      },
      {
        prompt: 'Show current status',
        label: '📊 Show Status',
        command: 'status'
      },
      {
        prompt: 'Navigate to https://example.com',
        label: '🌐 Navigate to Example.com',
        command: 'navigate'
      }
    ];
  }

  private registerCopilotCommands(context: vscode.ExtensionContext) {
    // Register the Copilot test command
    const testCommand = vscode.commands.registerCommand(
      'siba-ai-extensions.runCopilotTest',
      async () => {
        const { CopilotMCPTester } = await import('./copilotAgentTest.js');
        const tester = new CopilotMCPTester();
        try {
          return await tester.runFullCopilotTest();
        } finally {
          tester.dispose();
        }
      }
    );

    context.subscriptions.push(testCommand);
  }

  public dispose() {
    if (this.chatParticipant) {
      this.chatParticipant.dispose();
    }
  }
}
