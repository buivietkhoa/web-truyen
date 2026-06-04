"use client";

import { useRouter } from "next/navigation";
import { Chuong } from "@/types/truyen";

interface ChapterSelectProps {
  truyenId: string;
  chuongs: Chuong[];
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
            {chuong.ten}
          </option>
        ))}
      </select>
    </label>
  );
}
