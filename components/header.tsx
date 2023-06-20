import { motion } from "framer-motion";
import { useScrollDirection } from "../hooks";
import { usePathname } from "next/navigation";
import Logo from "../public/logo.svg";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  const scrollDirection = useScrollDirection();
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      data-direction={scrollDirection}
      className={`sticky h-24 transition-all duration-500 bg-white z-10 header flex items-center`}
    >
      <div className="container px-4">
        <Link href="/">
          <Image alt="Logo" src={Logo} width={210} />
        </Link>
      </div>
    </motion.div>
  );
}
