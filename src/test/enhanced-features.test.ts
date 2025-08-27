import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';

suite('Enhanced Features Test Suite', () => {
    const testTimeout = 30000; // 30 seconds
    let extensionContext: vscode.ExtensionContext;
    
    suiteSetup(async function() {
        this.timeout(testTimeout);
        
        // Ensure extension is activated
        const extension = vscode.extensions.getExtension('siba-tech.siba-ai-extensions');
        if (extension && !extension.isActive) {
            await extension.activate();
        }
        
        // Wait a bit for activation to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    test('1. Enhanced Form Filling Test', async function() {
        this.timeout(testTimeout);
        
        console.log('Starting Enhanced Form Filling Test...');
        
        try {
            // Launch headless browser for automated testing
            const browserId = await vscode.commands.executeCommand(
                'siba-ai-extensions.launchBrowserHeadless'
            ) as string;
            
            assert.ok(browserId, 'Browser should be launched successfully');
            console.log(`✅ Browser launched: ${browserId}`);
            
            // Navigate to enhanced test page
            const testFilePath = path.join(__dirname, '..', '..', 'enhanced-features-test.html');
            const testUrl = `file://${testFilePath}`;
            
            const navResult = await vscode.commands.executeCommand(
                'siba-ai-extensions.navigateToUrl',
                browserId,
                testUrl
            ) as any;
            
            assert.ok(navResult.pageId, 'Should navigate to test page successfully');
            console.log(`✅ Navigated to: ${testUrl}`);
            
            // Test comprehensive form filling
            const formData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                country: 'us',
                skills: ['javascript', 'python', 'ai'],
                bio: 'Software developer with expertise in AI automation',
                newsletter: true,
                terms: true
            };
            
            await vscode.commands.executeCommand(
                'siba-ai-extensions.fillForm',
                browserId,
                navResult.pageId,
                formData
            );
            
            console.log('✅ Form filled with comprehensive data');
            
            // Take screenshot to verify form filling
            const screenshot = await vscode.commands.executeCommand(
                'siba-ai-extensions.takeScreenshot',
                browserId,
                navResult.pageId
            ) as string;
            
            assert.ok(screenshot.length > 1000, 'Screenshot should be substantial');
            console.log(`✅ Screenshot captured: ${screenshot.length} characters`);
            
            // Clean up
            await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
            console.log('✅ Enhanced Form Filling Test completed successfully');
            
        } catch (error) {
            console.error('❌ Enhanced Form Filling Test failed:', error);
            throw error;
        }
    });

    test('2. Advanced Element Interaction Test', async function() {
        this.timeout(testTimeout);
        
        console.log('Starting Advanced Element Interaction Test...');
        
        try {
            const browserId = await vscode.commands.executeCommand(
                'siba-ai-extensions.launchBrowserHeadless'
            ) as string;
            
            const testFilePath = path.join(__dirname, '..', '..', 'enhanced-features-test.html');
            const testUrl = `file://${testFilePath}`;
            
            const navResult = await vscode.commands.executeCommand(
                'siba-ai-extensions.navigateToUrl',
                browserId,
                testUrl
            ) as any;
            
            // Test various interaction types
            const interactions = [
                { selector: '#hover-me', action: 'hover' },
                { selector: '[data-testid="double-click-button"]', action: 'doubleClick' },
                { selector: '[data-testid="focus-button"]', action: 'focus' },
                { selector: '#css-selector-test', action: 'click' }
            ];
            
            for (const interaction of interactions) {
                await vscode.commands.executeCommand(
                    'siba-ai-extensions.interactWithElement',
                    browserId,
                    navResult.pageId,
                    interaction.selector,
                    interaction.action
                );
                console.log(`✅ Successfully performed ${interaction.action} on ${interaction.selector}`);
            }
            
            // Test ARIA selector interaction - use CSS attribute selector instead for reliability
            await vscode.commands.executeCommand(
                'siba-ai-extensions.interactWithElement',
                browserId,
                navResult.pageId,
                '[aria-label="ARIA selector test button"]',
                'click'
            );
            console.log('✅ ARIA selector interaction successful');
            
            await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
            console.log('✅ Advanced Element Interaction Test completed successfully');
            
        } catch (error) {
            console.error('❌ Advanced Element Interaction Test failed:', error);
            throw error;
        }
    });

    test('3. Advanced Text Input Test', async function() {
        this.timeout(testTimeout);
        
        console.log('Starting Advanced Text Input Test...');
        
        try {
            const browserId = await vscode.commands.executeCommand(
                'siba-ai-extensions.launchBrowserHeadless'
            ) as string;
            
            const testFilePath = path.join(__dirname, '..', '..', 'enhanced-features-test.html');
            const testUrl = `file://${testFilePath}`;
            
            const navResult = await vscode.commands.executeCommand(
                'siba-ai-extensions.navigateToUrl',
                browserId,
                testUrl
            ) as any;
            
            // Test advanced typing with options
            await vscode.commands.executeCommand(
                'siba-ai-extensions.advancedTypeText',
                browserId,
                navResult.pageId,
                '#interaction-input',
                'This is advanced typing with enhanced features!',
                {
                    clear: true,
                    delay: 50,
                    pressTab: true
                }
            );
            
            console.log('✅ Advanced text input with options successful');
            
            // Get the typed text to verify
            const typedText = await vscode.commands.executeCommand(
                'siba-ai-extensions.evaluateJavaScript',
                browserId,
                navResult.pageId,
                'document.getElementById("interaction-input").value'
            );
            
            assert.ok(typedText, 'Text should be successfully typed');
            console.log(`✅ Text verification successful: "${typedText}"`);
            
            await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
            console.log('✅ Advanced Text Input Test completed successfully');
            
        } catch (error) {
            console.error('❌ Advanced Text Input Test failed:', error);
            throw error;
        }
    });

    test('4. Enhanced JavaScript Execution Test', async function() {
        this.timeout(testTimeout);
        
        console.log('Starting Enhanced JavaScript Execution Test...');
        
        try {
            const browserId = await vscode.commands.executeCommand(
                'siba-ai-extensions.launchBrowserHeadless'
            ) as string;
            
            const testFilePath = path.join(__dirname, '..', '..', 'enhanced-features-test.html');
            const testUrl = `file://${testFilePath}`;
            
            const navResult = await vscode.commands.executeCommand(
                'siba-ai-extensions.navigateToUrl',
                browserId,
                testUrl
            ) as any;
            
            // Test complex JavaScript execution
            const complexScript = `
                // Test comprehensive DOM manipulation and data extraction
                const results = {
                    title: document.title,
                    buttonCount: document.querySelectorAll('button').length,
                    inputCount: document.querySelectorAll('input').length,
                    formData: {},
                    timestamp: new Date().toISOString()
                };
                
                // Extract form data
                const formElements = document.querySelectorAll('#test-form input, #test-form select, #test-form textarea');
                formElements.forEach(element => {
                    if (element.name) {
                        results.formData[element.name] = element.value || element.placeholder || '';
                    }
                });
                
                // Test sync operation instead of async
                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                return delay(100).then(() => results);
            `;
            
            const result = await vscode.commands.executeCommand(
                'siba-ai-extensions.evaluateJavaScript',
                browserId,
                navResult.pageId,
                complexScript
            ) as any;
            
            assert.ok(result, 'JavaScript execution should return results');
            assert.ok(result.title, 'Should extract page title');
            assert.ok(result.buttonCount > 0, 'Should count buttons');
            assert.ok(result.inputCount > 0, 'Should count inputs');
            
            console.log('✅ Complex JavaScript execution successful');
            console.log(`📊 Extracted data: ${JSON.stringify(result, null, 2)}`);
            
            await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
            console.log('✅ Enhanced JavaScript Execution Test completed successfully');
            
        } catch (error) {
            console.error('❌ Enhanced JavaScript Execution Test failed:', error);
            throw error;
        }
    });

    test('5. Network Interception Test', async function() {
        this.timeout(testTimeout);
        
        console.log('Starting Network Interception Test...');
        
        try {
            const browserId = await vscode.commands.executeCommand(
                'siba-ai-extensions.launchBrowserHeadless'
            ) as string;
            
            const testFilePath = path.join(__dirname, '..', '..', 'enhanced-features-test.html');
            const testUrl = `file://${testFilePath}`;
            
            const navResult = await vscode.commands.executeCommand(
                'siba-ai-extensions.navigateToUrl',
                browserId,
                testUrl
            ) as any;
            
            // Enable network interception
            await vscode.commands.executeCommand(
                'siba-ai-extensions.enableNetworkInterception',
                browserId,
                navResult.pageId
            );
            console.log('✅ Network interception enabled');
            
            // Add network rules
            const blockRule = {
                id: 'block-images',
                urlPattern: 'image',
                action: 'block',
                priority: 1
            };
            
            await vscode.commands.executeCommand(
                'siba-ai-extensions.addNetworkRule',
                browserId,
                navResult.pageId,
                blockRule
            );
            console.log('✅ Network rule added');
            
            // Trigger network requests via JavaScript
            await vscode.commands.executeCommand(
                'siba-ai-extensions.evaluateJavaScript',
                browserId,
                navResult.pageId,
                `
                    // Make test network requests
                    makeNetworkRequest();
                    loadTestImage();
                    
                    // Wait a bit for requests to complete using Promise
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve('Network requests triggered');
                        }, 2000);
                    });
                `
            );
            
            // Get network logs
            const networkLogs = await vscode.commands.executeCommand(
                'siba-ai-extensions.getNetworkLogs',
                browserId
            );
            
            assert.ok(Array.isArray(networkLogs), 'Should return network logs array');
            console.log(`✅ Network logs retrieved: ${networkLogs.length} requests`);
            
            await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
            console.log('✅ Network Interception Test completed successfully');
            
        } catch (error) {
            console.error('❌ Network Interception Test failed:', error);
            throw error;
        }
    });

    test('6. Element Data Extraction Test', async function() {
        this.timeout(testTimeout);
        
        console.log('Starting Element Data Extraction Test...');
        
        try {
            const browserId = await vscode.commands.executeCommand(
                'siba-ai-extensions.launchBrowserHeadless'
            ) as string;
            
            const testFilePath = path.join(__dirname, '..', '..', 'enhanced-features-test.html');
            const testUrl = `file://${testFilePath}`;
            
            const navResult = await vscode.commands.executeCommand(
                'siba-ai-extensions.navigateToUrl',
                browserId,
                testUrl
            ) as any;
            
            // Test element text extraction
            const headerText = await vscode.commands.executeCommand(
                'siba-ai-extensions.getElementText',
                browserId,
                navResult.pageId,
                'h1'
            );
            
            assert.ok(headerText, 'Should extract header text');
            console.log(`✅ Header text extracted: "${headerText}"`);
            
            // Test attribute extraction
            const buttonTestId = await vscode.commands.executeCommand(
                'siba-ai-extensions.getElementAttribute',
                browserId,
                navResult.pageId,
                '#hover-me',
                'data-testid'
            );
            
            assert.strictEqual(buttonTestId, 'hover-button', 'Should extract correct attribute value');
            console.log(`✅ Attribute extracted: ${buttonTestId}`);

            await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
            console.log('✅ Element Data Extraction Test completed successfully');
            
        } catch (error) {
            console.error('❌ Element Data Extraction Test failed:', error);
            throw error;
        }
    });

    test('7. Integration Test - Complete Workflow', async function() {
        this.timeout(testTimeout * 2); // Extended timeout for comprehensive test
        
        console.log('Starting Complete Workflow Integration Test...');
        
        try {
            const browserId = await vscode.commands.executeCommand(
                'siba-ai-extensions.launchBrowserHeadless'
            ) as string;
            
            const testFilePath = path.join(__dirname, '..', '..', 'enhanced-features-test.html');
            const testUrl = `file://${testFilePath}`;
            
            const navResult = await vscode.commands.executeCommand(
                'siba-ai-extensions.navigateToUrl',
                browserId,
                testUrl
            ) as any;
            
            console.log('✅ Step 1: Browser launched and navigated');
            
            // Step 2: Enable network monitoring
            await vscode.commands.executeCommand(
                'siba-ai-extensions.enableNetworkInterception',
                browserId,
                navResult.pageId
            );
            console.log('✅ Step 2: Network monitoring enabled');
            
            // Step 3: Fill comprehensive form
            const formData = {
                firstName: 'Integration',
                lastName: 'Test',
                email: 'integration@test.com',
                country: 'ca',
                bio: 'Complete workflow integration test user'
            };
            
            await vscode.commands.executeCommand(
                'siba-ai-extensions.fillForm',
                browserId,
                navResult.pageId,
                formData
            );
            console.log('✅ Step 3: Form filled');
            
            // Step 4: Test multiple element interactions
            await vscode.commands.executeCommand(
                'siba-ai-extensions.interactWithElement',
                browserId,
                navResult.pageId,
                '#hover-me',
                'hover'
            );
            
            await vscode.commands.executeCommand(
                'siba-ai-extensions.advancedTypeText',
                browserId,
                navResult.pageId,
                '#interaction-input',
                'Integration test input'
            );
            console.log('✅ Step 4: Element interactions completed');
            
            // Step 5: Execute comprehensive JavaScript
            const pageAnalysis = await vscode.commands.executeCommand(
                'siba-ai-extensions.evaluateJavaScript',
                browserId,
                navResult.pageId,
                `
                    return {
                        url: window.location.href,
                        title: document.title,
                        formsFilled: document.querySelectorAll('input').length,
                        buttonsAvailable: document.querySelectorAll('button').length,
                        sectionsCount: document.querySelectorAll('.section').length,
                        ready: document.readyState
                    };
                `
            ) as any;
            console.log('✅ Step 5: Page analysis completed');
            
            // Step 6: Take final screenshot
            const screenshot = await vscode.commands.executeCommand(
                'siba-ai-extensions.takeScreenshot',
                browserId,
                navResult.pageId
            ) as string;
            
            assert.ok(screenshot.length > 1000, 'Screenshot should capture page state');
            console.log('✅ Step 6: Final screenshot captured');
            
            // Step 7: Verify all data
            assert.ok(pageAnalysis.title.includes('SIBA AI'), 'Should have correct page title');
            assert.ok(pageAnalysis.formsFilled >= 5, 'Should have multiple form inputs');
            assert.ok(pageAnalysis.buttonsAvailable > 10, 'Should have multiple buttons');
            assert.strictEqual(pageAnalysis.ready, 'complete', 'Page should be fully loaded');
            
            console.log(`📊 Final Analysis: ${JSON.stringify(pageAnalysis, null, 2)}`);
            
            await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
            console.log('✅ Complete Workflow Integration Test completed successfully');
            
        } catch (error) {
            console.error('❌ Complete Workflow Integration Test failed:', error);
            throw error;
        }
    });

    suiteTeardown(async function() {
        console.log('🧹 Cleaning up test environment...');
        
        // Get all browsers and close them
        try {
            const browsers = await vscode.commands.executeCommand(
                'siba-ai-extensions.getBrowserStatus'
            ) as any[];
            
            for (const browser of browsers) {
                try {
                    await vscode.commands.executeCommand(
                        'siba-ai-extensions.closeBrowser',
                        browser.id
                    );
                } catch (error) {
                    console.warn(`Failed to close browser ${browser.id}:`, error);
                }
            }
        } catch (error) {
            console.warn('Failed to get browser status during cleanup:', error);
        }
        
        console.log('✨ Test cleanup completed');
    });
});
