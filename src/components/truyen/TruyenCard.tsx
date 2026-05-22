import Link from "next/link";
import { Truyen } from "@/types/truyen";

interface Props {
  truyen: Truyen;
}

export default function TruyenCard({ truyen }: Props) {
  return (
    <div className="card h-100 shadow-sm">
      <img
        src={truyen.anhBia}
        className="card-img-top story-cover"
        alt={truyen.ten}
      />

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{truyen.ten}</h5>

        <p className="card-text text-muted mb-1">
          Tác giả: {truyen.tacGia}
        </p>

        <p className="card-text text-muted mb-1">
          Thể loại: {truyen.theLoai}
        </p>

        <p className="card-text small">{truyen.moTa}</p>

        <div className="mt-auto">
          <Link href={`/truyen/${truyen.id}`} className="btn btn-primary btn-block">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}