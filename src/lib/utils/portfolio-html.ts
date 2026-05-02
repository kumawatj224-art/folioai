const BANNED_TEXT_MATCHERS = [
  /upload\s+resume/i,
  /generate\s+portfolio/i,
  /save\s+draft/i,
  /save\s+changes/i,
  /message\s+folioai/i,
  /create\s+with\s+ai/i,
  /start\s+a\s+new\s+portfolio/i,
  /back\s+to\s+dashboard/i,
  /sign\s*out/i,
];

const BANNED_ATTRIBUTE_MATCHERS = [
  /(?:id|class|aria-label|title|data-testid)=["'][^"']*(?:resume-upload|upload-resume|dashboard|folioai-chat|chat-interface|create-with-ai)[^"']*["']/i,
];

const REMOVABLE_BLOCKS = [
  /<input[^>]*type=["']?file["']?[^>]*>/gi,
  /<label[^>]*>[\s\S]*?upload\s+resume[\s\S]*?<\/label>/gi,
  /<button[^>]*>[\s\S]*?upload\s+resume[\s\S]*?<\/button>/gi,
  /<div[^>]*>[\s\S]*?upload\s+resume[\s\S]*?<\/div>/gi,
  /<section[^>]*>[\s\S]*?upload\s+resume[\s\S]*?<\/section>/gi,
];

const HTML_COMMENT_RE = /<!--([\s\S]*?)-->/g;

export type PortfolioHtmlValidationResult = {
  sanitizedHtml: string;
  violations: string[];
};

function stripRemovableBlocks(html: string): string {
  let sanitized = html;

  for (const pattern of REMOVABLE_BLOCKS) {
    sanitized = sanitized.replace(pattern, "");
  }

  sanitized = sanitized.replace(/<(label|button|a|div|span|p)([^>]*)>([\s\S]*?)<\/\1>/gi, (fullMatch, tagName, attributes, innerHtml) => {
    const textContent = innerHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const attributeText = String(attributes ?? "");

    const hasBannedText = BANNED_TEXT_MATCHERS.some((pattern) => pattern.test(textContent));
    const hasBannedAttribute = BANNED_ATTRIBUTE_MATCHERS.some((pattern) => pattern.test(attributeText));

    if (hasBannedText || hasBannedAttribute) {
      return "";
    }

    return fullMatch;
  });

  return sanitized;
}

function collectViolations(html: string): string[] {
  const violations = new Set<string>();
  const visibleText = html
    .replace(HTML_COMMENT_RE, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  for (const pattern of BANNED_TEXT_MATCHERS) {
    if (pattern.test(visibleText)) {
      violations.add(`Contains banned UI text: ${pattern}`);
    }
  }

  for (const pattern of BANNED_ATTRIBUTE_MATCHERS) {
    if (pattern.test(html)) {
      violations.add(`Contains banned UI attribute: ${pattern}`);
    }
  }

  if (/<input[^>]*type=["']?file["']?[^>]*>/i.test(html)) {
    violations.add("Contains file upload input");
  }

  return [...violations];
}

export function sanitizePortfolioHtml(html: string): string {
  return stripRemovableBlocks(html).trim();
}

export function validatePortfolioHtml(html: string): PortfolioHtmlValidationResult {
  const sanitizedHtml = sanitizePortfolioHtml(html);
  const violations = collectViolations(sanitizedHtml);

  return {
    sanitizedHtml,
    violations,
  };
}

export function parsePortfolioHtml(html: string) {
  const sanitizedHtml = sanitizePortfolioHtml(html);
  const styleMatches = sanitizedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const styles = styleMatches.map((styleBlock) => styleBlock.replace(/<\/?style[^>]*>/gi, "")).join("\n");
  const bodyMatch = sanitizedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : sanitizedHtml;

  return { styles, bodyContent, sanitizedHtml };
}