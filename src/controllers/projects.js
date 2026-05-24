import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';

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
