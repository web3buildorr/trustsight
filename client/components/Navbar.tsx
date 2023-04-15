import Link from "next/link";
import styles from "@styles/Navbar.module.css";
import { Box, Button, HStack, Image, Spinner, Text } from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { handleConnect, handleDisconnect } from "@utils/web3";
import { HamburgerIcon } from "@chakra-ui/icons";
import { abridgeAddress } from "@utils/utils";
import { useTron } from "./TronProvider";
import { useRouter } from "next/router";
import { useState } from "react";

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
        <Menu>
          <MenuButton as={Button} variant="custom">
            <HamburgerIcon />
          </MenuButton>
          <MenuList>
            <Link href="/explore">
              <MenuItem>Explore</MenuItem>
            </Link>
            <Link href="/feed">
              <MenuItem>Feed</MenuItem>
            </Link>
            <Link href={`/address/${address}`}>
              <MenuItem>My Profile</MenuItem>
            </Link>
          </MenuList>
        </Menu>
      </HStack>
    </HStack>
  );
};

export default Navbar;
