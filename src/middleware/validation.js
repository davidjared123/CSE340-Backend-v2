import { body, validationResult } from 'express-validator';

/**
 * Validation rules for creating and editing an organization
 */
export const organizationValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Organization Name is required.'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required.'),
    body('contactEmail')
        .trim()
        .notEmpty().withMessage('Contact Email is required.')
        .isEmail().withMessage('A valid email address is required.')
        .normalizeEmail()
];

// Alias for backwards compatibility
export const newOrganizationRules = organizationValidationRules;

/**
 * Validation rules for creating and editing a service project
 */
export const projectValidationRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Project Title is required.'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required.'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required.'),
    body('date')
        .trim()
        .notEmpty().withMessage('Date is required.')
        .isISO8601().withMessage('Please enter a valid date.'),
    body('organizationId')
        .trim()
        .notEmpty().withMessage('Organization is required.')
        .isInt().withMessage('Please select a valid organization.')
];

/**
 * Validation rules for creating and editing a category
 */
export const categoryValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters.')
];

/**
 * Middleware to check validation results and handle errors
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Flash all validation errors to the session
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        
        // Redirect back to the page from which the form was submitted
        return res.redirect(req.get('Referer') || '/');
    }
    next();
};
