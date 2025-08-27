# Active Conventions [v1.8 - Updated 2025-08-27]

## Convention 19
### [convention] - Extension Version v1.2.1 GitHub Migration Published [2025-08-27T12:30:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User request to migrate from Azure DevOps to GitHub and publish v1.2.1
**Content**: REPOSITORY MIGRATION MILESTONE - Successfully published SIBA AI Browser Extensions v1.2.1 with GitHub integration:
- ✅ **Repository Migration**: Complete migration from Azure DevOps to GitHub
  - All package.json repository URLs updated to GitHub
  - README.md development setup updated with GitHub clone instructions
  - Support section updated with GitHub Issues and direct repository links
  - License link updated to GitHub Apache 2.0 license page
- ✅ **Version Synchronization**: Updated all components from v1.2.0 to v1.2.1
  - Main package.json: v1.2.0 → v1.2.1
  - MCP server package.json: v1.2.0 → v1.2.1
  - MCP server index.ts server definition: v1.2.0 → v1.2.1
  - CHANGELOG.md: Added comprehensive v1.2.1 release notes with migration details
  - README.md: Updated version badges and footer references
- ✅ **GitHub Integration**: New repository links implemented
  - Project Code: https://github.com/kwkau/siba-ai-browser
  - Project Issues: https://github.com/kwkau/siba-ai-browser/issues
  - Project License: https://github.com/kwkau/siba-ai-browser?tab=Apache-2.0-1-ov-file
  - Buy Me a Coffee: buymeacoffee.com/byq9t6syjyv (new support link added)
- ✅ **Publishing Process**: Successfully published using updated baseContentUrl
  - Command: `yarn vsce publish --baseContentUrl https://raw.githubusercontent.com/kwkau/siba-ai-browser/main/`
  - Build Process: Used yarn throughout, successful TypeScript compilation (21 style warnings only)
  - Package Size: 1238 files including complete MCP server and documentation
- ✅ **Extension URL**: https://marketplace.visualstudio.com/items?itemName=siba-tech.siba-ai-extensions
- 📋 **Migration Benefits**: Better community access, GitHub Issues integration, enhanced visibility
**References**: Convention 18 (GitHub Repository Migration Links), Convention 4 (baseContentUrl), Convention 5 (yarn usage)
**Related**: Repository migration, GitHub integration, marketplace publishing, community accessibility

## Convention 18
### [convention] - GitHub Repository Migration Links [2025-08-27T12:00:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User request to migrate from Azure DevOps to GitHub
**Content**: REPOSITORY MIGRATION - Project moved from Azure DevOps to GitHub. ALWAYS use these GitHub links for publishing and marketplace:
- ✅ **Project Code**: https://github.com/kwkau/siba-ai-browser
- ✅ **Project Issues**: https://github.com/kwkau/siba-ai-browser/issues
- ✅ **Project License**: https://github.com/kwkau/siba-ai-browser?tab=Apache-2.0-1-ov-file
- ✅ **Buy Me a Coffee**: buymeacoffee.com/byq9t6syjyv
- 📋 **Publishing BaseContentUrl**: Use `--baseContentUrl https://raw.githubusercontent.com/kwkau/siba-ai-browser/main/` for v1.2.1+ publishing
- ⚡ **Migration Impact**: Update all documentation, package.json, and marketplace references to GitHub URLs
**References**: Convention 4 (baseContentUrl publishing), Repository migration from Azure DevOps
**Related**: Marketplace publishing, repository links, user support links

## Convention 17
### [convention] - Extension Version v1.2.0 Select Dropdown Revolution Published [2025-08-06T08:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request to publish next version with specialized select dropdown automation
**Content**: MAJOR FEATURE MILESTONE - Successfully published SIBA AI Browser Extensions v1.2.0 with revolutionary select dropdown automation:
- ✅ **Major Feature Addition**: Updated all components from v1.1.0 to v1.2.0 (select dropdown automation revolution)
  - Main package.json: v1.1.0 → v1.2.0
  - MCP server package.json: v1.1.0 → v1.2.0
  - MCP server index.ts server definition: v1.1.0 → v1.2.0
  - CHANGELOG.md: Added comprehensive v1.2.0 release notes with select dropdown features
  - README.md: Updated version badges, description (25→27 tools), and current version section
- ✅ **Revolutionary Select Dropdown Features in v1.2.0**: Specialized automation addressing Copilot's dropdown interaction challenges
  - New VS Code Commands: `selectDropdown` and `getSelectInfo` with user interaction prompts
  - New MCP Tools: `siba_ai_select_dropdown` and `siba_ai_get_select_info` for AI assistant integration
  - Intelligent Detection: Auto-detection with value → text → index fallback strategies
  - Multiple Selection: Full support for multi-select dropdowns with array value handling
  - Optgroup Support: Handles grouped options correctly with proper navigation
  - Dynamic Content: Works with AJAX-loaded options using configurable wait times
  - Framework Compatible: Supports React, Vue, Angular with proper event triggering
  - Robust Error Handling: Multiple fallback strategies and clear error reporting
- ✅ **Technical Implementation**: Enhanced PuppeteerService with comprehensive select automation
  - `selectDropdown()` method with intelligent option detection and selection strategies
  - `getSelectInfo()` method for complete dropdown metadata extraction and analysis
  - Full TypeScript interfaces and comprehensive error handling
  - Comprehensive test suite with edge cases and framework compatibility
- ✅ **Protocol Compliance**: Followed Convention 12 (Pre-Publication Documentation Protocol)
- ✅ **Build Process**: Used yarn throughout, successful TypeScript compilation (21 style warnings only)
- ✅ **Marketplace Publishing**: Successfully published using Convention 4 (baseContentUrl parameter)
- ✅ **Extension URL**: https://marketplace.visualstudio.com/items?itemName=siba-tech.siba-ai-extensions
- 📋 **Milestone Achievement**: v1.2.0 represents specialized automation solving specific Copilot dropdown interaction challenges
**References**: Convention 4 (baseContentUrl), Convention 5 (yarn usage), Convention 12 (pre-publication protocol), select dropdown automation implementation
**Related**: Extension versioning, select dropdown automation, Copilot integration enhancement, marketplace publishing, AI automation reliability

## Convention 16
### [convention] - Extension Version v1.1.0 Major Milestone Published [2025-08-04T16:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request to increase version to 1.1.0
**Content**: MAJOR VERSION MILESTONE - Successfully published SIBA AI Browser Extensions v1.1.0:
- ✅ **Major Version Upgrade**: Updated all components from v1.0.30 to v1.1.0 (major milestone)
  - Main package.json: v1.0.30 → v1.1.0
  - MCP server package.json: v1.0.30 → v1.1.0
  - MCP server index.ts server definition: v1.0.30 → v1.1.0
  - CHANGELOG.md: Added comprehensive v1.1.0 release notes with major features
  - README.md: Updated version badges, current version section, and footer references
- ✅ **Major Features in v1.1.0**: Enhanced browser management capabilities
  - New `closeAllBrowsers` VS Code command with silent operation
  - New `siba_ai_close_all_browsers` MCP tool for AI assistant integration
  - Parallel browser closure implementation using Promise.allSettled
  - Enhanced error handling with detailed reporting
  - Complete version synchronization across all components
- ✅ **Protocol Compliance**: Followed Convention 12 (Pre-Publication Documentation Protocol)
- ✅ **Build Process**: Used yarn throughout, successful TypeScript compilation (18 style warnings only)
- ✅ **Marketplace Publishing**: Successfully published using Convention 4 (baseContentUrl parameter)
- ✅ **Extension URL**: https://marketplace.visualstudio.com/items?itemName=siba-tech.siba-ai-extensions
- 📋 **Milestone Achievement**: v1.1.0 represents enhanced stability and feature completeness for AI automation
**References**: Convention 4 (baseContentUrl), Convention 5 (yarn usage), Convention 12 (pre-publication protocol), Convention 14 (silent operation)
**Related**: Extension versioning, major milestones, browser management, marketplace publishing, AI automation enhancement

## Convention 15
### [convention] - Extension Version v1.0.29 Published with Silent Operation Features [2025-08-04T14:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request to increase version and publish to marketplace
**Content**: EXTENSION VERSION UPDATE WITH SILENT OPERATION ENHANCEMENT - Successfully published SIBA AI Browser Extensions v1.0.29:
- ✅ **Version Synchronization**: Updated all components from v1.0.28 to v1.0.29
  - Main package.json: v1.0.28 → v1.0.29
  - MCP server package.json: v1.0.28 → v1.0.29
  - MCP server index.ts server definition: v1.0.28 → v1.0.29
  - CHANGELOG.md: Added v1.0.29 release notes with silent operation features
  - README.md: Updated version badges and references
- ✅ **Key Features in v1.0.29**: Complete notification suppression for silent AI operation
  - All VS Code popup notifications disabled
  - MCP server silent startup
  - Clean automation without UI interruptions
  - Preserved console/output channel logging for debugging
- ✅ **Protocol Compliance**: Followed Convention 12 (Pre-Publication Documentation Protocol)
- ✅ **Build Process**: Used yarn throughout, successful TypeScript compilation (18 style warnings only)
- ✅ **Marketplace Publishing**: Successfully published using Convention 4 (baseContentUrl parameter)
- ✅ **Extension URL**: https://marketplace.visualstudio.com/items?itemName=siba-tech.siba-ai-extensions
- 📋 **Key Achievement**: Enhanced user experience with silent operation for uninterrupted AI automation
**References**: Convention 4 (baseContentUrl), Convention 5 (yarn usage), Convention 12 (pre-publication protocol), Convention 14 (silent operation)
**Related**: Extension versioning, silent operation, marketplace publishing, user experience optimization

## Convention 14
### [convention] - All VS Code Notifications Disabled for Silent Operation [2025-08-04T12:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request to disable all notifications for MCP tools and commands
**Content**: COMPLETE NOTIFICATION SUPPRESSION - All VS Code popup notifications disabled for silent operation:
- ✅ **Extension Startup**: Activation notification disabled
- ✅ **MCP Server Startup**: Console message changed from console.error to silent operation
- ✅ **All Commands**: Disabled showInformationMessage and showErrorMessage for all 25+ commands:
  - Browser lifecycle (launch, close, status)
  - Navigation and screenshot commands
  - Form automation and element interaction
  - JavaScript execution and file upload
  - Network interception and DOM analysis
  - Advanced DOM interaction and page structure analysis
- ✅ **Files Modified**: 
  - `src/extension.ts`: All notifications commented with "// Notification disabled:"
  - `src/vscodeMP.ts`: MCP provider error notifications disabled
  - `src/copilotAgentTest.ts`: Test notifications disabled
  - `mcp-server/src/index.ts`: Startup message removed for silent operation
- ✅ **Build Status**: Successfully compiled with only style warnings (18 ESLint warnings)
- 📋 **Implementation**: Used systematic sed replacement to disable all vscode.window.show* calls
- 🎯 **Benefit**: Clean AI operation without UI interruptions while maintaining console/output channel logging
**References**: MCP server architecture, VS Code extension development
**Related**: Silent operation, MCP tools, user experience optimization

## Convention 13
### [convention] - Extension Version v1.0.26 Published with Dual Integration Architecture [2025-08-03T12:30:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request for marketplace publishing with simplified Language Model Tools
**Content**: EXTENSION VERSION UPDATE WITH ARCHITECTURAL CLARIFICATION - Successfully published SIBA AI Browser Extensions v1.0.26:
- ✅ **Version Synchronization**: Updated all components from v1.0.25 to v1.0.26
  - Main package.json: v1.0.25 → v1.0.26
  - MCP server package.json: v1.0.25 → v1.0.26
  - MCP server index.ts server definition: v1.0.25 → v1.0.26
  - CHANGELOG.md: Added v1.0.26 release notes
- ✅ **Dual Integration Architecture Implemented**: Clean separation of VS Code integration layers:
  - **Primary MCP Integration**: 16+ tools via VS Code MCP API for Copilot agent mode (`vscodeMP.ts`)
  - **Secondary Language Model Tools**: Simplified screenshot tool for VS Code native chat (`languageModelTools.ts`)
  - **No Duplication**: Removed redundant advanced DOM interaction from Language Model Tools
- ✅ **Protocol Compliance**: Followed Convention 12 (Pre-Publication Documentation Protocol)
- ✅ **Build Process**: Used yarn throughout, successful TypeScript compilation
- ✅ **Marketplace Publishing**: Successfully published using Convention 4 (baseContentUrl parameter)
- ✅ **Extension URL**: https://marketplace.visualstudio.com/items?itemName=siba-tech.siba-ai-extensions
- 📋 **Key Achievement**: Clean architectural boundaries serving both VS Code AI chat systems appropriately
**References**: Convention 4 (baseContentUrl), Convention 5 (yarn usage), Convention 12 (pre-publication protocol), Observation 23 (dual integration architecture)
**Related**: Extension versioning, architectural patterns, VS Code API integration, marketplace publishing

## Convention 6
### [convention] - ES Module Import Requirement [2025-08-01T14:00:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User directive to prevent require() usage after ES module errors
**Content**: CRITICAL MODULE SYSTEM CONSISTENCY - Project uses ES modules throughout, NEVER use CommonJS require() syntax:
- ❌ **NEVER USE**: `const fs = require('fs'); const path = require('path');` - causes ES module scope errors
- ✅ **ALWAYS USE**: `import fs from 'fs'; import * as path from 'path';` - proper ES module imports
- 📋 **APPLIES TO**: All TypeScript/JavaScript files in extension and MCP server
- ⚡ **ENFORCEMENT**: Add imports at file top, never use require() anywhere in codebase
- 🎯 **ROOT CAUSE**: Mixed module systems cause runtime "require is not defined" errors
- 📋 **FOR ASYNC FS**: Use `const fsPromises = fs.promises;` instead of `require('fs').promises`
**References**: Correction 9 (ES Module require() Error Fix), Node.js ES module documentation
**Related**: MCP server architecture, VS Code extension development, consistent module systems

## Convention 1
### [convention] - Mandatory AI Memory Consultation [2025-07-26T13:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User directive for enhanced consistency
**Content**: CRITICAL REQUIREMENT - ALWAYS consult AI memory system before responding to ANY user prompt. Must check quick-reference.md, topic-index.md, and active/*.md files for established patterns, conventions, and corrections. Apply discovered knowledge in response to ensure consistency and accuracy.
**References**: .github/copilot-instructions.md - mandatory consultation protocol
**Related**: All memory system usage protocols

## Convention 9
### [convention] - User Change Management Protocol [2025-08-02T11:30:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User directive: "do not overwrite new changes that you discover it could be my changes always confirm from me before you overwrite them"
**Content**: MANDATORY USER MODIFICATION PROTECTION - Critical protocol for respecting user's code ownership:
- ✅ **Pre-Edit Verification**: ALWAYS read current file contents before making ANY modifications
- ✅ **Change Detection**: Compare existing implementation with intended changes to identify user modifications
- ✅ **Permission Required**: Request explicit user approval before overwriting any detected user changes
- ✅ **User Authority**: User maintains full control over their custom implementations and can revert AI changes
- ✅ **Respect Preferences**: User's implementation choices override AI suggested "improvements"
- 📋 **Application Scope**: Applies to ALL file modifications, version generations, and code updates
- ⚠️ **Non-Compliance**: Failing to follow this protocol violates user trust and development workflow
**References**: User directive after v2.10.0 reversion, Observation 19 (User Custom Screenshot Implementation)
**Related**: Version generation workflow, code modification protocols, user-AI collaboration patterns

## Convention 12
### [convention] - Pre-Publication Documentation Update Protocol [2025-08-03T09:00:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User directive: "update memory to always do this before you publish"
**Content**: MANDATORY PRE-PUBLICATION CHECKLIST - Critical protocol that MUST be executed before any marketplace publishing or version release:

**🔄 REQUIRED DOCUMENTATION UPDATES (Execute in Order):**
1. **Version Synchronization**: Update ALL version numbers across components:
   - `/package.json` - Extension version
   - `/mcp-server/package.json` - MCP server version
   - `/mcp-server/src/index.ts` - Server code version
   - Ensure all versions match exactly

2. **README.md Updates**: 
   - Version badge update
   - Tool count correction (current: 16 tools)
   - Feature descriptions for new capabilities
   - Usage examples for new tools/functions
   - Footer version number update

3. **CHANGELOG.md Updates**:
   - Add new version entry with comprehensive details
   - Document all new features with detailed descriptions
   - Include technical improvements and enhancements
   - Use proper changelog formatting (Added/Changed/Fixed)

4. **MCP Server Documentation**:
   - Update `/mcp-server/README.md` with new tool information
   - Correct tool counts and feature descriptions
   - Add usage examples for new capabilities

5. **Build & Package**:
   - Rebuild MCP server: `cd mcp-server && yarn build`
   - Rebuild extension: `yarn package`
   - Generate VSIX package with proper baseContentUrl

**⚠️ CRITICAL ENFORCEMENT**: This protocol is MANDATORY before any publishing action. Failing to complete these steps results in inconsistent user communication and incomplete documentation.

**📋 VERIFICATION**: Before publishing, verify all version numbers match and documentation accurately reflects current capabilities.
**References**: Version update workflow, marketplace publishing requirements, user communication standards
**Related**: Convention 4 (VS Code Publishing), Convention 9 (User Change Management), documentation consistency patterns

## Convention 11
### [convention] - Extension Version v2.11.0 Generated with User Enhanced Screenshot Implementation [2025-08-02T12:15:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request for next version generation after manual screenshot function enhancements
**Content**: EXTENSION VERSION UPDATE WITH USER ENHANCEMENTS - Successfully generated and packaged SIBA AI Browser Extensions v2.11.0:
- ✅ **Version Synchronization**: Updated all components from v2.10.0 to v2.11.0
  - Main package.json: v2.10.0 → v2.11.0
  - MCP server package.json: v2.10.0 → v2.11.0
  - MCP server index.ts server definition: v2.10.0 → v2.11.0  
  - Console log message: v2.10.0 → v2.11.0
- ✅ **User Enhanced Screenshot Implementation Preserved**: Maintained user's sophisticated screenshot improvements:
  - Data URL format detection with `result.startsWith('data:image/')`
  - Dual response format with both text and image content types
  - Base64 data extraction using `result.split(',')[1]` to remove data URL prefix
  - Enhanced MIME type handling with 'image/png' support
  - Fallback JSON text response with original MCP schema format
  - Improved error handling and response structure
- ✅ **Protocol Compliance**: Followed Convention 9 (User Change Management) - checked files first, detected user changes, preserved all modifications
- ✅ **Build Process**: Used yarn throughout, successful TypeScript compilation with 0 errors
- ✅ **Package Generation**: Successfully created siba-ai-extensions-2.11.0.vsix (7.32 MB, 1243 files)
- ✅ **BaseContentUrl**: Applied Convention 4 with GitHub raw URL parameter
- ✅ **Installation**: Successfully installed using VS Code CLI with --force flag
- 📋 **Key Enhancement**: User's data URL handling significantly improves screenshot compatibility and response format flexibility
**References**: User manual edits to mcp-server/src/index.ts screenshot function, Convention 9 (User Change Management Protocol)
**Related**: Screenshot functionality enhancement, data URL processing, MCP response format optimization, user-driven improvements

## Convention 10
### [convention] - Extension Version v2.10.0 Generated with User Implementation Preservation [2025-08-02T12:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request for next version generation with user modification protection
**Content**: EXTENSION VERSION UPDATE WITH USER PROTECTION - Successfully generated and packaged SIBA AI Browser Extensions v2.10.0:
- ✅ **Version Synchronization**: Updated all components from v2.9.0 to v2.10.0
  - Main package.json: v2.9.0 → v2.10.0
  - MCP server package.json: v2.9.0 → v2.10.0  
  - MCP server index.ts server definition: v2.9.0 → v2.10.0
  - Console log message: v2.9.0 → v2.10.0
- ✅ **User Implementation Preserved**: Maintained user's exact screenshot implementation without modification
  - Simple `typeof result === 'string'` validation preserved
  - Fixed 'jpeg' extension approach maintained
  - Text property in MCP response kept as user designed
  - File saving with timestamp naming unchanged
  - User's error handling pattern respected
- ✅ **Build Process**: Used yarn and direct build commands when script issues encountered
- ✅ **Package Generation**: Successfully created siba-ai-extensions-2.10.0.vsix (7.32 MB, 1243 files)
- ✅ **BaseContentUrl**: Applied Convention 4 with GitHub raw URL parameter
- ✅ **Installation**: Successfully installed using VS Code CLI with --force flag
- 📋 **Key Protocol**: Followed Convention 9 (User Change Management) - checked files first, preserved user changes
**References**: User request, Convention 9 (User Change Management Protocol), user's v2.9.0 screenshot implementation
**Related**: Version generation workflow, user modification protection, AI-user collaboration patterns

## Convention 8
### [convention] - Extension Version v2.9.0 Generated with Screenshot File Saving [2025-08-02T10:55:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request for next extension version generation with enhanced screenshot functionality
**Content**: EXTENSION VERSION UPDATE WITH FILE SAVING - Successfully generated and packaged SIBA AI Browser Extensions v2.9.0:
- ✅ **Version Synchronization**: Updated all components from mixed versions (v2.8.0/v2.5.0) to v2.9.0
  - Main package.json: v2.8.0 → v2.9.0
  - MCP server package.json: v2.8.0 → v2.9.0
  - MCP server index.ts server definition: v2.5.0 → v2.9.0
  - Console log message: v2.5.0 → v2.9.0
- ✅ **Screenshot Directory Creation**: Created `/mcp-server/src/screenshots/` for file saving functionality
- ✅ **Enhanced Screenshot Feature**: User's file saving implementation now included:
  - Saves screenshots to local filesystem with timestamp naming
  - Supports proper file extensions (png, jpeg, webp) based on media type
  - Maintains MCP image response format alongside file saving
- ✅ **Build Process**: Used yarn throughout (consistent with Convention 5)
- ✅ **Package Generation**: Successfully created siba-ai-extensions-2.9.0.vsix (7.32 MB, 1243 files)
- ✅ **BaseContentUrl**: Applied Convention 4 with GitHub raw URL parameter
- ✅ **Installation**: Successfully installed using VS Code CLI with --force flag
- 📋 **Key Implementation**: fs.writeFileSync(path.join(__dirname, 'screenshots', `screenshot_${Date.now()}.${extension}`), base64Data, 'base64')
- 🎯 **Dual Functionality**: Screenshots now both return MCP image response AND save to local file system
**References**: Convention 4 (baseContentUrl), Convention 5 (yarn usage), Convention 6 (ES modules), Pattern 8 (MCP screenshot format)
**Related**: Extension versioning, screenshot functionality, file system operations, MCP image handling

## Convention 7
### [convention] - Extension Version v2.6.0 Generated [2025-08-02T08:35:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User request for new extension version generation
**Content**: EXTENSION VERSION UPDATE - Successfully generated and packaged SIBA AI Browser Extensions v2.6.0:
- ✅ **Main Extension**: Updated from v2.5.0 to v2.6.0 in package.json
- ✅ **MCP Server**: Updated from v2.5.0 to v2.6.0 in mcp-server/package.json and index.ts
- ✅ **Build Process**: Used yarn for all operations (consistent with Convention 5)
- ✅ **Package Generation**: Successfully created siba-ai-extensions-2.6.0.vsix (7.32 MB, 1243 files)
- ✅ **BaseContentUrl**: Applied Convention 4 with GitHub raw URL parameter
- ✅ **ES Module Compliance**: All build scripts follow Convention 6 (no require() usage)
- 📋 **Package Location**: /Users/kwakuappiah-kubby/Documents/repos/AiVsCodeExtension/siba-ai-extensions-2.6.0.vsix
- 🔧 **Manual Installation**: Use VS Code Command Palette > "Extensions: Install from VSIX..." and select the .vsix file
**References**: Convention 3 (publishing workflow), Convention 4 (baseContentUrl), Convention 5 (yarn usage), Convention 6 (ES modules)
**Related**: Extension versioning, VS Code marketplace publishing, MCP server synchronization

## Convention 2
### [convention] - Private Field Naming [2025-07-24T12:00:00]
**Status**: active
**Confidence**: medium
**Classification**: internal
**Source**: Migration from ai.memory.md v1.0
**Content**: Prefix private fields with underscore (`_`)
**References**: [To be updated]
**Related**: [To be updated]

## Convention 3
### [convention] - VS Code Extension Publishing Workflow [2025-07-27T16:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User directive for standardized publishing approach
**Content**: STANDARD PUBLISHING WORKFLOW - Use `yarn vsce publish` command for marketplace publication. User has already logged in successfully with vsce, so no authentication needed. Always use yarn (never npm) for consistency with project conventions. Command publishes directly to VS Code Marketplace.
**References**: package.json scripts, vsce configuration
**Related**: Convention 1 (yarn usage), marketplace publication workflow

## Convention 4
### [convention] - VS Code Extension Publishing BaseContentUrl Fix [2025-07-27T16:45:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User directive to prevent recurring publishing issues
**Content**: CRITICAL PUBLISHING FIX - VS Code extension publishing fails with LICENSE link error unless baseContentUrl is specified. ALWAYS use the baseContentUrl parameter when publishing:
- ✅ **REQUIRED COMMAND**: `yarn vsce publish --baseContentUrl https://raw.githubusercontent.com/siba-tech/siba-ai-extensions/main/`
- ❌ **NEVER USE**: `yarn vsce publish` (without baseContentUrl) - will fail with repository detection error
- 🔍 **ERROR MESSAGE**: "Couldn't detect the repository where this extension is published. The link 'LICENSE' will be broken in README.md"
- 📋 **ROOT CAUSE**: VS Code marketplace cannot automatically detect repository for LICENSE link resolution
- ⚡ **SOLUTION**: Provide explicit base URL for content resolution during publishing
**References**: VS Code extension publishing documentation, marketplace publishing workflow
**Related**: Convention 3 (publishing workflow), package.json repository configuration

## Convention 5
### [convention] - Version Synchronization Requirement [2025-07-27T21:00:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User directive - "you also need to update the version number in the readme file, and mcp server file take note for the next publish"
**Content**: CRITICAL SYNCHRONIZATION - When bumping main extension version (package.json), MUST also update:
1. README.md version badges (multiple locations)
2. README.md release notes section (add new version entry)
3. mcp-server/package.json version field
4. Update "Known Issues" section status if fixes resolved issues
**Enforcement**: Before any marketplace publish, verify ALL version numbers match across all files
**Files to Update**: package.json, README.md (badges + release notes), mcp-server/package.json
**References**: Version consistency for professional extension management
**Related**: Publishing workflow, marketplace deployment standards

## Convention 12
### [convention] - VS Code CLI Location and Extension Installation v2.12.0 [2025-08-02T14:55:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User directive to locate VS Code CLI in installation directory for extension installation
**Content**: VS CODE CLI INSTALLATION SUCCESS - Successfully installed SIBA AI Browser Extensions v2.12.0 using full VS Code CLI path:
- ✅ **VS Code CLI Location**: `/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code` (macOS standard installation)
- ✅ **Installation Command**: `"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension [path-to-vsix] --force`
- ✅ **Version Verification**: `--list-extensions | grep siba` confirms `siba-tech.siba-ai-extensions` installed
- ✅ **v2.12.0 Success**: Extension installed successfully from `siba-ai-extensions-2.12.0.vsix`
- ✅ **Force Flag**: Uses `--force` to overwrite existing versions without prompts
- 📋 **Key Discovery**: VS Code CLI available at full application path when not in system PATH
- 🔧 **macOS Pattern**: Standard VS Code installation location `/Applications/Visual Studio Code.app/`
- ⚡ **Alternative to Manual**: Eliminates need for Command Palette manual installation process
**References**: Convention 7 (manual installation), user directive for VS Code CLI location
**Related**: Extension installation automation, VS Code CLI commands, macOS application structure
