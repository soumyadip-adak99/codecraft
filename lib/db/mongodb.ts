/**
 * mongodb.ts — Native MongoClient (with DNS patch for Atlas SRV)
 *
 * Root cause of `querySrv ECONNREFUSED`:
 *  - `mongodb+srv://` uses DNS SRV records for host discovery.
 *  - Windows ISP DNS often blocks SRV queries — Google DNS fixes this.
 */

// ── MUST be first — patch DNS before MongoClient loads ──
import { setServers } from "dns";
setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const db_name = process.env.MONGODB_DB_NAME;
const uri = `${process.env.MONGODB_URI}/${db_name}`;

const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 15000,
    maxPoolSize: 10,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;