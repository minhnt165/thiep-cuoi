"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth, type AuthMode } from "@/lib/client/auth";
import { api } from "@/lib/client/api";
import { THEME_LIST } from "@/lib/templates";
import { AccountLine, InlineLogin } from "./AuthScreens";

type Item = Awaited<ReturnType<typeof api.myInvitations>>[number];

/** Trang chủ khi bật đăng nhập: thiệp mà tài khoản đang đăng nhập quản lý */
export function MyInvitations({ authMode }: { authMode: AuthMode }) {
  const session = useAuth(authMode);
  const [list, setList] = useState<Item[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!session.email) return;
    api.myInvitations().then(setList).catch((e) => setErr((e as Error).message));
  }, [session.email]);

  if (!session.ready) return null;

  return (
    <section id="mine">
      <h2 className="home-h2">Thiệp của tôi</h2>
      {!session.email ? (
        <>
          <p className="home-sub">Đăng nhập để xem các thiệp bạn đang quản lý.</p>
          <InlineLogin session={session} />
        </>
      ) : (
        <>
          <AccountLine session={session} />
          {list && list.length === 0 && <p className="home-sub">Tài khoản này chưa quản lý thiệp nào. Tạo thiệp mới ở trên, hoặc nhờ người kia mời email của bạn.</p>}
          {list && list.length > 0 && (
            <ul className="inv-list">
              {list.map((i) => (
                <li key={i.slug}>
                  <div>
                    <b>{i.groom.shortName} &amp; {i.bride.shortName}</b>
                    <span>/{i.slug} · {i.mainEvent.date} · {THEME_LIST.find((t) => t.id === i.template)?.name}</span>
                  </div>
                  <div className="inv-list-actions">
                    <Link href={`/${i.slug}`}>Xem</Link>
                    <Link href={`/edit/${i.slug}`}>Sửa</Link>
                    <Link href={`/plan/${i.slug}`}>Quản lý</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {err && <p className="err">{err}</p>}
    </section>
  );
}
