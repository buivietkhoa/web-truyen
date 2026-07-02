interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: LoaderParams): string {
  if (!src.includes("res.cloudinary.com/")) return src;
  // Avoid double-transforming if already has params
  if (src.includes("/upload/f_auto") || src.includes("/upload/q_")) return src;
  const q = quality ?? 80;
  return src.replace("/upload/", `/upload/f_auto,q_${q},w_${width}/`);
}
