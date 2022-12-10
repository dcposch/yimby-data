import Head from "next/head";
import Search from "./Search";

export default function Home() {
  return (
    <div className="max-w-lg m-auto">
      <Head>
        <title>SF Projects</title>
        <meta name="description" content="SF housing project information." />
      </Head>

      <header className="text-center p-8">
        <h1 className="text-2xl">SF Housing Projects</h1>
        <p>{process.env.NODE_ENV}</p>
      </header>

      <main className="p-4">
        <Search />
      </main>

      <footer className="border-t border-gray-500 p-4">
        <a href="https://github.com/dcposch/yimby-data">View on Github</a>
      </footer>
    </div>
  );
}
