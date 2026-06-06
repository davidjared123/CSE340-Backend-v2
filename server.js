import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
import flash from './src/middleware/flash.js';
import appRoutes from './src/routes.js';
dotenv.config();

// Configuración de rutas base (necesario en ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Allow Express to receive and process common POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up session management
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // Session expires after 1 hour of inactivity
}));

// Use flash message middleware
app.use(flash);

// Make isLoggedIn and NODE_ENV available in EJS templates
app.use((req, res, next) => {
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }
    res.locals.NODE_ENV = process.env.NODE_ENV || 'development';
    next();
});

// Servir archivos estáticos (CSS/Imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' }); 
});

app.use('/', appRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
