import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  HStack,
  Text,
  VStack,
  Image,
  Link as ChakraLink,
  Textarea,
  Button,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import styles from "@styles/Home.module.css";
import SuccessLottie from "@components/SuccessLottie";
import Jdenticon from "react-jdenticon";
import {
  abridgeAddress,
  capitalizeFirstLetter,
  encodeStringAsBytes,
  encodeStringAsBytes32,
  TRUSTSIGHT_API_URL,
} from "@utils/utils";
import { useEffect, useState } from "react";
import { Web3Storage } from "web3.storage";
import axios from "axios";
import { Review } from "@utils/types";

const TRUSTSCORE_REGISTRY_ADDRESS = "TASoUmvErzXd4AxrEEHJXLFGb8tyr5Ubx6";

const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY;

const client = new Web3Storage({
  token: WEB3_STORAGE_TOKEN,
  endpoint: new URL("https://api.web3.storage"),
});

type CachedReview = {
  reviewee: string;
  [key: string]: string | number | object;
};

type Props = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  username: string;
  image: string;
  address: string;
  account: string;
  category: string;
  subscores: any;
};

function ReviewModal({
  isOpen,
  onOpen,
  onClose,
  username,
  image,
  address,
  account,
  category,
  subscores,
}: Props) {
  const [comment, setComment] = useState("");
  const [txnHash, setTxnHash] = useState<string>("");
  const [isTxnLoading, setTxnLoading] = useState(false);
  const [reviewMap, setReviewMap] = useState({
    trust: { reviewee: "", key: "", val: 0 },
  });

  async function cacheReview(txn?: string) {
    let cachedReview: CachedReview = {
      reviewer: account,
      reviewee: reviewMap.trust.reviewee,
      comment,
      transaction: txn,
    };

    for (let category in reviewMap) {
      cachedReview[category] = reviewMap[category].val;
    }

    cachedReview.createdAt = Date.now();
    cachedReview.likes = {};
    cachedReview.comments = {};

    try {
      const response = await axios.post(`${TRUSTSIGHT_API_URL}/api/reviews`, {
        review: cachedReview,
      });

      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
    setTxnLoading(false);
  }

  async function uploadComment() {
    const blob = new Blob(
      [
        JSON.stringify({
          comment,
        }),
      ],
      {
        type: "application/json",
      }
    );

    const files = [new File([blob], "comment.json")];
    const jsonCID = await client.put(files);
    const commentURL = `https://${jsonCID}.ipfs.w3s.link/comment.json`;
    console.log(`uploaded comment URL: ${commentURL}`);

    return commentURL;
  }

  async function attachComment() {
    const commentURL = await uploadComment();

    const review = {
      reviewee: address,
      key: "trustsight.comment",
      val: commentURL,
    };

    const reviewDeepCopy = JSON.parse(JSON.stringify(reviewMap));
    reviewDeepCopy["comment"] = review;
    return reviewDeepCopy;
  }

  async function createReview() {
    setTxnLoading(true);
    const trustscoreRegistryContract = await window.tronWeb
      .contract()
      .at(TRUSTSCORE_REGISTRY_ADDRESS);

    let reviews: Review[] = Object.values(reviewMap);

    if (comment) {
      const newReviewMap = await attachComment();
      reviews = Object.values(newReviewMap);
    }

    const reviewees = reviews.map((review) => review.reviewee);
    const keys = reviews.map((review) => encodeStringAsBytes32(review.key));
    const values = reviews.map((review) => encodeStringAsBytes(review.val));

    const txn = await trustscoreRegistryContract
      .createReview(reviewees, keys, values)
      .send();

    setTxnHash(txn);

    await cacheReview(txn);
  }

  function handleSetScore(score: number, type: string) {
    const reviewDeepCopy = JSON.parse(JSON.stringify(reviewMap));

    if (score === reviewDeepCopy[type]["val"]) {
      reviewDeepCopy[type]["val"] = 0;
      setReviewMap(reviewDeepCopy);
    } else {
      reviewDeepCopy[type]["val"] = score;
      setReviewMap(reviewDeepCopy);
    }
  }

  function handleSetComment(e) {
    setComment(e.target.value);
  }

  useEffect(() => {
    if (!address || !subscores) return;

    const reviewDeepCopy = JSON.parse(JSON.stringify(reviewMap));

    const trustKey = "trustsight.trust";

    const review = {
      reviewee: address,
      key: trustKey,
      val: 0,
    };

    reviewDeepCopy["trust"] = review;

    subscores.forEach((subscore) => {
      const reviewKey = `trustsight.${category}.${subscore}`;

      const review = {
        reviewee: address,
        key: reviewKey,
        val: 0,
      };

      reviewDeepCopy[subscore] = review;
    });
    setReviewMap(reviewDeepCopy);
  }, [address, category, subscores]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent className={styles.modalContent}>
        <ModalHeader className={styles.modalHeader}>
          <Text className={styles.yourReview}>Your Review</Text>
        </ModalHeader>
        <ModalCloseButton />
        {txnHash ? (
          <VStack className={styles.lottieContainer}>
            <SuccessLottie />
            <Text className={styles.subHeader} pb="1rem">
              Review successfully submitted!
            </Text>
          </VStack>
        ) : (
          <ModalBody>
            <VStack>
              <HStack className={styles.modalTopSection}>
                <HStack>
                  {image ? (
                    <Image
                      src={image}
                      alt={image}
                      className={styles.modalImage}
                    ></Image>
                  ) : (
                    <Jdenticon
                      value={address as string}
                      className={styles.profileImage}
                    />
                  )}
                  <VStack className={styles.modalTitleSection}>
                    <Text className={styles.modalTitle}>{username}</Text>
                    <Text className={styles.modalAddress}>
                      {abridgeAddress(address as string)}
                    </Text>
                  </VStack>
                </HStack>
                <HStack gap={2}>
                  <Text className={styles.trustScore}>Trust Score</Text>
                  <HStack>
                    {new Array(reviewMap["trust"]["val"])
                      .fill(0)
                      .map((_, idx) => (
                        <Image
                          src="/star.png"
                          alt="yo"
                          key={`star-${idx}`}
                          className={styles.largestar}
                          onClick={() => handleSetScore(idx + 1, "trust")}
                        />
                      ))}
                    {new Array(5 - reviewMap["trust"]["val"])
                      .fill(0)
                      .map((_, idx) => (
                        <Image
                          src="/blankstar.png"
                          alt="yo"
                          key={`blankstar-${idx}`}
                          className={styles.largestar}
                          onClick={() =>
                            handleSetScore(
                              reviewMap["trust"]["val"] + idx + 1,
                              "trust"
                            )
                          }
                        />
                      ))}
                  </HStack>
                </HStack>
              </HStack>
              {category && (
                <VStack>
                  <Box h="10px"></Box>
                  <HStack>
                    <VStack className={styles.categoryPill}>
                      <Text className={styles.categoryPillText}>
                        {category}
                      </Text>
                    </VStack>
                    <Text className={styles.subHeader}>
                      Category scores (optional)
                    </Text>
                  </HStack>
                  <Box h="10px"></Box>
                </VStack>
              )}
              {subscores && subscores.length > 0 && (
                <SimpleGrid columns={2} gap={6}>
                  {subscores.map((type) => (
                    <HStack key={type}>
                      <Text className={styles.subHeader} w="130px">
                        {capitalizeFirstLetter(type)}
                      </Text>
                      <HStack>
                        {new Array(
                          type in reviewMap ? reviewMap[type]["val"] : 0
                        )
                          .fill(0)
                          .map((_, idx) => (
                            <Image
                              src="/star.png"
                              alt="yo"
                              key={`star-${idx}`}
                              className={styles.largestar}
                              onClick={() => handleSetScore(idx + 1, type)}
                            />
                          ))}
                        {new Array(
                          type in reviewMap ? 5 - reviewMap[type]["val"] : 5
                        )
                          .fill(0)
                          .map((_, idx) => (
                            <Image
                              src="/blankstar.png"
                              alt="yo"
                              key={`blankstar-${idx}`}
                              className={styles.largestar}
                              onClick={() =>
                                handleSetScore(
                                  reviewMap[type]["val"] + idx + 1,
                                  type
                                )
                              }
                            />
                          ))}
                      </HStack>
                    </HStack>
                  ))}
                </SimpleGrid>
              )}
              <Box h="15px"></Box>
              <VStack w="100%" alignItems="flex-start">
                <Text className={styles.trustScore}>Comments</Text>
                <Box h="5px"></Box>
                <Textarea
                  placeholder="Write your review"
                  value={comment}
                  onChange={handleSetComment}
                />
              </VStack>
            </VStack>
          </ModalBody>
        )}
        <ModalFooter className={styles.modalFooter}>
          <VStack>
            {txnHash ? (
              <ChakraLink
                isExternal
                href={`https://tronscan.org/#/transaction/${txnHash}`}
              >
                <Button className={styles.submitButton}>
                  View Transaction
                </Button>
              </ChakraLink>
            ) : (
              <Button className={styles.submitButton} onClick={createReview}>
                {isTxnLoading ? <Spinner color="white" /> : "Submit Review"}
              </Button>
            )}
            {!txnHash && (
              <Text fontSize="14px" pt="1rem">
                The contract you will interact with has not been audited for
                production usage. Please use at your own discretion.
              </Text>
            )}
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ReviewModal;
