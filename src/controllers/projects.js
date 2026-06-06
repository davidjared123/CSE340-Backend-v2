import { getUpcomingProjects, getProjectDetails, updateProject, createProject } from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

export async function showProjectsPage(req, res) {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        console.log('Upcoming projects retrieved:', projects);
        res.render('projects', { title: 'Upcoming Service Projects', projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send('Internal Server Error');
    }
}

export async function showProjectDetailsPage(req, res) {
    try {
        const id = req.params.id;
        const project = await getProjectDetails(id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        const categories = await getCategoriesByProjectId(id);
        res.render('project', { title: project.title, project, categories });
    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Controller to show the edit project form.
 */
export async function showEditProjectForm(req, res) {
    try {
        const id = req.params.id;
        const project = await getProjectDetails(id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        const organizations = await getAllOrganizations();
        res.render('update-project', { title: 'Edit Project', project, organizations });
    } catch (error) {
        console.error('Error showing edit project form:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Controller to handle submission of the edit project form.
 */
export async function processEditProjectForm(req, res) {
    try {
        const id = req.params.id;
        const { title, description, location, date, organizationId } = req.body;
        
        await updateProject(id, title, description, location, date, organizationId);
        
        req.flash('success', 'Project updated successfully!');
        res.redirect(`/project/${id}`);
    } catch (error) {
        console.error('Error updating project:', error);
        req.flash('error', 'Failed to update project.');
        res.redirect(`/edit-project/${req.params.id}`);
    }
}

/**
 * Controller to show the create project form.
 */
export async function showNewProjectForm(req, res) {
    try {
        const organizations = await getAllOrganizations();
        res.render('new-project', { title: 'Add New Project', organizations });
    } catch (error) {
        console.error('Error showing new project form:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Controller to handle creation of a new project.
 */
export async function processNewProjectForm(req, res) {
    try {
        const { title, description, location, date, organizationId } = req.body;
        
        const projectId = await createProject(title, description, location, date, organizationId);
        
        req.flash('success', 'Project created successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error creating project:', error);
        req.flash('error', 'Failed to create project.');
        res.redirect('/new-project');
    }
}
