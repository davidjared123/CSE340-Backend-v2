import db from '../src/models/db.js';

async function inspect() {
    try {
        console.log("Inspecting database columns...");
        const columnsRes = await db.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
        `);
        
        const tables = {};
        columnsRes.rows.forEach(r => {
            if (!tables[r.table_name]) tables[r.table_name] = [];
            tables[r.table_name].push(`${r.column_name} (${r.data_type})`);
        });

        for (const [table, cols] of Object.entries(tables)) {
            console.log(`Table '${table}':`, cols.join(', '));
        }
        process.exit(0);
    } catch (e) {
        console.error("Database column inspection failed:", e.message);
        process.exit(1);
    }
}

inspect();
