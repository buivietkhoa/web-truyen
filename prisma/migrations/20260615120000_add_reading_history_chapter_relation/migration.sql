ALTER TABLE "ReadingHistory"
ADD CONSTRAINT "ReadingHistory_chapterId_fkey"
FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
