/**
 * Extract code blocks from markdown text
 */
export function extractCodeBlocks(markdown) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || 'plaintext',
      code: match[2].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return blocks;
}

/**
 * Check if text contains markdown formatting
 */
export function hasMarkdownFormatting(text) {
  const markdownPatterns = [
    /^#{1,6}\s/m, // Headers
    /\*\*.*\*\*/,  // Bold
    /\*.*\*/,      // Italic
    /\[.*\]\(.*\)/, // Links
    /```.*```/s,   // Code blocks
    /`.*`/,        // Inline code
    /^\s*[-*+]\s/m, // Lists
    /^\s*\d+\.\s/m, // Numbered lists
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Sanitize markdown to prevent XSS
 */
export function sanitizeMarkdown(markdown) {
  // Remove potentially dangerous HTML tags
  return markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Extract text content from markdown (no formatting)
 */
export function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .trim();
}

/**
 * Count words in markdown text (excluding code blocks)
 */
export function countWords(markdown) {
  const text = stripMarkdown(markdown);
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Generate a title from the first line of markdown
 */
export function generateTitle(markdown, maxLength = 60) {
  const stripped = stripMarkdown(markdown);
  const firstLine = stripped.split('\n')[0];
  
  if (firstLine.length <= maxLength) {
    return firstLine;
  }
  
  return firstLine.slice(0, maxLength).trim() + '...';
}

/**
 * Highlight syntax for specific language
 */
export function getLanguageDisplayName(language) {
  const languageMap = {
    js: 'JavaScript',
    ts: 'TypeScript',
    jsx: 'React JSX',
    tsx: 'React TSX',
    py: 'Python',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    php: 'PHP',
    swift: 'Swift',
    kt: 'Kotlin',
    sql: 'SQL',
    sh: 'Shell',
    bash: 'Bash',
    yaml: 'YAML',
    json: 'JSON',
    xml: 'XML',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    md: 'Markdown',
    plaintext: 'Plain Text',
  };

  return languageMap[language.toLowerCase()] || language;
}
