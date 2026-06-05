// Note: Since a database connection might not be fully configured yet, 
// a mock implementation is provided below so the application can still run and render the page.
// The actual SQL implementation using pg is commented out below.

const mockProjects = [
    { project_id: 1, title: 'Blood Drive', description: 'Help donate blood.', location: 'Community Center', organization_id: 1, organization_name: 'Red Cross', date: new Date('2026-06-01') },
    { project_id: 2, title: 'Home Build - Lot A', description: 'Build a home for those in need.', location: 'Lot A', organization_id: 2, organization_name: 'Habitat for Humanity', date: new Date('2026-06-10') },
    { project_id: 3, title: 'Food Sorting', description: 'Sort food for the hungry.', location: 'Food Bank', organization_id: 3, organization_name: 'Local Food Bank', date: new Date('2026-06-05') },
    { project_id: 4, title: 'Park Cleanup', description: 'Clean the local park.', location: 'City Park', organization_id: 4, organization_name: 'City Parks Dept', date: new Date('2026-06-15') },
    { project_id: 5, title: 'Reading to Kids', description: 'Read books to children.', location: 'Public Library', organization_id: 5, organization_name: 'Library Friends', date: new Date('2026-06-20') },
    { project_id: 6, title: 'This should not appear', description: 'Too far in the future.', location: 'Mars', organization_id: 6, organization_name: 'SpaceX', date: new Date('2026-06-25') }
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

export async function getProjectsByCategoryId(category_id) {
    // Mock implementation
    const mockProjectCategories = [
        { project_id: 1, category_id: 1 },
        { project_id: 2, category_id: 2 },
        { project_id: 3, category_id: 3 },
        { project_id: 4, category_id: 1 },
        { project_id: 5, category_id: 2 },
        { project_id: 6, category_id: 3 }
    ];
    const projectIds = mockProjectCategories
        .filter(pc => pc.category_id === parseInt(category_id))
        .map(pc => pc.project_id);
    return mockProjects.filter(p => projectIds.includes(p.project_id));
}

/**
 * Updates an existing project in the mock database.
 * @param {string|number} project_id - The ID of the project to update.
 * @param {string} title - New title.
 * @param {string} description - New description.
 * @param {string} location - New location.
 * @param {string} date - New date.
 * @param {string|number} organization_id - New organization ID.
 * @returns {number} The project ID of the updated project.
 */
export async function updateProject(project_id, title, description, location, date, organization_id) {
    const project = mockProjects.find(p => p.project_id === parseInt(project_id));
    if (!project) {
        throw new Error('Failed to update project: Project not found');
    }
    project.title = title;
    project.description = description;
    project.location = location;
    project.date = new Date(date);
    project.organization_id = parseInt(organization_id);

    // Update organization name in the mock database
    const orgNames = {
        1: 'Red Cross',
        2: 'Habitat for Humanity',
        3: 'Local Food Bank'
    };
    project.organization_name = orgNames[organization_id] || 'Unknown Organization';

    return project.project_id;
}

/* 
// --- ACTUAL DATABASE IMPLEMENTATION ---
// export async function updateProject(project_id, title, description, location, date, organization_id) {
//     try {
//         const query = `
//             UPDATE service_projects
//             SET title = $1, description = $2, location = $3, date = $4, organization_id = $5
//             WHERE project_id = $6
//             RETURNING project_id;
//         `;
//         const queryParams = [title, description, location, date, organization_id, project_id];
//         const result = await pool.query(query, queryParams);
//         if (result.rows.length === 0) {
//             throw new Error('Failed to update project');
//         }
//         return result.rows[0].project_id;
//     } catch (error) {
//         console.error("Error updating project in database:", error);
//         throw error;
//     }
// }
//
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

// export async function getProjectsByCategoryId(category_id) {
//     try {
//         const query = `
//             SELECT p.project_id, p.title, p.description, p.date, p.location, p.organization_id, o.name AS organization_name
//             FROM service_projects p
//             JOIN project_categories pc ON p.project_id = pc.project_id
//             JOIN organizations o ON p.organization_id = o.organization_id
//             WHERE pc.category_id = $1
//             ORDER BY p.date ASC;
//         `;
//         const result = await pool.query(query, [category_id]);
//         return result.rows;
//     } catch (error) {
//         console.error("Error fetching projects by category:", error);
//         throw error;
//     }
// }
*/
