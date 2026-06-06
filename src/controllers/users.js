import bcrypt from 'bcrypt';
import { createUser, authenticateUser } from '../models/users.js';

/**
 * Renders the user registration form.
 */
export const showUserRegistrationForm = (req, res) => {
    res.render('register', { 
        title: 'Register User',
        name: '',
        email: ''
    });
};

/**
 * Processes the registration form, hashes the password, and creates the user.
 */
export const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        await createUser(name, email, passwordHash);
        
        req.flash('success', 'User registered successfully! You can now log in.');
        res.redirect('/login'); // Redirect to login page after successful registration
    } catch (error) {
        console.error("Error in registration controller:", error);
        
        // Flash a general error message and redirect back to the form
        req.flash('error', error.message || 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

/**
 * Renders the user login form.
 */
export const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

/**
 * Processes the user login form.
 */
export const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);
        if (user) {
            // Store user info in session
            req.session.user = user;
            req.flash('success', 'Login successful!');

            if (res.locals.NODE_ENV === 'development' || process.env.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

/**
 * Processes logging out the user.
 */
export const processLogout = async (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

/**
 * Middleware to require user login for protected routes.
 */
export const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

/**
 * Renders the protected dashboard view.
 */
export const showDashboard = (req, res) => {
    const user = req.session.user;
    res.render('dashboard', { 
        title: 'Dashboard',
        name: user.name,
        email: user.email
    });
};


