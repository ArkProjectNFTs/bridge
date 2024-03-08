import cron from "node-cron";
import { Pool } from "pg";
import { MongoClient } from "mongodb";

const EVERAI_L1_CONTRACT_ADDRESS = "0x246d8e00a48576f24a274fb7d35a7d1c7ef950a7";
const QUEST_TYPE = "BRIDGE_EVERAI";

interface BridgeRequest {
  _id: string;
  to: string;
  token_ids: number[];
  is_checked: boolean;
  collection_src: string;
}

interface User {
  id: number;
  starknetAccountAddress: string;
  starknetAccountAddressCreatedAt: Date;
}

interface Quest {
  id: number;
  questType: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  count: number;
  questData: any;
}

async function handleBridgeRequest(doc: BridgeRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();

    // Find or create user (combined logic)
    const userQuery = `
      INSERT INTO User (starknetAccountAddress, starknetAccountAddressCreatedAt)
      VALUES ($1, now())
      ON CONFLICT (starknetAccountAddress) DO UPDATE SET
        starknetAccountAddressCreatedAt = EXCLUDED.starknetAccountAddressCreatedAt
      RETURNING id;
    `;

    const userValues: [string] = [doc.to];
    const userResult = await client.query<User>(userQuery, userValues);

    const userId = userResult.rows[0].id;

    // Check and update quest (combined logic)
    const questQuery = `
      SELECT * FROM Quest
      WHERE userId = $1 AND questType = $2 FOR UPDATE SKIP LOCKED;
    `;

    const questValues: [number, string] = [userId, QUEST_TYPE];
    const questResult = await client.query<Quest>(questQuery, questValues);

    if (questResult.rowCount === 0) {
      // Insert new quest
      const insertQuery = `
        INSERT INTO Quest (questType, userId, createdAt, updatedAt, count, questData)
        VALUES ($1, $2, now(), now(), 1, $3)
        RETURNING *;
      `;

      const insertValues: [string, number, any] = [QUEST_TYPE, userId, {}];
      const insertResult = await client.query<Quest>(insertQuery, insertValues);

      console.log("Quest inserted successfully:", insertResult.rows[0]);
    } else {
      // Update existing quest
      const updateQuery = `
        UPDATE Quest
        SET count = count + 1, updatedAt = now()
        WHERE id = $1;
      `;

      const updateValues: [number] = [questResult.rows[0].id];
      await client.query(updateQuery, updateValues);

      console.log("Quest updated successfully:", questResult.rows[0]);
    }

    await client.release();
  } catch (error) {
    console.error("Error handling bridge request:", error);
  } finally {
    pool.end();
  }

  const mongoClient = new MongoClient("mongodb://172.19.0.2:27017");
  await mongoClient.connect();
  const db = mongoClient.db("starklane");
  const requests = db.collection<BridgeRequest>("starknet_bridge_requests");
  await requests.updateOne({ _id: doc._id }, { $set: { is_checked: true } });
  await mongoClient.close();
}

async function tick() {
  const uri = "mongodb://172.19.0.2:27017";
  const client = new MongoClient(uri);

  console.log("Connecting to mongodb...");

  try {
    await client.connect();
    console.log("Connecté à MongoDB");

    const db = client.db("starklane");

    const requests = db.collection<BridgeRequest>("starknet_bridge_requests");
    const documents = await requests
      .find({
        is_checked: false,
        collection_src: EVERAI_L1_CONTRACT_ADDRESS,
      })
      .toArray();

    for (const doc of documents) {
      await handleBridgeRequest(doc);
    }
  } finally {
    await client.close();
  }
}

cron.schedule("*/10 * * * * *", () => {
  console.log("Checking bridge requests...");
  tick();
});
