# Change Log

All notable changes to the "siba-ai-extensions" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.2.1] - 2025-08-27

### 🔄 Repository Migration
- 📂 **GitHub Migration**: Migrated project from Azure DevOps to GitHub for better community access
- 🔗 **Updated Links**: All repository, issues, and license links now point to GitHub
- ☕ **Support Link**: Added "Buy Me a Coffee" link to support development
- 🏠 **New Home**: Repository now available at https://github.com/kwkau/siba-ai-browser

### Changed
- **Repository URLs**: Updated all references from Azure DevOps to GitHub
- **Issue Tracking**: Bug reports and feature requests now via GitHub Issues
- **Documentation**: Updated all development setup instructions with new repository links
- **Support Section**: Enhanced support section with direct GitHub links and coffee support

## [1.2.0] - 2025-08-06

### 🎯 Select Dropdown Automation Revolution
- 🎭 **Specialized Select Tools**: Advanced MCP tools for comprehensive select dropdown automation
- 🧠 **Intelligent Detection**: Auto-detection of selection methods (value → text → index fallback)
- 🎪 **Multiple Selection**: Full support for multi-select dropdowns with array value handling
- 🏗️ **Optgroup Support**: Handles grouped options correctly with proper navigation
- ⚡ **Dynamic Content**: Works with AJAX-loaded options using configurable wait times
- 🎨 **Framework Compatible**: Supports React, Vue, Angular applications with proper event triggering
- 🛡️ **Robust Error Handling**: Multiple fallback strategies and clear error reporting

### Added
- **VS Code Commands**:
  - `siba-ai-extensions.selectDropdown` - Advanced dropdown interaction with intelligent option detection
  - `siba-ai-extensions.getSelectInfo` - Comprehensive dropdown analysis and information retrieval
- **MCP Tools**:
  - `siba_ai_select_dropdown` - Specialized dropdown automation with multiple selection strategies
  - `siba_ai_get_select_info` - Detailed dropdown inspection and metadata extraction
- **Core Features**:
  - Intelligent selection methods: value-based, text-based, index-based, auto-detection
  - Partial text matching for dynamic content scenarios
  - Event triggering (change/input events) for modern web frameworks
  - Comprehensive option analysis with optgroup support
  - Wait strategies for dynamically loaded dropdown content

### Enhanced
- **PuppeteerService Methods**:
  - `selectDropdown()` - Advanced select interaction with comprehensive option detection
  - `getSelectInfo()` - Complete dropdown metadata extraction and analysis
- **TypeScript Support**: Full type definitions and interfaces for select dropdown operations
- **Documentation**: Complete implementation guide with usage examples and troubleshooting
- **Testing**: Comprehensive test suite with edge cases and framework compatibility testing

### Technical Improvements
- Enhanced option matching algorithms with fuzzy matching capabilities
- Improved error handling with detailed feedback and fallback mechanisms
- Better event simulation for modern JavaScript frameworks
- Optimized performance for large option lists and complex DOM structures

## [1.1.0] - 2025-08-04

### 🚀 Major Version Milestone
- 🎯 **Version Upgrade**: Major version increment to v1.1.0 reflecting enhanced stability and feature completeness
- 🔄 **Close All Browsers**: New VS Code command `closeAllBrowsers` for bulk browser management
- 🌐 **MCP Tool Enhancement**: Added `siba_ai_close_all_browsers` MCP tool for AI assistant integration
- ⚡ **Parallel Operations**: Implemented Promise.allSettled for simultaneous browser closure with error handling
- 📋 **Comprehensive Results**: Returns detailed closure statistics including count and error reporting
- 🎭 **Enhanced Automation**: Improved browser lifecycle management for complex automation workflows
- ✅ **Version Synchronization**: All components (extension, MCP server, documentation) aligned to v1.1.0
- 🔧 **Build Success**: Successful compilation and build across all TypeScript components

### Added
- New `closeAllBrowsers` VS Code command with silent operation
- New `siba_ai_close_all_browsers` MCP tool with no parameters required
- Parallel browser closure implementation in PuppeteerService
- Enhanced error handling with detailed error collection and reporting
- Command registration in package.json with proper categorization

### Changed
- Version numbers updated across all package.json files and server definitions
- Enhanced browser management workflow for improved automation efficiency
- Documentation updates in README.md and CHANGELOG.md reflecting v1.1.0 milestone

## [1.0.29] - 2025-08-04

### 🔇 Silent Operation Enhancement
- 🛑 **Complete Notification Suppression**: Disabled all VS Code popup notifications for silent AI operation
- 📱 **Extension Notifications**: Removed activation and all command success/error notifications  
- 🖥️ **MCP Server**: Silent startup with no console output for clean operation
- 🔧 **Files Updated**: Systematic notification disabling across extension.ts, vscodeMP.ts, copilotAgentTest.ts
- 🎯 **Benefit**: Uninterrupted AI automation without popup distractions while preserving console logging
- ✅ **Build Status**: Successfully compiled with maintained functionality

## [1.0.28] - 2025-08-04

### 🔄 Version Management
- 📦 **Version Increment**: Updated from v1.0.27 to v1.0.28
- 🔄 **Synchronization**: Maintained version consistency across all components
  - Main extension package.json: v1.0.27 → v1.0.28
  - MCP server package.json: v1.0.27 → v1.0.28
  - MCP server implementation: v1.0.27 → v1.0.28
- 🎯 **Preparation**: Ready for next feature additions and marketplace publishing

## [1.0.27] - 2025-08-03

### ⚡ Performance Improvements
- 🚀 **Timeout Optimization**: Reduced default timeouts from 30 seconds to 7 seconds across all browser operations
  - **PuppeteerService**: Updated default configuration timeout from 30000ms to 7000ms
  - **Config Fallback**: Updated configuration fallback value from 30000ms to 7000ms  
  - **MCP Server**: Updated command execution timeout from 30000ms to 7000ms
  - **76% Faster**: Quicker error detection and more responsive user experience
  - **Better UX**: Faster feedback on connection issues and failed operations

### 🔍 New Features
- ✨ **Page Structure Analysis Tool**: Added comprehensive DOM structure analysis capability
  - **siba_ai_get_page_structure**: New MCP tool for analyzing webpage DOM structure
  - **Shadow DOM Support**: Advanced piercing selectors for modern React/Vue applications
  - **Dynamic Content Detection**: Analyze visible elements, bounding boxes, and element hierarchy
  - **Rich Metadata**: Extract styles, attributes, text content, and accessibility information
  - **VS Code Integration**: "Get Page Structure" command available in Command Palette
  - **AI Assistant Ready**: Fully integrated with Copilot Chat via @siba-ai-browser

### 🎯 User Experience Enhancements
- **Quicker Response**: Browser navigation, element interactions, and screenshot captures now timeout faster
- **Improved Feedback**: Earlier detection of problematic web operations
- **Maintained Reliability**: 7-second timeout still provides reasonable time for web operations to complete
- **Customizable**: Individual operations can still override timeout via options parameter

## [1.0.26] - 2025-08-03

### 🔧 Integration Improvements
- 🏗️ **Dual Integration Architecture**: Simplified Language Model Tools to avoid duplication with MCP integration
  - **MCP Integration**: Primary integration with 16+ tools via VS Code MCP API for Copilot agent mode
  - **Language Model Tools**: Simplified screenshot tool for VS Code's built-in Language Model chat
  - **Clean Separation**: No tool duplication, clear architectural boundaries
- 📋 **Documentation**: Enhanced file comments explaining dual integration architecture
- ✅ **Code Quality**: Removed duplicate advanced DOM interaction handler from Language Model Tools

### 🎯 Architecture Clarification
- **Primary**: MCP Server Integration handles full automation suite for Copilot
- **Secondary**: Language Model Tools provides basic screenshot for VS Code native chat
- **Result**: Clean architecture serving both VS Code AI chat systems appropriately

## [1.0.25] - 2025-08-03

### ✨ Major New Features
- 🚀 **Advanced DOM Interaction**: Revolutionary new tool `siba_ai_advanced_dom_interaction` for React/Vue applications
  - **Shadow DOM Support**: Pierce through Shadow DOM boundaries with `>>>` and `>>>>` combinators
  - **XPath Selectors**: Advanced element targeting with `::-p-xpath(//div[@class="example"])` syntax
  - **Text-Based Selection**: Find elements by content using `::-p-text(Click me)` selectors
  - **ARIA Accessibility**: Target elements with `::-p-aria(button)` for accessibility-based automation
  - **Multiple Actions**: Support for click, type, hover, focus, getAttribute, getText, scroll operations
  - **Configurable Options**: Custom timeout, typing delay, scroll behavior, and more

### 🔧 Enhanced Capabilities
- 📈 **Tool Count**: Expanded from 13 to 16 MCP tools for comprehensive automation coverage
- 🎯 **Modern Framework Support**: Specialized support for React, Vue, Angular, and other component-based frameworks
- 🔍 **Advanced Selectors**: Complete suite of modern web selectors for complex applications
- ⚡ **Performance Optimization**: Improved element detection and interaction speed for dynamic content

### 🛠️ Technical Improvements
- 🏗️ **VS Code Command**: Added `siba-ai-extensions.advancedDomInteraction` command for direct usage
- 📋 **Type Safety**: Enhanced TypeScript definitions with comprehensive error handling
- 🔄 **MCP Integration**: Seamless integration with existing MCP bridge architecture
- ⚙️ **Configuration Options**: Flexible timeout, delay, and behavior customization

### 📚 Documentation Updates
- 📖 **README Enhancement**: Comprehensive documentation of new advanced DOM interaction features
- 🎯 **Usage Examples**: Detailed examples for Shadow DOM, XPath, and text-based selectors
- 🚀 **Quick Start Guide**: Updated quick start with modern framework automation scenarios
- 📊 **Architecture Diagrams**: Enhanced documentation with React/Vue automation workflows

## [1.0.17] - 2025-08-02

### Enhanced
- 🖼️ **Screenshot Improvements**: Enhanced screenshot capture with better error handling and multiple content formats
- 🔧 **MCP Response Format**: Improved screenshot tool response format with both text and image content
- 📋 **Documentation Updates**: Updated README with comprehensive browser automation capabilities and Puppeteer integration
- 🎯 **Tool Coverage**: Clarified actual 13 MCP tools available with detailed descriptions

### Technical
- ⚙️ **Response Structure**: Enhanced MCP tool responses with proper content type formatting
- 🔄 **Error Recovery**: Improved error handling for screenshot capture scenarios
- 📊 **Tool Documentation**: Comprehensive documentation of all available browser automation tools

## [1.0.16] - 2025-08-02

### Enhanced
- 🔧 **Version Consistency**: Aligned all package versions across extension and MCP server components
- 📦 **Package Management**: Standardized versioning system for better deployment consistency
- 🚀 **Deployment Optimization**: Streamlined build and deployment process for marketplace releases
- 📋 **Documentation Updates**: Updated README and changelog with latest version information

### Technical
- ⚙️ **Build System**: Improved version synchronization across multiple package.json files
- 🔄 **Release Process**: Enhanced automated deployment workflow for marketplace publishing
- 📊 **Version Management**: Centralized version tracking for extension components

## [1.0.11] - 2025-07-27

### Enhanced
- ✅ **Cross-Origin Communication**: Enhanced window.postMessage bridge system for better iframe communication
- 🔧 **Message Passing Reliability**: Improved webview message handling with timeout and retry mechanisms
- 🛡️ **CORS Handling**: Strengthened cross-origin safety with multiple fallback strategies
- 📊 **Error Recovery**: Enhanced error handling for webview communication failures

### Fixed
- 🔄 **Communication Stability**: Resolved intermittent communication issues between MCP server and webview
- 🎯 **Browser Integration**: Improved iframe-based browser automation reliability
- ⚡ **Response Times**: Optimized message passing for faster tool response times

### Technical
- **WebviewInteractionService**: Enhanced postMessage implementation with better error handling
- **MCP Bridge**: Improved communication pipeline stability
- **Extension Commands**: Enhanced webview creation and management

## [1.0.10] - 2025-07-27

### Added
- ✅ **WORKING Browser Automation**: All 31 MCP tools now return actual results instead of errors
- 🚀 **Custom SIBA Browser**: New webview panel with iframe-based browser automation
- 🔧 **Real DOM Interaction**: Implemented actual webview message passing with injected automation scripts
- 🛡️ **Cross-Origin Safety**: Proper iframe handling with fallback strategies for CORS issues
- 📊 **Enhanced Error Handling**: Detailed error reporting with specific failure reasons and recovery suggestions

### Fixed
- ❌ **No More Mock Errors**: Replaced "No active webview" and timeout errors with working functionality
- 🔄 **Communication Flow**: Fixed MCP Server ↔ VS Code Extension ↔ Webview ↔ DOM manipulation pipeline
- 🎯 **Browser Status Detection**: Now returns actual browser state information

### Changed
- **Architecture**: Moved from VS Code Simple Browser integration to custom webview panel approach
- **WebviewInteractionService**: Complete rewrite of `executeWebviewCommand` method for real automation
- **Extension Commands**: Enhanced `openSimpleBrowser` command with custom browser creation

## [Unreleased]

- Initial release