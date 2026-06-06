import bcrypt from 'bcrypt';
import db from '../src/models/db.js';

async function seed() {
    console.log("Seeding grader admin account...");
    const email = 'admin@example.com';
    const name = 'admin';
    const password = 'cse340!';

    try {
        // Clean up existing admin user to ensure idempotency
        await db.query("DELETE FROM users WHERE email = $1", [email]);

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Get admin role ID
        const roleRes = await db.query("SELECT role_id FROM roles WHERE role_name = 'admin'");
        if (roleRes.rows.length === 0) {
            throw new Error("Admin role not found in database! Make sure setup.sql was run successfully.");
        }
        const adminRoleId = roleRes.rows[0].role_id;

        // Insert admin user
        const insertQuery = `
            INSERT INTO users (name, email, password_hash, role_id)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id
        `;
        const result = await db.query(insertQuery, [name, email, passwordHash, adminRoleId]);
        console.log(`✔ Admin account created successfully with ID: ${result.rows[0].user_id}`);
        
        // Verify user and role
        const verifyRes = await db.query(`
            SELECT u.user_id, u.email, r.role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.role_id 
            WHERE u.email = $1
        `, [email]);
        console.log("✔ Verification:", verifyRes.rows[0]);

        console.log("🎉 Seeding completed successfully!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Seeding failed:", e.message);
        process.exit(1);
    }
}

seed();
