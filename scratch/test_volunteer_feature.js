import { createUser } from '../src/models/users.js';
import db from '../src/models/db.js';
import bcrypt from 'bcrypt';

async function runTests() {
    console.log("Starting volunteer feature integration tests...");

    const testEmail = `volunteer_test_${Date.now()}@example.com`;
    const testName = "Volunteer Test User";
    const testPassword = "volunteerPassword123";
    let userId;

    // 1. Create a test user in DB
    try {
        const passwordHash = await bcrypt.hash(testPassword, 10);
        userId = await createUser(testName, testEmail, passwordHash);
        console.log(`✔ Created test user in DB: ${testEmail}`);
    } catch (e) {
        console.error("❌ Failed to set up test user:", e.message);
        process.exit(1);
    }

    // 2. Log in and capture session cookie
    let cookie = '';
    try {
        let res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(testEmail)}&password=${encodeURIComponent(testPassword)}`,
            redirect: 'manual'
        });
        
        if (res.status !== 302) {
            throw new Error(`Login failed with status ${res.status}`);
        }
        
        const setCookieHeaders = res.headers.get('set-cookie');
        if (!setCookieHeaders) {
            throw new Error("No session cookie set on successful login!");
        }
        cookie = setCookieHeaders.split(';')[0];
        console.log("✔ User logged in successfully and session cookie captured.");
    } catch (e) {
        console.error("❌ Test step 'Login' failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    const testProjectId = 2; // Home Build - Lot A

    // 3. Verify logged-out user cannot see volunteer section or volunteer
    try {
        let res = await fetch(`http://localhost:3000/project/${testProjectId}`);
        const html = await res.text();
        if (html.includes('Volunteer for this project') || html.includes('You are volunteering')) {
            throw new Error("Volunteer elements were visible to a logged-out user!");
        }
        
        let addRes = await fetch(`http://localhost:3000/volunteer/add/${testProjectId}`, { redirect: 'manual' });
        if (addRes.status !== 302 || addRes.headers.get('location') !== '/login') {
            throw new Error(`Logged-out volunteer attempt did not redirect to /login. Status: ${addRes.status}`);
        }
        console.log("✔ Logged-out users are correctly blocked from volunteer actions and views");
    } catch (e) {
        console.error("❌ Test step 'Logged-out Block' failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // 4. Verify logged-in user can see the volunteer button
    try {
        let res = await fetch(`http://localhost:3000/project/${testProjectId}`, {
            headers: { 'Cookie': cookie }
        });
        const html = await res.text();
        if (!html.includes('Volunteer for this project')) {
            throw new Error("Volunteer signup link not visible to logged-in user on project details page!");
        }
        console.log("✔ Volunteer signup link is visible to logged-in user");
    } catch (e) {
        console.error("❌ Test step 'Volunteer Visibility' failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // 5. Volunteer for the project and verify redirection and database entry
    try {
        let res = await fetch(`http://localhost:3000/volunteer/add/${testProjectId}`, {
            headers: { 'Cookie': cookie },
            redirect: 'manual'
        });
        
        if (res.status !== 302 || res.headers.get('location') !== `/project/${testProjectId}`) {
            throw new Error(`Volunteer signup did not redirect back to project details. Status: ${res.status}, Location: ${res.headers.get('location')}`);
        }

        // Verify database entry
        const dbRes = await db.query(
            "SELECT 1 FROM project_volunteers WHERE project_id = $1 AND user_id = $2",
            [testProjectId, userId]
        );
        if (dbRes.rows.length === 0) {
            throw new Error("Volunteer record was not created in the database!");
        }
        console.log("✔ Volunteering successful: database record created and redirected back");
    } catch (e) {
        console.error("❌ Test step 'Volunteer Signup Action' failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // 6. Verify status change on project page
    try {
        let res = await fetch(`http://localhost:3000/project/${testProjectId}`, {
            headers: { 'Cookie': cookie }
        });
        const html = await res.text();
        if (!html.includes('You are volunteering for this project') || !html.includes('Remove yourself as a volunteer')) {
            throw new Error("Project page did not update status or show removal link!");
        }
        console.log("✔ Project details page updated to show active volunteering and removal option");
    } catch (e) {
        console.error("❌ Test step 'Volunteer Details Verification' failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // 7. Verify dashboard displays the volunteered project and a remove link
    try {
        let res = await fetch('http://localhost:3000/dashboard', {
            headers: { 'Cookie': cookie }
        });
        const html = await res.text();
        if (!html.includes('Home Build - Lot A') || !html.includes(`/volunteer/remove/${testProjectId}?redirect=dashboard`)) {
            throw new Error("Dashboard does not display volunteered project or the dashboard removal link!");
        }
        console.log("✔ Dashboard displays volunteered project and option to remove");
    } catch (e) {
        console.error("❌ Test step 'Dashboard Verification' failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // 8. Remove yourself as a volunteer from dashboard and verify redirection and deletion
    try {
        let res = await fetch(`http://localhost:3000/volunteer/remove/${testProjectId}?redirect=dashboard`, {
            headers: { 'Cookie': cookie },
            redirect: 'manual'
        });

        if (res.status !== 302 || res.headers.get('location') !== '/dashboard') {
            throw new Error(`Removal from dashboard did not redirect back to dashboard. Status: ${res.status}, Location: ${res.headers.get('location')}`);
        }

        // Verify database entry is deleted
        const dbRes = await db.query(
            "SELECT 1 FROM project_volunteers WHERE project_id = $1 AND user_id = $2",
            [testProjectId, userId]
        );
        if (dbRes.rows.length > 0) {
            throw new Error("Volunteer record still exists in the database after removal!");
        }
        console.log("✔ Volunteering cancelled: database record deleted and redirected back");
    } catch (e) {
        console.error("❌ Test step 'Volunteer Removal Action' failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // 9. Verify dashboard no longer shows the project
    try {
        let res = await fetch('http://localhost:3000/dashboard', {
            headers: { 'Cookie': cookie }
        });
        const html = await res.text();
        if (html.includes('Home Build - Lot A')) {
            throw new Error("Dashboard still displays the project after volunteer removal!");
        }
        console.log("✔ Dashboard successfully updated (project is no longer listed)");
    } catch (e) {
        console.error("❌ Test step 'Post-Removal Dashboard Verification' failed:", e.message);
        await cleanup(userId);
        process.exit(1);
    }

    // Clean up
    await cleanup(userId);
    console.log("🎉 All volunteer integration tests passed successfully!");
    process.exit(0);
}

async function cleanup(userId) {
    if (userId) {
        await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
        console.log("✔ Test user cleaned up from database.");
    }
}

runTests();
