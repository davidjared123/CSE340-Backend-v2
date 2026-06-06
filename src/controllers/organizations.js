import { createOrganization, getOrganizationDetails, updateOrganization, getAllOrganizations } from '../models/organizations.js';

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

/**
 * Controller to display organization details page
 */
const showOrganizationDetailsPage = async (req, res) => {
    try {
        const id = req.params.id;
        const organization = await getOrganizationDetails(id);
        if (!organization) {
            return res.status(404).send('Organization not found');
        }
        res.render('organization', { title: organization.name, organization });
    } catch (error) {
        console.error('Error fetching organization details:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Controller to show the edit organization form
 */
const showEditOrganizationForm = async (req, res) => {
    try {
        const id = req.params.id;
        const organization = await getOrganizationDetails(id);
        if (!organization) {
            return res.status(404).send('Organization not found');
        }
        res.render('edit-organization', { title: 'Edit Organization', organization });
    } catch (error) {
        console.error('Error showing edit organization form:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Controller to handle submission of organization updates
 */
const processEditOrganizationForm = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, contactEmail } = req.body;
        const org = await getOrganizationDetails(id);
        const logoFilename = org ? org.logoFilename : 'placeholder-logo.png';
        
        await updateOrganization(id, name, description, contactEmail, logoFilename);
        req.flash('success', 'Organization updated successfully!');
        res.redirect(`/organizations`);
    } catch (error) {
        console.error('Error updating organization:', error);
        req.flash('error', 'Failed to update organization.');
        res.redirect(`/edit-organization/${req.params.id}`);
    }
}

/**
 * Controller to display organizations list page
 */
const showOrganizationsPage = async (req, res) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('organizations', { title: 'Organizations', organizations });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).send('Internal Server Error');
    }
}

export { 
    showNewOrganizationForm, 
    processNewOrganizationForm,
    showOrganizationDetailsPage,
    showEditOrganizationForm,
    processEditOrganizationForm,
    showOrganizationsPage
};
