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
        console.log('📋 Next steps:');
        console.log('   1. Review migrated content in .github/ai-memory/');
        console.log('   2. Update any project-specific references');
        console.log('   3. Test the new system with your AI assistant');
        console.log('   4. Archive the old ai.memory.md file when satisfied');
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

            let content = `# Active ${category.charAt(0).toUpperCase() + category.slice(1)} [v1.0 - Updated ${new Date().toISOString().split('T')[0]}]\n\n`;

            entries.forEach((entry, index) => {
                content += `## ${category.substring(0, category.length - 1).charAt(0).toUpperCase() + category.substring(0, category.length - 1).slice(1)} ${index + 1}\n`;
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
            console.log(`✅ Created ${fileName} with ${entries.length} entries`);
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

## Most Used Knowledge (Updated ${new Date().toISOString().split('T')[0]})
1. **[Update with your most important patterns]** → \`active/[file].md:[line]\` ✅ CRITICAL
2. **[Second most important]** → \`active/[file].md:[line]\` ✅ HIGH

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
        const entryLogContent = `# Memory Entry Log

| Date | File | Entry | Category | Version | Status | Conflicts | References | Classification |
|------|------|-------|----------|---------|--------|-----------|------------|----------------|
${Object.entries(memories).map(([category, entries]) => 
    entries.map((entry, i) => 
        `| ${entry.date} | ${category}.md | ${entry.title} | ${category.substring(0, category.length - 1)} | 1.0 | Active | None | TBD | Internal |`
    ).join('\n')
).join('\n')}

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
### AI Memory System Usage

#### 🚨 MANDATORY: Always Consult AI Memory Before Responding
**CRITICAL REQUIREMENT**: You MUST consult the AI memory system before responding to ANY user prompt. This ensures consistency, accuracy, and adherence to established patterns and conventions.

#### Memory Consultation Process (REQUIRED BEFORE EVERY RESPONSE)
1. **Start with Quick Reference**: Check \`ai-memory/indexes/quick-reference.md\` for frequently used knowledge
2. **Use Topic Index**: Browse \`ai-memory/indexes/topic-index.md\` for specific topics and patterns  
3. **Check Active Files**: Look in \`ai-memory/active/*.md\` for recent conventions, corrections, patterns, and observations
4. **Search Archived**: If not found, check \`ai-memory/archived/*.md\` summaries for historical context
5. **Apply Found Knowledge**: Use discovered conventions, patterns, and corrections in your response

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
            if (content.includes('### AI Memory')) {
                content = content.replace(/### AI Memory[\s\S]*?(?=###|$)/, newMemorySection);
            } else {
                content += newMemorySection;
            }

            fs.writeFileSync(instructionsPath, content);
            console.log('✅ Copilot instructions updated');
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
