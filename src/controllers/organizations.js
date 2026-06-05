import { createOrganization } from '../models/organizations.js';

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
}

const processNewOrganizationForm = async (req, res) => {
    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png'; // Use the placeholder logo for all new organizations

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
    
    // Set a success flash message
    req.flash('success', 'Organization added successfully!');
    
    res.redirect(`/organization/${organizationId}`);
};

export { showNewOrganizationForm, processNewOrganizationForm };
