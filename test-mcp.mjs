#!/usr/bin/env node

/**
 * Simple test script to verify MCP tools are working
 */

import { execSync } from 'child_process';

function testMCPServer() {
    console.log('🧪 Testing MCP Server...');
    
    try {
        // Test 1: List tools
        console.log('\n1. Testing tools/list...');
        const listCommand = 'echo \'{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}\' | node ./mcp-server/build/index.js';
        const listResult = execSync(listCommand, { encoding: 'utf8', timeout: 10000 });
        console.log('Raw output:', listResult);
        
        const listLines = listResult.trim().split('\n').filter(line => line.trim().length > 0);
        console.log('Lines:', listLines);
        
        // Find the JSON response line (should start with {)
        const jsonLine = listLines.find(line => line.trim().startsWith('{'));
        if (!jsonLine) {
            throw new Error('No JSON response found in output');
        }
        
        const listResponse = JSON.parse(jsonLine);
        
        console.log(`✅ Found ${listResponse.result.tools.length} tools`);
        
        // Test 2: Get browser status (should work without needing browser)
        console.log('\n2. Testing siba_ai_get_browser_status...');
        const statusCommand = 'echo \'{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "siba_ai_get_browser_status", "arguments": {}}}\' | node ./mcp-server/build/index.js';
        const statusResult = execSync(statusCommand, { encoding: 'utf8', timeout: 30000 });
        const statusLines = statusResult.trim().split('\n');
        const statusResponse = JSON.parse(statusLines[1]);
        
        if (statusResponse.result) {
            console.log('✅ MCP command bridge is working!');
            console.log('📄 Result:', statusResponse.result.content[0].text);
        } else if (statusResponse.error) {
            console.log('❌ MCP command failed:', statusResponse.error.message);
        }
        
        console.log('\n🎉 MCP Server test completed!');
        
    } catch (error) {
        console.error('❌ MCP Server test failed:', error.message);
        if (error.stdout) {
            console.error('📤 stdout:', error.stdout);
        }
        if (error.stderr) {
            console.error('📥 stderr:', error.stderr);
        }
    }
}

testMCPServer();
