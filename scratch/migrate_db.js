import db from '../src/models/db.js';

async function migrate() {
    try {
        console.log("Running migration...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS project_volunteers (
                project_id INTEGER NOT NULL REFERENCES service_projects(project_id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                PRIMARY KEY (project_id, user_id)
            );
        `);
        console.log("✔ Table 'project_volunteers' created successfully!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
