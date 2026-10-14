import mongoose from "mongoose";

async function ConnectDb() {
  const databaseUrl = process.env.MONGO_DB_CATEGORY;

  if (!databaseUrl) {
    throw new Error("MONGO_DB_CATEGORY is not configured.");
  }

  await mongoose.connect(databaseUrl);
  console.log("Connected to MongoDB.");
}

export default ConnectDb;
