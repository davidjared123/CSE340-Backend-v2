// Note: Since a database connection might not be fully configured yet, 
// a mock implementation is provided below so the application can still run and render the page.
// The actual SQL implementation using pg is commented out below.

const mockProjects = [
    { project_id: 1, title: 'Blood Drive', description: 'Help donate blood.', location: 'Community Center', organization_id: 1, organization_name: 'Red Cross', date: new Date('2026-06-01') },
    { project_id: 2, title: 'Home Build - Lot A', description: 'Build a home for those in need.', location: 'Lot A', organization_id: 2, organization_name: 'Habitat for Humanity', date: new Date('2026-06-10') },
    { project_id: 3, title: 'Food Sorting', description: 'Sort food for the hungry.', location: 'Food Bank', organization_id: 3, organization_name: 'Local Food Bank', date: new Date('2026-06-05') }
];

export async function getAllProjects() {
    // Simulated database query result with a JOIN
    return mockProjects;
}

export async function getUpcomingProjects(number_of_projects) {
    const today = new Date();
    // In a real app, today should be midnight local time to include today's events, 
    // but here we just do a simple mock filter.
    const upcoming = mockProjects
        .filter(p => p.date >= today)
        .sort((a, b) => a.date - b.date)
        .slice(0, number_of_projects);
    return upcoming;
}

export async function getProjectDetails(id) {
    return mockProjects.find(p => p.project_id === parseInt(id));
}

/* 
// --- ACTUAL DATABASE IMPLEMENTATION ---
// import pool from '../database/index.js'; // Adjust path to your database connection module

// export async function getAllProjects() {
//     try {
//         const query = `
//             SELECT p.project_id, p.title, p.description, p.location, p.date, p.organization_id, o.name AS organization_name
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

// export async function getUpcomingProjects(number_of_projects) {
//     try {
//         const query = `
//             SELECT p.project_id, p.title, p.description, p.date, p.location, p.organization_id, o.name AS organization_name
//             FROM service_projects p
//             JOIN organizations o ON p.organization_id = o.organization_id
//             WHERE p.date >= CURRENT_DATE
//             ORDER BY p.date ASC
//             LIMIT $1;
//         `;
//         const result = await pool.query(query, [number_of_projects]);
//         return result.rows;
//     } catch (error) {
//         console.error("Error fetching upcoming projects:", error);
//         throw error;
//     }
// }

// export async function getProjectDetails(id) {
//     try {
//         const query = `
//             SELECT p.project_id, p.title, p.description, p.date, p.location, p.organization_id, o.name AS organization_name
//             FROM service_projects p
//             JOIN organizations o ON p.organization_id = o.organization_id
//             WHERE p.project_id = $1;
//         `;
//         const result = await pool.query(query, [id]);
//         return result.rows[0];
//     } catch (error) {
//         console.error("Error fetching project details:", error);
//         throw error;
//     }
// }
*/
