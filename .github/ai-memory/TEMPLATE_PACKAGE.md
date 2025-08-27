# 📦 AI Memory V2.0 Template Package

## Quick Setup for New Projects

### 1. **Copy Template Files**
Copy these files to your new project's `.github/ai-memory/` directory:

```bash
# Create directory structure
mkdir -p .github/ai-memory/{active,archived,indexes,metadata}

# Copy template files (modify as needed for your project)
cp /path/to/this/project/.github/ai-memory/metadata/*.md .github/ai-memory/metadata/
cp /path/to/this/project/.github/ai-memory/migrate.js .github/ai-memory/
```

### 2. **Initialize Active Files**
Create these starter files in `.github/ai-memory/active/`:

#### conventions.md
```markdown
# Active Conventions [v1.0 - Updated YYYY-MM-DD]

## Package Management
### [Convention] - Package Manager Choice [YYYY-MM-DD]
**Status**: active
**Confidence**: high
**Classification**: public
**Source**: Project setup decisions
**Content**: [Document your package manager choice - npm, yarn, pnpm]
**References**: Build scripts, CI/CD workflows
**Related**: Build process, dependency management

## Code Style  
### [Convention] - Code Formatting [YYYY-MM-DD]
**Status**: active
**Confidence**: high
**Classification**: public
**Source**: Team standards discussion
**Content**: [Document your code formatting standards - prettier, eslint, etc.]
**References**: IDE configuration, pre-commit hooks
**Related**: Code quality, team collaboration
```

#### corrections.md
```markdown
# Active Corrections [v1.0 - Updated YYYY-MM-DD]

## Build Issues
### [Correction] - [First Major Fix] [YYYY-MM-DD]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: Issue resolution
**Content**: [Document your first major correction]
**References**: Where this fix was applied
**Related**: Build process, deployment
```

#### patterns.md
```markdown
# Active Patterns [v1.0 - Updated YYYY-MM-DD]

## Architecture Patterns
### [Pattern] - Project Structure [YYYY-MM-DD]
**Status**: active
**Confidence**: high
**Classification**: public
**Source**: Architecture decisions
**Content**: [Document your project structure patterns]
**References**: File organization, module design
**Related**: Maintainability, scalability

## Development Patterns
### [Pattern] - Error Handling [YYYY-MM-DD]
**Status**: active
**Confidence**: high
**Classification**: public
**Source**: Development best practices
**Content**: [Document your error handling patterns]
**References**: Exception handling, logging
**Related**: Code quality, debugging
```

#### observations.md
```markdown
# Active Observations [v1.0 - Updated YYYY-MM-DD]

## Setup Success
### [Observation] - Project Initialization [YYYY-MM-DD]
**Status**: active
**Confidence**: high
**Classification**: internal
**Source**: Initial project setup
**Content**: ✅ Project successfully initialized with AI Memory System V2.0
**References**: Initial setup, foundation
**Related**: Project start, system architecture
```

### 3. **Initialize Index Files**

#### indexes/quick-reference.md
```markdown
# Quick Reference Guide

## Most Used Knowledge (Updated YYYY-MM-DD)
1. **[Your Key Pattern]** → \`active/[file].md:[line]\` ✅ CRITICAL
2. **[Second Pattern]** → \`active/[file].md:[line]\` ✅ HIGH

## Current Project Context
- **Version**: [Current version]
- **Main Components**: [Your architecture]
- **Active Development**: [Current focus]
- **Tech Stack**: [Technologies used]

## Common Development Patterns
- **Build Process**: [Your build workflow]
- **Testing Strategy**: [Your testing approach]
- **Deployment**: [Your deployment process]

## Critical File Locations
- **[Main File]**: \`path/to/file\`
- **[Config File]**: \`path/to/config\`
- **[Build File]**: \`path/to/build\`

## Quick Problem Resolution
- **Build Issues**: [Common solutions]
- **[Other Issues]**: [Quick fixes]
```

#### indexes/topic-index.md
```markdown
# AI Memory Topic Index

## Project Categories
- **Package Management**: \`active/conventions.md\` 
- **Code Standards**: \`active/conventions.md\`
- **Build Process**: \`active/patterns.md\`
- **Error Resolution**: \`active/corrections.md\`
- **Project Insights**: \`active/observations.md\`

## Quick References
- **Common Patterns**: See \`active/patterns.md\`
- **Recent Fixes**: See \`active/corrections.md\`
- **Project Standards**: See \`active/conventions.md\`
- **Development Insights**: See \`active/observations.md\`

## Status Indicators
- ✅ **High Priority**: Critical knowledge
- 🔄 **In Progress**: Active development
- 📋 **Reference**: Background knowledge
```

#### indexes/project-timeline.md
```markdown
# Project Timeline

## Major Milestones
### YYYY-MM-DD - Project Initialization
- **Setup Complete**: AI Memory System V2.0 initialized
- **Foundation**: Core project structure established

## Version History
- **v0.1.0**: Initial project setup

## Key Technical Decisions
- **Memory System**: AI Memory V2.0 for knowledge management
- **[Other Decision]**: [Rationale and outcome]
```

### 4. **Initialize Entry Log**

#### metadata/entry-log.md
```markdown
# Memory Entry Log

| Date | File | Entry | Category | Version | Status | Conflicts | References | Classification |
|------|------|-------|----------|---------|--------|-----------|------------|----------------|
| YYYY-MM-DD | conventions.md | Package manager | convention | 1.0 | Active | None | 1 time | Public |
| YYYY-MM-DD | observations.md | Project init | observation | 1.0 | Active | None | 1 time | Internal |

## Usage Statistics
- **Total Active Entries**: 2
- **Total Categories**: 4
- **Last Updated**: YYYY-MM-DD
- **System Version**: V2.0

## Maintenance Notes
- **System initialized**: YYYY-MM-DD
- **Next cleanup**: YYYY-MM-DD (quarterly)
- **Status**: Ready for development
```

### 5. **Update Copilot Instructions**

Add this section to your `.github/copilot-instructions.md`:

```markdown
### AI Memory System Usage

#### Memory Consultation Process
1. **Start with Quick Reference**: Check \`ai-memory/indexes/quick-reference.md\` for frequently used knowledge
2. **Use Topic Index**: Browse \`ai-memory/indexes/topic-index.md\` for specific topics
3. **Check Active Files**: Look in \`ai-memory/active/*.md\` for recent conventions, corrections, patterns
4. **Search Archived**: If not found, check \`ai-memory/archived/*.md\` summaries

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
- **Follow privacy rules** - sanitize sensitive information
- **Use structured templates** for consistent formatting
```

## 🎯 Project-Specific Customizations

### For Different Project Types:

#### React/Frontend Projects
- Focus on component patterns, state management, performance optimizations
- Track build configurations, deployment processes, testing strategies

#### Node.js/Backend Projects  
- Document API patterns, database configurations, security implementations
- Track performance optimizations, scaling decisions, monitoring setups

#### Python Projects
- Record environment management, dependency patterns, testing frameworks
- Document deployment strategies, performance profiling, code organization

#### Mobile Projects
- Track platform-specific patterns, performance considerations, store guidelines
- Document build processes, testing strategies, distribution methods

## ✅ Verification Checklist

After setup:
- [ ] All directory structure created
- [ ] Template files copied and customized
- [ ] Index files reflect your project specifics
- [ ] Entry log initialized with basic entries
- [ ] Copilot instructions updated
- [ ] Privacy classifications appropriate for your project
- [ ] Quick reference contains your most important patterns

## 🚀 Ready to Use!

Your AI Memory System V2.0 is now ready. The system will:
- ✅ Scale efficiently as your project grows
- ✅ Provide fast retrieval through multiple indexes
- ✅ Maintain consistency through validation rules
- ✅ Protect sensitive information through classifications
- ✅ Archive old content automatically to prevent bloat

Start using it by having your AI assistant consult the quick reference for common tasks and add new learnings as they occur!
