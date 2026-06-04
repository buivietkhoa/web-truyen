export const categories = [
  { name: "Tiên Hiệp", slug: "tien-hiep" },
  { name: "Kiếm Hiệp", slug: "kiem-hiep" },
  { name: "Tu Chân", slug: "tu-chan" },
  { name: "Huyền Huyễn", slug: "huyen-huyen" },
  { name: "Ngôn Tình", slug: "ngon-tinh" },
  { name: "Xuyên Không", slug: "xuyen-khong" },
  { name: "Kỳ Huyễn", slug: "ky-huyen" },
  { name: "Dị Giới", slug: "di-gioi" },
  { name: "Cổ Đại", slug: "co-dai" },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategorySlug(name: string) {
  return categories.find((category) => category.name === name)?.slug || "khac";
}
