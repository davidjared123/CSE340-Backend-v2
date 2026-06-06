import { getUserByEmail } from '../src/models/users.js';
import db from '../src/models/db.js';

async function runTests() {
    console.log("Starting user registration and hashing integration tests...");

    const testEmail = `testuser_${Date.now()}@example.com`;
    const testName = "Test User Registration";
    const testPassword = "supersecurepassword123";

    // Test 1: GET /register
    try {
        let res = await fetch('http://localhost:3000/register');
        if (res.status !== 200) throw new Error(`GET /register failed with status ${res.status}`);
        console.log("✔ GET /register succeeded (status 200)");
    } catch (e) {
        console.error("❌ Test 1 failed:", e.message);
        process.exit(1);
    }

    // Test 2: POST /register (Successful Registration)
    try {
        let res = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `name=${encodeURIComponent(testName)}&email=${encodeURIComponent(testEmail)}&password=${encodeURIComponent(testPassword)}`,
            redirect: 'manual'
        });
        
        if (res.status !== 302 || res.headers.get('location') !== '/') {
            throw new Error(`POST /register failed: Status ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ POST /register redirects to / (status 302)");
    } catch (e) {
        console.error("❌ Test 2 failed:", e.message);
        process.exit(1);
    }

    // Test 3: Verify User stored in database and password is hashed
    let userId;
    try {
        const user = await getUserByEmail(testEmail);
        if (!user) {
            throw new Error("User was not found in the database after successful registration!");
        }
        userId = user.user_id;
        
        console.log(`✔ User found in DB. Name: "${user.name}", Role: "${user.role_name}"`);

        // Check if password hash is valid bcrypt hash (starts with $2b$ or $2a$)
        if (!user.password_hash.startsWith('$2')) {
            throw new Error(`Password was not correctly hashed! Hashed value: "${user.password_hash}"`);
        }
        console.log(`✔ Password is hashed securely: "${user.password_hash}"`);
    } catch (e) {
        console.error("❌ Test 3 failed:", e.message);
        // Clean up before exiting
        if (testEmail) {
            await db.query("DELETE FROM users WHERE email = $1", [testEmail]);
        }
        process.exit(1);
    }

    // Test 4: Duplicate registration (Email must be unique)
    try {
        let res = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'http://localhost:3000/register'
            },
            body: `name=Another&email=${encodeURIComponent(testEmail)}&password=anotherpassword`,
            redirect: 'manual'
        });
        
        // Should redirect back to /register due to validation error
        if (res.status !== 302 || !res.headers.get('location').includes('/register')) {
            throw new Error(`Duplicate registration validation bypass! Status ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ Duplicate registration blocked by validation (redirects back to /register)");
    } catch (e) {
        console.error("❌ Test 4 failed:", e.message);
        // Clean up before exiting
        if (userId) {
            await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
        }
        process.exit(1);
    }

    // Clean up
    if (userId) {
        await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
        console.log("✔ Test user cleaned up from database successfully.");
    }

    console.log("🎉 All user registration and hashing tests passed successfully!");
    process.exit(0);
}

runTests();
