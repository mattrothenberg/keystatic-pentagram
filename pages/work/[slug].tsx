import { createReader } from "@keystatic/core/reader";
import { DocumentRenderer } from "@keystatic/core/renderer";
import { AnimatePresence, motion, useAnimate, useInView } from "framer-motion";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { omit, pick } from "radash";
import { useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";
import config from "../../keystatic.config";
import { WorkHeader } from "../../components/work-header";
import { useScrollDirection } from "../../hooks";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

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
  const footerInView = useInView(footerScope);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    console.log("Mount!", pathname, pageState);
    document.body.classList.remove("transitioning");
  }, []);

  const handleNextWorkNavigate = () => {
    // Stop the body from overflowing.
    document.body.classList.add("transitioning");
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
      { top: "6rem" },
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
      <AnimatePresence>
        {!footerInView && scrollDirection === "down" && (
          <WorkFloatingBar title={work.title} />
        )}
      </AnimatePresence>
      <div className="container px-4">
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
      </div>
      <div className="container px-4">
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
          <div className="space-y-12 mt-16">
            <DocumentRenderer
              componentBlocks={{}}
              renderers={{
                block: {
                  layout: (props) => {
                    return match(props.layout)
                      .with([1], () => {
                        return <div>{props.children}</div>;
                      })
                      .with([1, 1], () => {
                        return (
                          <div className="grid lg:grid-cols-2 gap-12">
                            {props.children}
                          </div>
                        );
                      })
                      .otherwise(() => null);
                  },
                  blockquote: (props) => {
                    return (
                      <div>
                        <blockquote className="text-3xl leading-tight font-medium">
                          {props.children}
                        </blockquote>
                      </div>
                    );
                  },
                  image: (props) => {
                    console.log(props);
                    return (
                      <div className="space-y-2">
                        <div className="aspect-video relative">
                          <Image src={props.src} alt={props.alt} fill />
                        </div>
                        {props?.title && (
                          <p className="text-gray-600 text-sm">{props.title}</p>
                        )}
                      </div>
                    );
                  },
                },
              }}
              document={work.content}
            />
          </div>
          <div className="border-t mt-12 pt-6">
            <p className="font-normal text-lg text-red-600 select-none">
              Next Project
            </p>
          </div>
        </motion.div>
      </div>
      <div
        style={{
          maxHeight: 480,
          overflow: "hidden",
        }}
        ref={footerScope}
      >
        <div className="container px-4">
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
    </div>
  );
}

function WorkFloatingBar({ title }: { title: string }) {
  return (
    <motion.div
      transition={{
        duration: 0.85,
        type: "spring",
        bounce: 0,
      }}
      initial={{
        y: 100,
      }}
      animate={{
        y: 0,
      }}
      exit={{
        y: 100,
      }}
      className={`fixed bottom-0 left-0 right-0 bg-white z-10 text-center h-16`}
    >
      <div className="container px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <Link className="text-gray-400 hover:text-black" href="/">
            <ArrowLeft size={24} />
          </Link>
          <p className="text-lg">{title}</p>
          <Link className="text-gray-400 hover:text-black" href="/">
            <ArrowRight size={24} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
