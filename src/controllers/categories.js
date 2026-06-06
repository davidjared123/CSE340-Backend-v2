import { getAllCategories, getCategoryById, createCategory, updateCategory } from '../models/categories.js';
import { getProjectsByCategoryId } from '../models/projects.js';

export async function showCategoriesPage(req, res) {
    try {
        const categories = await getAllCategories();
        res.render('categories', { title: 'Service Categories', categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
    }
}

export async function showCategoryDetailsPage(req, res) {
    try {
        const id = req.params.id;
        const category = await getCategoryById(id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        const projects = await getProjectsByCategoryId(id);
        res.render('category', { title: category.name, category, projects });
    } catch (error) {
        console.error('Error fetching category details:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Action to display the form for creating a new category
 */
export async function showNewCategoryForm(req, res) {
    res.render('new-category', { title: 'Add New Category' });
}

/**
 * Action to handle form submission for a new category
 */
export async function processNewCategoryForm(req, res) {
    try {
        const { name } = req.body;
        await createCategory(name);
        req.flash('success', 'Category created successfully!');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error creating category:', error);
        req.flash('error', 'Failed to create category.');
        res.redirect('/new-category');
    }
}

/**
 * Action to display the edit form for an existing category
 */
export async function showEditCategoryForm(req, res) {
    try {
        const id = req.params.id;
        const category = await getCategoryById(id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('edit-category', { title: 'Edit Category', category });
    } catch (error) {
        console.error('Error showing edit category form:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Action to process form submission for updating a category
 */
export async function processEditCategoryForm(req, res) {
    try {
        const id = req.params.id;
        const { name } = req.body;
        await updateCategory(id, name);
        req.flash('success', 'Category updated successfully!');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', 'Failed to update category.');
        res.redirect(`/edit-category/${req.params.id}`);
    }
}
