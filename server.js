import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

app.get('/projects', (req, res) => {
    res.render('projects', { title: 'Projects' }); 
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
