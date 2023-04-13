const TronWeb = require("tronweb");
require("dotenv").config();

// Replace these values with your actual contract address and private key
const CONTRACT_ADDRESS = "TTbxStTcs7Zf7yC3tfzAPx9cbpvtyC477f";
const PRIVATE_KEY = process.env.PRIVATE_KEY_NILE;

// Initialize TronWeb instance
const tronWeb = new TronWeb({
  fullHost: "https://nile.trongrid.io",
  privateKey: PRIVATE_KEY,
});

// TrustScoreRegistry ABI
const TRUST_SCORE_REGISTRY_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reviewer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "reviewee",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
    ],
    name: "ReviewCreated",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "reviewee",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "key",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "value",
            type: "bytes",
          },
        ],
        internalType: "struct TrustScoreRegistry.ReviewData[]",
        name: "_reviews",
        type: "tuple[]",
      },
    ],
    name: "createReview",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "reviews",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function createReviews(reviews) {
  try {
    const contractInstance = await tronWeb.contract().at(CONTRACT_ADDRESS);

    // Separate arrays for reviewees, keys, and values
    const reviewees = reviews.map((review) => review.reviewee);
    const keys = reviews.map((review) => encodeStringAsBytes32(review.key));
    const values = reviews.map((review) => encodeStringAsBytes32(review.value));

    // Call the createReview function with separate arrays
    const transaction = await contractInstance
      .createReview(reviewees, keys, values)
      .send();

    console.log("Transaction successful:", transaction);
  } catch (error) {
    console.error("Error while creating reviews:", error);
  }
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

function decodeBytes32AsString(bytes32) {
  const unpaddedBytes = Buffer.from(bytes32.slice(0), "hex");
  const decoder = new TextDecoder();
  const text = decoder.decode(unpaddedBytes).replace(/\0+$/, "");

  return text;
}

createReviews([
  {
    reviewee: "TU2JJ7XZp5kQT4eAbiBUc9R4uKx7bPdg76",
    key: "123",
    value: "Excellent",
  },
  {
    reviewee: "TU2JJ7XZp5kQT4eAbiBUc9R4uKx7bPdg76",
    key: "456",
    value: "Great communication",
  },
]);

console.log(
  decodeBytes32AsString(
    "3132330000000000000000000000000000000000000000000000000000000000"
  )
);
console.log(
  decodeBytes32AsString(
    "457863656c6c656e740000000000000000000000000000000000000000000000"
  )
);
