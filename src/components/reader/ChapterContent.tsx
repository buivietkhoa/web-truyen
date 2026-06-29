"use client";

import { useEffect, useState } from "react";

interface Props {
  chapterId: string;
}

export default function ChapterContent({ chapterId }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setHtml(null);

    fetch(`/api/chapter/${chapterId}/content`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setHtml(data.content ?? ""))
      .catch(() => setHtml("<p>Không thể tải nội dung chương này.</p>"))
      .finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) {
    return (
      <div className="reader-content reader-content-loading">
        <div className="chapter-loading-skeleton" />
        <div className="chapter-loading-skeleton" />
        <div className="chapter-loading-skeleton short" />
      </div>
    );
  }

  return (
    <section
      className="reader-content"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html ?? "" }}
    />
  );
}
