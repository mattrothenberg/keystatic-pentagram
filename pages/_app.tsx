import { motion } from "framer-motion";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { Header } from "../components/header";
import { useSiteStore } from "../store";
import "../style.css";

const interFont = Inter({
  weight: "variable",
  subsets: ["latin"],
  display: "swap",
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const pathname = usePathname();
  const disableGlobalTransition = useSiteStore(
    (state) => state.disableGlobalTransition
  );

  return (
    <div className={interFont.className}>
      <Header />
      <motion.div
        key={pathname}
        exit={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        initial={disableGlobalTransition ? false : { opacity: 0 }}
        transition={{ type: "spring", duration: 2 }}
      >
        <Component {...pageProps} />
      </motion.div>
    </div>
  );
}
