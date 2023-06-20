import Image from "next/image";
import Link from "next/link";
import { MouseEventHandler, useState } from "react";
import { categoryFormatter } from "../util";
import { ConditionalWrap } from "./conditional-wrap";

type DefaultWorkHeader = {
  truncated?: false;
  slug?: never;
  onNavigate?: never;
};

type TruncatedWorkHeader = {
  truncated: true;
  slug: string;
  onNavigate: () => void;
};

type WorkHeaderProps = {
  title: string;
  description: string;
  image: string;
  categories: readonly string[];
} & (TruncatedWorkHeader | DefaultWorkHeader);

export function WorkHeader({
  title,
  description,
  image,
  slug = "",
  truncated = false,
  categories,
  onNavigate = () => {},
}: WorkHeaderProps) {
  const [animating, setAnimating] = useState(false);
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    // Check if user is holding the command key. Allow them to open the link in a new tab.
    if (e.metaKey) {
      return;
    }
    setAnimating(true);
    e.preventDefault();
    onNavigate();
  };

  return (
    <ConditionalWrap
      condition={truncated && Boolean(slug)}
      wrap={(children) => {
        return (
          <Link onClick={handleClick} href={slug}>
            {children}
          </Link>
        );
      }}
    >
      <div className="space-y-4">
        <div className="grid lg:grid-cols-2 pb-8 pt-16">
          <div>
            <h1 aria-hidden={truncated} className="text-4xl font-semibold">
              {title}
            </h1>
            <p className="text-gray-500 text-xl mt-2">
              {categories
                .map((category) => {
                  return categoryFormatter(category);
                })
                .join(", ")}
            </p>
          </div>
          <div>
            <p className="text-2xl font-medium">{description}</p>
          </div>
        </div>
        <div
          className={`aspect-video bg-gray-200 relative overflow-hidden ${
            truncated && !animating ? "group" : ""
          }`}
        >
          <Image
            priority={!truncated}
            className="object-cover transform group-hover:scale-125 transition-transform will-change-transform duration-500"
            alt={title}
            src={image}
            fill
          />
        </div>
      </div>
    </ConditionalWrap>
  );
}
