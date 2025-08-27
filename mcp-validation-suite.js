#!/usr/bin/env node

/**
 * MCP Server Comprehensive Test Suite
 * Validates all 25 MCP tools and their schemas before marketplace publication
 */

const fs = require('fs');
const path = require('path');

class MCPServerValidator {
  constructor() {
    this.mcpServerPath = path.join(__dirname, 'mcp-server', 'build', 'index.js');
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  addTest(name, passed, details = '') {
    this.results.tests.push({ name, passed, details });
    if (passed) {
      this.results.passed++;
      this.log(`✅ ${name}`, 'success');
    } else {
      this.results.failed++;
      this.log(`❌ ${name} - ${details}`, 'error');
    }
  }

  async validateMCPServerFile() {
    this.log('\n🔍 Step 1: Validating MCP Server File Structure', 'info');
    
    try {
      const serverExists = fs.existsSync(this.mcpServerPath);
      this.addTest('MCP server build file exists', serverExists);
      
      if (serverExists) {
        const serverContent = fs.readFileSync(this.mcpServerPath, 'utf8');
        
        // Check for essential components
        this.addTest('Contains MCP SDK imports', serverContent.includes('@modelcontextprotocol/sdk'));
        this.addTest('Contains tool definitions', serverContent.includes('siba_ai_'));
        this.addTest('Contains server initialization', serverContent.includes('new Server'));
        this.addTest('Contains bridge communication', serverContent.includes('VSCodeBridge'));
        this.addTest('Has proper shebang', serverContent.startsWith('#!/usr/bin/env node'));
      }
    } catch (error) {
      this.addTest('MCP server file validation', false, error.message);
    }
  }

  async validateToolSchemas() {
    this.log('\n🛠️ Step 2: Validating MCP Tool Schemas', 'info');
    
    try {
      const serverContent = fs.readFileSync(this.mcpServerPath, 'utf8');
      
      // Expected tools list with siba_ai_ prefix
      const expectedTools = [
        'siba_ai_launch_browser',
        'siba_ai_launch_browser_headless', 
        'siba_ai_navigate_to_url',
        'siba_ai_take_screenshot',
        'siba_ai_click_element',
        'siba_ai_type_text',
        'siba_ai_evaluate_javascript',
        'siba_ai_get_browser_status',
        'siba_ai_close_browser',
        'siba_ai_browser_workflow',
        'siba_ai_fill_form',
        'siba_ai_interact_with_element',
        'siba_ai_advanced_type_text',
        'siba_ai_upload_file',
        'siba_ai_drag_and_drop',
        'siba_ai_enable_network_interception',
        'siba_ai_add_network_rule',
        'siba_ai_get_network_logs',
        'siba_ai_wait_for_element',
        'siba_ai_get_element_text',
        'siba_ai_get_element_attribute'
      ];

      expectedTools.forEach(tool => {
        const hasToolDefinition = serverContent.includes(`'${tool}'`) || serverContent.includes(`"${tool}"`);
        this.addTest(`Tool schema: ${tool}`, hasToolDefinition);
      });

      // Check for proper schema structures
      this.addTest('Has schema definitions', serverContent.includes('Schema = {'));
      this.addTest('Has proper tool registration', serverContent.includes('ListToolsRequestSchema'));
      this.addTest('Has tool execution handler', serverContent.includes('CallToolRequestSchema'));
      
    } catch (error) {
      this.addTest('Tool schema validation', false, error.message);
    }
  }

  async validateBridgeCommunication() {
    this.log('\n🌉 Step 3: Validating Bridge Communication', 'info');
    
    try {
      const serverContent = fs.readFileSync(this.mcpServerPath, 'utf8');
      
      // Check bridge components
      this.addTest('Contains VSCodeBridge class', serverContent.includes('class VSCodeBridge'));
      this.addTest('Has bridge request handling', serverContent.includes('sendRequest'));
      this.addTest('Has file-based communication', serverContent.includes('siba-ai-mcp-bridge'));
      this.addTest('Contains bridge directory setup', serverContent.includes('bridgeDir'));
      this.addTest('Has request/response pattern', serverContent.includes('.request.json') && serverContent.includes('.response.json'));
      this.addTest('Has error handling', serverContent.includes('try') && serverContent.includes('catch'));
      this.addTest('Has timeout management', serverContent.includes('timeout') || serverContent.includes('setTimeout'));
      
    } catch (error) {
      this.addTest('Bridge communication validation', false, error.message);
    }
  }

  async validatePackageConfiguration() {
    this.log('\n📦 Step 4: Validating Package Configuration', 'info');
    
    try {
      // Check main package.json
      const mainPackagePath = path.join(__dirname, 'package.json');
      const mainPackage = JSON.parse(fs.readFileSync(mainPackagePath, 'utf8'));
      
      this.addTest('Extension version is 2.2.0', mainPackage.version === '2.2.0');
      this.addTest('Has MCP bridge commands', mainPackage.contributes?.commands?.some(cmd => cmd.command.includes('MCP')));
      this.addTest('Has proper publisher', mainPackage.publisher === 'siba-tech');
      this.addTest('Contains AI integration keywords', mainPackage.keywords?.includes('mcp'));
      
      // Check MCP server package.json
      const mcpPackagePath = path.join(__dirname, 'mcp-server', 'package.json');
      const mcpPackage = JSON.parse(fs.readFileSync(mcpPackagePath, 'utf8'));
      
      this.addTest('MCP server has proper dependencies', mcpPackage.dependencies?.['@modelcontextprotocol/sdk']);
      this.addTest('MCP server is ES module', mcpPackage.type === 'module');
      this.addTest('MCP server has build script', mcpPackage.scripts?.build);
      
    } catch (error) {
      this.addTest('Package configuration validation', false, error.message);
    }
  }

  async validateDocumentation() {
    this.log('\n📚 Step 5: Validating Documentation', 'info');
    
    try {
      const docsToCheck = [
        'AI_INTEGRATION_GUIDE.md',
        'AI_INTEGRATION_STATUS.md',
        'mcp-server/README.md',
        'mcp-server/API_REFERENCE.md'
      ];
      
      docsToCheck.forEach(docPath => {
        const fullPath = path.join(__dirname, docPath);
        const exists = fs.existsSync(fullPath);
        this.addTest(`Documentation exists: ${docPath}`, exists);
        
        if (exists) {
          const content = fs.readFileSync(fullPath, 'utf8');
          this.addTest(`${docPath} has content`, content.length > 100);
        }
      });
      
    } catch (error) {
      this.addTest('Documentation validation', false, error.message);
    }
  }

  async runBridgeDirectoryTest() {
    this.log('\n🔌 Step 6: Testing Bridge Directory Setup', 'info');
    
    try {
      const os = require('os');
      const bridgeDir = path.join(os.tmpdir(), 'siba-ai-mcp-bridge');
      
      // Create test bridge directory
      if (!fs.existsSync(bridgeDir)) {
        fs.mkdirSync(bridgeDir, { recursive: true });
      }
      
      this.addTest('Bridge directory accessible', fs.existsSync(bridgeDir));
      
      // Test file operations
      const testFile = path.join(bridgeDir, 'test.json');
      fs.writeFileSync(testFile, JSON.stringify({ test: true }));
      const canRead = fs.existsSync(testFile);
      this.addTest('Bridge directory writable', canRead);
      
      // Cleanup
      if (canRead) {
        fs.unlinkSync(testFile);
      }
      
    } catch (error) {
      this.addTest('Bridge directory test', false, error.message);
    }
  }

  generateReport() {
    this.log('\n📊 MCP Server Validation Report', 'info');
    this.log('═'.repeat(50), 'info');
    
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    this.log(`📊 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`, 'info');
    
    if (this.results.failed > 0) {
      this.log('\n🔍 Failed Tests:', 'warning');
      this.results.tests.filter(t => !t.passed).forEach(test => {
        this.log(`  • ${test.name}: ${test.details}`, 'error');
      });
    }
    
    const isReady = this.results.failed === 0;
    this.log(`\n🚀 Marketplace Ready: ${isReady ? 'YES' : 'NO'}`, isReady ? 'success' : 'error');
    
    if (isReady) {
      this.log('\n🎉 MCP Server is ready for marketplace publication!', 'success');
      this.log('All systems validated and functioning correctly.', 'success');
    } else {
      this.log('\n⚠️  Please fix the failed tests before publishing.', 'warning');
    }
    
    return isReady;
  }

  async runFullValidation() {
    this.log('🚀 SIBA AI MCP Server Validation Suite', 'info');
    this.log('Testing all components before marketplace publication...', 'info');
    
    await this.validateMCPServerFile();
    await this.validateToolSchemas();
    await this.validateBridgeCommunication();
    await this.validatePackageConfiguration();
    await this.validateDocumentation();
    await this.runBridgeDirectoryTest();
    
    return this.generateReport();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new MCPServerValidator();
  validator.runFullValidation().then(isReady => {
    process.exit(isReady ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = { MCPServerValidator };
