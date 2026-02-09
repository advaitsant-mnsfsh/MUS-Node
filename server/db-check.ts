import { db } from './src/lib/db';
import { appSecrets } from './src/db/schema';

async function checkSecrets() {
    try {
        console.log("Checking app_secrets table...");
        const data = await db.select().from(appSecrets);
        console.log("Found", data.length, "secrets.");
        data.forEach(s => {
            console.log(`- Key: [${s.key_name}] (Length: ${s.key_name.length})`);
        });
        process.exit(0);
    } catch (e) {
        console.error("DB Check failed:", e);
        process.exit(1);
    }
}

checkSecrets();
