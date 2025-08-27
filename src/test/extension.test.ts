import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('SIBA AI Puppeteer Extension Test Suite', () => {
	vscode.window.showInformationMessage('Starting Puppeteer extension tests...');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('siba-tech.siba-ai-extensions'));
	});

	test('Commands should be registered', async () => {
		// Ensure extension is fully activated
		const extension = vscode.extensions.getExtension('siba-tech.siba-ai-extensions');
		if (extension && !extension.isActive) {
			console.log('Activating extension...');
			await extension.activate();
		}
		
		// Wait a moment for command registration to complete
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		const commands = await vscode.commands.getCommands(true);
		
		const expectedCommands = [
			'siba-ai-extensions.launchBrowser',
			'siba-ai-extensions.launchBrowserHeadless',
			'siba-ai-extensions.navigateToUrl',
			'siba-ai-extensions.takeScreenshot',
			'siba-ai-extensions.getBrowserStatus',
			'siba-ai-extensions.closeBrowser'
		];

		// Debug: Check if our commands are in the list
		const ourCommands = commands.filter(cmd => cmd.startsWith('siba-ai-extensions.'));
		console.log('Found SIBA AI commands:', ourCommands);

		for (const command of expectedCommands) {
			assert.ok(commands.includes(command), `Command ${command} should be registered`);
		}
	});

	test('Headless Browser Integration Test', async function() {
		this.timeout(30000); // 30 second timeout for browser operations

		let browserId: string | undefined;
		
		try {
			// Test 1: Launch Headless Browser
			console.log('Testing headless browser launch...');
			browserId = await vscode.commands.executeCommand('siba-ai-extensions.launchBrowserHeadless');
			assert.ok(browserId, 'Headless browser should launch and return an ID');
			assert.ok(typeof browserId === 'string', 'Browser ID should be a string');

			// Test 2: Navigate to test page
			console.log('Testing navigation in headless mode...');
			const studentFormPath = path.join(__dirname, '..', '..', 'student-form-test.html');
			const studentFormUrl = `file://${studentFormPath}`;
			
			const navResult = await vscode.commands.executeCommand('siba-ai-extensions.navigateToUrl', browserId, studentFormUrl);
			assert.ok(navResult, 'Navigation should return result in headless mode');
			assert.ok((navResult as any).pageId, 'Navigation should return page ID in headless mode');

			// Test 3: Take screenshot in headless mode
			console.log('Testing headless screenshot...');
			const screenshotResult = await vscode.commands.executeCommand('siba-ai-extensions.takeScreenshot', browserId, (navResult as any).pageId);
			assert.ok(screenshotResult, 'Screenshot should be captured in headless mode');
			assert.ok(typeof screenshotResult === 'string', 'Screenshot should be base64 string in headless mode');
			assert.ok(screenshotResult.length > 0, 'Screenshot should have content in headless mode');

			console.log('All headless Puppeteer tests passed! ✅');

		} catch (error) {
			console.error('Headless test failed:', error);
			throw error;
		} finally {
			// Cleanup: Close browser if it was opened
			if (browserId) {
				try {
					await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
					console.log('Headless browser cleaned up successfully');
				} catch (cleanupError) {
					console.warn('Failed to cleanup headless browser:', cleanupError);
				}
			}
		}
	});

	test('Puppeteer Integration Test', async function() {
		this.timeout(30000); // 30 second timeout for browser operations

		let browserId: string | undefined;
		
		try {
			// Test 1: Launch Browser
			console.log('Testing browser launch...');
			browserId = await vscode.commands.executeCommand('siba-ai-extensions.launchBrowser');
			assert.ok(browserId, 'Browser should launch and return an ID');
			assert.ok(typeof browserId === 'string', 'Browser ID should be a string');

			// Test 2: Navigate to test page
			console.log('Testing navigation...');
			const studentFormPath = path.join(__dirname, '..', '..', 'student-form-test.html');
			const studentFormUrl = `file://${studentFormPath}`;
			
			const navResult = await vscode.commands.executeCommand('siba-ai-extensions.navigateToUrl', browserId, studentFormUrl);
			assert.ok(navResult, 'Navigation should return result');
			assert.ok((navResult as any).pageId, 'Navigation should return page ID');

			// Test 3: Take screenshot
			console.log('Testing screenshot...');
			const screenshotResult = await vscode.commands.executeCommand('siba-ai-extensions.takeScreenshot', browserId, (navResult as any).pageId);
			assert.ok(screenshotResult, 'Screenshot should be captured');
			assert.ok(typeof screenshotResult === 'string', 'Screenshot should be base64 string');
			assert.ok(screenshotResult.length > 0, 'Screenshot should have content');

			// Test 4: Get browser status
			console.log('Testing browser status...');
			const statusResult = await vscode.commands.executeCommand('siba-ai-extensions.getBrowserStatus');
			assert.ok(statusResult, 'Status should return information');

			console.log('All Puppeteer tests passed! ✅');

		} catch (error) {
			console.error('Test failed:', error);
			throw error;
		} finally {
			// Cleanup: Close browser if it was opened
			if (browserId) {
				try {
					await vscode.commands.executeCommand('siba-ai-extensions.closeBrowser', browserId);
					console.log('Browser cleaned up successfully');
				} catch (cleanupError) {
					console.warn('Failed to cleanup browser:', cleanupError);
				}
			}
		}
	});

	test('Error handling test', async function() {
		this.timeout(10000);

		try {
			// Test invalid browser ID
			await assert.rejects(
				async () => await vscode.commands.executeCommand('siba-ai-extensions.navigateToUrl', 'invalid-id', 'https://example.com'),
				'Should reject with invalid browser ID'
			);

			console.log('Error handling tests completed');
		} catch (error) {
			console.error('Error handling test failed:', error);
			throw error;
		}
	});
});
