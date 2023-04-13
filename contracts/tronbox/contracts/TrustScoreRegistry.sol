// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TrustScoreRegistry {
    // A nested mapping to store reviews for each user (reviewee) submitted by another user (reviewer).
    // Structure: registry[reviewer][reviewee][key] = score
    mapping(address => mapping(address => mapping(bytes32 => bytes)))
        public registry;

    // A struct to represent review, containing the reviewee's address, a key (identifier), and a score (review details).
    struct Review {
        address reviewee;
        bytes32 key;
        bytes score;
    }

    // An event to notify listeners when a new review is created (useful for dapps).
    // It includes the reviewer's address, reviewee's address, the key (identifier), and the score (review details).
    event ReviewCreated(
        address indexed reviewer,
        address indexed reviewee,
        bytes32 indexed key,
        bytes score
    );

    // createReview function accepts an array of Review structs as input and stores them in the contract.
    // It also emits a ReviewCreated event for each review in the array.
    function createReview(
        address[] memory _reviewees,
        bytes32[] memory _keys,
        bytes[] memory _scores
    ) public {
        require(
            _reviewees.length == _keys.length && _keys.length == _scores.length,
            "Input array lengths must be equal"
        );

        for (uint256 i = 0; i < _reviewees.length; ++i) {
            // Reconstruct the review struct
            Review memory review = Review({
                reviewee: _reviewees[i],
                key: _keys[i],
                score: _scores[i]
            });

            registry[msg.sender][review.reviewee][review.key] = review.score;
            emit ReviewCreated(
                msg.sender,
                review.reviewee,
                review.key,
                review.score
            );
        }
    }
}
