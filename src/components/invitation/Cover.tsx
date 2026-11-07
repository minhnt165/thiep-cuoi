import type { PublicInvitation } from "@/lib/schema";
import type { Theme } from "@/lib/templates";
import { longDate } from "@/lib/dates";
import { HeartBadge, Lantern, WaxSeal } from "@/components/ornaments";
import { Corners } from "./Corner";
import { Photo } from "./Photo";

interface Props {
  data: PublicInvitation;
  theme: Theme;
  open: boolean;
  onOpen: () => void;
  guest?: string;
}

export function Cover({ data, theme, open, onOpen, guest = "" }: Props) {
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
    <div className={`cover ${open ? "is-open" : ""}`} aria-hidden={open}>
      {inner}
    </div>
  );
}
