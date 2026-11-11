import type { PublicInvitation } from "@/lib/schema";
import type { Theme } from "@/lib/templates";
import { longDate } from "@/lib/dates";
import { nameLengthClass } from "@/lib/names";
import { HeartBadge, Lantern, PeonyCluster, WaxSeal } from "@/components/ornaments";
import { Corners } from "./Corner";
import { Photo } from "./Photo";

export type CoverKind = Theme["cover"];
/**
 * closed: chờ khách bấm · opening: hiệu ứng riêng của bìa (bóc phong bì, tim đập…)
 * · revealing: bìa phóng nhẹ và tan dần, nội dung hiện ra · open: bìa đã gỡ
 */
export type CoverPhase = "closed" | "opening" | "revealing" | "open";

interface Props {
  data: PublicInvitation;
  theme: Theme;
  phase: CoverPhase;
  onOpen: () => void;
  guest?: string;
}

/** Hạt bung ra từ giữa lúc bìa tan: vị trí cố định theo chỉ số để render giống nhau mọi lần */
const BURST = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2 + (i % 2) * 0.14;
  const dist = 120 + ((i * 37) % 90);
  return {
    x: `${Math.round(Math.cos(a) * dist)}px`,
    y: `${Math.round(Math.sin(a) * dist * 1.15)}px`,
    s: 5 + (i % 4) * 2,
    d: `${(i % 5) * 40}ms`,
    heart: i % 3 === 0,
  };
});

function Burst() {
  return (
    <div className="burst" aria-hidden="true">
      {BURST.map((b, i) => (
        <i key={i} className={b.heart ? "is-heart" : ""} style={{ "--x": b.x, "--y": b.y, width: b.s, height: b.s, animationDelay: b.d } as React.CSSProperties} />
      ))}
    </div>
  );
}

export function Cover({ data, theme, phase, onOpen, guest = "" }: Props) {
  const open = phase !== "closed";
  const greet = guest ? `${data.texts.coverGreeting} ${guest}` : data.texts.coverGreeting;
  const initials = `${data.groom.shortName.slice(0, 1)}&${data.bride.shortName.slice(0, 1)}`;
  const date = longDate(data.mainEvent.date);

  let inner: React.ReactNode;
  switch (theme.cover) {
    case "envelope":
      inner = (
        <button type="button" className={`env ${open ? "is-open" : ""}`} onClick={onOpen} aria-label="Mở thiệp">
          <div className="env-body" />
          <div className="env-card">
            <p className="eyebrow">{greet}</p>
            <p className="cover-names" style={{ fontSize: 26 }}>
              {data.groom.shortName}
              <span className="amp">&amp;</span>
              {data.bride.shortName}
            </p>
            <p className="cover-date" style={{ fontSize: 15, marginTop: 8 }}>{date}</p>
          </div>
          <div className="env-pocket" />
          <div className="env-flap" />
          <span className="env-seal">
            <WaxSeal text={initials} color={theme.colors.gold} ink={theme.colors.accent} />
          </span>
          <span className="env-front">
            <span className="script">{guest ? `Thân gửi ${guest}` : "Thân gửi bạn"}</span>
            <span>Thiệp mời cưới · {data.groom.shortName} &amp; {data.bride.shortName}</span>
          </span>
          <span className="env-tap">Chạm để mở thiệp</span>
        </button>
      );
      break;
    case "band":
      inner = (
        <div className="cover-band">
          <div className="band">
            <span className="lantern lantern-l"><Lantern /></span>
            <span className="lantern lantern-r"><Lantern /></span>
            <p className="eyebrow">Lễ thành hôn</p>
            <div className="band-row">
              <div><p className="who">Chú rể</p><p className="nm">{data.groom.shortName}</p></div>
              <div className="hy-seal"><div><span className="hy">囍</span></div></div>
              <div><p className="who">Cô dâu</p><p className="nm">{data.bride.shortName}</p></div>
            </div>
          </div>
          <div className="band-arch">
            <Photo src={data.photos.cover} alt="Ảnh cưới" label="Ảnh bìa" />
          </div>
          <p className="cover-date">{date}</p>
          <p className="cover-greet">{greet}</p>
          <button type="button" className="btn" onClick={onOpen}>Mở thiệp</button>
        </div>
      );
      break;
    case "polaroid":
      inner = (
        <div className="cover-pol">
          <Corners theme={theme} where={["tr", "bl"]} />
          <p className="eyebrow">{greet}</p>
          <div className="pol-stack">
            <div className="pol pol-1"><span className="tape" /><Photo src={data.photos.saveTheDate[0] ?? data.photos.cover} alt="Chú rể" /><p className="cap">{data.groom.shortName}</p></div>
            <div className="pol pol-2"><span className="tape" /><Photo src={data.photos.saveTheDate[1] ?? data.photos.cover} alt="Cô dâu" /><p className="cap">{data.bride.shortName}</p></div>
          </div>
          <p className="cover-names script" style={{ fontSize: 44, marginTop: 14 }}>
            {data.groom.shortName} &amp; {data.bride.shortName}
          </p>
          <p className="cover-date">{date}</p>
          <button type="button" className="btn" onClick={onOpen}>Mở thiệp</button>
        </div>
      );
      break;
    case "arch":
      inner = (
        <div className="cover-arch">
          <Corners theme={theme} where={["tl", "br"]} />
          <div className="arch-photo">
            <Photo src={data.photos.cover || data.photos.saveTheDate[0]} alt="Ảnh cưới" label="Ảnh bìa" />
          </div>
          <p className="eyebrow">{greet}</p>
          <h1 className="cover-names">
            {data.groom.shortName}
            <span className="amp">&amp;</span>
            {data.bride.shortName}
          </h1>
          <p className="cover-date">{date}</p>
          <button type="button" className="btn" onClick={onOpen}>Mở thiệp</button>
        </div>
      );
      break;
    case "wreath":
      inner = (
        <div className="cover-wreath">
          <p className="eyebrow">{greet}</p>
          <div className="wreath">
            <span className="wreath-ring" />
            <div className="wreath-photo">
              <Photo src={data.photos.cover || data.photos.saveTheDate[0]} alt="Ảnh cưới" label="Ảnh bìa" />
            </div>
            <span className="wreath-orn wreath-o1"><PeonyCluster /></span>
            <span className="wreath-orn wreath-o2"><PeonyCluster /></span>
          </div>
          <h1 className="cover-names script" style={{ fontSize: 46 }}>
            {data.groom.shortName} &amp; {data.bride.shortName}
          </h1>
          <p className="cover-date">{date}</p>
          <button type="button" className="btn" onClick={onOpen}>Mở thiệp</button>
        </div>
      );
      break;
    case "gate":
      inner = (
        <button type="button" className="gate" onClick={onOpen} aria-label="Mở thiệp">
          <span className="gate-door gate-l">
            <Corners theme={theme} where={["tl"]} />
            {theme.ornament === "songHy" && <span className="lantern lantern-l"><Lantern /></span>}
          </span>
          <span className="gate-door gate-r">
            <Corners theme={theme} where={["br"]} />
            {theme.ornament === "songHy" && <span className="lantern lantern-r"><Lantern /></span>}
          </span>
          <span className="gate-text">
            <span className="gate-greet">{greet}</span>
            <span className="cover-names">{data.groom.shortName}</span>
            <span className="gate-seal"><span>{theme.ornament === "songHy" ? "囍" : initials}</span></span>
            <span className="cover-names">{data.bride.shortName}</span>
            <span className="cover-date">{date}</span>
          </span>
          <span className="gate-tap">Chạm để mở thiệp</span>
        </button>
      );
      break;
    default:
      inner = (
        <div className="cover-card">
          <Corners theme={theme} where={["tl", "br"]} />
          <div className="cover-heart"><HeartBadge /></div>
          <h1 className="cover-names">
            {data.groom.shortName}
            <span className="amp">&amp;</span>
            {data.bride.shortName}
          </h1>
          <p className="cover-date">{date}</p>
          <p className="cover-greet">{greet}</p>
          <button type="button" className="btn" onClick={onOpen}>Mở thiệp</button>
        </div>
      );
  }

  return (
    <div className={`cover kind-${theme.cover} is-${phase} ${nameLengthClass(data)}`} aria-hidden={open}>
      <div className="cover-stage">{inner}</div>
      {phase === "revealing" && <Burst />}
    </div>
  );
}
