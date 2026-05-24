// Note: Mock implementation since the database connection might not be fully configured yet.
// The actual SQL implementation using pg is commented out below.

const mockCategories = [
    { category_id: 1, name: 'Health & Safety' },
    { category_id: 2, name: 'Community Building' },
    { category_id: 3, name: 'Food Assistance' }
];

const mockProjectCategories = [
    { project_id: 1, category_id: 1 },
    { project_id: 2, category_id: 2 },
    { project_id: 3, category_id: 3 },
    { project_id: 4, category_id: 1 },
    { project_id: 5, category_id: 2 },
    { project_id: 6, category_id: 3 }
];

export async function getAllCategories() {
    return mockCategories;
}

export async function getCategoryById(id) {
    return mockCategories.find(c => c.category_id === parseInt(id));
}

export async function getCategoriesByProjectId(project_id) {
    const categoryIds = mockProjectCategories
        .filter(pc => pc.project_id === parseInt(project_id))
        .map(pc => pc.category_id);
    return mockCategories.filter(c => categoryIds.includes(c.category_id));
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

// export async function getCategoryById(id) {
//     try {
//         const query = `SELECT * FROM categories WHERE category_id = $1;`;
//         const result = await pool.query(query, [id]);
//         return result.rows[0];
//     } catch (error) {
//         console.error("Error fetching category details:", error);
//         throw error;
//     }
// }

// export async function getCategoriesByProjectId(project_id) {
//     try {
//         const query = `
//             SELECT c.category_id, c.name
//             FROM categories c
//             JOIN project_categories pc ON c.category_id = pc.category_id
//             WHERE pc.project_id = $1
//             ORDER BY c.name ASC;
//         `;
//         const result = await pool.query(query, [project_id]);
//         return result.rows;
//     } catch (error) {
//         console.error("Error fetching categories for project:", error);
//         throw error;
//     }
// }
*/
