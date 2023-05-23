# TrustSight EigenTrust Algorithm

This is the EigenTrust algorithm v1 that powers TrustSight on the Tron blockchain. It uses the TronWeb library to communicate with the Tron blockchain. 

## Dependencies

This project relies on the following dependencies:

- `tronweb`: A JavaScript API library for the Tron Blockchain. It allows interaction with a local or remote Tron network node.
- `dotenv`: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.

## Project Structure

### Environment Variables

The script requires an environment variable to function properly:

- `PRIVATE_KEY_NILE`: The private key to the Tron account that will be used to interact with the Tron blockchain.

### Contract Address

The `CONTRACT_ADDRESS` constant is the address of the deployed contract in the Tron Network that this script will interact with.

### TronWeb Instance

A TronWeb instance is created by passing in the full host URL of the Tron Network (in this case, `https://nile.trongrid.io`) and the private key from the environment variable.

### Trust Pool Creation

A Trust Pool is a data structure that keeps track of the trust scores of entities in a network. The `createPool()` function initializes a new Trust Pool with the following default parameters:

- `trustPool`: An empty object for holding trust scores.
- `initialTrust`: An empty object for holding initial trust scores.
- `certainty`: The threshold for determining when the iterative calculation of trust scores has sufficiently converged.
- `max`: The maximum number of iterations for the trust score calculation.
- `alpha`: The decay factor for the trust score calculation.

### Key Encoding

Keys need to be encoded to a specific format before they can be used in the Tron blockchain. The `encodeRawKey()` function takes a raw key string, hashes it, and returns a 64-byte key.

### Trust Score Management

The `addTrust()` function adds a trust relationship between a creator and a recipient to the Trust Pool, along with the corresponding trust score.

The `initialTrust()` function sets the initial trust score for a recipient in the Trust Pool.

The `computeTrust()` function calculates the Eigentrust scores iteratively based on the trust relationships in the Trust Pool.

### Review Creation

The `createReview()` function communicates with the Tron blockchain to create a new review. It does this by calling the `createReview()` function of the smart contract deployed at `CONTRACT_ADDRESS`.

### Main Function

The `main()` function is the entry point of the script. It performs the following steps:

1. Creates a new Trust Pool.
2. Fetches trust relationships from the Tron contract.
3. Adds those trust relationships to the Trust Pool and sets the initial trust scores for the recipients.
4. Computes the final trust scores for the recipients.
5. Creates new reviews on the Tron contract for each recipient with their calculated trust score.

The `getTrustEvents()` function is a placeholder and should be replaced with your own logic to fetch trust relationships from your Tron contract.

The `encodeStringAsBytes32()` function is a utility function that encodes a string into a 32-byte hexadecimal string, which is a format required by the Tron blockchain.

To run the script, ensure that your environment variables are correctly set up and simply execute the script in a Node.js environment.
