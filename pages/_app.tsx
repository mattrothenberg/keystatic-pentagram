import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import "../style.css";
import { usePathname } from "next/navigation";
import { Header } from "../components/header";

const interFont = Inter({
  weight: "variable",
  subsets: ["latin-ext"],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const pathname = usePathname();
  return (
    <>
      <Header />
      <div className={`${interFont.className}`}>
        <Component key={pathname} {...pageProps} />
      </div>
    </>
  );
}
