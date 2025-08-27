# Active Corrections [v1.3 - Updated 2025-08-01]

## Correction 10
### [correction] - MCP Tool Array Schema Validation Fix [2025-08-01T15:30:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User reported persistent VS Code MCP validation error - "tool parameters array type must have items"
**Content**: CRITICAL MCP SCHEMA FIX - VS Code MCP tool validation requires all array types to have proper `items` specification with ONLY valid JSON Schema types:
- ❌ **PROBLEMATIC SCHEMA**: `{ type: 'function' }`, `{ type: 'undefined' }`, and nested `{ type: 'array' }` - causes MCP tool validation failure
- ✅ **FIXED SCHEMA**: Only valid JSON Schema types: `{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }, { type: 'object' }`
- 📋 **VALIDATION RULE**: VS Code MCP API requires ALL array types to specify items schema using ONLY valid JSON Schema types
- ⚡ **SOLUTION**: Removed invalid types (`function`, `undefined`) and circular array reference to prevent validation errors
- 🎯 **RESULT**: `siba_ai_evaluate_javascript` tool now passes VS Code MCP validation successfully
- 📋 **VALID JSON SCHEMA TYPES**: "array", "boolean", "integer", "null", "number", "object", "string" (no "function" or "undefined")
**References**: Correction 8 (JSON Schema validation patterns), VS Code MCP API documentation, JSON Schema specification
**Related**: MCP tool validation, JSON Schema array types, VS Code native MCP integration

## Correction 9
### [correction] - ES Module require() Error Fix [2025-08-01T13:00:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User reported MCP server runtime error - "ReferenceError: require is not defined in ES module scope"
**Content**: CRITICAL ES MODULE FIX - MCP server was configured as ES module (`"type": "module"` in package.json) but still used CommonJS `require()` syntax causing runtime failures. Fixed by replacing all require() calls with proper ES module imports:
- ❌ **PROBLEMATIC CODE**: `const fs = require('fs'); const path = require('path'); const os = require('os');`
- ✅ **FIXED CODE**: `import fs from 'fs'; import path from 'path'; import os from 'os';` at file top + `const fsPromises = fs.promises;` for async operations
- 📋 **ROOT CAUSE**: Mixed module systems - ES module configuration with CommonJS syntax
- ⚡ **SOLUTION**: Consistent ES module imports throughout the codebase
- 🎯 **RESULT**: MCP server now starts successfully without module scope errors
**References**: Node.js ES module documentation, MCP server architecture patterns
**Related**: ES module configuration, MCP server startup, file system operations

## Correction 8
### [correction] - JSON Schema Validation Fix for MCP Tools [2025-08-01T12:00:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User reported tool validation error - "Tool `siba_ai_evaluate_javascript` has invalid JSON parameters"
**Content**: CRITICAL JSON SCHEMA FIX - MCP tool `siba_ai_evaluate_javascript` had invalid JSON schema using `"type": "any"` which is not a valid JSON Schema type. Fixed by replacing with proper `oneOf` union type accepting all valid JSON-serializable values:
- ❌ **INVALID SCHEMA**: `items: { type: 'any' }` - causes MCP tool registration failure
- ✅ **VALID SCHEMA**: `items: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }, { type: 'object' }, { type: 'array' }] }`
- 📋 **VALID JSON SCHEMA TYPES**: "array", "boolean", "integer", "null", "number", "object", "string"
- ⚡ **SOLUTION**: Use `oneOf` construct to accept multiple valid JSON Schema types for function arguments
**References**: JSON Schema specification, MCP tool validation patterns
**Related**: MCP tool registration, JSON Schema validation patterns, tool parameter validation

## Correction 7
### [correction] - Repeated Memory Consultation Failure [2025-07-27T22:35:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User directive - "this is the second time that this is happening, how can we stop this from happening going forward"
**Content**: CRITICAL PATTERN FAILURE - AI consistently fails to consult memory system before responding despite explicit Convention 1 requiring mandatory consultation. This has occurred multiple times:
- Publishing workflow failure (ignored Convention 4 baseContentUrl requirement)
- Version synchronization failure (ignored Convention 5 requirements)
- Pattern: AI improvises solutions instead of checking established conventions

**ENFORCEMENT MECHANISM REQUIRED:**
- ✅ **IMMEDIATE STOP PROTOCOL**: When user requests action, MUST begin response with "Checking AI memory first..." and actually read memory files
- ✅ **CHECKPOINT VERIFICATION**: List discovered conventions/patterns before proceeding
- ✅ **EXPLICIT DECLARATION**: State "Based on memory consultation, I will..." before taking action
- ✅ **FAILURE ACKNOWLEDGMENT**: If memory consultation is skipped, immediately acknowledge violation and correct

**ROOT CAUSE**: Memory consultation treated as optional suggestion rather than mandatory requirement
**IMPACT**: Wasted time, incorrect approaches, user frustration with repeated pattern violations
**SOLUTION**: Treat memory consultation as non-negotiable system requirement, not optional guideline
**References**: Convention 1 (mandatory consultation), quick-reference.md enforcement protocol
**Related**: All memory system usage, workflow consistency, user trust maintenance

## Correction 1
### [correction] - AI Memory Consultation Enforcement [2025-07-26T15:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: User reported Copilot not following memory consultation instructions
**Content**: CRITICAL ISSUE - Strengthened AI memory consultation requirements in copilot-instructions.md. Copilot was not consistently consulting AI memory before responding, leading to violations of established conventions (especially yarn vs npm usage). Enhanced enforcement with mandatory checkpoints, verification questions, and explicit consequences for non-compliance.
**References**: .github/copilot-instructions.md - updated mandatory consultation protocol
**Related**: Convention 1 (Mandatory AI Memory Consultation)

## Correction 2
### [correction] - Package Manager Usage [2025-07-26T03:00:00]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: Migration from ai.memory.md v1.0
**Content**: ALWAYS use yarn instead of npm - Project uses yarn as package manager consistently across all commands (install, build, run, etc.). This is a critical requirement that must not be violated.
**References**: [To be updated]
**Related**: [To be updated]

## Correction 3
### [correction] - Legacy Entry [2025-07-24T12:00:00]
**Status**: active
**Confidence**: low
**Classification**: internal
**Source**: Migration from ai.memory.md v1.0
**Content**: Legacy entry from migration - needs review and proper formatting
**References**: [To be updated]
**Related**: [To be updated]

## Correction 4
### [correction] - VS Code MCP Integration Approach [2025-07-27T07:00:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: VS Code MCP server not running in VS Code - user reported issue
**Content**: CRITICAL FIX - VS Code MCP integration was incorrectly implemented using workspace configuration manipulation. The correct approach is to use VS Code's native MCP API:
- ❌ **WRONG**: `HybridMCPIntegration` manipulating `.vscode/mcp.json` files
- ✅ **CORRECT**: `vscode.McpServerDefinitionProvider` with `vscode.lm.registerMcpServerDefinitionProvider()`
- ✅ **Required**: `mcpServerDefinitionProviders` contribution point in package.json
- ✅ **Environment**: Use `MCP_CLIENT_TYPE: 'vscode'` for client detection
This was resolved in v1.0.3 with automatic VS Code MCP integration.
**References**: VS_CODE_MCP_FIX_SUMMARY.md, src/vscodeMP.ts, active/patterns.md:Pattern 7
**Related**: MCP server architecture, VS Code extension API patterns

## Correction 5
### [correction] - MCP Server Dependencies Packaging [2025-07-27T16:45:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: VS Code MCP server failing with ERR_MODULE_NOT_FOUND for @modelcontextprotocol/sdk
**Content**: CRITICAL FIX - Published VS Code extension was missing MCP server dependencies due to .vscodeignore excluding mcp-server/node_modules/**. This caused runtime failures when VS Code tried to start the MCP server:
- ❌ **PROBLEM**: `.vscodeignore` excluded `mcp-server/node_modules/**` causing missing dependencies
- ✅ **SOLUTION**: Removed the exclusion to include MCP server dependencies in published extension
- ✅ **RESULT**: Extension v1.0.4 successfully published with 1219 MCP server files (25MB total)
- ⚠️ **TRADE-OFF**: Larger extension size but proper runtime functionality
**Technical Details**:
- Error: `Cannot find package '@modelcontextprotocol/sdk'` in published extension
- Root cause: VS Code extension packaging excluded required node_modules
- Fix: Modified .vscodeignore to include mcp-server/node_modules directory
**References**: .vscodeignore, mcp-server/package.json, v1.0.4 marketplace publication
**Related**: VS Code extension packaging, MCP server runtime dependencies

## Correction 6
### [correction] - AI Memory Consultation Protocol Violation [2025-07-27T17:00:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User reported AI failed to apply documented baseContentUrl solution despite memory consultation
**Content**: CRITICAL PROCESS FAILURE - AI consulted memory system and found the correct solution (Convention 4: baseContentUrl fix) but failed to apply it directly. Instead attempted alternative approaches that were unnecessary and risky:
- ❌ **VIOLATION**: Found Convention 4 but tried modifying package.json instead of using documented command
- ❌ **IGNORED SOLUTION**: `yarn vsce publish --baseContentUrl https://raw.githubusercontent.com/siba-tech/siba-ai-extensions/main/` was documented but not applied
- ❌ **WRONG APPROACH**: Disabled `vscode:prepublish` script instead of using correct publishing command
- ✅ **CORRECTION**: Must APPLY discovered knowledge immediately, not seek alternative solutions
- 🚨 **ROOT CAUSE**: Memory consultation without proper application of discovered knowledge
**Process Fix**: When AI memory contains a documented solution, APPLY IT DIRECTLY - do not attempt alternative approaches
**References**: active/conventions.md:Convention 4, user feedback on process failure
**Related**: Convention 1 (mandatory memory consultation), memory application protocol

## Correction 7
### [correction] - MCP Server Mock Functionality Removal [2025-07-27T17:30:00]
**Status**: active
**Confidence**: high
**Classification**: critical
**Source**: User directive to remove all mocking functionality from MCP server
**Content**: CRITICAL ARCHITECTURE FIX - Removed all mock/fallback responses from MCP server to enable proper error diagnosis and force real VS Code communication:
- ❌ **REMOVED**: `getMockResponse()` function and all mock data responses
- ❌ **REMOVED**: Fallback to mock data when bridge communication fails
- ❌ **REMOVED**: Client-type specific mock responses for VS Code environment
- ✅ **IMPLEMENTED**: Clear error messages when VS Code communication fails
- ✅ **IMPLEMENTED**: Proper MCPError responses using ErrorFactory.bridgeConnectionError()
- ✅ **RESULT**: MCP server now either returns actual VS Code extension responses or clear error messages
**Technical Changes**:
- Modified `executeSIBAAICommand()` to always attempt VS Code bridge communication
- Removed conditional mock responses based on `IS_VSCODE_CLIENT`
- Added structured error responses with troubleshooting guidance
- Published as v1.0.6 with these changes
**Benefits**: Enables proper diagnosis of communication issues, forces resolution of bridge problems, eliminates confusion between real and mock responses
**References**: mcp-server/src/index.ts, v1.0.6 marketplace publication
**Related**: VS Code MCP integration, bridge communication patterns

