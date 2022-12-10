import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>SF Projects</title>
        <meta name="description" content="SF housing project information." />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Hello World</h1>
        <p>Testing 123</p>
      </main>

      <footer className={styles.footer}>
        <a href="https://github.com/dcposch/yimby-data">View on Github</a>
      </footer>
    </div>
  );
}
