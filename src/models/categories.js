// Note: Mock implementation since the database connection might not be fully configured yet.
// The actual SQL implementation using pg is commented out below.

export async function getAllCategories() {
    return [
        { category_id: 1, name: 'Health & Safety' },
        { category_id: 2, name: 'Community Building' },
        { category_id: 3, name: 'Food Assistance' }
    ];
}

/* 
// --- ACTUAL DATABASE IMPLEMENTATION ---
// import pool from '../database/index.js'; // Adjust path to your database connection module

// export async function getAllCategories() {
//     try {
//         const query = `SELECT * FROM categories ORDER BY name ASC;`;
//         const result = await pool.query(query);
//         return result.rows;
//     } catch (error) {
//         console.error("Error fetching categories from database:", error);
//         throw error;
//     }
// }
*/
