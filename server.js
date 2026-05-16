import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllProjects } from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';
dotenv.config();

// Configuración de rutas base (necesario en ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Servir archivos estáticos (CSS/Imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' }); 
});

app.get('/organizations', (req, res) => {
    res.render('organizations', { title: 'Organizations' }); 
});

app.get('/projects', async (req, res) => {
    try {
        const projects = await getAllProjects();
        console.log('Projects retrieved:', projects);
        res.render('projects', { title: 'Projects', projects }); 
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.render('categories', { title: 'Service Categories', categories }); 
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
