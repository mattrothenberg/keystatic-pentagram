import type { AppProps } from "next/app";
import "../style.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="container">
      <Component {...pageProps} />
    </div>
  );
}
