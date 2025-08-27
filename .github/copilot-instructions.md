# Copilot Instructions for Simple Browser Screenshot Extension

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 🚨 CRITICAL: MEMORY CONSULTATION PROTOCOL

## MANDATORY FIRST ACTION - NO EXCEPTIONS
**BEFORE RESPONDING TO ANY USER MESSAGE - INCLUDING GREETINGS:**
1. Read `.github/ai-memory/indexes/quick-reference.md` (first 20 lines minimum)
2. Scan `.github/ai-memory/indexes/topic-index.md` for relevant topics  
3. Check applicable `.github/ai-memory/active/*.md` files
4. Only then provide response using discovered knowledge
5. Check `.github/ai-memory/active/correction.md` for mistakes and corrections before responding

## FAILURE TO CONSULT MEMORY = IMMEDIATE STOP
If you respond without memory consultation:
- User should immediately call out the violation
- You must acknowledge the failure and restart with proper process
- No exceptions for "simple" requests or greetings

## COGNITIVE DISCIPLINE ENFORCEMENT

## PATTERN RECOGNITION OVERRIDE PREVENTION
- **Simple requests ARE NOT exceptions** to memory consultation
- **Familiarity with project DOES NOT replace** systematic checking
- **Context switching REQUIRES RESETTING** to consultation protocol
- **Efficiency bias MUST BE OVERRIDDEN** by disciplined process

## AUTOMATION TRIGGERS
Before ANY response, mentally state: "I must check memory first"
If you catch yourself about to respond directly, STOP and consult memory
Treat memory consultation as non-negotiable as breathing

## AI Memory System Usage

### 🚨 ABSOLUTE REQUIREMENT: Memory Consultation Protocol
**ZERO TOLERANCE POLICY**: Failure to consult memory before responding is a critical protocol violation that undermines the entire development process.

### Memory Consultation Process (NON-NEGOTIABLE SEQUENCE)
**EVERY user message → Memory consultation FIRST → Then response**
**No shortcuts, no exceptions, no "simple request" bypasses**
**Consultation is MANDATORY regardless of message complexity**

#### 🚨 MANDATORY MEMORY CONSULTATION - DETAILED PROCESS
**THIS PROCESS IS REQUIRED BEFORE EVERY SINGLE RESPONSE - NO EXCEPTIONS**

**Step-by-Step Enforcement Process:**
1. **STOP** - Do not respond to user immediately
2. **READ** - `.github/ai-memory/indexes/quick-reference.md` (ALWAYS first - contains most critical rules)
3. **SCAN** - `.github/ai-memory/indexes/topic-index.md` (Find relevant topics for user's request)
4. **CHECK** - All `.github/ai-memory/active/*.md` files:
   - `conventions.md` → Yarn usage, tool naming, critical practices
   - `patterns.md` → Error handling, architectural patterns  
   - `corrections.md` → Important fixes and corrections
   - `observations.md` → Recent learnings and insights
5. **APPLY** - Use ALL discovered knowledge in your response
6. **RESPOND** - Only after completing steps 1-5

**CRITICAL MEMORY CHECKPOINTS (CHECK EVERY TIME):**
- ✅ **Yarn vs NPM**: ALWAYS use yarn (from `conventions.md`)
- ✅ **Tool Naming**: All MCP tools use `siba_ai_*` prefix (from `conventions.md`)
- ✅ **Error Handling**: Use structured MCPError patterns (from `patterns.md`)
- ✅ **Security**: Multi-layer validation required (from `patterns.md`)
- ✅ **Architecture**: VS Code + MCP + Python SDK structure (from `observations.md`)

**VERIFICATION QUESTIONS (Ask yourself before responding):**
- Did I check quick-reference.md for the most critical rules?
- Did I verify yarn usage requirements?
- Did I check for established patterns that apply to this request?
- Did I look for any corrections that might affect my response?
- Am I applying consistent conventions from memory?

**FAILURE TO FOLLOW THIS PROCESS WILL RESULT IN:**
- Inconsistent responses
- Violation of established conventions
- Broken build processes (using npm instead of yarn)
- Architectural mistakes
- Ignored security patterns

#### Memory Consultation Process (REQUIRED BEFORE EVERY RESPONSE)
**THIS IS NOT A GUIDELINE - THIS IS A STRICT REQUIREMENT**

1. **Start with Quick Reference**: Read `.github/ai-memory/indexes/quick-reference.md` for frequently used knowledge
   - **WHY**: Contains the most critical and frequently referenced patterns
   - **WHAT TO LOOK FOR**: Yarn usage, tool naming, build processes, critical rules
   
2. **Use Topic Index**: Read `.github/ai-memory/indexes/topic-index.md` for specific topics and patterns  
   - **WHY**: Helps locate specific knowledge relevant to user's request
   - **WHAT TO LOOK FOR**: Topic-specific entries that match the user's question
   
3. **Check Active Files**: Look in `.github/ai-memory/active/*.md` for recent conventions, corrections, patterns, and observations
   - **conventions.md**: Current active conventions (CRITICAL - includes yarn requirement)
   - **patterns.md**: Established coding patterns and architectural decisions
   - **corrections.md**: Important fixes and corrections from past mistakes
   - **observations.md**: Recent insights and learnings from development
   
4. **Search Archived**: If not found, check `.github/ai-memory/archived/*.md` summaries for historical context
   - **WHY**: Important historical decisions and patterns may be archived
   
5. **Apply Found Knowledge**: Use discovered conventions, patterns, and corrections in your response
   - **REQUIREMENT**: Every applicable piece of knowledge MUST be applied
   - **VALIDATION**: Double-check that your response follows discovered patterns

#### Memory Addition Protocol
When learning something new or when user says "remember" or "take note":
1. **Determine Category**: convention|correction|pattern|observation
2. **Check for Conflicts**: Review existing entries in relevant active file
3. **Add Structured Entry**: Use validation template from `.github/ai-memory/metadata/validation-rules.md`
4. **Update Indexes**: Add reference to `topic-index.md` and entry to `entry-log.md`
5. **Archive if Full**: Follow cleanup rules from `.github/ai-memory/metadata/cleanup-rules.md`

#### Memory System Guidelines
- **Update entry-log.md** whenever you add new memories
- **Check for conflicts** before adding contradictory information
- **Compress and archive** when active files reach limits (30-60 entries per file)
- **Maintain topic-index.md** for efficient retrieval
- **Follow privacy rules** - sanitize all sensitive information per `.github/ai-memory/metadata/privacy-rules.md`
- **Use structured templates** from `.github/ai-memory/metadata/validation-rules.md`

#### Critical Memory References (CHECK THESE FIRST)
- **Yarn Usage**: `.github/ai-memory/active/conventions.md` - ALWAYS use yarn, never npm
- **Error Handling**: `.github/ai-memory/active/patterns.md` - Use structured MCPError with retry logic
- **MCP Tool Naming**: `.github/ai-memory/active/conventions.md` - All tools use `siba_ai_*` prefix
- **Security Patterns**: `.github/ai-memory/active/patterns.md` - Multi-layer validation required

### 🚨Ensure Entry Log continuously Updated After Each Change
- **Update entry-log.md** after every memory addition or modification
- **Use structured format** for consistency
- **Include date, category, and brief description** of the change

### Memory System Guidelines
- **Update entry-log.md** whenever you add new memories
- **Check for conflicts** before adding contradictory information
- **Compress and archive** when active files reach limits (30-60 entries per file)
- **Maintain topic-index.md** for efficient retrieval
- **Follow privacy rules** - sanitize all sensitive information per `.github/ai-memory/metadata/privacy-rules.md`
- **Use structured templates** from `.github/ai-memory/metadata/validation-rules.md`

### Memory System Maintenance
- **Review Cleanup Before Responding**: Check cleanup rules in `.github/ai-memory/metadata/cleanup-rules.md` for managing entry lifecycle and update File Size Management details and apply lifecycle Management rules
- **Weekly Review**: Check `.github/ai-memory/entry-log.md` for low reference counts
- **Monthly Cleanup**: Archive low-usage entries, update topic index
- **Quarterly Summaries**: Create compressed summaries in `.github/ai-memory/archived/YYYY-qX-summary.md`
- **Conflict Resolution**: Use `.github/ai-memory/metadata/cleanup-rules.md` for managing conflicting entries
- **Memory Health Check**: Ensure completeness, accuracy, relevance, and organization of active entries


---

# 🤖 BROWSER AUTOMATION EXPERT MODE

## MCP TOOLS MASTERY - 15 POWERFUL AUTOMATION TOOLS

You have access to **15 advanced MCP tools** for comprehensive browser automation. Always think in **intelligent workflows**, not single actions.

### 🎯 CORE WORKFLOW PHILOSOPHY
1. **Start with end goal** → Break into logical steps → Execute with appropriate tools
2. **Chain tools intelligently** → Launch → Navigate → Interact → Capture → Analyze
3. **Handle errors gracefully** → Check status → Retry → Provide alternatives
4. **Optimize for user experience** → Minimize manual steps → Clear feedback

### 🛠️ TOOL CATEGORIES & EXPERT USAGE

#### **BROWSER LIFECYCLE**
- `siba_ai_launch_browser` - Visible browsers for interaction/debugging
- `siba_ai_launch_browser_headless` - Background automation/testing
- `siba_ai_get_browser_status` - Health check & troubleshooting
- `siba_ai_close_browser` - Resource cleanup

#### **NAVIGATION & CAPTURE**
- `siba_ai_navigate_to_url` - Smart navigation with wait strategies
- `siba_ai_take_screenshot` - Full page documentation & verification
- `siba_ai_take_element_screenshot` - Focused UI component capture

#### **MODERN WEB APP INTERACTION** ⭐ **FLAGSHIP CAPABILITIES**
- `siba_ai_advanced_dom_interaction` - **THE POWER TOOL**
  - **Shadow DOM**: `component >>> .internal-element`
  - **XPath**: `::-p-xpath(//div[@data-testid='submit'])`
  - **Text-based**: `::-p-text(Click to continue)`
  - **ARIA**: `::-p-aria(button)`
  - **Actions**: click, type, hover, focus, getAttribute, getText, scroll

#### **FORM & DATA AUTOMATION**
- `siba_ai_fill_form` - Intelligent form completion with field detection
- `siba_ai_advanced_type_text` - Human-like typing with delays/actions
- `siba_ai_interact_with_element` - Standard element interactions
- `siba_ai_get_element_text` - Content extraction & validation
- `siba_ai_get_element_attribute` - Dynamic attribute analysis

#### **ADVANCED CAPABILITIES**
- `siba_ai_evaluate_javascript` - Custom logic & state extraction
- `siba_ai_upload_file` - File upload automation

### 🎖️ EXPERT WORKFLOW PATTERNS

#### **Pattern 1: Complete Website Testing**
```
1. Launch browser → 2. Navigate with smart wait → 3. Screenshot (before)
4. Advanced DOM interactions → 5. Form automation → 6. Result verification
7. Screenshot (after) → 8. Cleanup
```

#### **Pattern 2: Modern SPA Automation (React/Vue/Angular)**
```
1. Headless browser → 2. Navigate (networkidle0) → 3. Shadow DOM selectors
4. Component interaction → 5. State extraction → 6. Validation
```

#### **Pattern 3: Form Automation with Validation**
```
1. Navigate to form → 2. Screenshot empty state → 3. Fill with siba_ai_fill_form
4. Advanced typing for special fields → 5. Submit → 6. Verify success
```

### 🧠 INTELLIGENT SELECTOR STRATEGIES

#### **Selector Hierarchy (Try in Order):**
1. **CSS**: `#id`, `.class`, `[data-testid]`
2. **XPath**: `::-p-xpath(//button[contains(text(), 'Submit')])`
3. **Shadow DOM**: `my-component >>> .button`
4. **Text-based**: `::-p-text(Click here)`
5. **ARIA**: `::-p-aria(Submit button)`

#### **Smart Examples:**
```json
// React component interaction
{
  "selector": "my-react-app >>> .submit-button",
  "action": "click",
  "options": {"scrollIntoView": true, "timeout": 10000}
}

// Complex form field
{
  "selector": "::-p-xpath(//input[@placeholder='Enter email'])",
  "action": "type",
  "options": {"text": "user@example.com", "delay": 50}
}

// Modern framework button
{
  "selector": "::-p-text(Submit Order)",
  "action": "click",
  "options": {"timeout": 5000}
}
```

### ⚡ PERFORMANCE & ERROR HANDLING

#### **Smart Wait Strategies:**
- `load` - Basic page loads
- `domcontentloaded` - Fast DOM access
- `networkidle0` - SPAs with dynamic content
- `networkidle2` - Partially loaded pages

#### **Error Recovery Protocol:**
1. Check `siba_ai_get_browser_status` first
2. Try alternative selectors
3. Adjust timeouts for slow content
4. Provide multiple solutions
5. Document workarounds

### 🎯 COPILOT EXCELLENCE STANDARDS

#### **Always Provide:**
- Complete working examples with all parameters
- Multiple approaches for complex scenarios
- Error handling suggestions
- Performance considerations
- Explanation of selector choices

#### **Never Do:**
- Incomplete tool calls missing required parameters
- Inefficient workflows with unnecessary steps
- Brittle selectors without fallbacks
- Resource leaks (always clean up browsers)
- Generic advice without specific examples

---

## Development Guidelines
1. Always use TypeScript for type safety
2. Follow VS Code extension development best practices
3. Use proper error handling and logging
4. Implement commands that can be called programmatically by Copilot
5. Ensure screenshot functionality works with VS Code's Simple Browser specifically
6. For MCP server development, follow MCP protocol specifications
7. Use ES modules for MCP server compatibility

## Architecture Notes
- The extension should intercept or interact with Simple Browser webview instances
- Screenshot capture should return base64 encoded image data or file paths
- Commands should be designed for both manual and programmatic usage
- Consider using webview message passing for communication with browser content
- MCP server acts as a bridge between AI clients and VS Code extension functionality
- Communication between MCP server and VS Code extension can be implemented via IPC, named pipes, sockets, or file-based methods

## Security Considerations
- Validate all input parameters
- Ensure screenshot functionality doesn't expose sensitive information
- Follow VS Code's webview security guidelines
- Implement proper CSP (Content Security Policy) for any webview content
- Secure MCP server communication channels
- Validate MCP tool parameters and sanitize inputs

## Package Management
- **ALWAYS use yarn instead of npm** - The project uses yarn as the package manager consistently across all commands (install, build, run, etc.)

## Web Search
- You have the freedom to use web search to research and gather more industry information and practices on the features that you are implementing to help make your updates more robust, grounded and reliable and I urge you to do this often as you work and to also remember this directive

## Fact Checking and Research
- **Always verify facts** before responding
- **Use web search** to gather additional information and best practices
- **Ensure responses are grounded in reliable sources**
- **Research industry standards** for features being implemented
- **Incorporate findings** into your responses to enhance robustness and reliability

---



## Project Overview
This is a VS Code extension project that enables Copilot to take screenshots of content displayed in VS Code's Simple Browser. The project includes both a VS Code extension and an MCP (Model Context Protocol) server for seamless AI integration. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Key Components
- **Extension Main**: Located in `src/extension.ts` - handles extension activation and command registration
- **Screenshot Service**: Captures screenshots from Simple Browser webview content
- **Command Registration**: Provides commands for Copilot to interact with screenshot functionality
- **MCP Server**: Located in `mcp-server/` - bridges VS Code extension functionality for direct Copilot access

## MCP Server Integration
The project includes a complete MCP server implementation that provides:
- **take_screenshot**: Capture screenshots from Simple Browser
- **open_url_in_browser**: Open URLs in VS Code's Simple Browser
- **get_browser_status**: Get browser state information
- **screenshot_workflow**: Complete URL opening and screenshot workflow

For MCP development, refer to the official documentation at: https://github.com/modelcontextprotocol/create-python-server
