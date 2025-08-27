# Privacy and Sensitive Information Rules

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
