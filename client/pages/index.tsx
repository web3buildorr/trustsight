import { Search2Icon } from "@chakra-ui/icons";
import { HStack, Text, Input, Box, useToast } from "@chakra-ui/react";
import styles from "@styles/Home.module.css";
import { useRouter } from "next/router";
import { useState } from "react";

function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState("DeFi");
  const isNavbar = false;
  const toast = useToast();
  const [inputValue, setInputValue] = useState("");

  function handleInputChange(e: any) {
    setInputValue(e.target.value);
  }

  function handleNavigation(e: any) {
    e.preventDefault();
    if (inputValue.length === 0) return;
    router.push(`/address/${inputValue}`);
  }

  return (
    <main className={styles.main}>
      <Box h="40px" />
      <Text className={styles.title}>
        Read Reviews. Write Reviews. Find addresses you can{" "}
        <span className={styles.specialWord}>trust.</span>
      </Text>
      <HStack className={!isNavbar ? styles.searchbar : styles.searchbarMini}>
        <Search2Icon color="black" />
        <form onSubmit={handleNavigation} style={{ width: "100%" }}>
          <Input
            className={styles.searchInput}
            placeholder="Search account or contract by address"
            onSubmit={handleNavigation}
            onChange={handleInputChange}
          ></Input>
        </form>
      </HStack>
      <Text className={styles.bold}>Built with ❤️ at HackaTRON Season 4</Text>
    </main>
  );
}

export default Home;
