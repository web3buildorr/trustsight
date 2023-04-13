const TronWeb = require("tronweb");
require("dotenv").config();

const CONTRACT_ADDRESS = "TTbxStTcs7Zf7yC3tfzAPx9cbpvtyC477f";
const PRIVATE_KEY = process.env.PRIVATE_KEY_NILE;

const tronWeb = new TronWeb({
  fullHost: "https://nile.trongrid.io",
  privateKey: PRIVATE_KEY,
});

// Create an initial trust pool with default parameters
function createPool() {
  return {
    trustPool: {},
    initialTrust: {},
    certainty: 0.001,
    max: 200,
    alpha: 0.95,
  };
}

// Encode a raw key into a suitable format
function encodeRawKey(rawKey) {
  if (rawKey.length < 32) return hre.ethers.utils.formatBytes32String(rawKey);

  const hash = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes(rawKey));
  return hash.slice(0, 64) + "ff";
}

// Add trust relationships to the trust pool
function addTrust(pool, creator, recipient, score) {
  if (!pool.trustPool.hasOwnProperty(creator)) {
    pool.trustPool[creator] = {};
  }
  pool.trustPool[creator][recipient] = score;
}

// Set the initial trust scores for recipients
function initialTrust(pool, recipient, score) {
  pool.initialTrust[recipient] = score;
}

// Calculate the Eigentrust scores iteratively based on the trust pool's relationships
function computeTrust(pool) {
  if (Object.keys(pool.initialTrust).length === 0) {
    return {};
  }

  let prevIteration = pool.initialTrust;

  for (let i = 0; i < pool.max; i++) {
    let currIteration = computeIteration(pool, prevIteration);
    let d = avgD(prevIteration, currIteration);
    prevIteration = currIteration;
    if (d < pool.certainty) {
      break;
    }
  }

  return prevIteration;
}

// Perform a single iteration of the Eigentrust calculation
function computeIteration(pool, prevIteration) {
  const t1 = {};
  Object.entries(prevIteration).forEach(([creator, score1]) => {
    Object.entries(pool.trustPool[creator] || {}).forEach(
      ([recipient, score2]) => {
        if (creator != recipient) {
          if (!t1.hasOwnProperty(recipient)) {
            t1[recipient] = 0;
          }
          t1[recipient] += score1 * score2;
        }
      }
    );
  });

  let highestTrustScore = 0;
  Object.entries(t1).forEach(([_, score]) => {
    if (score > highestTrustScore) {
      highestTrustScore = score;
    }
  });

  Object.entries(t1).forEach(([key, score]) => {
    t1[key] =
      (score / highestTrustScore) * pool.alpha +
      (1 - pool.alpha) * pool.initialTrust[key];
  });

  return t1;
}

// Calculate the average difference between two consecutive iterations
function avgD(prevIteration, currIteration) {
  let d = 0;

  Object.entries(currIteration).forEach(([key, score]) => {
    d += Math.abs(score - prevIteration[key]);
  });

  d = d / Object.entries(prevIteration).length;

  return d;
}

async function createReview(reviewer, reviewee, key, score) {
  try {
    const contractInstance = await tronWeb.contract().at(CONTRACT_ADDRESS);

    const transaction = await contractInstance
      .createReview([reviewee], [key], [score])
      .send();

    console.log("Transaction successful:", transaction);
  } catch (error) {
    console.error("Error while creating reviews:", error);
  }
}

async function main() {
  const trustKey = encodeStringAsBytes32("trustsight.trust");

  const pool = createPool();

  // Fetch trust relationships from the TRON contract
  // You can replace `getTrustEvents()` with your own logic to fetch trust relationships from your TRON contract
  const trustEvents = await getTrustEvents();

  trustEvents.forEach(({ reviewer, reviewee, key, score }) => {
    if (key === trustKey) {
      addTrust(pool, reviewer, reviewee, Number(score));
    }
  });

  // Set initial trust for recipients
  trustEvents.forEach(({ reviewer, reviewee, key, score }) => {
    if (key === trustKey) {
      initialTrust(pool, reviewee, Number(score));
    }
  });

  const outputPool = computeTrust(pool);

  // Update scores on the contract
  for (const [recipient, score] of Object.entries(outputPool)) {
    await createReview(CREATOR_ADDRESS, recipient, trustKey, String(score));
  }

  console.log(`Updated ${trustEvents.length} scores`);
}

main();

// Replace this function with your own logic to fetch trust relationships from your TRON contract
async function getTrustEvents() {
  // Example data format
  return [
    {
      reviewer: "TU2JJ7XZp5kQT4eAbiBUc9R4uKx7bPdg76",
      reviewee: "TU2JJ7XZp5kQT4eAbiBUc9R4uKx7bPdg76",
      key: encodeStringAsBytes32("trustsight.trust"),
      score: "4",
    },
    {
      reviewer: "TU2JJ7XZp5kQT4eAbiBUc9R4uKx7bPdg76",
      reviewee: "TU2JJ7XZp5kQT4eAbiBUc9R4uKx7bPdg76",
      key: encodeStringAsBytes32("trustsight.trust"),
      score: "5",
    },
  ];
}

function encodeStringAsBytes32(text) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const paddedBytes = new Uint8Array(32).fill(0);

  if (bytes.length > 32) {
    throw new Error("Text must be 32 bytes or shorter.");
  }

  paddedBytes.set(bytes);

  return "0x" + Buffer.from(paddedBytes).toString("hex");
}
