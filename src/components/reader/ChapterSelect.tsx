"use client";

import { useRouter } from "next/navigation";

interface ChapterOption {
  id: string;
  title: string;
  number: number;
}

interface ChapterSelectProps {
  truyenId: string;
  chuongs: ChapterOption[];
  currentChapterId: string;
}

export default function ChapterSelect({ truyenId, chuongs, currentChapterId }: ChapterSelectProps) {
  const router = useRouter();

  return (
    <label className="reader-chapter-select">
      <span>Chọn chương</span>
      <select
        value={currentChapterId}
        onChange={(event) => router.push(`/doc-truyen/${truyenId}/${event.target.value}`)}
      >
        {chuongs.map((chuong) => (
          <option value={chuong.id} key={chuong.id}>
            Chương {chuong.number}: {chuong.title}
          </option>
        ))}
      </select>
    </label>
  );
}
