import "../style.css";
import type { AppProps } from "next/app";
import { motion } from "framer-motion";
import { Inter } from "next/font/google";
import { usePrevious } from "../hooks";
import { useParams, usePathname } from "next/navigation";
import { Header } from "../components/header";
import { match, P } from "ts-pattern";
import { useRouter } from "next/router";
import { useSiteStore } from "../store";

const interFont = Inter({
  weight: "variable",
  subsets: ["latin-ext"],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const pathname = usePathname();
  const disableGlobalTransition = useSiteStore(
    (state) => state.disableGlobalTransition
  );

  return (
    <>
      <Header />
      <div className={`${interFont.className}`}>
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
    </>
  );
}
