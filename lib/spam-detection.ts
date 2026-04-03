/**
 * Anti-spam detection utilities
 * Detects common spam patterns in user input
 */

const SPAM_PATTERNS = {
  // URLs and links
  urls: /https?:\/\/|www\.|\.com|\.xyz|\.tk|\.ml|bit\.ly|tinyurl/gi,
  
  // Repeated characters (excessive caps, dots, etc)
  repeatedChars: /(.)\1{4,}/g,
  
  // Numbers that form phone/card patterns
  sequentialNumbers: /\d{8,}/g,
  
  // Suspicious words
  suspiciousWords: /viagra|casino|lottery|prize|winner|click here|buy now|limited time|act now/gi,
  
  // Excessive punctuation
  excessivePunctuation: /[!?]{3,}|\.{4,}/g,
  
  // All caps words (phishing indicators)
  allCaps: /\b[A-Z]{6,}\b/g,
  
  // Email domain spam
  spamEmailDomains: /gmail\.com\..*|yahoo\..*\.ru|temp.*email/gi,
}

const SPAM_KEYWORDS = [
  "click",
  "now",
  "guaranteed",
  "risk-free",
  "act",
  "limited",
  "exclusive",
  "million",
  "money",
  "cash",
  "free",
  "win",
  "invest",
  "profit",
  "crypto",
  "bitcoin",
]

/**
 * Calculate spam score for a text input
 * Returns score 0-100, where:
 * - 0-20: Clear (safe)
 * - 21-50: Suspicious (consider blocking)
 * - 51-100: Likely spam (block)
 */
export function calculateSpamScore(text: string): number {
  if (!text || text.length < 3) return 0

  let score = 0
  const lowerText = text.toLowerCase()

  // Check for URLs
  if (SPAM_PATTERNS.urls.test(text)) {
    score += 30
  }

  // Check for repeated characters
  if (SPAM_PATTERNS.repeatedChars.test(text)) {
    score += 15
  }

  // Check for sequential numbers (suspicious patterns)
  const matches = text.match(/\d{8,}/g)
  if (matches) {
    score += Math.min(20, matches.length * 5)
  }

  // Check for suspicious words
  const suspiciousCount = (text.match(SPAM_PATTERNS.suspiciousWords) || []).length
  score += Math.min(25, suspiciousCount * 8)

  // Check for excessive punctuation
  if (SPAM_PATTERNS.excessivePunctuation.test(text)) {
    score += 10
  }

  // Check for all caps words (phishing)
  const capsWords = (text.match(SPAM_PATTERNS.allCaps) || []).length
  score += Math.min(15, capsWords * 3)

  // Check for spam keywords density
  const words = lowerText.split(/\s+/)
  const spamKeywordCount = words.filter(word =>
    SPAM_KEYWORDS.some(keyword => word.includes(keyword))
  ).length
  const keywordDensity = spamKeywordCount / words.length
  if (keywordDensity > 0.1) score += Math.min(20, keywordDensity * 50)

  // Check for excessive length (often spam)
  if (text.length > 1000) score += 10

  // Check for very short length (often bot/spam)
  if (text.length < 5 && text.length > 0) score += 5

  return Math.min(100, score)
}

/**
 * Check if input is likely spam
 * Threshold: > 50 is considered spam
 */
export function isLikelySpam(text: string, threshold: number = 50): boolean {
  return calculateSpamScore(text) > threshold
}

/**
 * Get spam detection message for user
 */
export function getSpamErrorMessage(score: number): string {
  if (score > 70) {
    return "Tu mensaje contiene patrones que se parecen a spam. Por favor, revisa y intenta de nuevo."
  }
  if (score > 50) {
    return "Tu mensaje puede contener contenido sospechoso. Por favor, simplifica y reintenta."
  }
  return ""
}

/**
 * Sanitize user input by removing spam-like patterns
 * Use with caution - only for logging/analysis, not for user-facing text
 */
export function getSanitizedForAnalysis(text: string): string {
  return text
    .replace(SPAM_PATTERNS.urls, "[URL]")
    .replace(SPAM_PATTERNS.suspiciousWords, "[SUSPICIOUS]")
    .substring(0, 500)
}

/**
 * Validate email domain for common spam indicators
 */
export function isSpamEmailDomain(email: string): boolean {
  return SPAM_PATTERNS.spamEmailDomains.test(email)
}

/**
 * Advanced spam detection combining multiple checks
 */
export function advancedSpamCheck(data: {
  email?: string
  name?: string
  message?: string
  phone?: string
}): {
  isSpam: boolean
  score: number
  details: string[]
} {
  const details: string[] = []
  let totalScore = 0

  // Check email
  if (data.email && isSpamEmailDomain(data.email)) {
    totalScore += 25
    details.push("Email domain appears suspicious")
  }

  // Check name
  if (data.name) {
    const nameScore = calculateSpamScore(data.name)
    totalScore += nameScore * 0.5
    if (nameScore > 30) {
      details.push("Name contains suspicious patterns")
    }
  }

  // Check message
  if (data.message) {
    const messageScore = calculateSpamScore(data.message)
    totalScore += messageScore
    if (messageScore > 30) {
      details.push("Message appears to be spam (high score)")
    }
  }

  // Check phone (should be mostly numbers)
  if (data.phone && !/^[\d\s\-\+\(\)]*$/.test(data.phone)) {
    totalScore += 10
    details.push("Phone format suspicious")
  }

  const score = Math.min(100, Math.round(totalScore / Object.keys(data).filter(k => data[k as keyof typeof data]).length))
  const isSpam = score > 50

  return { isSpam, score, details }
}
