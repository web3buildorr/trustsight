import { MongoClient, ServerApiVersion } from "mongodb";
import { addresses, reviews } from "./data";
require("dotenv").config();

type Review = {
  reviewer: string;
  reviewee: string;
  score: number;
  review: string;
  createdAt: string;
};

type Result = {
  _id: string;
  comment: string;
  governance: number;
  innovative: number;
  liquidity: number;
  tokenomics: number;
  reviewer: string;
  reviewee: string;
  transaction: null;
  trust: number;
};

const getRandomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

function mapReviews(reviews: Review[]): Result[] {
  return reviews.map((review, idx) => ({
    _id: `${review.reviewer}:${review.reviewee}`,
    comment: review.review,
    governance: getRandomFourOrFive(),
    innovative: getRandomFourOrFive(),
    liquidity: getRandomFourOrFive(),
    tokenomics: getRandomFourOrFive(),
    reviewer: review.reviewer,
    reviewee: review.reviewee,
    transaction: null,
    trust: review.score,
    createdAt: getRandomDate(new Date("2023-04-13"), new Date("2023-05-13")),
    likes: {},
    comments: {},
  }));
}

function getRandomFourOrFive(): number {
  return Math.random() > 0.5 ? 5 : 4;
}

const MONGO_USER = process.env.MONGO_USER ?? "";
const MONGO_PW = process.env.MONGO_PW ?? "";
const MONGO_DB = process.env.MONGO_DB ?? "";

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PW}@cluster0.hsk5jk6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function main() {
  try {
    await client.connect();

    // const addressesCollection = await client
    //   .db(MONGO_DB)
    //   .collection("addresses");

    // const addressKeys = Object.keys(addresses);

    // for (let i = 0; i < addressKeys.length; i++) {
    //   await addressesCollection.updateOne(
    //     { _id: addressKeys[i] as any },
    //     { $set: addresses[addressKeys[i]] },
    //     { upsert: true }
    //   );
    // }

    const reviewsCollection = await client.db(MONGO_DB).collection("reviews");

    const result = mapReviews(reviews);

    for (let i = 0; i < result.length; i++) {
      await reviewsCollection.updateOne(
        { _id: result[i]._id as any },
        { $set: result[i] },
        { upsert: true }
      );
    }
  } catch (err) {
    console.log(err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
