const mongoose = require('mongoose');
const { mongoAppDb, mongoAppUser, mongoAppPass, mongoRootUri } = require('../config/env');
async function setupMongoDB() {
    let adminConn;

    try {
        // Connect as root
        adminConn = mongoose.createConnection(mongoRootUri, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 8000,
        });
        await adminConn.asPromise();
        console.log("Connected to MongoDB as root");

        const db = adminConn.useDb(mongoAppDb);

        // Check if app user exists
        const existingUsers = await db.db.command({ usersInfo: mongoAppUser });
        if (!existingUsers.users || existingUsers.users.length === 0) {
            console.log(`Creating application user '${mongoAppUser}'...`);
            await db.db.command({
                createUser: mongoAppUser,
                pwd: mongoAppPass,
                roles: [{ role: "readWrite", db: mongoAppDb }],
            });
            console.log("Application user created successfully");
        } else {
            console.log("Application user already exists");
        }
    } catch (error) {
        console.error("Error setting up MongoDB:", error);
        process.exit(1);
    } finally {
        if (adminConn) await adminConn.close();
    }
}

module.exports = { setupMongoDB };
