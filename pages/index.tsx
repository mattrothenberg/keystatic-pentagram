import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { createReader } from "@keystatic/core/reader";
import config from "../keystatic.config";
import { InferGetStaticPropsType } from "next";

export async function getStaticProps() {
  const reader = createReader(process.cwd(), config);
  const works = await reader.collections.work.all();

  return {
    props: {
      works: works.map((work) => {
        return {
          title: work.entry.title,
          description: work.entry.description,
          thumbnail: work.entry.thumbnail,
          slug: work.slug,
        };
      }),
    },
  };
}

export default function Index({
  works,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>Keystagram | Work</title>
      </Head>
      <div className="p-4">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {works.map((work) => {
            return (
              <li className="space-y-2" key={work.title}>
                <div className="aspect-video bg-gray-200 relative">
                  <Image
                    className="object-cover"
                    alt={work.title}
                    src={work.thumbnail}
                    fill
                  />
                </div>
                <h2>{work.title}</h2>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
