// Mock DB for the assignment
const mockOrganizations = [
    { organization_id: 1, name: 'Red Cross' },
    { organization_id: 2, name: 'Habitat for Humanity' },
    { organization_id: 3, name: 'Local Food Bank' }
];

const db = {
    query: async (query, params) => {
        const id = mockOrganizations.length + 1;
        mockOrganizations.push({ organization_id: id, name: params[0], description: params[1], contactEmail: params[2], logoFilename: params[3] });
        return { rows: [{ organization_id: id }] };
    }
};

/**
 * Creates a new organization in the database.
 * @param {string} name - The name of the organization.
 * @param {string} description - A description of the organization.
 * @param {string} contactEmail - The contact email for the organization.
 * @param {string} logoFilename - The filename of the organization's logo.
 * @returns {string} The id of the newly created organization record.
 */
const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
      INSERT INTO organization (name, description, contact_email, logo_filename)
      VALUES ($1, $2, $3, $4)
      RETURNING organization_id
    `;

    const queryParams = [name, description, contactEmail, logoFilename];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new organization with ID:', result.rows[0].organization_id);
    }

    return result.rows[0].organization_id;
};

/**
 * Retrieves all organizations from the database.
 * @returns {Array} List of organizations.
 */
const getAllOrganizations = async () => {
    // Mock implementation returning the memory array
    return mockOrganizations;
};

/*
// --- ACTUAL DATABASE IMPLEMENTATION ---
// export async function getAllOrganizations() {
//     try {
//         const query = `SELECT organization_id, name FROM organizations ORDER BY name ASC`;
//         const result = await pool.query(query);
//         return result.rows;
//     } catch (error) {
//         console.error("Error fetching organizations from database:", error);
//         throw error;
//     }
// }
*/

export { createOrganization, getAllOrganizations };
