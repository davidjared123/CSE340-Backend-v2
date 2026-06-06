import { createUser } from '../src/models/users.js';
import db from '../src/models/db.js';
import bcrypt from 'bcrypt';

async function runTests() {
    console.log("Starting admin authorization and role-based access control tests...");

    const regularEmail = `user_${Date.now()}@example.com`;
    const regularPassword = "userpassword123";
    let regularUserId;

    // Create a regular user in the DB
    try {
        const passwordHash = await bcrypt.hash(regularPassword, 10);
        regularUserId = await createUser("Regular User", regularEmail, passwordHash);
        console.log(`✔ Created regular user in DB with email: ${regularEmail}`);
    } catch (e) {
        console.error("❌ Failed to set up regular user in database:", e.message);
        process.exit(1);
    }

    // Test 1: Logged-out access to admin route (should redirect to /login)
    try {
        let res = await fetch('http://localhost:3000/new-project', { redirect: 'manual' });
        if (res.status !== 302 || res.headers.get('location') !== '/login') {
            throw new Error(`Logged-out user was not redirected to /login on admin route. Status: ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ Logged-out access to /new-project correctly redirected to /login");
    } catch (e) {
        console.error("❌ Test 1 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Test 2: Regular user login and access check (should redirect to / with error)
    let regularCookie = '';
    try {
        // Log in regular user
        let loginRes = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(regularEmail)}&password=${encodeURIComponent(regularPassword)}`,
            redirect: 'manual'
        });
        regularCookie = loginRes.headers.get('set-cookie').split(';')[0];
        
        // Attempt access to admin route /new-project
        let res = await fetch('http://localhost:3000/new-project', {
            headers: { 'Cookie': regularCookie },
            redirect: 'manual'
        });
        
        if (res.status !== 302 || res.headers.get('location') !== '/') {
            throw new Error(`Regular user was not blocked from admin route. Status: ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ Regular user was blocked from /new-project and redirected to / (status 302)");
    } catch (e) {
        console.error("❌ Test 2 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Test 3: Regular user view verification (admin buttons should be hidden)
    try {
        let res = await fetch('http://localhost:3000/projects', {
            headers: { 'Cookie': regularCookie }
        });
        const html = await res.text();
        if (html.includes('href="/new-project"')) {
            throw new Error("Add New Project link was visible to a regular user on /projects page!");
        }
        console.log("✔ Add New Project link is hidden from regular user on /projects page");
    } catch (e) {
        console.error("❌ Test 3 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Test 4: Admin user login and access check (should allow access, status 200)
    let adminCookie = '';
    try {
        // Log in grader admin account
        let loginRes = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent('admin@example.com')}&password=${encodeURIComponent('cse340!')}`,
            redirect: 'manual'
        });
        
        if (!loginRes.headers.get('set-cookie')) {
            throw new Error("Admin login failed to set session cookie!");
        }
        adminCookie = loginRes.headers.get('set-cookie').split(';')[0];
        
        // Access admin route /new-project
        let res = await fetch('http://localhost:3000/new-project', {
            headers: { 'Cookie': adminCookie }
        });
        
        if (res.status !== 200) {
            throw new Error(`Admin user was blocked from accessing /new-project. Status: ${res.status}`);
        }
        console.log("✔ Admin user successfully accessed /new-project (status 200)");
    } catch (e) {
        console.error("❌ Test 4 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Test 5: Admin user view verification (admin buttons should be visible)
    try {
        let res = await fetch('http://localhost:3000/projects', {
            headers: { 'Cookie': adminCookie }
        });
        const html = await res.text();
        if (!html.includes('href="/new-project"') && !html.includes('Add a new project')) {
            throw new Error("Add New Project link is missing for admin user on /projects page!");
        }
        console.log("✔ Add New Project link is visible to admin user on /projects page");
    } catch (e) {
        console.error("❌ Test 5 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Clean up
    await cleanup(regularUserId);
    console.log("🎉 All admin role and authorization tests passed successfully!");
    process.exit(0);
}

async function cleanup(userId) {
    if (userId) {
        await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
        console.log("✔ Cleaned up regular test user from database.");
    }
}

runTests();
