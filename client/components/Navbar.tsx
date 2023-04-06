import Link from "next/link";
import styles from "@styles/Navbar.module.css";
import { Box, Button, HStack, Image, Spinner, Text } from "@chakra-ui/react";
import { useTron } from "./TronProvider";
import { abridgeAddress } from "@utils/utils";
import { handleConnect, handleDisconnect } from "@utils/web3";
import { useState } from "react";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();
  const { address, setAddress, provider } = useTron();
  const [isHover, setIsHover] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  function handleNavigate() {
    router.push("/");
  }

  return (
    <HStack className={styles.navbar}>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          cursor="pointer"
          className={styles.logo}
        ></Image>
      </Link>
      <HStack className={styles.navLeftSection}>
        <Link href="/profile">
          <Text cursor="pointer">My Profile</Text>
        </Link>
        <Box></Box>
        {address ? (
          <Button
            className={styles.connectButton}
            onClick={() =>
              handleDisconnect(setLoading, setAddress, handleNavigate)
            }
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            {isLoading ? (
              <Spinner color="white" />
            ) : isHover ? (
              "Disconnect"
            ) : (
              abridgeAddress(address)
            )}
          </Button>
        ) : (
          <Button
            className={styles.connectButton}
            onClick={() => handleConnect(setLoading, setAddress, provider)}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            {isLoading ? <Spinner color="white" /> : "Connect TronLink"}
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default Navbar;
