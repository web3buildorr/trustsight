import { Text, Box } from "@chakra-ui/react";
import styles from "@styles/Home.module.css";

function Home() {
  return (
    <main className={styles.main}>
      <Box h="40px" />
      <Text className={styles.title}>
        Read Reviews. Write Reviews. Find addresses you can{" "}
        <span className={styles.specialWord}>trust.</span>
      </Text>
      <Text className={styles.bold}>Built with ❤️ at HackaTRON Season 4</Text>
    </main>
  );
}

export default Home;
