import { getAllCategories, getCategoryById } from '../models/categories.js';
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
