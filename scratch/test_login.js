import { createUser } from '../src/models/users.js';
import db from '../src/models/db.js';
import bcrypt from 'bcrypt';

async function runTests() {
    console.log("Starting login, logout, and session persistence integration tests...");

    const testEmail = `loginuser_${Date.now()}@example.com`;
    const testName = "Login Test User";
    const testPassword = "securepassword456";
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

    // Test 1: GET /login
    try {
        let res = await fetch('http://localhost:3000/login');
        if (res.status !== 200) throw new Error(`GET /login failed with status ${res.status}`);
        console.log("✔ GET /login succeeded (status 200)");
    } catch (e) {
        console.error("❌ Test 1 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Test 2: Login with INVALID credentials
    try {
        let res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(testEmail)}&password=wrongpassword`,
            redirect: 'manual'
        });
        
        if (res.status !== 302 || res.headers.get('location') !== '/login') {
            throw new Error(`Invalid credentials did not redirect to /login: Status ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ Invalid login correctly redirects back to /login (status 302)");
    } catch (e) {
        console.error("❌ Test 2 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Test 3: Login with VALID credentials and capture session cookie
    let cookie = '';
    try {
        let res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(testEmail)}&password=${encodeURIComponent(testPassword)}`,
            redirect: 'manual'
        });
        
        if (res.status !== 302 || res.headers.get('location') !== '/') {
            throw new Error(`Valid credentials did not redirect to /: Status ${res.status}, Location: ${res.headers.get('location')}`);
        }
        
        const setCookieHeaders = res.headers.get('set-cookie');
        if (!setCookieHeaders) {
            throw new Error("No session cookie set on successful login!");
        }
        
        // Extract the session cookie (connect.sid)
        cookie = setCookieHeaders.split(';')[0];
        console.log("✔ Valid login redirects to / (status 302)");
        console.log(`✔ Session cookie successfully captured: ${cookie.substring(0, 25)}...`);
    } catch (e) {
        console.error("❌ Test 3 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Test 4: Verify Session Persistence & Dynamic Navigation (Should show Logout, not Login/Register)
    try {
        let res = await fetch('http://localhost:3000/', {
            headers: { 'Cookie': cookie }
        });
        
        if (res.status !== 200) {
            throw new Error(`GET / with session cookie failed with status ${res.status}`);
        }
        
        const html = await res.text();
        
        // The dynamic nav should contain the Logout link
        if (!html.includes('href="/logout"')) {
            throw new Error("Navigation does not display 'Logout' link when user is logged in!");
        }
        
        // The dynamic nav should NOT contain Login or Register links
        if (html.includes('href="/login"') || html.includes('href="/register"')) {
            throw new Error("Navigation displays 'Login' or 'Register' links while logged in!");
        }
        
        console.log("✔ Navigation dynamically updated to show only 'Logout' (Session verified)");
    } catch (e) {
        console.error("❌ Test 4 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Test 5: Logout Flow
    try {
        let res = await fetch('http://localhost:3000/logout', {
            headers: { 'Cookie': cookie },
            redirect: 'manual'
        });
        
        if (res.status !== 302 || res.headers.get('location') !== '/login') {
            throw new Error(`GET /logout did not redirect to /login: Status ${res.status}, Location: ${res.headers.get('location')}`);
        }
        console.log("✔ Logout redirects to /login (status 302)");
        
        // Verify that the session is destroyed by fetching home page again with the same cookie
        let resHome = await fetch('http://localhost:3000/', {
            headers: { 'Cookie': cookie }
        });
        const htmlHome = await resHome.text();
        
        if (htmlHome.includes('href="/logout"')) {
            throw new Error("Logout failed: Session still active and showing 'Logout' link!");
        }
        
        if (!htmlHome.includes('href="/login"') || !htmlHome.includes('href="/register"')) {
            throw new Error("Navigation did not revert to showing 'Login' and 'Register' links after logout!");
        }
        
        console.log("✔ Session successfully destroyed and navigation reverted (Logout verified)");
    } catch (e) {
        console.error("❌ Test 5 failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Clean up
    await cleanup(userId);
    console.log("🎉 All login, logout, and session tests passed successfully!");
    process.exit(0);
}

async function cleanup(userId) {
    if (userId) {
        await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
        console.log("✔ Test user cleaned up from database.");
    }
}

runTests();
