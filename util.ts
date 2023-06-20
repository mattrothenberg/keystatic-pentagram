export function categoryFormatter(category: string) {
  // the category will come in like "brand-identity" and we want it to be "Brand Identity".
  return category
    .split("-")
    .map((word) => {
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
}
