import { config } from "dotenv";
import cron from "node-cron";
import { Pool } from "pg";
import { MongoClient } from "mongodb";

const EVERAI_L1_CONTRACT_ADDRESS = "0x246d8e00a48576f24a274fb7d35a7d1c7ef950a7";
const QUEST_TYPE = "BRIDGE_EVERAI";

config();

interface BridgeRequest {
  _id: string;
  to: string;
  token_ids: number[];
  is_checked: boolean;
  collection_src: string;
}

interface BridgeQuest {
  id: number;
  questType: string;
  starknetAccountAddress: string;
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

    const questQuery = `
      SELECT * FROM public."BridgeQuest"
      WHERE "starknetAccountAddress" = $1 AND "questType" = $2 FOR UPDATE SKIP LOCKED;
    `;

    const questValues = [doc.to, QUEST_TYPE];
    const questResult = await client.query<BridgeQuest>(
      questQuery,
      questValues,
    );

    if (questResult.rowCount === 0) {
      const insertQuery = `
        INSERT INTO public."BridgeQuest" ("questType", "starknetAccountAddress", "createdAt", "updatedAt", "count", "questData")
        VALUES ($1, $2, now(), now(), 1, $3)
        RETURNING *;
      `;

      const insertValues: [string, string, any] = [
        QUEST_TYPE,
        doc.to,
        { tokenIds: doc.token_ids },
      ];
      const insertResult = await client.query<BridgeQuest>(
        insertQuery,
        insertValues,
      );

      console.log("Quest inserted successfully:", insertResult.rows[0]);
    } else {
      const updateQuery = `
        UPDATE public."BridgeQuest"
        SET count = count + 1, "updatedAt" = now(), "questData" = $3
        WHERE "questType" = $1 AND "starknetAccountAddress" = $2;
      `;

      const data = questResult.rows[0];

      await client.query(updateQuery, [
        data.questType,
        data.starknetAccountAddress,
        {
          ...data.questData,
          tokenIds: [
            ...(data.questData.tokenIds || []),
            ...(doc.token_ids || []),
          ],
        },
      ]);

      console.log("Quest updated successfully:", data);
    }

    await client.release();

    const mongoClient = new MongoClient("mongodb://172.19.0.2:27017");
    await mongoClient.connect();
    const db = mongoClient.db("starklane");
    const requests = db.collection<BridgeRequest>("starknet_bridge_requests");
    await requests.updateOne({ _id: doc._id }, { $set: { is_checked: true } });
    await mongoClient.close();
  } catch (error) {
    console.error("Error handling bridge request:", error);
  } finally {
    pool.end();
  }
}

async function tick() {
  const uri = "mongodb://172.19.0.2:27017";
  const client = new MongoClient(uri);

  try {
    console.log("Checking bridge requests...");
    await client.connect();
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
  tick();
});
