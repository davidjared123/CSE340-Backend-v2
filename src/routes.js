import express from 'express';
import { 
    showProjectsPage, 
    showProjectDetailsPage, 
    showEditProjectForm, 
    processEditProjectForm,
    showNewProjectForm,
    processNewProjectForm,
    processAddVolunteer,
    processRemoveVolunteer
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
    showUserRegistrationForm, 
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    showDashboard,
    requireRole,
    showUsersPage
} from './controllers/users.js';
import { 
    organizationValidationRules, 
    projectValidationRules,
    categoryValidationRules,
    userRegistrationValidationRules,
    validate 
} from './middleware/validation.js';

const router = express.Router();

// Projects routes
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/new-project', requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireRole('admin'), projectValidationRules, validate, processNewProjectForm);
router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireRole('admin'), projectValidationRules, validate, processEditProjectForm);

// Categories routes
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);
router.get('/new-category', requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireRole('admin'), categoryValidationRules, validate, processNewCategoryForm);
router.get('/edit-category/:id', requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireRole('admin'), categoryValidationRules, validate, processEditCategoryForm);

// Organizations routes
router.get('/organizations', showOrganizationsPage);
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireRole('admin'), organizationValidationRules, validate, processNewOrganizationForm);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/edit-organization/:id', requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireRole('admin'), organizationValidationRules, validate, processEditOrganizationForm);

// User registration routes
router.get('/register', showUserRegistrationForm);
router.post('/register', userRegistrationValidationRules, validate, processUserRegistrationForm);

// User login routes
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);

// Protected dashboard route
router.get('/dashboard', requireLogin, showDashboard);

// Volunteer routes
router.get('/volunteer/add/:projectId', requireLogin, processAddVolunteer);
router.get('/volunteer/remove/:projectId', requireLogin, processRemoveVolunteer);

// Admin users page route
router.get('/users', requireRole('admin'), showUsersPage);

export default router;
