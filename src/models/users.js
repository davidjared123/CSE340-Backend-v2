import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Creates a new user in the database with the default 'user' role.
 * @param {string} name - User's display name.
 * @param {string} email - User's email.
 * @param {string} passwordHash - Hashed password.
 * @returns {number} The newly created user ID.
 */
const createUser = async (name, email, passwordHash) => {
    const default_role = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id) 
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4)) 
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, default_role];
    
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

/**
 * Retrieves a user by their email address.
 * @param {string} email - The user's email.
 * @returns {object|null} The user object or null if not found.
 */
const getUserByEmail = async (email) => {
    const query = `
        SELECT u.*, r.role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Finds a user in the database by their email.
 * @param {string} email - User's email.
 * @returns {object|null} User record or null if not found.
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT user_id, name, email, password_hash, role_id 
        FROM users 
        WHERE email = $1
    `;
    const queryParams = [email];
    
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows[0];
};

/**
 * Verifies if a password matches a bcrypt hash.
 * @param {string} password - Plaintext password.
 * @param {string} passwordHash - Hashed password.
 * @returns {boolean} True if they match, false otherwise.
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticates a user by email and password.
 * @param {string} email - User email.
 * @param {string} password - User plaintext password.
 * @returns {object|null} Authenticated user object (without password hash) or null.
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }
    
    const isPasswordCorrect = await verifyPassword(password, user.password_hash);
    if (isPasswordCorrect) {
        // Remove password hash before returning the user
        delete user.password_hash;
        return user;
    }
    
    return null;
};

export { createUser, getUserByEmail, authenticateUser };

