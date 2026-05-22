export interface Chuong {
  id: string;
  ten: string;
  soChuong: number;
  noiDung: string;
}

export interface Truyen {
  id: string;
  ten: string;
  tacGia: string;
  theLoai: string;
  trangThai: "Đang ra" | "Hoàn thành" | "Tạm ngưng";
  anhBia: string;
  moTa: string;
  luotXem: number;
  chuongs: Chuong[];
}
