import { omit, pick } from "radash";
import { motion, useAnimate } from "framer-motion";
import Image from "next/image";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import { ConditionalWrap } from "../../components/conditional-wrap";
import Link from "next/link";
import { MouseEventHandler, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const variants = {
  idle: {
    opacity: 1,
  },
  navigating: {
    opacity: 0,
  },
};

export async function getStaticPaths() {
  const reader = createReader(process.cwd(), config);
  const paths = await reader.collections.work.all().then((works) => {
    return works.map((work) => {
      return {
        params: {
          slug: work.slug,
        },
      };
    });
  });

  return {
    fallback: false,
    paths,
  };
}

function categoryFormatter(category: string) {
  // the category will come in like "brand-identity" and we want it to be "Brand Identity".
  return category
    .split("-")
    .map((word) => {
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const slug = context.params?.slug as string;
  const reader = createReader(process.cwd(), config);
  const works = await reader.collections.work.all();
  const workIndex = works.findIndex((w) => w.slug === slug);
  if (workIndex < 0) throw new Error("Work not found.");
  const work = works[workIndex];
  if (!work) throw new Error("Work not found");
  const content = await work.entry.content();

  const nextWorkIndex = workIndex === works.length - 1 ? 0 : workIndex + 1;
  const nextWork = works[nextWorkIndex];

  return {
    props: {
      nextWork: {
        slug: nextWork.slug,
        ...pick(nextWork.entry, [
          "description",
          "title",
          "thumbnail",
          "categories",
        ]),
      },
      work: {
        ...omit(work.entry, ["content"]),
        content,
      },
    },
  };
}

export default function WorkDetail({
  work,
  nextWork,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [pageState, setPageState] = useState<"idle" | "navigating">("idle");
  const [footerScope, animateFooter] = useAnimate<HTMLDivElement>();
  const navigate = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("Mount!", pathname, pageState);
    document.body.style.overflow = "visible";
  }, []);

  const handleNextWorkNavigate = () => {
    // Stop the body from overflowing.
    document.body.style.overflow = "hidden";
    setPageState("navigating");
  };

  const animate = async () => {
    // Un-truncate the footer.
    footerScope.current.style.maxHeight = "none";
    footerScope.current.style.overflow = "visible";

    // Get current yOffset of the footer.
    const footerBbox = footerScope.current.getBoundingClientRect();
    footerScope.current.style.position = "fixed";
    footerScope.current.style.width = footerBbox.width + "px";

    footerScope.current.style.left = `${footerBbox.left}px`;
    footerScope.current.style.top = `${footerBbox.top}px`;
    footerScope.current.style.right = `${footerBbox.right}px`;

    await animateFooter(
      footerScope.current,
      { top: 0 },
      {
        type: "spring",
        bounce: 0,
        damping: 20,
      }
    );

    navigate.push(nextWork.slug);
  };

  return (
    <div className="relative">
      <motion.div
        variants={variants}
        animate={pageState}
        initial={false}
        transition={{
          duration: 0.85,
          type: "spring",
          bounce: 0,
        }}
      >
        <WorkHeader
          title={work.title}
          description={work.description}
          image={work.thumbnail}
          categories={work.categories}
        />{" "}
      </motion.div>
      <motion.div
        className="py-8"
        variants={variants}
        animate={pageState}
        initial={{
          opacity: 0,
        }}
        transition={{
          duration: 0.75,
          type: "spring",
          bounce: 0,
        }}
        onAnimationComplete={() => {
          if (pageState === "idle") return;
          animate();
        }}
      >
        <div className="grid grid-cols-2 gap-8">
          {Array.from({ length: 16 }).map((_, i) => {
            return <div key={i} className="aspect-video bg-gray-200"></div>;
          })}
        </div>
        <div className="border-t mt-12 pt-6">
          <p className="font-normal text-lg text-red-600 select-none">
            Next Project
          </p>
        </div>
      </motion.div>
      <div
        style={{
          maxHeight: 320,
          overflow: "hidden",
        }}
        ref={footerScope}
      >
        <WorkHeader
          truncated
          onNavigate={handleNextWorkNavigate}
          categories={nextWork.categories}
          slug={nextWork.slug}
          title={nextWork.title}
          description={nextWork.description}
          image={nextWork.thumbnail}
        />
      </div>
    </div>
  );
}

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

function WorkHeader({
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
