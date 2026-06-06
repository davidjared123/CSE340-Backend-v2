import { createUser } from '../src/models/users.js';
import db from '../src/models/db.js';
import bcrypt from 'bcrypt';

async function runTests() {
    console.log("Starting users page and role redirect integration tests...");

    const regularEmail = `user_assignment_${Date.now()}@example.com`;
    const regularPassword = "userpassword123";
    let regularUserId;

    // Create a regular user in the DB
    try {
        const passwordHash = await bcrypt.hash(regularPassword, 10);
        regularUserId = await createUser("Regular User Assignment", regularEmail, passwordHash);
        console.log(`✔ Created regular user in DB with email: ${regularEmail}`);
    } catch (e) {
        console.error("❌ Failed to set up regular user in database:", e.message);
        process.exit(1);
    }

    // Test 1: Logged-out access to admin route (should redirect to /login)
    try {
        let res = await fetch('http://localhost:3000/users', { redirect: 'manual' });
        if (res.status !== 302 || res.headers.get('location') !== '/login') {
            throw new Error(`Logged-out user was not redirected to /login on /users route. Status: ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ Logged-out access to /users correctly redirected to /login");
    } catch (e) {
        console.error("❌ Test 1 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Test 2: Regular user login and access check (should redirect to /dashboard)
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
        
        // Attempt access to admin route /users
        let res = await fetch('http://localhost:3000/users', {
            headers: { 'Cookie': regularCookie },
            redirect: 'manual'
        });
        
        if (res.status !== 302 || res.headers.get('location') !== '/dashboard') {
            throw new Error(`Regular user was not blocked or redirected to /dashboard on /users route. Status: ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ Regular user was blocked from /users and correctly redirected to /dashboard (status 302)");
    } catch (e) {
        console.error("❌ Test 2 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Test 3: Regular user view verification (Manage Users link should be hidden)
    try {
        let res = await fetch('http://localhost:3000/dashboard', {
            headers: { 'Cookie': regularCookie }
        });
        const html = await res.text();
        if (html.includes('href="/users"') || html.includes('Manage Users')) {
            throw new Error("Manage Users link was visible to a regular user on their dashboard!");
        }
        console.log("✔ Manage Users link is hidden from regular user on dashboard");
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
        
        // Access admin route /users
        let res = await fetch('http://localhost:3000/users', {
            headers: { 'Cookie': adminCookie }
        });
        
        if (res.status !== 200) {
            throw new Error(`Admin user was blocked from accessing /users. Status: ${res.status}`);
        }
        
        const html = await res.text();
        if (!html.includes('admin@example.com') || !html.includes('Registered Users')) {
            throw new Error("Registered Users list is missing user emails or headings!");
        }
        
        console.log("✔ Admin user successfully accessed /users and saw the registered user list (status 200)");
    } catch (e) {
        console.error("❌ Test 4 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Test 5: Admin user dashboard view verification (Manage Users link should be visible)
    try {
        let res = await fetch('http://localhost:3000/dashboard', {
            headers: { 'Cookie': adminCookie }
        });
        const html = await res.text();
        if (!html.includes('href="/users"') || !html.includes('Manage Users')) {
            throw new Error("Manage Users link is missing for admin user on dashboard!");
        }
        console.log("✔ Manage Users link is visible to admin user on /dashboard");
    } catch (e) {
        console.error("❌ Test 5 failed:", e.message);
        await cleanup(regularUserId);
        process.exit(1);
    }

    // Clean up
    await cleanup(regularUserId);
    console.log("🎉 All users page and redirect checks passed successfully!");
    process.exit(0);
}

async function cleanup(userId) {
    if (userId) {
        await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
        console.log("✔ Cleaned up regular test user from database.");
    }
}

runTests();
