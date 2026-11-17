"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth, type AuthMode } from "@/lib/client/auth";
import { api } from "@/lib/client/api";
import { rememberedSlugs } from "@/lib/client/edit-key";
import { templateShot } from "@/lib/template-shots";
import { daysBetween, vnToday } from "@/lib/plan";
import { dotDate } from "@/lib/dates";

export interface InvitationCard {
  slug: string;
  template: string;
  title: string;
  date: string;
}

type Summary = { slug: string; template: string; groom: { shortName: string }; bride: { shortName: string }; mainEvent: { date: string } };
const toCard = (i: Summary): InvitationCard => ({ slug: i.slug, template: i.template, title: `${i.groom.shortName} & ${i.bride.shortName}`, date: i.mainEvent.date });

/**
 * Đầu trang chủ: thiệp của người đang xem, để người quay lại vào sửa ngay
 * mà không phải cuộn. Không có thiệp nào thì không hiện gì.
 * Nguồn: tài khoản (khi bật đăng nhập), danh sách trên máy (chạy local), hoặc
 * các thiệp trình duyệt này đang giữ khóa sửa (site thật chưa bật đăng nhập).
 */
export function YourInvitations({ authMode, local }: { authMode: AuthMode; local: Summary[] | null }) {
  const session = useAuth(authMode);
  const [fetched, setFetched] = useState<InvitationCard[] | null>(null);

  useEffect(() => {
    if (authMode !== "off") {
      if (!session.email) return;
      api.myInvitations().then((l) => setFetched(l.map(toCard))).catch(() => setFetched([]));
      return;
    }
    if (local) return;
    Promise.all(
      rememberedSlugs().map(async (slug) => {
        try {
          const r = await fetch(`/api/invitations/${slug}`, { cache: "no-store" });
          return r.ok ? toCard((await r.json()) as Summary) : null;
        } catch {
          return null;
        }
      }),
    ).then((l) => setFetched(l.filter((x): x is InvitationCard => x !== null)));
  }, [authMode, session.email, local]);

  const items = authMode === "off" && local ? local.map(toCard) : authMode !== "off" && !session.email ? [] : fetched ?? [];
  if (items.length === 0) return null;
  const today = vnToday();

  return (
    <section className="mine" id="mine" aria-labelledby="mine-h">
      <h2 id="mine-h">Thiệp của bạn</h2>
      <ul>
        {items.map((i) => {
          const left = daysBetween(today, i.date);
          return (
            <li key={i.slug}>
              <img src={templateShot(i.template)} alt="" loading="lazy" />
              <div className="mine-info">
                <b>{i.title}</b>
                <span>{dotDate(i.date)} · {left > 0 ? `còn ${left} ngày` : left === 0 ? "hôm nay" : "đã cưới"}</span>
                <span className="mine-slug">/{i.slug}</span>
              </div>
              <div className="mine-acts">
                <Link href={`/edit/${i.slug}`} className="mine-main">Sửa thiệp</Link>
                <Link href={`/plan/${i.slug}`}>Quản lý cưới</Link>
                <Link href={`/${i.slug}`} target="_blank">Xem ↗</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
