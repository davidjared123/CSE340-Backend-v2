import express from 'express';
import { showProjectsPage, showProjectDetailsPage, showEditProjectForm, processEditProjectForm } from './controllers/projects.js';
import { showCategoriesPage, showCategoryDetailsPage } from './controllers/categories.js';
import { showNewOrganizationForm, processNewOrganizationForm } from './controllers/organizations.js';
import { newOrganizationRules, validate } from './middleware/validation.js';

const router = express.Router();

router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);

// Route for new organization page
router.get('/new-organization', showNewOrganizationForm);

// Route to handle new organization form submission
router.post('/new-organization', newOrganizationRules, validate, processNewOrganizationForm);

// Route for edit project form page
router.get('/edit-project/:id', showEditProjectForm);

// Route to handle edit project form submission
router.post('/edit-project/:id', processEditProjectForm);

export default router;
