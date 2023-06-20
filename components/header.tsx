import { motion } from "framer-motion";
import { useScrollDirection } from "../hooks";
import { usePathname } from "next/navigation";

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
      className={`sticky h-16 transition-all duration-500 bg-white z-10 header`}
    >
      <div className="p-5 font-bold">Disappearing Header</div>
    </motion.div>
  );
}
