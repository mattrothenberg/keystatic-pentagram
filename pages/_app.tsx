import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import "../style.css";
import { usePathname } from "next/navigation";

const interFont = Inter({
  weight: "variable",
  subsets: ["latin-ext"],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const pathname = usePathname();
  return (
    <div className={`container px-4 ${interFont.className}`}>
      <Component key={pathname} {...pageProps} />
    </div>
  );
}
