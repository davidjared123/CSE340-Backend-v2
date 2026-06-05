import { body, validationResult } from 'express-validator';

/**
 * Validation rules for creating a new organization
 */
export const newOrganizationRules = [
    // Validate Organization Name
    body('name')
        .trim()
        .notEmpty().withMessage('Organization Name is required.'),
    
    // Validate Description
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required.'),
    
    // Validate Contact Email
    body('contactEmail')
        .trim()
        .notEmpty().withMessage('Contact Email is required.')
        .isEmail().withMessage('A valid email address is required.')
        .normalizeEmail()
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
        
        // Redirect back to the new-organization form page
        return res.redirect('/new-organization');
    }
    next();
};
