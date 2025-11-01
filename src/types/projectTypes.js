// Project Types and Interfaces

/**
 * @typedef {Object} Project
 * @property {string} id - Unique identifier for the project
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {'IFRS'|'Assurance'} type - Project type
 * @property {number} progress - Progress percentage (0-100)
 * @property {string[]} assigned_to - Array of user IDs assigned to the project
 * @property {string} client - Client user ID
 * @property {string} due_date - Due date in ISO format
 * @property {string} created_by - User ID who created the project
 * @property {'active'|'completed'|'on-hold'|'cancelled'} status - Project status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} ProjectCreate
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {'IFRS'|'Assurance'} type - Project type
 * @property {number} [progress] - Progress percentage (0-100), defaults to 0
 * @property {string[]} [assigned_to] - Array of user IDs assigned to the project
 * @property {string} client - Client user ID
 * @property {string} due_date - Due date in ISO format
 */

/**
 * @typedef {Object} ProjectUpdate
 * @property {number} [progress] - Progress percentage (0-100)
 * @property {string[]} [assigned_to] - Array of user IDs assigned to the project
 * @property {'active'|'completed'|'on-hold'|'cancelled'} [status] - Project status
 * @property {string} [updated_at] - Last update timestamp
 */

/**
 * @typedef {Project} ProjectResponse
 */

/**
 * @typedef {Object} Asset
 * @property {string} reference - Asset reference
 * @property {string} description - Asset description
 * @property {number} superficie_calculee - Calculated surface area
 * @property {number} valeur_neuf - New value
 * @property {number} valeur_depreciee - Depreciated value
 * @property {number} depreciation - Depreciation amount
 */

export const PROJECT_TYPES = ['IFRS', 'Assurance'];
export const PROJECT_STATUSES = ['active', 'completed', 'on-hold', 'cancelled'];
