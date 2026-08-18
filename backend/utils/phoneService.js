/**
 * Phone number normalization utilities
 * Handles international phone formats and converts them to local format for database lookup
 */

/**
 * Normalize phone number by removing country code and special characters
 * Accepts formats like:
 * - +919876543210 (with country code)
 * - 9876543210 (local format)
 * - +91-9876543210
 * - (91) 9876543210
 * Returns normalized format: 9876543210
 * 
 * @param {string} phone - Raw phone number input
 * @returns {string} - Normalized phone number (digits only, without country code)
 */
const normalizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If the number is longer than 10 digits, assume the first digits are country code
  // Extract the last 10 digits (standard Indian phone format)
  if (cleaned.length > 10) {
    cleaned = cleaned.slice(-10);
  }

  return cleaned;
};

/**
 * Validate phone number format
 * Checks if phone number is valid after normalization
 * 
 * @param {string} phone - Phone number to validate
 * @returns {object} - { valid: boolean, normalized: string, error: string|null }
 */
const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, normalized: '', error: 'Phone number is required' };
  }

  const normalized = normalizePhoneNumber(phone);

  // Check if normalized number is 10 digits (standard format)
  if (!/^\d{10}$/.test(normalized)) {
    return { 
      valid: false, 
      normalized, 
      error: `Invalid phone format. Expected 10 digits, got ${normalized.length}` 
    };
  }

  return { valid: true, normalized, error: null };
};

module.exports = {
  normalizePhoneNumber,
  validatePhoneNumber,
};
