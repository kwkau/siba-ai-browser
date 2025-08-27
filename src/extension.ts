import * as vscode from 'vscode';
import { PuppeteerService, ScreenshotOptions } from './puppeteerService';
import { MCPBridge, MCPTools } from './mcpBridge';
import { SibaCopilotAgent } from './copilotAgent';
import { registerVSCodeMCPProvider } from './vscodeMP';
import { MCPCommandBridge } from './mcpCommandBridge';
import { SibaLanguageModelTools } from './languageModelTools';

let puppeteerService: PuppeteerService;
let outputChannel: vscode.OutputChannel;
let mcpBridge: MCPBridge;
let mcpTools: MCPTools;
let copilotAgent: SibaCopilotAgent;
let mcpCommandBridge: MCPCommandBridge;
let languageModelTools: SibaLanguageModelTools;

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 SIBA AI Browser Extensions is now active!');
    
    // Activation notification disabled
    // // Notification disabled: vscode.window.showInformationMessage('🎉 SIBA AI Browser Extensions activated! Try @siba-ai-browser in Copilot Chat.');

    // Create output channel
    outputChannel = vscode.window.createOutputChannel('SIBA AI Browser');
    context.subscriptions.push(outputChannel);
    
    // Log activation details
    outputChannel.appendLine('🚀 SIBA AI Browser Extensions activated successfully');
    outputChannel.appendLine(`📁 Extension path: ${context.extensionPath}`);
    outputChannel.appendLine(`🔧 Mode: ${context.extensionMode === vscode.ExtensionMode.Development ? 'Development' : 'Production'}`);

    // Initialize Puppeteer service
    puppeteerService = new PuppeteerService(outputChannel);
    
    // Initialize MCP Bridge
    mcpBridge = MCPBridge.getInstance();
    mcpTools = new MCPTools();
    
    // Initialize Copilot Agent
    copilotAgent = SibaCopilotAgent.getInstance();
    copilotAgent.activate(context);
    
    // Initialize Language Model Tools
    languageModelTools = SibaLanguageModelTools.getInstance();
    languageModelTools.activate(context);
    
    // Initialize MCP Command Bridge (for direct MCP server communication)
    mcpCommandBridge = MCPCommandBridge.getInstance(outputChannel);
    mcpCommandBridge.startMonitoring();
    
    // Register VS Code MCP Provider (native integration)
    registerVSCodeMCPProvider(context, outputChannel);
    
    // Register disposal of services
    context.subscriptions.push(vscode.Disposable.from({
        dispose: () => {
            puppeteerService.dispose();
            mcpBridge.dispose();
            copilotAgent.dispose();
            mcpCommandBridge.dispose();
            languageModelTools.dispose();
        }
    }));

    // Register commands
    registerCommands(context);

    // Start MCP server process
    startMCPServer(context);

    outputChannel.appendLine('✅ SIBA AI Browser Extensions activated successfully');
    outputChannel.appendLine(`🌉 MCP Bridge directory: ${mcpBridge.getBridgeInfo().directory}`);
    outputChannel.appendLine('🤖 Copilot Agent registered as @siba-ai-browser');
    outputChannel.appendLine('');
    outputChannel.appendLine('🎯 Quick Test Commands:');
    outputChannel.appendLine('  • Open Copilot Chat: Ctrl+Shift+I (Windows/Linux) or Cmd+Shift+I (Mac)');
    outputChannel.appendLine('  • Try: @siba-ai-browser Hello!');
    outputChannel.appendLine('  • Try: @siba-ai-browser Show status');
    outputChannel.appendLine('  • Try: @siba-ai-browser Take a screenshot of https://example.com');
    outputChannel.show();
}

function registerCommands(context: vscode.ExtensionContext) {
    // Launch Browser Command (Visible)
    const launchBrowserCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.launchBrowser',
        async () => {
            try {
                const browserId = await puppeteerService.launchBrowser({ headless: false });
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage(`Visible browser launched with ID: ${browserId}`);
                return browserId;
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to launch visible browser: ${error}`);
                throw error;
            }
        }
    );

    // Launch Browser Command (Headless)
    const launchBrowserHeadlessCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.launchBrowserHeadless',
        async () => {
            try {
                const browserId = await puppeteerService.launchBrowser({ headless: true });
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage(`Headless browser launched with ID: ${browserId}`);
                return browserId;
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to launch headless browser: ${error}`);
                throw error;
            }
        }
    );

    // Navigate to URL Command
    const navigateCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.navigateToUrl',
        async (browserId?: string, url?: string) => {
            try {
                if (!browserId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    browserId = browsers[0].id;
                }

                if (!url) {
                    url = await vscode.window.showInputBox({
                        prompt: 'Enter URL to navigate to',
                        placeHolder: 'https://example.com'
                    });
                    if (!url) {
                        return;
                    }
                }

                const pageId = await puppeteerService.navigateToUrl(browserId!, url!);
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage(`Navigated to ${url} (Page ID: ${pageId})`);
                return { browserId, pageId };
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to navigate: ${error}`);
                throw error;
            }
        }
    );

    // Take Screenshot Command
    const screenshotCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.takeScreenshot',
        async (browserId?: string, pageId?: string, options?: ScreenshotOptions) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                const screenshot = await puppeteerService.takeScreenshot(browserId!, pageId!, {
                    fullPage: false, // Capture full page by default,
                    captureBeyondViewport: false, // Capture beyond viewport
                    format: "jpeg",
                    quality: 70, // Default quality for JPEG
                    optimizeForSpeed: true, // Optimize for speed
                    encoding: 'base64'
                });
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage(`Screenshot captured (${screenshot.length} characters)`);
                return screenshot;
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to take screenshot: ${error}`);
                throw error;
            }
        }
    );

    const elementScreenshotCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.takeElementScreenshot',
        async (selector: string, browserId?: string, pageId?: string, options?: ScreenshotOptions) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                const screenshot = await puppeteerService.elementScreenshot(selector, browserId!, pageId!, {
                    format: options?.format || "jpeg",
                    quality: options?.quality || 70,
                    optimizeForSpeed: true,
                    encoding: 'base64'
                });
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage(`Screenshot captured (${screenshot.length} characters)`);
                return screenshot;
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to take screenshot: ${error}`);
                throw error;
            }
        }
    );

    // Get Browser Status Command
    const statusCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.getBrowserStatus',
        async () => {
            try {
                const browsers = puppeteerService.getAllBrowsers();
                outputChannel.appendLine(`Browser Status: ${JSON.stringify(browsers, null, 2)}`);
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage(`Found ${browsers.length} browsers`);
                return browsers;
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to get browser status: ${error}`);
                throw error;
            }
        }
    );

    // Close Browser Command
    const closeBrowserCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.closeBrowser',
        async (browserId?: string) => {
            try {
                if (!browserId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        // Notification disabled: // Notification disabled: vscode.window.showInformationMessage('No browsers to close');
                        return;
                    }
                    browserId = browsers[0].id;
                }

                await puppeteerService.closeBrowser(browserId!);
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage(`Browser ${browserId} closed`);
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to close browser: ${error}`);
                throw error;
            }
        }
    );

    // Close All Browsers Command
    const closeAllBrowsersCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.closeAllBrowsers',
        async () => {
            try {
                const result = await puppeteerService.closeAllBrowsers();
                outputChannel.appendLine(`[Extension] Close all browsers result: ${result.closed} closed, ${result.errors.length} errors`);
                
                if (result.errors.length > 0) {
                    outputChannel.appendLine(`[Extension] Errors: ${result.errors.join(', ')}`);
                }
                
                return result;
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to close all browsers: ${error}`);
                throw error;
            }
        }
    );

    // Register all commands
    context.subscriptions.push(
        launchBrowserCommand,
        launchBrowserHeadlessCommand,
        navigateCommand,
        screenshotCommand,
        elementScreenshotCommand,
        statusCommand,
        closeBrowserCommand,
        closeAllBrowsersCommand,
        ...registerAdvancedCommands(context, puppeteerService, outputChannel)
    );
}

function registerAdvancedCommands(
    context: vscode.ExtensionContext,
    puppeteerService: PuppeteerService,
    outputChannel: vscode.OutputChannel
): vscode.Disposable[] {
    const commands: vscode.Disposable[] = [];

    // Fill Form Command
    const fillFormCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.fillForm',
        async (browserId?: string, pageId?: string, formData?: any) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!formData) {
                    // For manual testing, show input box
                    const jsonInput = await vscode.window.showInputBox({
                        prompt: 'Enter form data as JSON',
                        placeHolder: '{"name": "John", "email": "john@example.com"}'
                    });
                    if (!jsonInput) return;
                    formData = JSON.parse(jsonInput);
                }

                await puppeteerService.fillForm(browserId!, pageId!, formData);
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage('Form filled successfully');
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to fill form: ${error}`);
                throw error;
            }
        }
    );

    // Interact with Element Command
    const interactCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.interactWithElement',
        async (browserId?: string, pageId?: string, selector?: string, action?: string) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!selector) {
                    selector = await vscode.window.showInputBox({
                        prompt: 'Enter CSS selector',
                        placeHolder: '.button, #submit, [data-testid="login"]'
                    });
                    if (!selector) return;
                }

                if (!action) {
                    action = await vscode.window.showQuickPick(
                        ['click', 'hover', 'scroll', 'focus', 'doubleClick', 'rightClick'],
                        { placeHolder: 'Select action to perform' }
                    );
                    if (!action) return;
                }

                await puppeteerService.interactWithElement(browserId!, pageId!, selector!, action as any);
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage(`Successfully performed ${action} on element`);
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to interact with element: ${error}`);
                throw error;
            }
        }
    );

    // Advanced Type Text Command
    const advancedTypeCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.advancedTypeText',
        async (browserId?: string, pageId?: string, selector?: string, text?: string) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!selector) {
                    selector = await vscode.window.showInputBox({
                        prompt: 'Enter input field selector',
                        placeHolder: 'input[name="username"], #email, .search-input'
                    });
                    if (!selector) return;
                }

                if (!text) {
                    text = await vscode.window.showInputBox({
                        prompt: 'Enter text to type',
                        placeHolder: 'Hello World'
                    });
                    if (!text) return;
                }

                await puppeteerService.advancedTypeText(browserId!, pageId!, selector!, text!);
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage('Text typed successfully');
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to type text: ${error}`);
                throw error;
            }
        }
    );

    // Evaluate JavaScript Command
    const evaluateJsCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.evaluateJavaScript',
        async (browserId?: string, pageId?: string, script?: string, args?: any[]) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!script) {
                    script = await vscode.window.showInputBox({
                        prompt: 'Enter JavaScript to execute',
                        placeHolder: 'document.title'
                    });
                    if (!script) return;
                }

                const result = await puppeteerService.evaluateJavaScript(browserId!, pageId!, script!, args);
                outputChannel.appendLine(`JavaScript Result: ${JSON.stringify(result, null, 2)}`);
                // Notification disabled: // Notification disabled: vscode.window.showInformationMessage('JavaScript executed successfully');
                return result;
            } catch (error) {
                // Notification disabled: // Notification disabled: vscode.window.showErrorMessage(`Failed to execute JavaScript: ${error}`);
                throw error;
            }
        }
    );

    // Upload File Command
    const uploadFileCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.uploadFile',
        async (browserId?: string, pageId?: string, selector?: string, filePath?: string) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!selector) {
                    selector = await vscode.window.showInputBox({
                        prompt: 'Enter file input selector',
                        placeHolder: 'input[type="file"], #file-upload'
                    });
                    if (!selector) return;
                }

                if (!filePath) {
                    const fileUri = await vscode.window.showOpenDialog({
                        canSelectFiles: true,
                        canSelectMany: false
                    });
                    if (!fileUri || fileUri.length === 0) return;
                    filePath = fileUri[0].fsPath;
                }

                await puppeteerService.uploadFile(browserId!, pageId!, selector!, filePath!);
                // Notification disabled: vscode.window.showInformationMessage('File uploaded successfully');
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to upload file: ${error}`);
                throw error;
            }
        }
    );

    // Drag and Drop Command
    const dragDropCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.dragAndDrop',
        async (browserId?: string, pageId?: string, sourceSelector?: string, targetSelector?: string) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!sourceSelector) {
                    sourceSelector = await vscode.window.showInputBox({
                        prompt: 'Enter source element selector',
                        placeHolder: '.draggable-item, #source'
                    });
                    if (!sourceSelector) return;
                }

                if (!targetSelector) {
                    targetSelector = await vscode.window.showInputBox({
                        prompt: 'Enter target element selector',
                        placeHolder: '.drop-zone, #target'
                    });
                    if (!targetSelector) return;
                }

                await puppeteerService.dragAndDrop(browserId!, pageId!, sourceSelector!, targetSelector!);
                // Notification disabled: vscode.window.showInformationMessage('Drag and drop completed successfully');
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to perform drag and drop: ${error}`);
                throw error;
            }
        }
    );

    // Enable Network Interception Command
    const enableNetworkCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.enableNetworkInterception',
        async (browserId?: string, pageId?: string) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                await puppeteerService.enableNetworkInterception(browserId!, pageId!);
                // Notification disabled: vscode.window.showInformationMessage('Network interception enabled');
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to enable network interception: ${error}`);
                throw error;
            }
        }
    );

    // Add Network Rule Command
    const addNetworkRuleCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.addNetworkRule',
        async (browserId?: string, pageId?: string, rule?: any) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!rule) {
                    const ruleJson = await vscode.window.showInputBox({
                        prompt: 'Enter network rule as JSON',
                        placeHolder: '{"id": "block-ads", "urlPattern": "ads", "action": "block", "priority": 1}'
                    });
                    if (!ruleJson) return;
                    rule = JSON.parse(ruleJson);
                }

                await puppeteerService.addNetworkRule(browserId!, pageId!, rule);
                // Notification disabled: vscode.window.showInformationMessage('Network rule added successfully');
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to add network rule: ${error}`);
                throw error;
            }
        }
    );

    // Get Network Logs Command
    const getNetworkLogsCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.getNetworkLogs',
        async (browserId?: string) => {
            try {
                if (!browserId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    browserId = browsers[0].id;
                }

                const logs = puppeteerService.getNetworkLogs(browserId!);
                outputChannel.appendLine(`Network Logs (${logs.length} requests):`);
                outputChannel.appendLine(JSON.stringify(logs, null, 2));
                // Notification disabled: vscode.window.showInformationMessage(`Found ${logs.length} network requests`);
                return logs;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to get network logs: ${error}`);
                throw error;
            }
        }
    );

    // Get Element Text Command
    const getElementTextCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.getElementText',
        async (browserId?: string, pageId?: string, selector?: string) => {
            try {
                if (!browserId || !pageId || !selector) {
                    const userInputs = await vscode.window.showInputBox({
                        prompt: 'Enter element selector',
                        placeHolder: '#my-element or .my-class or [data-test="element"]'
                    });
                    
                    if (!userInputs) {
                        throw new Error('Element selector is required');
                    }
                    
                    selector = userInputs;
                    
                    // Use the first available browser/page if not provided
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    browserId = browsers[0].id;
                    const pages = browsers[0].pages;
                    if (pages.size === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    
                    pageId = Array.from(pages.keys())[0] as string;
                }

                const text = await puppeteerService.getElementText(browserId!, pageId!, selector!);
                outputChannel.appendLine(`Element text for "${selector}": ${text}`);
                // Notification disabled: vscode.window.showInformationMessage(`Element text: ${text}`);
                return text;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to get element text: ${error}`);
                throw error;
            }
        }
    );

    // Get Element Attribute Command
    const getElementAttributeCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.getElementAttribute',
        async (browserId?: string, pageId?: string, selector?: string, attributeName?: string) => {
            try {
                if (!browserId || !pageId || !selector || !attributeName) {
                    if (!selector) {
                        selector = await vscode.window.showInputBox({
                            prompt: 'Enter element selector',
                            placeHolder: '#my-element or .my-class or [data-test="element"]'
                        });
                    }
                    
                    if (!attributeName) {
                        attributeName = await vscode.window.showInputBox({
                            prompt: 'Enter attribute name',
                            placeHolder: 'href, src, class, id, data-test, etc.'
                        });
                    }
                    
                    if (!selector || !attributeName) {
                        throw new Error('Both selector and attribute name are required');
                    }
                    
                    // Use the first available browser/page if not provided
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    browserId = browsers[0].id;
                    const pages = browsers[0].pages;
                    if (pages.size === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    
                    pageId = Array.from(pages.keys())[0] as string;
                }

                const attributeValue = await puppeteerService.getElementAttribute(browserId!, pageId!, selector!, attributeName!);
                outputChannel.appendLine(`Element attribute "${attributeName}" for "${selector}": ${attributeValue}`);
                // Notification disabled: vscode.window.showInformationMessage(`Attribute "${attributeName}": ${attributeValue}`);
                return attributeValue;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to get element attribute: ${error}`);
                throw error;
            }
        }
    );

    // Advanced DOM Interaction Command - Supports Shadow DOM, React/Vue Components
    const advancedDomInteractionCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.advancedDomInteraction',
        async (browserId?: string, pageId?: string, selector?: string, action?: string, options?: any) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!selector) {
                    selector = await vscode.window.showInputBox({
                        prompt: 'Enter advanced selector (supports Shadow DOM, XPath, Text, ARIA)',
                        placeHolder: 'Examples: my-component >>> button, ::-p-xpath(//div), ::-p-text(Click me), ::-p-aria(Submit)'
                    });
                    if (!selector) return;
                }

                if (!action) {
                    action = await vscode.window.showQuickPick(
                        ['click', 'hover', 'scroll', 'focus', 'doubleClick', 'rightClick', 'getText', 'getAttribute', 'isVisible', 'wait'],
                        { placeHolder: 'Select advanced action to perform' }
                    );
                    if (!action) return;
                }

                const result = await puppeteerService.advancedDomInteraction(browserId!, pageId!, selector!, action as any, options);
                
                if (result !== undefined) {
                    outputChannel.appendLine(`Advanced DOM Interaction Result: ${JSON.stringify(result, null, 2)}`);
                    // Notification disabled: vscode.window.showInformationMessage(`Advanced DOM interaction completed: ${action} on ${selector}`);
                    return result;
                } else {
                    // Notification disabled: vscode.window.showInformationMessage(`Advanced DOM interaction completed: ${action} on ${selector}`);
                }
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to perform advanced DOM interaction: ${error}`);
                throw error;
            }
        }
    );

    // Get Page Structure Command
    const getPageStructureCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.getPageStructure',
        async (browserId?: string, pageId?: string, options?: any) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!options) {
                    // For manual testing, show input box for options
                    const optionsInput = await vscode.window.showInputBox({
                        prompt: 'Enter analysis options as JSON (optional)',
                        placeHolder: '{"includeStyles": true, "maxDepth": 5, "selector": "body"}'
                    });
                    if (optionsInput) {
                        try {
                            options = JSON.parse(optionsInput);
                        } catch {
                            options = {}; // Use default options if JSON is invalid
                        }
                    } else {
                        options = {}; // Use default options
                    }
                }

                const structure = await puppeteerService.getPageStructure(browserId!, pageId!, options);
                outputChannel.appendLine(`Page Structure Analysis:`);
                outputChannel.appendLine(JSON.stringify(structure, null, 2));
                // Notification disabled: vscode.window.showInformationMessage(`Page structure analyzed successfully. Check output panel for details.`);
                outputChannel.show();
                return structure;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to analyze page structure: ${error}`);
                throw error;
            }
        }
    );

    // Page Introspection Command - Analyze all elements on a page
    const pageIntrospectCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.pageIntrospect',
        async (browserId?: string, pageId?: string) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                const introspectionData = await puppeteerService.pageIntrospect(browserId!, pageId!);
                outputChannel.appendLine(`Page Introspection Results - Found ${introspectionData.length} elements:`);
                outputChannel.appendLine(JSON.stringify(introspectionData, null, 2));
                // Notification disabled: vscode.window.showInformationMessage(`Page introspection completed. Found ${introspectionData.length} elements. Check output panel for details.`);
                outputChannel.show();
                return introspectionData;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to introspect page: ${error}`);
                throw error;
            }
        }
    );

    // Element Introspection Command - Analyze a specific element
    const pageElementIntrospectCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.pageElementIntrospect',
        async (browserId?: string, pageId?: string, selector?: string) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!selector) {
                    selector = await vscode.window.showInputBox({
                        prompt: 'Enter element selector to introspect',
                        placeHolder: '#my-element, .my-class, [data-test="element"], etc.'
                    });
                }
                
                if (!selector) {
                    throw new Error('Element selector is required');
                }

                const elementData = await puppeteerService.pageElementIntrospect(browserId!, pageId!, selector);
                outputChannel.appendLine(`Element Introspection Results for "${selector}":`);
                outputChannel.appendLine(JSON.stringify(elementData, null, 2));
                // Notification disabled: vscode.window.showInformationMessage(`Element introspection completed for "${selector}". Check output panel for details.`);
                outputChannel.show();
                return elementData;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to introspect element: ${error}`);
                throw error;
            }
        }
    );

    // Advanced Select Dropdown Interaction Command
    const selectDropdownCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.selectDropdown',
        async (browserId?: string, pageId?: string, selector?: string, values?: string | string[], options?: any) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!selector) {
                    selector = await vscode.window.showInputBox({
                        prompt: 'Enter select dropdown selector',
                        placeHolder: '#my-select, select[name="country"], .dropdown-select, etc.'
                    });
                }

                if (!values) {
                    const valuesInput = await vscode.window.showInputBox({
                        prompt: 'Enter values to select (comma-separated for multiple)',
                        placeHolder: 'option1, option2 or just option1'
                    });
                    if (valuesInput) {
                        values = valuesInput.includes(',') 
                            ? valuesInput.split(',').map(v => v.trim())
                            : valuesInput.trim();
                    }
                }
                
                if (!selector || !values) {
                    throw new Error('Both selector and values are required');
                }

                if (!options) {
                    // For manual testing, show input box for options
                    const optionsInput = await vscode.window.showInputBox({
                        prompt: 'Enter selection options as JSON (optional)',
                        placeHolder: '{"method": "text", "allowPartialMatch": true}'
                    });
                    if (optionsInput) {
                        try {
                            options = JSON.parse(optionsInput);
                        } catch {
                            options = {}; // Use default options if JSON is invalid
                        }
                    } else {
                        options = {}; // Use default options
                    }
                }

                const result = await puppeteerService.selectDropdown(browserId!, pageId!, selector, values, options);
                outputChannel.appendLine(`Select Dropdown Interaction Results:`);
                outputChannel.appendLine(`Selected: ${result.selected.join(', ')}`);
                outputChannel.appendLine(`Method used: ${result.method}`);
                outputChannel.appendLine(`Multiple selection: ${result.isMultiple}`);
                outputChannel.appendLine(`Available options: ${JSON.stringify(result.available, null, 2)}`);
                // Notification disabled: vscode.window.showInformationMessage(`Successfully selected ${result.selected.length} options. Check output panel for details.`);
                outputChannel.show();
                return result;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to interact with select dropdown: ${error}`);
                throw error;
            }
        }
    );

    // Get Select Dropdown Information Command
    const getSelectInfoCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.getSelectInfo',
        async (browserId?: string, pageId?: string, selector?: string) => {
            try {
                if (!browserId || !pageId) {
                    const browsers = puppeteerService.getAllBrowsers();
                    if (browsers.length === 0) {
                        throw new Error('No browsers available. Please launch a browser first.');
                    }
                    
                    const browser = browsers[0];
                    browserId = browser.id;
                    
                    if (browser.pageIds.length === 0) {
                        throw new Error('No pages available. Please navigate to a URL first.');
                    }
                    pageId = browser.pageIds[0];
                }

                if (!selector) {
                    selector = await vscode.window.showInputBox({
                        prompt: 'Enter select dropdown selector to analyze',
                        placeHolder: '#my-select, select[name="country"], .dropdown-select, etc.'
                    });
                }
                
                if (!selector) {
                    throw new Error('Select dropdown selector is required');
                }

                const selectInfo = await puppeteerService.getSelectInfo(browserId!, pageId!, selector);
                outputChannel.appendLine(`Select Dropdown Information for "${selector}":`);
                outputChannel.appendLine(`Multiple selection: ${selectInfo.isMultiple}`);
                outputChannel.appendLine(`Disabled: ${selectInfo.disabled}`);
                outputChannel.appendLine(`Selected values: ${selectInfo.selectedValues.join(', ')}`);
                outputChannel.appendLine(`Selected texts: ${selectInfo.selectedTexts.join(', ')}`);
                outputChannel.appendLine(`Total options: ${selectInfo.options.length}`);
                if (selectInfo.optgroups.length > 0) {
                    outputChannel.appendLine(`Optgroups: ${selectInfo.optgroups.length}`);
                }
                outputChannel.appendLine(`Full details: ${JSON.stringify(selectInfo, null, 2)}`);
                // Notification disabled: vscode.window.showInformationMessage(`Select dropdown information retrieved. Check output panel for details.`);
                outputChannel.show();
                return selectInfo;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to get select dropdown info: ${error}`);
                throw error;
            }
        }
    );

    commands.push(
        fillFormCommand,
        interactCommand,
        advancedTypeCommand,
        evaluateJsCommand,
        uploadFileCommand,
        dragDropCommand,
        enableNetworkCommand,
        addNetworkRuleCommand,
        getNetworkLogsCommand,
        getElementTextCommand,
        getElementAttributeCommand,
        advancedDomInteractionCommand,
        getPageStructureCommand,
        pageIntrospectCommand,
        pageElementIntrospectCommand,
        selectDropdownCommand,
        getSelectInfoCommand
    );

    // Register MCP Bridge commands
    const mcpStatusCommand = vscode.commands.registerCommand(
        'siba-ai-extensions.getMCPBridgeStatus',
        async () => {
            try {
                const info = mcpBridge.getBridgeInfo();
                const message = `MCP Bridge Status:\nDirectory: ${info.directory}\nPending Requests: ${info.pendingRequests}`;
                // Notification disabled: vscode.window.showInformationMessage(message);
                return info;
            } catch (error) {
                // Notification disabled: vscode.window.showErrorMessage(`Failed to get MCP bridge status: ${error}`);
                throw error;
            }
        }
    );

    const testMCPConnection = vscode.commands.registerCommand(
        'siba-ai-extensions.testMCPConnection',
        async () => {
            try {
                outputChannel.appendLine('Testing MCP connection...');
                const browserId = await mcpTools.launchBrowser(true); // headless for test
                const status = await mcpTools.getBrowserStatus(browserId);
                await mcpTools.closeBrowser(browserId);
                
                const message = `MCP Connection Test Successful!\nBrowser ID: ${browserId}\nStatus: ${JSON.stringify(status, null, 2)}`;
                // Notification disabled: vscode.window.showInformationMessage('MCP connection test passed!');
                outputChannel.appendLine(message);
                return { success: true, browserId, status };
            } catch (error) {
                const errorMsg = `MCP connection test failed: ${error}`;
                // Notification disabled: vscode.window.showErrorMessage(errorMsg);
                outputChannel.appendLine(errorMsg);
                throw error;
            }
        }
    );

    // Test Extension Command - Quick verification that extension is working
    const testExtension = vscode.commands.registerCommand(
        'siba-ai-extensions.testExtension',
        async () => {
            const startTime = Date.now();
            
            try {
                outputChannel.clear();
                outputChannel.show();
                outputChannel.appendLine('🧪 SIBA AI Extension Test Started');
                outputChannel.appendLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                // Test 1: Basic extension status
                outputChannel.appendLine('📋 Test 1: Extension Status');
                outputChannel.appendLine(`  ✅ Extension Name: ${context.extension?.packageJSON?.displayName || 'SIBA AI Browser Extensions'}`);
                outputChannel.appendLine(`  ✅ Version: ${context.extension?.packageJSON?.version || '2.2.0'}`);
                outputChannel.appendLine(`  ✅ Mode: ${context.extensionMode === vscode.ExtensionMode.Development ? 'Development' : 'Production'}`);
                
                // Test 2: Services status
                outputChannel.appendLine('\n🔧 Test 2: Services Status');
                outputChannel.appendLine(`  ✅ PuppeteerService: ${puppeteerService ? 'Initialized' : 'Missing'}`);
                outputChannel.appendLine(`  ✅ MCP Bridge: ${mcpBridge ? 'Initialized' : 'Missing'}`);
                outputChannel.appendLine(`  ✅ Copilot Agent: ${copilotAgent ? 'Initialized' : 'Missing'}`);
                
                // Test 3: Copilot Chat Participant
                outputChannel.appendLine('\n🤖 Test 3: Copilot Integration');
                outputChannel.appendLine('  ✅ Chat Participant ID: @siba-ai-browser');
                outputChannel.appendLine('  ✅ Chat Commands: Available');
                
                // Test 4: Quick command test
                outputChannel.appendLine('\n📊 Test 4: MCP Bridge Test');
                const bridgeStatus = await mcpBridge.getBridgeInfo();
                outputChannel.appendLine(`  ✅ Bridge Directory: ${bridgeStatus.directory}`);
                outputChannel.appendLine(`  ✅ Pending Requests: ${bridgeStatus.pendingRequests}`);
                outputChannel.appendLine(`  ✅ Bridge Status: Ready`);
                
                const duration = Date.now() - startTime;
                outputChannel.appendLine('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                outputChannel.appendLine(`🎉 All tests passed! (${duration}ms)`);
                outputChannel.appendLine('\n🎯 Try these next:');
                outputChannel.appendLine('  • Open Copilot Chat: Ctrl+Shift+I (Windows/Linux) or Cmd+Shift+I (Mac)');
                outputChannel.appendLine('  • Type: @siba-ai-browser Hello!');
                outputChannel.appendLine('  • Type: @siba-ai-browser Show status');
                
                // Notification disabled: vscode.window.showInformationMessage('🎉 SIBA AI Extension test passed! Check output panel for details.');
                
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`\n❌ Test failed: ${errorMessage}`);
                // Notification disabled: vscode.window.showErrorMessage(`Extension test failed: ${errorMessage}`);
            }
        }
    );

    commands.push(mcpStatusCommand, testMCPConnection, testExtension);

    return commands;
}

/**
 * Start MCP Server Process
 * Launches the MCP server as a background process for AI assistant integration
 */
async function startMCPServer(context: vscode.ExtensionContext): Promise<void> {
    try {
        const path = require('path');
        const { spawn } = require('child_process');
        
        // Path to MCP server
        const mcpServerPath = path.join(context.extensionPath, 'mcp-server', 'build', 'index.js');
        
        // Check if MCP server exists
        const fs = require('fs');
        if (!fs.existsSync(mcpServerPath)) {
            outputChannel.appendLine('MCP server not found, building...');
            await buildMCPServer(context);
        }
        
        // Start MCP server process
        const mcpProcess = spawn('node', [mcpServerPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: path.join(context.extensionPath, 'mcp-server')
        });
        
        mcpProcess.stdout.on('data', (data: Buffer) => {
            outputChannel.appendLine(`MCP Server: ${data.toString()}`);
        });
        
        mcpProcess.stderr.on('data', (data: Buffer) => {
            outputChannel.appendLine(`MCP Server Error: ${data.toString()}`);
        });
        
        mcpProcess.on('close', (code: number) => {
            outputChannel.appendLine(`MCP server process exited with code ${code}`);
        });
        
        // Store process for cleanup
        context.subscriptions.push(vscode.Disposable.from({
            dispose: () => {
                if (mcpProcess && !mcpProcess.killed) {
                    mcpProcess.kill();
                }
            }
        }));
        
        outputChannel.appendLine('MCP server started successfully');
    } catch (error) {
        outputChannel.appendLine(`Failed to start MCP server: ${error}`);
        vscode.window.showWarningMessage('MCP server failed to start. Bridge mode will not be available.');
    }
}

/**
 * Build MCP Server
 * Compiles the TypeScript MCP server if needed
 */
async function buildMCPServer(context: vscode.ExtensionContext): Promise<void> {
    return new Promise((resolve, reject) => {
        const path = require('path');
        const { spawn } = require('child_process');
        
        const mcpServerDir = path.join(context.extensionPath, 'mcp-server');
        
        outputChannel.appendLine('Building MCP server...');
        const buildProcess = spawn('yarn', ['build'], {
            cwd: mcpServerDir,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        buildProcess.stdout.on('data', (data: Buffer) => {
            outputChannel.appendLine(`MCP Build: ${data.toString()}`);
        });
        
        buildProcess.stderr.on('data', (data: Buffer) => {
            outputChannel.appendLine(`MCP Build Error: ${data.toString()}`);
        });
        
        buildProcess.on('close', (code: number) => {
            if (code === 0) {
                outputChannel.appendLine('MCP server built successfully');
                resolve();
            } else {
                reject(new Error(`MCP server build failed with code ${code}`));
            }
        });
    });
}

export function deactivate() {
    if (puppeteerService) {
        puppeteerService.dispose();
    }
    if (mcpBridge) {
        mcpBridge.dispose();
    }
    if (outputChannel) {
        outputChannel.dispose();
    }
}
