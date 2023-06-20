import Image from "next/image";
import Link from "next/link";
import { useScrollDirection } from "../hooks";
import Logo from "../public/logo.svg";

export function Header() {
  const scrollDirection = useScrollDirection();

  return (
    <div
      data-direction={scrollDirection}
      className={`sticky h-24 z-[initial] transition-all duration-500 bg-white header flex items-center`}
    >
      <div className="container px-4">
        <Link href="/">
          <Image priority alt="Logo" src={Logo} width={210} />
        </Link>
      </div>
    </div>
  );
}
