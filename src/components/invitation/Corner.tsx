import type { Theme } from "@/lib/templates";
import { BlossomCluster, GoldLeafSprig, RoseCluster } from "@/components/ornaments";

/** Họa tiết đặt ở góc một khối, theo loại của theme */
export function Ornament({ theme }: { theme: Theme }) {
  switch (theme.ornament) {
    case "goldLeaf":
      return <GoldLeafSprig />;
    case "burgundyRose":
      return <RoseCluster />;
    case "whiteBlossom":
      return <BlossomCluster />;
    default:
      return null;
  }
}

export function Corners({ theme, where = ["tl", "br"] }: { theme: Theme; where?: ("tl" | "tr" | "bl" | "br")[] }) {
  if (theme.ornament === "songHy") return null;
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
