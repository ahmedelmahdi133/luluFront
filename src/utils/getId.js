/**
 * Normalize MongoDB document ID access.
 * Backend may return `id` (virtuals) or `_id` — this helper handles both.
 * @param {Object} obj - Document object
 * @returns {string} The document ID or empty string
 */
export const getId = (obj) => obj?.id || obj?._id || '';
