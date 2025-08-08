// Security Configuration
const SECURITY_CONFIG = {
    maxInputLength: 200,
    rateLimitWindow: 60000, // 1 minute
    maxRequestsPerWindow: 5,
    blockedKeywords: [
        // Explicit content
        'explicit', 'sexual', 'adult', 'porn', 'nude', 'naked',
        // Violence/harmful
        'violence', 'weapon', 'kill', 'murder', 'bomb', 'terrorist',
        // Inappropriate for education
        'illegal', 'drug', 'gambling', 'hate', 'discrimination'
        // Add more as needed
    ],
    suspiciousPatterns: [
        /\b(hack|exploit|inject|script|malware)\b/i,
        /javascript:/i,
        /<script/i,
        /eval\(/i
    ]
};

// Rate limiting tracker
let requestTracker = {
    count: 0,
    windowStart: Date.now()
};

// Content filtering and validation
class SecurityManager {
    static sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        // Basic HTML encoding
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .trim();
    }

    static validateInput(input, fieldName) {
        const sanitized = this.sanitizeInput(input);
        
        // Length validation
        if (sanitized.length > SECURITY_CONFIG.maxInputLength) {
            throw new Error(`${fieldName} is too long (max ${SECURITY_CONFIG.maxInputLength} characters)`);
        }

        // Keyword filtering
        const lowerInput = sanitized.toLowerCase();
        for (const keyword of SECURITY_CONFIG.blockedKeywords) {
            if (lowerInput.includes(keyword)) {
                throw new Error(`Content contains inappropriate material. Please revise your ${fieldName.toLowerCase()}.`);
            }
        }

        // Pattern matching for suspicious content
        for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
            if (pattern.test(sanitized)) {
                throw new Error(`Invalid content detected in ${fieldName.toLowerCase()}. Please use appropriate educational terms.`);
            }
        }

        return sanitized;
    }

    static checkRateLimit() {
        const now = Date.now();
        
        // Reset window if expired
        if (now - requestTracker.windowStart > SECURITY_CONFIG.rateLimitWindow) {
            requestTracker.count = 0;
            requestTracker.windowStart = now;
        }

        // Check if limit exceeded
        if (requestTracker.count >= SECURITY_CONFIG.maxRequestsPerWindow) {
            const remainingTime = Math.ceil((SECURITY_CONFIG.rateLimitWindow - (now - requestTracker.windowStart)) / 1000);
            throw new Error(`Too many requests. Please wait ${remainingTime} seconds before trying again.`);
        }

        requestTracker.count++;
    }

    static async moderateContent(text) {
        // Simulated moderation API call
        // In production, replace with actual API calls to:
        // - OpenAI Moderation API
        // - Google Perspective API  
        // - Microsoft Content Moderator
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate AI moderation results
                const isSafe = !SECURITY_CONFIG.blockedKeywords.some(keyword => 
                    text.toLowerCase().includes(keyword)
                );
                
                resolve({
                    safe: isSafe,
                    categories: isSafe ? [] : ['inappropriate-content'],
                    confidence: 0.95
                });
            }, 500);
        });
    }
}
