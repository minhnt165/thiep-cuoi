"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { PublicInvitation, SectionId, Wish } from "@/lib/schema";
import { THEMES, themeVars } from "@/lib/templates";
import { makeId } from "@/lib/schema";
import { textureCss } from "@/components/ornaments/textures";
import { IconNote } from "@/components/ornaments";
import { Cover } from "./Cover";
import { Album } from "./Album";
import { DressCode, Family, Footer, Gift, Guestbook, Party, SaveTheDate, Story, Timeline, type RsvpInput } from "./sections";
import "./invitation.css";

export type Mode = "live" | "preview" | "demo";

interface Props {
  data: PublicInvitation;
  wishes: Wish[];
  /** live: gửi lên server · demo: chỉ giữ trong trang · preview: trong trình chỉnh sửa */
  mode: Mode;
  /** Bỏ qua bìa (dùng trong trình chỉnh sửa) */
  startOpened?: boolean;
  /** Nhúng trong khung điện thoại của trình chỉnh sửa */
  embedded?: boolean;
}

function FallEffect({ kind }: { kind: "sparkle" | "petal" }) {
  // Vị trí cố định theo chỉ số để server và client render giống nhau
  const items = Array.from({ length: 16 }, (_, i) => {
    const r = (i * 7919) % 100;
    const w = kind === "petal" ? 8 + (i % 5) * 1.6 : 5 + (i % 4) * 1.2;
    return { left: `${r}%`, w, h: kind === "petal" ? w * 1.25 : w, dx: `${((i * 37) % 80) - 40}px`, dur: `${9 + (i % 7)}s`, delay: `-${(i * 1.3) % 14}s` };
  });
  return (
    <div className={`fall fall-${kind}`} aria-hidden="true">
      {items.map((it, i) => (
        <i key={i} style={{ left: it.left, width: it.w, height: it.h, "--dx": it.dx, animationDuration: it.dur, animationDelay: it.delay } as CSSProperties} />
      ))}
    </div>
  );
}

export function Invitation({ data, wishes: initialWishes, mode, startOpened = false, embedded = false }: Props) {
  const theme = THEMES[data.template];
  const [open, setOpen] = useState(startOpened);
  const [wishes, setWishes] = useState(initialWishes);
  const [music, setMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const style = useMemo(
    () => ({ ...themeVars(theme, data.accent), "--texture": textureCss(theme) }) as CSSProperties,
    [theme, data.accent],
  );

  // Hiện dần các phần khi cuộn tới
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { root: embedded ? root : null, rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [open, embedded, data.sections, data.template]);

  function onOpen() {
    setOpen(true);
    if (data.music && audioRef.current) {
      audioRef.current.play().then(() => setMusic(true)).catch(() => setMusic(false));
    }
  }

  function toggleMusic() {
    const a = audioRef.current;
    if (!a) return;
    if (music) {
      a.pause();
      setMusic(false);
    } else {
      a.play().then(() => setMusic(true)).catch(() => setMusic(false));
    }
  }

  async function addWish(name: string, message: string) {
    const local: Wish = { id: makeId(), name, message, createdAt: new Date().toISOString() };
    if (mode === "live") {
      const res = await fetch(`/api/invitations/${data.slug}/wishes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, message }) });
      if (!res.ok) throw new Error("wish failed");
      const saved = (await res.json()) as Wish;
      setWishes((w) => [saved, ...w]);
    } else {
      setWishes((w) => [local, ...w]);
    }
  }

  async function addRsvp(input: RsvpInput) {
    if (mode !== "live") return;
    const res = await fetch(`/api/invitations/${data.slug}/rsvp`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
    if (!res.ok) throw new Error("rsvp failed");
  }

  const sectionMap: Record<SectionId, React.ReactNode> = {
    saveTheDate: <SaveTheDate key="std" data={data} theme={theme} />,
    family: <Family key="family" data={data} />,
    album: <Album key="album" data={data} />,
    party: <Party key="party" data={data} onRsvp={addRsvp} />,
    dressCode: <DressCode key="dress" data={data} />,
    timeline: <Timeline key="tl" data={data} />,
    story: <Story key="story" data={data} />,
    guestbook: <Guestbook key="gb" wishes={wishes} onAdd={addWish} />,
    gift: <Gift key="gift" data={data} />,
  };

  return (
    <div className={`inv-root ${embedded ? "is-embedded" : ""}`} style={style} ref={rootRef}>
      <div className={`inv t-${theme.id} ${open ? "" : "is-locked"}`}>
        {theme.fall !== "none" && <FallEffect kind={theme.fall} />}
        <Cover data={data} theme={theme} open={open} onOpen={onOpen} />
        {data.sections.map((id) => sectionMap[id])}
        <Footer data={data} />
      </div>
      {data.music && (
        <>
          <audio ref={audioRef} src={data.music} loop preload="none" />
          <button type="button" className={`music ${music ? "on" : ""}`} onClick={toggleMusic} aria-pressed={music} aria-label={music ? "Tắt nhạc nền" : "Bật nhạc nền"}>
            <IconNote />
          </button>
        </>
      )}
    </div>
  );
}
