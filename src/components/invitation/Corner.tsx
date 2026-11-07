import type { Theme } from "@/lib/templates";
import { BlossomCluster, EucalyptusSprig, GoldLeafSprig, PeonyCluster, RoseCluster, StarCluster } from "@/components/ornaments";

/** Họa tiết đặt ở góc một khối, theo loại của theme */
export function Ornament({ theme }: { theme: Theme }) {
  switch (theme.ornament) {
    case "goldLeaf":
      return <GoldLeafSprig />;
    case "burgundyRose":
      return <RoseCluster />;
    case "whiteBlossom":
      return <BlossomCluster />;
    case "eucalyptus":
      return <EucalyptusSprig />;
    case "peony":
      return <PeonyCluster />;
    case "stars":
      return <StarCluster />;
    default:
      return null;
  }
}

/**
 * Họa tiết lớn rải dọc hai mép thiệp (như các mẫu thiệp in): đặt theo % chiều cao
 * trang, luân phiên trái phải, để cả trang có "chất" chứ không chỉ bìa.
 */
const SIDE_SPOTS: { top: string; side: "l" | "r"; flip?: boolean }[] = [
  { top: "14%", side: "r" },
  { top: "31%", side: "l", flip: true },
  { top: "50%", side: "r" },
  { top: "68%", side: "l", flip: true },
  { top: "86%", side: "r" },
];

export function SideArt({ theme }: { theme: Theme }) {
  if (theme.ornament === "songHy" || theme.ornament === "none") return null;
  return (
    <>
      {SIDE_SPOTS.map((s, i) => (
        <span key={i} className={`orn orn-side orn-side-${s.side} ${s.flip ? "is-flip" : ""}`} style={{ top: s.top }} aria-hidden="true">
          <Ornament theme={theme} />
        </span>
      ))}
    </>
  );
}

export function Corners({ theme, where = ["tl", "br"] }: { theme: Theme; where?: ("tl" | "tr" | "bl" | "br")[] }) {
  if (theme.ornament === "songHy" || theme.ornament === "none") return null;
  return (
    <>
      {where.map((w) => (
        <span key={w} className={`orn orn-${w}`}>
          <Ornament theme={theme} />
        </span>
      ))}
    </>
  );
}
