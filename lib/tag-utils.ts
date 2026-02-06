/**
 * Tag Utility Functions
 * Handles hashtag extraction, normalization, and linkification
 */

/**
 * Extract all hashtags from text
 * Matches #word patterns (letters, numbers, underscores)
 */
export function extractHashtags(text: string): string[] {
    if (!text) return []

    // Match #word pattern (alphanumeric + underscore)
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g
    const matches = text.match(hashtagRegex)

    if (!matches) return []

    // Remove # and normalize (lowercase, unique)
    const tags = matches
        .map(tag => tag.substring(1).toLowerCase())
        .filter((tag, index, self) => self.indexOf(tag) === index) // unique

    return tags
}

/**
 * Normalize tag name for storage
 * - Convert to lowercase
 * - Remove special characters except underscores
 * - Trim whitespace
 */
export function normalizeTagName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .trim()
}

/**
 * Validate tag name
 * Rules: 1-50 chars, alphanumeric + underscore only
 */
export function isValidTagName(name: string): boolean {
    const normalized = normalizeTagName(name)
    return normalized.length >= 1 && normalized.length <= 50
}

/**
 * Convert hashtags in text to clickable links
 * Returns JSX-compatible React elements
 */
export function linkifyHashtags(text: string): string {
    if (!text) return text

    // Replace #hashtag with link markup
    return text.replace(
        /#([a-zA-Z0-9_]+)/g,
        '<a href="/tags/$1" class="hashtag">#$1</a>'
    )
}

/**
 * Parse text and return array of parts (text and hashtag objects)
 * Useful for rendering with React components
 */
export interface TextPart {
    type: 'text' | 'hashtag'
    content: string
    href?: string
}

export function parseTextWithHashtags(text: string): TextPart[] {
    if (!text) return []

    const parts: TextPart[] = []
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g

    let lastIndex = 0
    let match

    while ((match = hashtagRegex.exec(text)) !== null) {
        // Add text before hashtag
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            })
        }

        // Add hashtag
        parts.push({
            type: 'hashtag',
            content: match[0],
            href: `/tags/${match[1].toLowerCase()}`
        })

        lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.substring(lastIndex)
        })
    }

    return parts
}

/**
 * Get display name for tag (capitalize first letter)
 */
export function getTagDisplayName(tagName: string): string {
    if (!tagName) return ''
    return tagName.charAt(0).toUpperCase() + tagName.slice(1).toLowerCase()
}
