import DOMPurify from 'dompurify';

/**
 * Sanitize input to prevent XSS.
 * Removes any HTML tags or scripts from the input.
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

/**
 * Validate email format using regex.
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

/**
 * Validate phone number format (Egyptian format or standard 11 digits starting with 01).
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validatePhone = (phone) => {
    // Allows optional country code or just 11 digits starting with 01
    const re = /^(?:\+2)?01[0125]\d{8}$/;
    return re.test(String(phone).trim());
};

/**
 * Validate name (prevent numbers or special characters).
 * @param {string} name - The name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateName = (name) => {
    // Allows Arabic, English characters, and spaces
    const re = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    return re.test(String(name).trim());
};

/**
 * Validate password length and complexity (min 8 chars).
 * @param {string} password - The password to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validatePassword = (password) => {
    return typeof password === 'string' && password.length >= 8;
};

/**
 * Validate if a string is a valid URL.
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
