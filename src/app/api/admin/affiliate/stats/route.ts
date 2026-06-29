import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Không có quyền." }, { status: 403 });
  }

  // Tổng click theo từng sản phẩm
  const clicksByProduct = await db.affiliateClick.groupBy({
    by: ["productId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  // Múi giờ Việt Nam UTC+7: đầu ngày hôm nay = UTC 17:00 hôm qua
  const now = new Date();
  const vnMidnight = new Date(now);
  vnMidnight.setUTCHours(17, 0, 0, 0); // 17:00 UTC = 00:00 VN (+7)
  // Nếu hiện tại UTC < 17:00 thì đầu ngày VN là hôm qua 17:00 UTC
  if (now.getUTCHours() < 17) {
    vnMidnight.setUTCDate(vnMidnight.getUTCDate() - 1);
  }

  const todayClicks = await db.affiliateClick.count({
    where: { createdAt: { gte: vnMidnight } },
  });

  // 7 ngày qua (từ đầu ngày 7 ngày trước)
  const weekStart = new Date(vnMidnight);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);

  const weekClicks = await db.affiliateClick.count({
    where: { createdAt: { gte: weekStart } },
  });

  // Tháng này
  const monthStart = new Date(vnMidnight);
  monthStart.setUTCDate(1);

  const monthClicks = await db.affiliateClick.count({
    where: { createdAt: { gte: monthStart } },
  });

  // Tổng tất cả
  const totalClicks = await db.affiliateClick.count();

  return NextResponse.json({
    totalClicks,
    todayClicks,
    weekClicks,
    monthClicks,
    clicksByProduct: Object.fromEntries(
      clicksByProduct.map((item) => [item.productId, item._count.id])
    ),
  });
}
