"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rememberedSlugs } from "@/lib/client/edit-key";

type Item = { slug: string; title: string; date: string };

/**
 * Trang chủ khi chưa bật đăng nhập trên site thật: thiệp mà trình duyệt này
 * đang giữ khóa sửa (đã tạo hoặc đã mở bằng link chỉnh sửa). Không lộ thiệp của người khác.
 */
export function RecentInvitations() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    const slugs = rememberedSlugs();
    Promise.all(
      slugs.map(async (slug) => {
        try {
          const r = await fetch(`/api/invitations/${slug}`, { cache: "no-store" });
          if (!r.ok) return null;
          const d = (await r.json()) as { groom: { shortName: string }; bride: { shortName: string }; mainEvent: { date: string } };
          return { slug, title: `${d.groom.shortName} & ${d.bride.shortName}`, date: d.mainEvent.date };
        } catch {
          return null;
        }
      }),
    ).then((list) => setItems(list.filter((x): x is Item => x !== null)));
  }, []);

  if (items === null) return null;
  if (items.length === 0) {
    return <p className="home-sub">Trình duyệt này chưa mở thiệp nào. Thiệp bạn tạo, hoặc mở bằng link chỉnh sửa, sẽ hiện ở đây.</p>;
  }
  return (
    <ul className="inv-list">
      {items.map((i) => (
        <li key={i.slug}>
          <div>
            <b>{i.title}</b>
            <span>/{i.slug} · {i.date}</span>
          </div>
          <div className="inv-list-actions">
            <Link href={`/${i.slug}`}>Xem</Link>
            <Link href={`/edit/${i.slug}`}>Sửa</Link>
            <Link href={`/plan/${i.slug}`}>Quản lý</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
