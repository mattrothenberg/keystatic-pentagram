import { omit, pick } from "radash";
import { motion, useAnimate, useMotionValue } from "framer-motion";
import Image from "next/image";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import { ConditionalWrap } from "../../components/conditional-wrap";
import Link from "next/link";
import { MouseEventHandler, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
        ...pick(nextWork.entry, ["description", "title", "thumbnail"]),
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
      }
    );

    // window.scrollTo(0, 0);
    navigate.push(nextWork.slug);
    // setPageState("idle");
    // document.body.style.overflow = "visible";
  };

  const variants = {
    idle: {
      opacity: 1,
    },
    navigating: {
      opacity: 0,
    },
  };

  return (
    <div className="relative">
      <motion.div
        className="py-8"
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
        />{" "}
        <motion.div
          className="py-8"
          variants={variants}
          animate={pageState}
          initial={{
            opacity: 0,
          }}
          transition={{
            duration: 0.85,
            type: "spring",
            bounce: 0,
          }}
          onAnimationComplete={() => {
            if (pageState === "idle") return;
            animate();
          }}
        >
          <div className="grid grid-cols-2 gap-8">
            {Array.from({ length: 25 }).map((_, i) => {
              return <div key={i} className="aspect-video bg-gray-200"></div>;
            })}
          </div>
        </motion.div>
      </motion.div>
      <div
        className="pt-8"
        style={{
          maxHeight: 320,
          overflow: "hidden",
        }}
        ref={footerScope}
      >
        <WorkHeader
          truncated
          onNavigate={handleNextWorkNavigate}
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
} & (TruncatedWorkHeader | DefaultWorkHeader);

function WorkHeader({
  title,
  description,
  image,
  slug = "",
  truncated = false,
  onNavigate = () => {},
}: WorkHeaderProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    // todo: intercept if user is holding the command key.
    // we want to open the link in a new tab if so.
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
        <div className="grid lg:grid-cols-2">
          <div>
            <h1 aria-hidden={truncated} className="text-4xl font-medium">
              {title}
            </h1>
          </div>
          <div>
            <p className="text-2xl font-medium">{description}</p>
          </div>
        </div>
        <div className="aspect-video bg-gray-200 relative">
          <Image
            priority={!truncated}
            className="object-cover"
            alt={title}
            src={image}
            fill
          />
        </div>
      </div>
    </ConditionalWrap>
  );
}
