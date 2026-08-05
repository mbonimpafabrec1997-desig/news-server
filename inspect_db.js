import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://mrkaboss263_db_user:kaboss123@cluster0.kiqgkxv.mongodb.net/News-server";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");
    
    const db = mongoose.connection.db;
    const newsCollection = db.collection("news");
    
    const news = await newsCollection.find().sort({ createdAt: -1 }).limit(10).toArray();
    console.log("Latest news articles:");
    news.forEach((n, idx) => {
      console.log(`${idx + 1}. Title: ${n.title}`);
      console.log(`   Image: ${n.image}`);
      console.log(`   Created At: ${n.createdAt}`);
    });
    
    const adsCollection = db.collection("ads");
    const ads = await adsCollection.find().sort({ createdAt: -1 }).limit(10).toArray();
    console.log("\nLatest ads:");
    ads.forEach((a, idx) => {
      console.log(`${idx + 1}. Business Name: ${a.businessName}`);
      console.log(`   Banner: ${a.banner}`);
      console.log(`   Status: ${a.status}`);
      console.log(`   Created At: ${a.createdAt}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
