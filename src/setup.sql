CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE service_projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(organization_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    date DATE
);

-- Insert Organizations
INSERT INTO organizations (name) VALUES 
('Red Cross'), 
('Habitat for Humanity'), 
('Local Food Bank');

-- Insert at least 5 projects per organization (15 total)
INSERT INTO service_projects (organization_id, title, description, location, date) VALUES 
-- Organization 1 (Red Cross)
(1, 'Blood Drive', 'Annual blood drive', 'City Center', '2026-06-01'),
(1, 'CPR Training', 'Learn life-saving CPR', 'Community Center', '2026-06-15'),
(1, 'Disaster Relief Training', 'Prepare for emergencies', 'Red Cross HQ', '2026-07-10'),
(1, 'First Aid Workshop', 'Basic first aid skills', 'High School', '2026-07-20'),
(1, 'Volunteer Orientation', 'Intro for new volunteers', 'City Center', '2026-08-05'),
-- Organization 2 (Habitat for Humanity)
(2, 'Home Build - Lot A', 'Building a new home', '123 Main St', '2026-06-10'),
(2, 'Home Build - Lot B', 'Framing a new home', '456 Oak St', '2026-06-17'),
(2, 'Neighborhood Cleanup', 'Cleaning up the block', 'Downtown', '2026-06-24'),
(2, 'Painting Day', 'Painting a community center', 'Community Center', '2026-07-01'),
(2, 'Landscaping Project', 'Planting trees and shrubs', 'City Park', '2026-07-08'),
-- Organization 3 (Local Food Bank)
(3, 'Food Sorting', 'Sort donated canned goods', 'Food Bank Warehouse', '2026-06-05'),
(3, 'Meal Prep', 'Prepare hot meals', 'Community Kitchen', '2026-06-12'),
(3, 'Grocery Delivery', 'Deliver groceries to seniors', 'Various Locations', '2026-06-19'),
(3, 'Food Drive at Supermarket', 'Collect donations', 'Local Grocery Store', '2026-06-26'),
(3, 'Pantry Reorganization', 'Organize shelves', 'Food Bank Warehouse', '2026-07-03');

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE project_categories (
    project_id INTEGER REFERENCES service_projects(project_id),
    category_id INTEGER REFERENCES categories(category_id),
    PRIMARY KEY (project_id, category_id)
);

-- Insert Categories
INSERT INTO categories (name) VALUES 
('Health & Safety'),
('Community Building'),
('Food Assistance');

-- Associate projects with categories
INSERT INTO project_categories (project_id, category_id) VALUES 
(1, 1), (2, 1), (3, 1), (4, 1), (5, 2),
(6, 2), (7, 2), (8, 2), (9, 2), (10, 2),
(11, 3), (12, 3), (13, 3), (14, 3), (15, 3);
