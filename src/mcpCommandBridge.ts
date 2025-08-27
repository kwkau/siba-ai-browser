/**
 * MCP Command Bridge - Monitors file system for MCP command requests
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class MCPCommandBridge {
    private static instance: MCPCommandBridge;
    private bridgeDir = '/tmp/siba-ai-mcp-direct';
    private watcher: fs.FSWatcher | null = null;
    private isMonitoring = false;

    private constructor(private outputChannel: vscode.OutputChannel) {
        this.ensureBridgeDirectory();
    }

    public static getInstance(outputChannel?: vscode.OutputChannel): MCPCommandBridge {
        if (!MCPCommandBridge.instance && outputChannel) {
            MCPCommandBridge.instance = new MCPCommandBridge(outputChannel);
        }
        return MCPCommandBridge.instance;
    }

    private ensureBridgeDirectory(): void {
        if (!fs.existsSync(this.bridgeDir)) {
            fs.mkdirSync(this.bridgeDir, { recursive: true });
        }
    }

    public startMonitoring(): void {
        if (this.isMonitoring) {
            return;
        }

        try {
            this.watcher = fs.watch(this.bridgeDir, { persistent: false }, (eventType, filename) => {
                if (eventType === 'rename' && filename && filename.endsWith('.json') && !filename.includes('_response')) {
                    this.handleCommandRequest(filename);
                }
            });

            this.isMonitoring = true;
            this.outputChannel.appendLine('🔄 MCP Command Bridge monitoring started');
        } catch (error) {
            this.outputChannel.appendLine(`❌ Failed to start MCP Command Bridge: ${error}`);
        }
    }

    public stopMonitoring(): void {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
        this.isMonitoring = false;
        this.outputChannel.appendLine('🔄 MCP Command Bridge monitoring stopped');
    }

    private async handleCommandRequest(filename: string): Promise<void> {
        const requestFile = path.join(this.bridgeDir, filename);
        const responseFile = path.join(this.bridgeDir, filename.replace('.json', '_response.json'));

        try {
            // Wait a bit for file to be fully written
            await new Promise(resolve => setTimeout(resolve, 50));

            if (!fs.existsSync(requestFile)) {
                return; // File might have been processed already
            }

            const requestContent = fs.readFileSync(requestFile, 'utf8');
            const request = JSON.parse(requestContent);

            this.outputChannel.appendLine(`📡 Processing MCP command: ${request.command}`);

            try {
                // Execute VS Code command
                const result = await vscode.commands.executeCommand(request.command, ...request.args);
                
                // Write successful response
                const response = {
                    id: request.id,
                    result,
                    timestamp: Date.now()
                };

                fs.writeFileSync(responseFile, JSON.stringify(response, null, 2));
                this.outputChannel.appendLine(`✅ MCP command completed: ${request.command}`);

            } catch (commandError) {
                // Write error response
                const errorResponse = {
                    id: request.id,
                    error: `Command execution failed: ${commandError}`,
                    timestamp: Date.now()
                };

                fs.writeFileSync(responseFile, JSON.stringify(errorResponse, null, 2));
                this.outputChannel.appendLine(`❌ MCP command failed: ${request.command} - ${commandError}`);
            }

        } catch (error) {
            this.outputChannel.appendLine(`❌ Failed to process MCP command request: ${error}`);
            
            // Try to write error response
            try {
                const errorResponse = {
                    id: 'unknown',
                    error: `Request processing failed: ${error}`,
                    timestamp: Date.now()
                };
                fs.writeFileSync(responseFile, JSON.stringify(errorResponse, null, 2));
            } catch (writeError) {
                this.outputChannel.appendLine(`❌ Failed to write error response: ${writeError}`);
            }
        }
    }

    public dispose(): void {
        this.stopMonitoring();
    }
}
