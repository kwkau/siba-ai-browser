#!/usr/bin/env node

/**
 * AI Memory System Migration Script
 * Migrates from V1.0 (single file) to V2.0 (structured system)
 */

const fs = require('fs');
const path = require('path');

class MemoryMigrator {
    constructor(projectPath = '.') {
        this.projectPath = projectPath;
        this.githubPath = path.join(projectPath, '.github');
        this.oldMemoryPath = path.join(this.githubPath, 'ai.memory.md');
        this.newMemoryPath = path.join(this.githubPath, 'ai-memory');
    }

    async migrate() {
        console.log('🚀 Starting AI Memory System Migration...\n');

        // Step 1: Validate preconditions
        await this.validatePreconditions();

        // Step 2: Create backup
        await this.createBackup();

        // Step 3: Create directory structure
        await this.createDirectoryStructure();

        // Step 4: Parse existing memory file
        const memories = await this.parseExistingMemories();

        // Step 5: Categorize and migrate content
        await this.migrateContent(memories);

        // Step 6: Create indexes
        await this.createIndexes(memories);

        // Step 7: Create metadata files
        await this.createMetadata(memories);

        // Step 8: Update copilot instructions
        await this.updateCopilotInstructions();

        console.log('\n✅ Migration completed successfully!');
        console.log('� ENHANCED: AI Memory Consultation enforcement has been strengthened');
        console.log('�📋 Next steps:');
        console.log('   1. Review migrated content in .github/ai-memory/');
        console.log('   2. Note: Mandatory AI Memory Consultation convention has been added');
        console.log('   3. Copilot instructions updated with enhanced enforcement protocol');
        console.log('   4. Test the new system with your AI assistant');
        console.log('   5. Archive the old ai.memory.md file when satisfied');
        console.log('');
        console.log('🔥 CRITICAL: The system now includes:');
        console.log('   - Mandatory memory consultation before every response');
        console.log('   - Step-by-step verification process');
        console.log('   - Critical checkpoints for yarn usage and tool naming');
        console.log('   - Enhanced error prevention for common issues');
    }

    async validatePreconditions() {
        console.log('🔍 Validating preconditions...');
        
        if (!fs.existsSync(this.oldMemoryPath)) {
            throw new Error(`❌ Original memory file not found: ${this.oldMemoryPath}`);
        }

        if (fs.existsSync(this.newMemoryPath)) {
            const response = await this.promptUser('⚠️  New memory system already exists. Overwrite? (y/N): ');
            if (response.toLowerCase() !== 'y') {
                throw new Error('Migration cancelled by user');
            }
        }

        console.log('✅ Preconditions validated');
    }

    async createBackup() {
        console.log('💾 Creating backup...');
        
        const backupPath = `${this.oldMemoryPath}.backup.${Date.now()}`;
        fs.copyFileSync(this.oldMemoryPath, backupPath);
        
        console.log(`✅ Backup created: ${backupPath}`);
    }

    async createDirectoryStructure() {
        console.log('📁 Creating directory structure...');

        const dirs = [
            'active',
            'archived', 
            'indexes',
            'metadata'
        ];

        dirs.forEach(dir => {
            const dirPath = path.join(this.newMemoryPath, dir);
            fs.mkdirSync(dirPath, { recursive: true });
        });

        console.log('✅ Directory structure created');
    }

    async parseExistingMemories() {
        console.log('📖 Parsing existing memory file...');

        const content = fs.readFileSync(this.oldMemoryPath, 'utf8');
        const memories = {
            conventions: [],
            corrections: [],
            patterns: [],
            observations: []
        };

        // Simple parsing - look for sections and dated entries
        const lines = content.split('\n');
        let currentSection = null;
        let currentEntry = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Detect sections
            if (line.includes('Convention') || line.includes('convention')) {
                currentSection = 'conventions';
            } else if (line.includes('Correction') || line.includes('correction')) {
                currentSection = 'corrections';
            } else if (line.includes('Pattern') || line.includes('pattern')) {
                currentSection = 'patterns';
            } else if (line.includes('Observation') || line.includes('observation') || line.includes('Test')) {
                currentSection = 'observations';
            }

            // Detect entries with dates
            if (line.includes('[2025') || line.includes('[2024')) {
                if (currentEntry) {
                    // Save previous entry
                    if (currentSection && memories[currentSection]) {
                        memories[currentSection].push(currentEntry);
                    }
                }

                // Start new entry
                currentEntry = {
                    title: this.extractTitle(line),
                    date: this.extractDate(line),
                    content: [line],
                    section: currentSection || 'observations'
                };
            } else if (currentEntry && line.length > 0) {
                currentEntry.content.push(line);
            }
        }

        // Don't forget the last entry
        if (currentEntry && currentSection && memories[currentSection]) {
            memories[currentSection].push(currentEntry);
        }

        console.log(`✅ Parsed ${Object.values(memories).flat().length} entries`);
        return memories;
    }

    extractTitle(line) {
        // Try to extract title from various formats
        const patterns = [
            /###\s*(.+?)\s*\[/,
            /##\s*(.+?)\s*\[/,
            /-\s*(.+?)\s*:/,
            /\*\*(.+?)\*\*/
        ];

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) return match[1].trim();
        }

        return line.substring(0, 50) + '...';
    }

    extractDate(line) {
        const dateMatch = line.match(/\[(20\d{2}-\d{2}-\d{2}[T\d:]*)\]/);
        return dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    }

    async migrateContent(memories) {
        console.log('📝 Migrating content to new structure...');

        const categories = ['conventions', 'corrections', 'patterns', 'observations'];

        for (const category of categories) {
            const entries = memories[category] || [];
            const fileName = `${category}.md`;
            const filePath = path.join(this.newMemoryPath, 'active', fileName);

            let content = `# Active ${category.charAt(0).toUpperCase() + category.slice(1)} [v1.1 - Updated ${new Date().toISOString().split('T')[0]}]\n\n`;

            // Add mandatory AI memory consultation convention as first entry for conventions
            if (category === 'conventions') {
                content += `## Convention 1\n`;
                content += `### [convention] - Mandatory AI Memory Consultation [${new Date().toISOString().split('T')[0]}T${new Date().toISOString().split('T')[1].split('.')[0]}]\n`;
                content += `**Status**: active\n`;
                content += `**Confidence**: high\n`;
                content += `**Classification**: internal\n`;
                content += `**Source**: Enhanced enforcement protocol for consistency\n`;
                content += `**Content**: CRITICAL REQUIREMENT - ALWAYS consult AI memory system before responding to ANY user prompt. Must check quick-reference.md, topic-index.md, and active/*.md files for established patterns, conventions, and corrections. Apply discovered knowledge in response to ensure consistency and accuracy.\n`;
                content += `**References**: .github/copilot-instructions.md - mandatory consultation protocol\n`;
                content += `**Related**: All memory system usage protocols\n\n`;
            }

            entries.forEach((entry, index) => {
                const entryNumber = category === 'conventions' ? index + 2 : index + 1; // Start from 2 for conventions due to mandatory consultation entry
                content += `## ${category.substring(0, category.length - 1).charAt(0).toUpperCase() + category.substring(0, category.length - 1).slice(1)} ${entryNumber}\n`;
                content += `### [${category.substring(0, category.length - 1)}] - ${entry.title} [${entry.date}]\n`;
                content += `**Status**: active\n`;
                content += `**Confidence**: medium\n`;
                content += `**Classification**: internal\n`;
                content += `**Source**: Migration from ai.memory.md v1.0\n`;
                content += `**Content**: ${entry.content.join(' ').replace(/#+/g, '').trim()}\n`;
                content += `**References**: [To be updated]\n`;
                content += `**Related**: [To be updated]\n\n`;
            });

            fs.writeFileSync(filePath, content);
            console.log(`✅ Created ${fileName} with ${entries.length + (category === 'conventions' ? 1 : 0)} entries`);
        }
    }

    async createIndexes(memories) {
        console.log('🗂️ Creating index files...');

        // Topic Index
        const topicIndexContent = `# AI Memory Topic Index

## Project Categories
${Object.entries(memories).map(([category, entries]) => 
    entries.length > 0 ? `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: \`active/${category}.md\` (${entries.length} entries)` : ''
).filter(Boolean).join('\n')}

## Quick References
- **Common Patterns**: See \`active/patterns.md\`
- **Recent Fixes**: See \`active/corrections.md\`
- **Project Standards**: See \`active/conventions.md\`
- **Development Insights**: See \`active/observations.md\`

## Status Indicators
- ✅ **High Priority**: Critical knowledge referenced frequently
- 🔄 **In Progress**: Active development or ongoing patterns
- 📋 **Reference**: Background knowledge and context
`;

        fs.writeFileSync(path.join(this.newMemoryPath, 'indexes', 'topic-index.md'), topicIndexContent);

        // Quick Reference
        const quickRefContent = `# Quick Reference Guide

## 🚨 MOST CRITICAL RULE (Updated ${new Date().toISOString().split('T')[0]})
### ⚠️ MANDATORY MEMORY CONSULTATION - READ THIS FIRST ⚠️
**BEFORE EVERY RESPONSE - NO EXCEPTIONS**
1. **MANDATORY MEMORY CONSULTATION** → \`active/conventions.md:Convention 1\` ✅ ALWAYS REQUIRED
   - MUST consult AI memory before EVERY user response
   - Check quick-reference.md, topic-index.md, active/*.md files first
   - Apply discovered patterns, conventions, and corrections
   - FAILURE TO DO THIS CAUSES: npm usage (critical error), pattern violations, inconsistent responses

## Most Used Knowledge (Updated ${new Date().toISOString().split('T')[0]})
1. **Yarn Package Manager** → \`active/conventions.md\` ✅ CRITICAL - ALWAYS use yarn, never npm
2. **MCP Tool Naming** → \`active/conventions.md\` ✅ HIGH - All tools use \`siba_ai_*\` prefix

## Current Project Context
- **Version**: [Update with current version]
- **Main Components**: [Update with your architecture]  
- **Current Focus**: [Update with current development focus]

## Common Development Patterns
- **[Your pattern]**: [Brief description]
- **Build Process**: [Your build workflow]
- **Testing Strategy**: [Your testing approach]

## Critical File Locations
- **[Important File 1]**: \`path/to/file\`
- **[Important File 2]**: \`path/to/file\`

## Recent Major Achievements
${memories.observations.slice(0, 3).map(obs => `- ✅ **${obs.title}**: ${obs.content[0].substring(0, 100)}...`).join('\n')}

## Quick Problem Resolution
- **Build Issues**: [Your common build solutions]
- **[Other Issues]**: [Your solutions]
`;

        fs.writeFileSync(path.join(this.newMemoryPath, 'indexes', 'quick-reference.md'), quickRefContent);

        // Project Timeline
        const timelineContent = `# Project Timeline

## Major Milestones
${memories.observations.map(obs => `### ${obs.date} - ${obs.title}
- **Achievement**: ${obs.content.join(' ').substring(0, 200)}...`).slice(0, 10).join('\n\n')}

## Development History
- **Migration Date**: ${new Date().toISOString().split('T')[0]} - Migrated to AI Memory System V2.0

## Key Technical Decisions
- **Memory System**: Upgraded from single file to structured system for better scalability
`;

        fs.writeFileSync(path.join(this.newMemoryPath, 'indexes', 'project-timeline.md'), timelineContent);

        console.log('✅ Index files created');
    }

    async createMetadata(memories) {
        console.log('📊 Creating metadata files...');

        // Entry Log
        const totalEntries = Object.values(memories).flat().length;
        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = `${currentDate}T${new Date().toISOString().split('T')[1].split('.')[0]}`;
        
        let entryLogEntries = [];
        
        // Add mandatory AI memory consultation entry first
        entryLogEntries.push(`| ${currentTime} | conventions.md | Mandatory AI Memory Consultation | convention | 1.1 | Active | None | copilot-instructions.md | Internal |`);
        
        // Add other entries from migration
        Object.entries(memories).forEach(([category, entries]) => {
            entries.forEach((entry, i) => {
                entryLogEntries.push(`| ${entry.date} | ${category}.md | ${entry.title} | ${category.substring(0, category.length - 1)} | 1.0 | Active | None | TBD | Internal |`);
            });
        });

        const entryLogContent = `# Memory Entry Log

| Date | File | Entry | Category | Version | Status | Conflicts | References | Classification |
|------|------|-------|----------|---------|--------|-----------|------------|----------------|
${entryLogEntries.join('\n')}

## Usage Statistics
- **Total Active Entries**: ${totalEntries}
- **Categories**: ${Object.keys(memories).length}
- **Migration Date**: ${new Date().toISOString().split('T')[0]}
- **Source**: ai.memory.md v1.0

## Maintenance Notes
- **Migration completed**: ${new Date().toISOString().split('T')[0]}
- **Next cleanup**: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} (quarterly)
- **Validation needed**: Update references and classifications
`;

        fs.writeFileSync(path.join(this.newMemoryPath, 'metadata', 'entry-log.md'), entryLogContent);

        // Copy template files (simplified versions)
        const templates = {
            'cleanup-rules.md': this.getCleanupRulesTemplate(),
            'validation-rules.md': this.getValidationRulesTemplate(),
            'privacy-rules.md': this.getPrivacyRulesTemplate()
        };

        Object.entries(templates).forEach(([filename, content]) => {
            fs.writeFileSync(path.join(this.newMemoryPath, 'metadata', filename), content);
        });

        console.log('✅ Metadata files created');
    }

    async updateCopilotInstructions() {
        console.log('📝 Updating copilot instructions...');

        const instructionsPath = path.join(this.githubPath, 'copilot-instructions.md');
        
        if (fs.existsSync(instructionsPath)) {
            let content = fs.readFileSync(instructionsPath, 'utf8');
            
            const newMemorySection = `
## 🚨 CRITICAL: MANDATORY AI MEMORY CONSULTATION PROTOCOL

### BEFORE EVERY RESPONSE - NO EXCEPTIONS
**YOU MUST ALWAYS CONSULT THE AI MEMORY SYSTEM FIRST**

**ENFORCEMENT RULES:**
1. **NEVER respond to ANY user prompt without first consulting AI memory**
2. **READ THESE FILES IN ORDER (MANDATORY):**
   - \`ai-memory/indexes/quick-reference.md\` → Most critical patterns and conventions
   - \`ai-memory/indexes/topic-index.md\` → Topic-specific knowledge lookup
   - \`ai-memory/active/conventions.md\` → Current active conventions (especially yarn usage, tool naming)
   - \`ai-memory/active/patterns.md\` → Established coding patterns and error handling
   - \`ai-memory/active/corrections.md\` → Important corrections and fixes
   - \`ai-memory/active/observations.md\` → Recent insights and learnings

3. **APPLY ALL DISCOVERED KNOWLEDGE** from memory files in your response
4. **THIS IS NOT OPTIONAL** - Memory consultation is required for consistency and accuracy

**If you fail to consult memory, you may:**
- Use npm instead of yarn (CRITICAL ERROR - always use yarn)
- Miss established patterns and conventions
- Ignore important corrections and fixes
- Provide inconsistent responses
- Break established architectural decisions

### AI Memory System Usage

#### 🚨 MANDATORY MEMORY CONSULTATION - DETAILED PROCESS
**THIS PROCESS IS REQUIRED BEFORE EVERY SINGLE RESPONSE - NO EXCEPTIONS**

**Step-by-Step Enforcement Process:**
1. **STOP** - Do not respond to user immediately
2. **READ** - \`ai-memory/indexes/quick-reference.md\` (ALWAYS first - contains most critical rules)
3. **SCAN** - \`ai-memory/indexes/topic-index.md\` (Find relevant topics for user's request)
4. **CHECK** - All \`ai-memory/active/*.md\` files:
   - \`conventions.md\` → Yarn usage, tool naming, critical practices
   - \`patterns.md\` → Error handling, architectural patterns  
   - \`corrections.md\` → Important fixes and corrections
   - \`observations.md\` → Recent learnings and insights
5. **APPLY** - Use ALL discovered knowledge in your response
6. **RESPOND** - Only after completing steps 1-5

**CRITICAL MEMORY CHECKPOINTS (CHECK EVERY TIME):**
- ✅ **Yarn vs NPM**: ALWAYS use yarn (from \`conventions.md\`)
- ✅ **Tool Naming**: All MCP tools use \`siba_ai_*\` prefix (from \`conventions.md\`)
- ✅ **Error Handling**: Use structured MCPError patterns (from \`patterns.md\`)
- ✅ **Security**: Multi-layer validation required (from \`patterns.md\`)
- ✅ **Architecture**: VS Code + MCP + Python SDK structure (from \`observations.md\`)

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

1. **Start with Quick Reference**: Read \`ai-memory/indexes/quick-reference.md\` for frequently used knowledge
   - **WHY**: Contains the most critical and frequently referenced patterns
   - **WHAT TO LOOK FOR**: Yarn usage, tool naming, build processes, critical rules
   
2. **Use Topic Index**: Read \`ai-memory/indexes/topic-index.md\` for specific topics and patterns  
   - **WHY**: Helps locate specific knowledge relevant to user's request
   - **WHAT TO LOOK FOR**: Topic-specific entries that match the user's question
   
3. **Check Active Files**: Look in \`ai-memory/active/*.md\` for recent conventions, corrections, patterns, and observations
   - **conventions.md**: Current active conventions (CRITICAL - includes yarn requirement)
   - **patterns.md**: Established coding patterns and architectural decisions
   - **corrections.md**: Important fixes and corrections from past mistakes
   - **observations.md**: Recent insights and learnings from development
   
4. **Search Archived**: If not found, check \`ai-memory/archived/*.md\` summaries for historical context
   - **WHY**: Important historical decisions and patterns may be archived
   
5. **Apply Found Knowledge**: Use discovered conventions, patterns, and corrections in your response
   - **REQUIREMENT**: Every applicable piece of knowledge MUST be applied
   - **VALIDATION**: Double-check that your response follows discovered patterns

#### Memory Addition Protocol
When learning something new or when user says "remember" or "take note":
1. **Determine Category**: convention|correction|pattern|observation
2. **Check for Conflicts**: Review existing entries in relevant active file
3. **Add Structured Entry**: Use validation template from \`ai-memory/metadata/validation-rules.md\`
4. **Update Indexes**: Add reference to \`topic-index.md\` and entry to \`entry-log.md\`
5. **Archive if Full**: Follow cleanup rules from \`ai-memory/metadata/cleanup-rules.md\`

#### Memory System Guidelines
- **Update entry-log.md** whenever you add new memories
- **Check for conflicts** before adding contradictory information
- **Compress and archive** when active files reach limits (30-60 entries per file)
- **Maintain topic-index.md** for efficient retrieval
- **Follow privacy rules** - sanitize all sensitive information per \`ai-memory/metadata/privacy-rules.md\`
- **Use structured templates** from \`ai-memory/metadata/validation-rules.md\`

#### Critical Memory References (CHECK THESE FIRST)
- **Yarn Usage**: \`ai-memory/active/conventions.md\` - ALWAYS use yarn, never npm
- **Error Handling**: \`ai-memory/active/patterns.md\` - Use structured MCPError with retry logic
- **MCP Tool Naming**: \`ai-memory/active/conventions.md\` - All tools use \`siba_ai_*\` prefix
- **Security Patterns**: \`ai-memory/active/patterns.md\` - Multi-layer validation required
`;

            // Replace or add memory section
            if (content.includes('### AI Memory') || content.includes('## 🚨 CRITICAL: MANDATORY AI MEMORY')) {
                content = content.replace(/### AI Memory[\s\S]*?(?=###|##|$)/, newMemorySection);
                content = content.replace(/## 🚨 CRITICAL: MANDATORY AI MEMORY[\s\S]*?(?=###|##|$)/, newMemorySection);
            } else {
                content += newMemorySection;
            }

            fs.writeFileSync(instructionsPath, content);
            console.log('✅ Copilot instructions updated with enhanced memory consultation enforcement');
        } else {
            console.log('⚠️  copilot-instructions.md not found, skipping update');
        }
    }

    getCleanupRulesTemplate() {
        return `# AI Memory Cleanup Rules

## Memory Limits
- \`active/conventions.md\`: Max 30 entries
- \`active/corrections.md\`: Max 40 entries
- \`active/patterns.md\`: Max 50 entries
- \`active/observations.md\`: Max 60 entries

## Archival Process
1. **Quarterly Reviews**: Every 3 months, review active memories
2. **Compress Similar**: Group related memories for compression
3. **Create Summaries**: Move to archived/ with compressed content
4. **Update Indexes**: Reflect changes in all index files

## Quality Maintenance
- Remove duplicate entries
- Resolve conflicts between memories
- Update references and classifications
- Maintain consistent formatting
`;
    }

    getValidationRulesTemplate() {
        return `# Memory Validation Rules

## Entry Template
\`\`\`markdown
### [Category] - [Title] [Date]
**Status**: active|archived|deprecated|conflicted
**Confidence**: high|medium|low
**Classification**: public|internal|confidential|restricted
**Source**: [conversation context or session ID]
**Content**: [the actual memory/knowledge]
**References**: [when/where this was used]
**Related**: [links to related memories]
\`\`\`

## Quality Standards
- Use clear, actionable language
- Include specific examples where helpful
- Reference exact file paths or commands
- Maintain consistent terminology
- Avoid sensitive information
`;
    }

    getPrivacyRulesTemplate() {
        return `# Privacy and Sensitive Information Rules

## Classification Levels
- **PUBLIC**: General knowledge, open standards
- **INTERNAL**: Project-specific, non-sensitive details
- **CONFIDENTIAL**: Proprietary implementations
- **RESTRICTED**: Personal/sensitive information

## Sanitization Rules
Before adding memories:
1. Remove PII (names, emails, addresses)
2. Remove credentials (passwords, tokens, keys)
3. Generalize paths (use placeholders)
4. Abstract sensitive configurations

## Regular Audits
- Monthly review for sensitive content
- Quarterly classification updates
- Remove/sanitize as needed
`;
    }

    promptUser(question) {
        return new Promise((resolve) => {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question(question, (answer) => {
                readline.close();
                resolve(answer);
            });
        });
    }
}

// Run migration if called directly
if (require.main === module) {
    const migrator = new MemoryMigrator(process.argv[2]);
    migrator.migrate().catch(console.error);
}

module.exports = MemoryMigrator;
