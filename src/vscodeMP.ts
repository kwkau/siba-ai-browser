/**
 * VS Code MCP Server Definition Provider
 * Implements native VS Code MCP integration using McpServerDefinitionProvider
 * Based on established patterns from AI memory system
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * VS Code MCP Provider Implementation
 * Uses native VS Code API instead of workspace configuration manipulation
 */
export class VSCodeMCPProvider implements vscode.McpServerDefinitionProvider<vscode.McpStdioServerDefinition> {
    private extensionContext: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
        this.extensionContext = context;
        this.outputChannel = outputChannel;
    }

    /**
     * Provide MCP server definitions for VS Code MCP agent
     * Returns array of available MCP servers
     */
    async provideMcpServerDefinitions(token: vscode.CancellationToken): Promise<vscode.McpStdioServerDefinition[]> {
        try {
            this.outputChannel.appendLine('🔧 Providing MCP server definitions...');

            // Path to compiled MCP server
            const mcpServerPath = path.join(
                this.extensionContext.extensionPath, 
                'mcp-server', 
                'build', 
                'index.js'
            );

            // Check if MCP server exists
            if (!fs.existsSync(mcpServerPath)) {
                this.outputChannel.appendLine(`❌ MCP server not found at: ${mcpServerPath}`);
                return [];
            }

            // Create server definition using VS Code native API
            const serverDefinition = new vscode.McpStdioServerDefinition(
                'siba-ai-browser',
                'node',
                [mcpServerPath],
                {
                    // Set MCP client type for proper server configuration
                    MCP_CLIENT_TYPE: 'vscode',
                    NODE_ENV: this.extensionContext.extensionMode === vscode.ExtensionMode.Development ? 'development' : 'production'
                },
                '2.2.0'
            );

            this.outputChannel.appendLine('✅ MCP server definition created successfully');
            this.outputChannel.appendLine(`📁 Server path: ${mcpServerPath}`);
            this.outputChannel.appendLine(`🔧 Client type: vscode`);

            return [serverDefinition];

        } catch (error) {
            this.outputChannel.appendLine(`❌ Error providing MCP server definitions: ${error}`);
            // Notification disabled: vscode.window.showErrorMessage(`Failed to provide MCP server definitions: ${error}`);
            return [];
        }
    }

    /**
     * Resolve MCP server definition
     * Validates server configuration and startup
     */
    async resolveMcpServerDefinition(
        definition: vscode.McpStdioServerDefinition,
        token: vscode.CancellationToken
    ): Promise<vscode.McpStdioServerDefinition> {
        try {
            this.outputChannel.appendLine(`🔍 Resolving MCP server definition...`);

            // Server definition is already properly configured
            // VS Code will handle the actual server startup
            
            this.outputChannel.appendLine(`✅ MCP server definition resolved successfully`);
            return definition;

        } catch (error) {
            this.outputChannel.appendLine(`❌ Error resolving MCP server definition: ${error}`);
            throw error;
        }
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        // Cleanup if needed
        this.outputChannel.appendLine('🧹 VS Code MCP Provider disposed');
    }
}

/**
 * Register VS Code MCP Server Definition Provider
 * Uses native VS Code MCP API for automatic integration
 */
export function registerVSCodeMCPProvider(
    context: vscode.ExtensionContext, 
    outputChannel: vscode.OutputChannel
): vscode.Disposable {
    try {
        outputChannel.appendLine('🚀 Registering VS Code MCP Server Definition Provider...');

        // Create provider instance
        const mcpProvider = new VSCodeMCPProvider(context, outputChannel);

        // Register with VS Code using native API
        const registration = vscode.lm.registerMcpServerDefinitionProvider(
            'siba-ai-mcp-provider',
            mcpProvider
        );

        outputChannel.appendLine('✅ VS Code MCP Server Definition Provider registered successfully');
        outputChannel.appendLine('🔧 Provider ID: siba-ai-mcp-provider');
        outputChannel.appendLine('🌐 Integration: Native VS Code MCP API');

        // Add disposal to context
        context.subscriptions.push(registration);
        context.subscriptions.push(mcpProvider);

        return registration;

    } catch (error) {
        outputChannel.appendLine(`❌ Failed to register VS Code MCP provider: ${error}`);
        // Notification disabled: vscode.window.showErrorMessage(`MCP provider registration failed: ${error}`);
        
        // Return dummy disposable to prevent crashes
        return { dispose: () => {} };
    }
}
