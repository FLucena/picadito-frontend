/**
 * XSS Sanitization utilities
 * React escapes by default, but this provides explicit sanitization for dynamic content
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validates and sanitizes a URL
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, return null
    return null;
  }
}

/**
 * Sanitizes text for use in HTML attributes
 */
export function sanitizeAttribute(value: string | null | undefined): string {
  if (!value) return '';
  
  return escapeHtml(value)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

