import { createUser } from '../src/models/users.js';
import db from '../src/models/db.js';
import bcrypt from 'bcrypt';

async function runTests() {
    console.log("Starting protected routes and dashboard integration tests...");

    const testEmail = `dashuser_${Date.now()}@example.com`;
    const testName = "Dashboard Test User";
    const testPassword = "securepassword789";
    let userId;

    // Create the test user in the DB
    try {
        const passwordHash = await bcrypt.hash(testPassword, 10);
        userId = await createUser(testName, testEmail, passwordHash);
        console.log(`✔ Created test user in DB with email: ${testEmail}`);
    } catch (e) {
        console.error("❌ Failed to set up test user in database:", e.message);
        process.exit(1);
    }

    // Test 1: Access /dashboard while LOGGED OUT (should redirect to /login)
    try {
        let res = await fetch('http://localhost:3000/dashboard', {
            redirect: 'manual'
        });
        if (res.status !== 302 || res.headers.get('location') !== '/login') {
            throw new Error(`Accessing protected route /dashboard while logged out did not redirect to /login. Status ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ Accessing /dashboard while logged out correctly redirects to /login (status 302)");
    } catch (e) {
        console.error("❌ Test 1 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Test 2: Login (Should redirect to /dashboard)
    let cookie = '';
    try {
        let res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(testEmail)}&password=${encodeURIComponent(testPassword)}`,
            redirect: 'manual'
        });
        
        if (res.status !== 302 || res.headers.get('location') !== '/dashboard') {
            throw new Error(`Login successful redirect was not to /dashboard: Status ${res.status}, Location: ${res.headers.get('location')}`);
        }
        
        const setCookieHeaders = res.headers.get('set-cookie');
        if (!setCookieHeaders) {
            throw new Error("No session cookie set on successful login!");
        }
        
        cookie = setCookieHeaders.split(';')[0];
        console.log("✔ Login redirects to /dashboard upon success (status 302)");
    } catch (e) {
        console.error("❌ Test 2 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Test 3: Access /dashboard with session cookie (Should render successfully with user name & email)
    try {
        let res = await fetch('http://localhost:3000/dashboard', {
            headers: { 'Cookie': cookie }
        });
        
        if (res.status !== 200) {
            throw new Error(`Accessing dashboard with session cookie failed with status ${res.status}`);
        }
        
        const html = await res.text();
        if (!html.includes('Dashboard') || !html.includes(testName) || !html.includes(testEmail)) {
            throw new Error("Dashboard view does not display expected user details!");
        }
        console.log(`✔ Protected dashboard rendered correctly. Details matches user: ${testName} (${testEmail})`);
    } catch (e) {
        console.error("❌ Test 3 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Test 4: Access / home page with session cookie (Should display "My Dashboard" link)
    try {
        let res = await fetch('http://localhost:3000/', {
            headers: { 'Cookie': cookie }
        });
        
        const html = await res.text();
        if (!html.includes('href="/dashboard"') || !html.includes('My Dashboard')) {
            throw new Error("Home page does not contain 'My Dashboard' link for logged-in users!");
        }
        console.log("✔ Home page displays 'My Dashboard' link for logged-in user");
    } catch (e) {
        console.error("❌ Test 4 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Test 5: Logout and verify access to /dashboard is blocked again
    try {
        let resLogout = await fetch('http://localhost:3000/logout', {
            headers: { 'Cookie': cookie },
            redirect: 'manual'
        });
        
        if (resLogout.status !== 302) {
            throw new Error(`Logout failed with status ${resLogout.status}`);
        }
        
        let resDash = await fetch('http://localhost:3000/dashboard', {
            headers: { 'Cookie': cookie },
            redirect: 'manual'
        });
        
        if (resDash.status !== 302 || resDash.headers.get('location') !== '/login') {
            throw new Error(`Accessing /dashboard after logout did not block user! Status ${resDash.status}, Location: ${resDash.headers.get('location')}`);
        }
        
        console.log("✔ Logging out successfully revokes access to the protected dashboard");
    } catch (e) {
        console.error("❌ Test 5 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Clean up
    await cleanup(userId);
    console.log("🎉 All protected routes and dashboard tests passed successfully!");
    process.exit(0);
}

async function cleanup(userId) {
    if (userId) {
        await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
        console.log("✔ Test user cleaned up from database.");
    }
}

runTests();
