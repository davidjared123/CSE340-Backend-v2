import express from 'express';
import { 
    showProjectsPage, 
    showProjectDetailsPage, 
    showEditProjectForm, 
    processEditProjectForm,
    showNewProjectForm,
    processNewProjectForm
} from './controllers/projects.js';
import { 
    showCategoriesPage, 
    showCategoryDetailsPage,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm
} from './controllers/categories.js';
import { 
    showNewOrganizationForm, 
    processNewOrganizationForm,
    showOrganizationDetailsPage,
    showEditOrganizationForm,
    processEditOrganizationForm,
    showOrganizationsPage
} from './controllers/organizations.js';
import { 
    organizationValidationRules, 
    projectValidationRules,
    categoryValidationRules,
    validate 
} from './middleware/validation.js';

const router = express.Router();

// Projects routes
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/new-project', showNewProjectForm);
router.post('/new-project', projectValidationRules, validate, processNewProjectForm);
router.get('/edit-project/:id', showEditProjectForm);
router.post('/edit-project/:id', projectValidationRules, validate, processEditProjectForm);

// Categories routes
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);
router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidationRules, validate, processNewCategoryForm);
router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidationRules, validate, processEditCategoryForm);

// Organizations routes
router.get('/organizations', showOrganizationsPage);
router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidationRules, validate, processNewOrganizationForm);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidationRules, validate, processEditOrganizationForm);

export default router;
