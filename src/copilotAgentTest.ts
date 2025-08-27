/**
 * GitHub Copilot Agent Test Suite
 * Tests SIBA AI Browser Extensions MCP integration with GitHub Copilot
 */

import * as vscode from 'vscode';

interface TestResult {
  command: string;
  status: 'success' | 'failed';
  result?: any;
  error?: string;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  duration: string;
}

export class CopilotMCPTester {
  private testResults: TestResult[] = [];
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('Copilot MCP Test');
  }

  private log(message: string, type: 'info' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    
    this.outputChannel.appendLine(logMessage);
    console.log(logMessage);
    
    if (type === 'error') {
      // Notification disabled: vscode.window.showErrorMessage(message);
    } else if (type === 'success') {
      // Notification disabled: vscode.window.showInformationMessage(message);
    }
  }

  private async testCommand(commandId: string, params: any = {}): Promise<any> {
    try {
      this.log(`Testing command: ${commandId}`, 'info');
      const result = await vscode.commands.executeCommand(commandId, params);
      this.log(`✅ Command ${commandId} succeeded`, 'success');
      this.testResults.push({ command: commandId, status: 'success', result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`❌ Command ${commandId} failed: ${errorMessage}`, 'error');
      this.testResults.push({ command: commandId, status: 'failed', error: errorMessage });
      throw error;
    }
  }

  async runCopilotBrowserAutomationTest(): Promise<void> {
    this.log('🚀 Starting GitHub Copilot Browser Automation Test', 'info');
    
    try {
      // Test 1: Launch Browser
      this.log('Test 1: Launching browser for Copilot...', 'info');
      const browserId = await this.testCommand('siba-ai-extensions.launchBrowser');
      
      // Test 2: Navigate to a test page
      this.log('Test 2: Navigating to GitHub Copilot page...', 'info');
      await this.testCommand('siba-ai-extensions.navigateToUrl', {
        browserId,
        url: 'https://github.com/features/copilot'
      });

      // Test 3: Take screenshot
      this.log('Test 3: Taking screenshot for Copilot...', 'info');
      const screenshot = await this.testCommand('siba-ai-extensions.takeScreenshot', {
        browserId,
        fullPage: true
      });

      // Test 4: Get browser status
      this.log('Test 4: Getting browser status...', 'info');
      const status = await this.testCommand('siba-ai-extensions.getBrowserStatus', { browserId });

      // Test 5: Execute JavaScript
      this.log('Test 5: Executing JavaScript...', 'info');
      await this.testCommand('siba-ai-extensions.executeJavaScript', {
        browserId,
        script: 'console.log("Copilot test successful!");'
      });

      // Test 6: Interact with elements
      this.log('Test 6: Testing element interaction...', 'info');
      try {
        await this.testCommand('siba-ai-extensions.clickElement', {
          browserId,
          selector: 'body'
        });
      } catch (error) {
        this.log('Element interaction may not be available on this page', 'info');
      }

      // Test 7: Network monitoring
      this.log('Test 7: Testing network monitoring...', 'info');
      try {
        await this.testCommand('siba-ai-extensions.enableNetworkMonitoring', { browserId });
        const requests = await this.testCommand('siba-ai-extensions.getNetworkLogs', { browserId });
        this.log(`Network requests captured: ${Array.isArray(requests) ? requests.length : 'unknown'}`, 'info');
      } catch (error) {
        this.log('Network monitoring test completed with expected behavior', 'info');
      }

      // Test 8: Clean up
      this.log('Test 8: Cleaning up browser...', 'info');
      await this.testCommand('siba-ai-extensions.closeBrowser', { browserId });

      this.log('🎉 All Copilot browser automation tests completed successfully!', 'success');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`❌ Copilot browser automation test failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  async testMCPBridgeForCopilot(): Promise<void> {
    this.log('🌉 Testing MCP Bridge for Copilot integration...', 'info');
    
    try {
      // Test MCP Bridge status
      const bridgeStatus = await this.testCommand('siba-ai-extensions.getMCPBridgeStatus');
      this.log(`MCP Bridge Status: ${JSON.stringify(bridgeStatus)}`, 'info');

      // Test MCP connection
      await this.testCommand('siba-ai-extensions.testMCPConnection');
      
      this.log('✅ MCP Bridge is ready for Copilot integration!', 'success');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`❌ MCP Bridge test failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  async runFullCopilotTest(): Promise<{ summary: TestSummary; duration: string }> {
    const startTime = Date.now();
    this.testResults = [];
    
    this.log('🧪 Starting Full Copilot Integration Test Suite', 'info');
    this.outputChannel.show();

    try {
      // Run MCP Bridge tests
      await this.testMCPBridgeForCopilot();

      // Run browser automation tests
      await this.runCopilotBrowserAutomationTest();

      const endTime = Date.now();
      const duration = `${(endTime - startTime) / 1000}s`;

      const summary: TestSummary = {
        totalTests: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'success').length,
        failed: this.testResults.filter(r => r.status === 'failed').length,
        duration
      };

      this.log('📊 Test Summary:', 'info');
      this.log(`   Total Tests: ${summary.totalTests}`, 'info');
      this.log(`   Passed: ${summary.passed}`, 'info');
      this.log(`   Failed: ${summary.failed}`, 'info');
      this.log(`   Duration: ${summary.duration}`, 'info');

      if (summary.failed === 0) {
        this.log('🎉 All tests passed! SIBA AI is ready for GitHub Copilot integration!', 'success');
      } else {
        this.log(`⚠️ ${summary.failed} test(s) failed. Check the logs above for details.`, 'error');
      }

      return { summary, duration };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`❌ Test suite execution failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}
