import styles from "@styles/Home.module.css";
import {
  HStack,
  Image,
  VStack,
  Text,
  Box,
  useDisclosure,
  Button,
  SimpleGrid,
  Textarea,
  Spinner,
  Link as ChakraLink,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { reviews, scoreMap, whitelistedProjects } from "@data/data";
import { abridgeAddress, capitalizeFirstLetter } from "@utils/utils";
import { Select } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { FaFlag } from "react-icons/fa";
import Identicon from "react-identicons";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import SuccessLottie from "@components/SuccessLottie";
import { useTron } from "@components/TronProvider";
import { Web3Storage } from "web3.storage";
import { toastConnectWallet } from "@utils/toast";

const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY;

const client = new Web3Storage({
  token: WEB3_STORAGE_TOKEN,
  endpoint: new URL("https://api.web3.storage"),
});

function Address() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [eventLogMap, setEventLogMap] = useState({});
  const [attestationMap, setAttestationMap] = useState({ trust: { val: 0 } });
  const { address: connectedAddress } = useTron();

  const [sortReviews, setSortReviews] = useState("recent");
  const [filterReviews, setFilterReviews] = useState("all");

  const router = useRouter();
  const { id: address } = router.query;

  let account = whitelistedProjects[address as string];

  if (!account || !eventLogMap) {
    account = {
      score: 0,
      address: address,
      reviews: 0,
      flags: 0,
    };
  }

  const { title, image, category, description, createdAt } = account;

  const filteredReviews = useMemo(
    () => reviews.filter((r) => r.reviewee === address),
    [address]
  );

  const totalScore = filteredReviews.reduce(
    (sum, review) => sum + review.score,
    0
  );

  const averageScore = totalScore / filteredReviews.length;
  const subscores = account.subscores;
  const flags = 0;

  function handleSelectChange(e) {
    setSortReviews(e.target.value);
  }

  function handleFilterChange(e) {
    setFilterReviews(e.target.value);
  }

  function handleSetScore(score: number, type: string) {
    const attestationDeepCopy = JSON.parse(JSON.stringify(attestationMap));

    if (score === attestationDeepCopy[type]["val"]) {
      attestationDeepCopy[type]["val"] = 0;
      setAttestationMap(attestationDeepCopy);
    } else {
      attestationDeepCopy[type]["val"] = score * 100;
      setAttestationMap(attestationDeepCopy);
    }

    console.log(attestationDeepCopy[type]);
  }

  function handleReview() {
    if (!connectedAddress) {
      toastConnectWallet(toast, "Please connect wallet to review.");
    } else {
      onOpen();
    }
  }

  const reviewList = useMemo(() => {
    if (sortReviews === "recent")
      return filteredReviews.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    if (sortReviews === "oldest")
      return filteredReviews.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    else {
      return filteredReviews.sort(
        (a, b) => scoreMap[b.reviewer] - scoreMap[a.reviewer]
      );
    }
  }, [filteredReviews, sortReviews]);

  const filteredReviewList = useMemo(() => {
    if (filterReviews === "all") return reviewList;
    else {
      return reviewList.filter(
        (review) => review.score == parseInt(filterReviews)
      );
    }
  }, [filterReviews, reviewList]);

  const isSuccess = false;
  const data = null;
  const isTxnLoading = false;
  const write = () => {};

  return (
    <main className={styles.main}>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent className={styles.modalContent}>
          <ModalHeader className={styles.modalHeader}>
            <Text className={styles.yourReview}>Your Review</Text>
          </ModalHeader>
          <ModalCloseButton />
          {isSuccess && data ? (
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
                      <Identicon
                        string={address as string}
                        className={styles.modalImage}
                      />
                    )}
                    <VStack className={styles.modalTitleSection}>
                      <Text className={styles.modalTitle}>{title}</Text>
                      <Text className={styles.modalAddress}>
                        {abridgeAddress(address as string)}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack gap={2}>
                    <Text className={styles.trustScore}>Trust Score</Text>
                    <HStack>
                      {new Array(attestationMap["trust"]["val"] / 100)
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
                      {new Array(5 - attestationMap["trust"]["val"] / 100)
                        .fill(0)
                        .map((_, idx) => (
                          <Image
                            src="/blankstar.png"
                            alt="yo"
                            key={`blankstar-${idx}`}
                            className={styles.largestar}
                            onClick={() =>
                              handleSetScore(
                                attestationMap["trust"]["val"] / 100 + idx + 1,
                                "trust"
                              )
                            }
                          />
                        ))}
                    </HStack>
                  </HStack>
                </HStack>
                <Box h="10px"></Box>
                <HStack>
                  {category && (
                    <VStack className={styles.categoryPill}>
                      <Text className={styles.categoryPillText}>
                        {category}
                      </Text>
                    </VStack>
                  )}
                  <Text className={styles.subHeader}>
                    Category scores (optional)
                  </Text>
                </HStack>
                <Box h="10px"></Box>
                {subscores && subscores.length > 0 && (
                  <SimpleGrid columns={2} gap={6}>
                    {subscores.map((type) => (
                      <HStack key={type}>
                        <Text className={styles.subHeader} w="130px">
                          {capitalizeFirstLetter(type)}
                        </Text>
                        <HStack>
                          {new Array(
                            type in attestationMap
                              ? attestationMap[type]["val"] / 100
                              : 0
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
                            type in attestationMap
                              ? 5 - attestationMap[type]["val"] / 100
                              : 5
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
                                    attestationMap[type]["val"] / 100 + idx + 1,
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
                  <Textarea placeholder="Write your review" />
                </VStack>
              </VStack>
            </ModalBody>
          )}
          <ModalFooter className={styles.modalFooter}>
            {isSuccess && data ? (
              <ChakraLink isExternal href="https://example.com">
                <Button className={styles.submitButton}>
                  View Transaction
                </Button>
              </ChakraLink>
            ) : (
              <Button className={styles.submitButton} onClick={() => write?.()}>
                {isTxnLoading ? <Spinner color="white" /> : "Submit Review"}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      <HStack w="100%" justifyContent="space-between">
        <VStack className={styles.leftSection}>
          <VStack className={styles.stickySection}>
            {image ? (
              <Image
                src={image}
                alt={image}
                className={styles.profileImage}
              ></Image>
            ) : (
              <Identicon
                string={address as string}
                className={styles.profileImage}
              />
            )}
            <Box h="10px"></Box>
            <VStack onClick={handleReview} cursor="pointer">
              <HStack>
                {new Array(5).fill(0).map((_, idx) => (
                  <Image
                    src="/blankstar.png"
                    alt="yo"
                    key={idx}
                    className={styles.largestar}
                  />
                ))}
              </HStack>
              <Text>Review this address</Text>
            </VStack>
          </VStack>
        </VStack>

        <VStack className={styles.rightSection}>
          <VStack className={styles.rightInnerSection}>
            <HStack w="100%" justifyContent="space-between">
              <Text className={styles.profileTitle}>
                {title ? title : abridgeAddress(address as string)}
              </Text>
              <HStack>
                <VStack>
                  <HStack>
                    <VStack opacity={0.4}>
                      <FaFlag />
                    </VStack>
                    <Text className={styles.reviewsText}>
                      Report this address
                    </Text>
                  </HStack>
                  {flags && (
                    <Text className={styles.reviewsSubtext}>
                      Reported by {flags} users
                    </Text>
                  )}
                </VStack>
              </HStack>
            </HStack>
            <HStack>
              <Text className={styles.profileSubtitle}>
                {abridgeAddress(address as string)}
              </Text>
              {category && (
                <VStack className={styles.categoryPill}>
                  <Text className={styles.categoryPillText}>{category}</Text>
                </VStack>
              )}
              {flags && (
                <VStack className={styles.scamPill}>
                  <Text className={styles.categoryPillText}>Likely Scam</Text>
                </VStack>
              )}
            </HStack>

            <HStack>
              <HStack className={styles.starContainer}>
                <HStack
                  className={styles.goldStarContainer}
                  style={{
                    width: `${
                      averageScore === 5 ? 207 : (averageScore / 5) * 200
                    }px`,
                  }}
                >
                  {new Array(averageScore ? Math.round(averageScore) : 0)
                    .fill(0)
                    .map((_, idx) => (
                      <Image
                        src="/star.png"
                        alt="yo"
                        key={idx}
                        className={styles.largestar}
                      />
                    ))}
                </HStack>
                <HStack className={styles.blankStarContainer}>
                  {new Array(5).fill(0).map((_, idx) => (
                    <Image
                      src="/greystar.png"
                      alt="yo"
                      key={idx}
                      className={styles.largestar}
                    />
                  ))}
                </HStack>
              </HStack>
              <Text className={styles.scoreText}>
                {averageScore ? averageScore.toFixed(2) : 0}
              </Text>
              <Text className={styles.reviewsText}>
                · {filteredReviews.length} reviews
              </Text>
            </HStack>
            <Box h="1px"></Box>
            <Text className={styles.description}>
              {description ?? "No description available."}
            </Text>
            <Box h="10px"></Box>
            {createdAt && (
              <Text className={styles.reviewsText}>
                Contract deployed on {new Date(createdAt).toDateString()}
              </Text>
            )}
          </VStack>
          <Box h="20px"></Box>
          <VStack className={styles.reviewsContainer}>
            <Text className={styles.reviewsHeader}>Reviews</Text>
            <VStack className={styles.reviewsScorebarContainer}>
              {subscores &&
                subscores.length > 0 &&
                subscores.map((val) => (
                  <HStack key={val}>
                    <Text className={styles.categoryTitle}>
                      {capitalizeFirstLetter(val)}
                    </Text>
                    <Box className={styles.scoreBarContainer}>
                      <Box
                        className={styles.scoreBar}
                        width={`${(account[val] / 5) * 100}%`}
                      ></Box>
                    </Box>
                    <Text className={styles.categoryScore}>{account[val]}</Text>
                  </HStack>
                ))}
            </VStack>
          </VStack>
          {subscores && <Box h="20px"></Box>}
          <VStack w="100%" gap={5} alignItems="flex-start">
            <HStack className={styles.filterContainer}>
              <Text className={styles.filterLabel}>Sort by:</Text>
              <VStack className={styles.select}>
                <Select variant="custom" onChange={handleSelectChange}>
                  <option value="recent">Most recent</option>
                  <option value="trusted">Most trusted</option>
                  <option value="oldest">Oldest</option>
                </Select>
              </VStack>
              <Box w="10px"></Box>
              <Text className={styles.filterLabel}>Filter by:</Text>
              <VStack className={styles.select}>
                <Select variant="custom" onChange={handleFilterChange}>
                  <option value="all">Show all</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 stars</option>
                </Select>
              </VStack>
            </HStack>
            <Tabs isFitted variant="custom">
              <TabList mb="1em">
                <Tab
                  _selected={{
                    color: "black",
                    fontWeight: 700,
                    borderBottom: "2px solid black",
                  }}
                >
                  Received
                </Tab>
                <Tab
                  _selected={{
                    color: "black",
                    fontWeight: 700,
                    borderBottom: "2px solid black",
                  }}
                >
                  Given
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack gap={5}>
                    {filteredReviewList && filteredReviewList.length > 0 ? (
                      filteredReviewList.map(
                        ({ reviewer, score, review, createdAt }, index) => (
                          <HStack
                            key={index}
                            className={styles.reviewContainer}
                          >
                            <VStack className={styles.leftReviewSection}>
                              <Identicon
                                string={reviewer as string}
                                className={styles.reviewImage}
                              />
                              <Text className={styles.reviewReviewer}>
                                {abridgeAddress(reviewer, 5)}
                              </Text>
                              <HStack>
                                <Image
                                  alt="yo"
                                  src="/blackstar.png"
                                  className={styles.blackstar}
                                  opacity={0.5}
                                ></Image>
                                <Text className={styles.reviewScore}>
                                  {scoreMap[reviewer]}
                                </Text>
                              </HStack>
                            </VStack>
                            <VStack className={styles.rightReviewSection}>
                              <HStack className={styles.rightTopSection}>
                                <HStack className={styles.smallStarContainer}>
                                  <HStack
                                    className={styles.goldStarContainer}
                                    style={{
                                      width: `${(score / 5) * 157}px`,
                                    }}
                                  >
                                    {new Array(Math.round(score))
                                      .fill(0)
                                      .map((_, idx) => (
                                        <Image
                                          src="/star.png"
                                          alt="yo"
                                          key={idx}
                                          className={styles.star}
                                        />
                                      ))}
                                  </HStack>
                                  <HStack className={styles.blankStarContainer}>
                                    {new Array(5).fill(0).map((_, idx) => (
                                      <Image
                                        src="/greystar.png"
                                        alt="yo"
                                        key={idx}
                                        className={styles.star}
                                      />
                                    ))}
                                  </HStack>
                                </HStack>
                                <Text className={styles.reviewDate}>
                                  {new Date(createdAt).toDateString()}
                                </Text>
                              </HStack>
                              <Text className={styles.reviewDescription}>
                                {review}
                              </Text>
                            </VStack>
                          </HStack>
                        )
                      )
                    ) : (
                      <Text>No reviews available.</Text>
                    )}
                  </VStack>
                </TabPanel>
                <TabPanel></TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </VStack>
      </HStack>
    </main>
  );
}

export default Address;
