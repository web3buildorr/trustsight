import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import express, { Request, Response, Express } from "express";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const app: Express = express();
const port = process.env.PORT ?? 8888;
const MONGO_USER = process.env.MONGO_USER ?? "";
const MONGO_PW = process.env.MONGO_PW ?? "";
const MONGO_DB = process.env.MONGO_DB ?? "";

dotenv.config();

app.use(helmet());
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PW}@cluster0.hsk5jk6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/api/address/:address", async (req: Request, res: Response) => {
  const { address } = req.params;

  console.log("request received for: ", address);

  try {
    await client.connect();

    const addressesCollection = await client
      .db(MONGO_DB)
      .collection("addresses");

    const metadata = await addressesCollection.findOne({ address });

    if (metadata) res.status(200).send(metadata);
    else {
      const newMetadata = {
        username: "",
        subtitle: "",
        image: "",
        address: address,
        category: "",
        createdAt: "",
        description: "",
        flags: 0,
        followers: {},
        following: {},
      };
      await addressesCollection.updateOne(
        { _id: address as any },
        { $set: newMetadata },
        { upsert: true }
      );
      res.status(200).send(newMetadata);
    }
  } catch (error) {
    console.error("Error while processing request:", error);
    res.status(500).send("An error occurred while communicating with server.");
  }
});

type Review = Record<string, any>;

function computeAverage(reviews: Review[]): Review {
  if (reviews.length === 0) {
    return { trust: 0 };
  }

  const total = reviews.reduce((acc, curr) => {
    for (const key in curr) {
      if (typeof curr[key] === "number") {
        acc[key] = (acc[key] || 0) + curr[key];
      }
    }
    return acc;
  }, {} as Review);

  const count = reviews.length;

  const average = {} as Review;
  for (const key in total) {
    average[key] = total[key] / count;
  }

  return average;
}

app.get("/api/reviews/:address", async (req: Request, res: Response) => {
  const { address } = req.params;

  try {
    await client.connect();

    const reviewsCollection = await client
      .db("trustsight")
      .collection("reviews");

    const reviews = await reviewsCollection
      .find({
        $or: [{ reviewee: address }, { reviewer: address }],
      })
      .toArray();

    const givenReviews = reviews.filter(
      (r) => r.reviewer.toLocaleLowerCase() === address.toLocaleLowerCase()
    );
    const receivedReviews = reviews.filter(
      (r) => r.reviewee.toLocaleLowerCase() === address.toLocaleLowerCase()
    );

    const average = computeAverage(receivedReviews);

    res.status(200).send({
      scores: average,
      givenReviews,
      receivedReviews,
    });
  } catch (error) {
    console.error("Error while fetching reviews:", error);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
