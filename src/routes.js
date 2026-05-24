import express from 'express';
import { showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';

const router = express.Router();

router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);

export default router;
