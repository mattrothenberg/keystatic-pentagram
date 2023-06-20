import { DocumentElement, DocumentNode } from "@keystatic/core";

export function categoryFormatter(category: string) {
  // the category will come in like "brand-identity" and we want it to be "Brand Identity".
  return category
    .split("-")
    .map((word) => {
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function getImages(data: DocumentElement[]) {
  const images: DocumentNode[] = [];

  const traverse = (obj: DocumentNode) => {
    if (obj.type === "image") {
      images.push(obj);
    } else if ("children" in obj) {
      (obj.children as DocumentElement[]).forEach((child) => traverse(child));
    }
  };

  data.forEach((obj) => traverse(obj));

  return images;
}
