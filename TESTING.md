# Testing Guide for TRON Team

This guide will assist you in testing the key features of TrustSight, a web3 reputation platform powered by EigenTrust for crowdsourcing on-chain trust. Following these steps will enable you to understand how the platform operates and how users interact with it.

Here is our hosted project domain: [https://www.trustsight.org](https://www.trustsight.org/)

You can follow along our demo video for convenience: [https://vimeo.com/829685033](https://vimeo.com/829685033)

### Reading Reviews for On-Chain Addresses

1. Navigate to the landing page on TrustSight.
2. Search for an on-chain address in the search bar or click on a featured project such as "Sunswap" to open its profile page.
1. Scroll down to the 'Reviews' section to read user reviews.

### Writing Reviews for On-Chain Addresses

1. Navigate to an on-chain address's profile page as described above.
2. In the 'Reviews' section, click on 'Review this address'.
3. Connect your wallet with TronLink if you haven't already.
4. Write your comment and assign scores, then click on 'Submit'.
5. Check your transaction on Tronscan and see on-chain data.

### Discovering Top-Rated Projects

1. Go to the 'Explore' tab in the navigation bar.
2. Browse through the list of highest-rated on-chain projects as per their trust scores.

### Liking and Commenting on Reviews

1. Go to the "Feed" tab in the navigation bar.
2. Scroll to the 'Reviews' section, pick a review.
3. Click the 'Like' button to like the review.
4. To comment, type your comment in the comment box.

### Following Users on TrustSight

1. Click on a user's profile name in any review or comment section.
2. On the user's profile page, click the 'Follow' button.
3. Go to the "Feed" page to see new "Following" reviews.

### Customizing Your Profile Name and Image

1. Navigate to your profile page by clicking on your username in the top right corner of the website.
2. Click the pencil button to change your profile name.
3. Click the 'Edit profile image' button to upload your profile image.
4. Click 'Save Changes' to apply your updates.

By following these steps, you can thoroughly test the functionality and usability of TrustSight.

## TrustSight Contract

You can view the test version of our TrustSight contract on Tronscan below:

Nile Testnet: [TTbxStTcs7Zf7yC3tfzAPx9cbpvtyC477f](https://nile.tronscan.org/#/contract/TTbxStTcs7Zf7yC3tfzAPx9cbpvtyC477f/transactions)

To better understand the contract, you can read our documentation [here](contracts/README.md) where we've explained in detail how the contract was built and its functionalities.

We will follow-up with a Mainnet version of the contract in the coming week.

## EigenTrust Algorithm

Finally, you can also view the code for the EigenTrust algorithm that powered the platform at [EigenTrust Algorithm](server/eigentrust.js) and read more about it in the [docs](server/EIGENTRUST.md).

## Final Thoughts

Let us know if you have any feedback or questions about our project. Thank you again for organizing this hackathon.