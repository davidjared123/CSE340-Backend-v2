// Note: Since a database connection might not be fully configured yet, 
// a mock implementation is provided below so the application can still run and render the page.
// The actual SQL implementation using pg is commented out below.

export async function getAllProjects() {
    // Simulated database query result with a JOIN
    return [
        { title: 'Blood Drive', organization_name: 'Red Cross', date: new Date('2026-06-01') },
        { title: 'Home Build - Lot A', organization_name: 'Habitat for Humanity', date: new Date('2026-06-10') },
        { title: 'Food Sorting', organization_name: 'Local Food Bank', date: new Date('2026-06-05') }
    ];
}

/* 
// --- ACTUAL DATABASE IMPLEMENTATION ---
// import pool from '../database/index.js'; // Adjust path to your database connection module

// export async function getAllProjects() {
//     try {
//         const query = `
//             SELECT p.project_id, p.title, p.description, p.location, p.date, o.name AS organization_name
//             FROM service_projects p
//             JOIN organizations o ON p.organization_id = o.organization_id
//             ORDER BY p.date ASC;
//         `;
//         const result = await pool.query(query);
//         return result.rows;
//     } catch (error) {
//         console.error("Error fetching projects from database:", error);
//         throw error;
//     }
// }
*/
