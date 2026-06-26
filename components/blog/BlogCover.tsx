interface Blob {
  color: string;
  top: string;
  left: string;
}

interface Palette {
  bg: string;
  blobs: Blob[];
}

const PALETTES: Palette[] = [
  {
    bg: "#09090f",
    blobs: [
      { color: "#7c3aed", top: "-30%", left: "-15%" },
      { color: "#4f46e5", top: "20%",  left: "45%"  },
      { color: "#db2777", top: "50%",  left: "5%"   },
    ],
  },
  {
    bg: "#030f1a",
    blobs: [
      { color: "#0891b2", top: "-25%", left: "15%"  },
      { color: "#0d9488", top: "35%",  left: "-10%" },
      { color: "#2563eb", top: "5%",   left: "55%"  },
    ],
  },
  {
    bg: "#100500",
    blobs: [
      { color: "#ea580c", top: "-20%", left: "-10%" },
      { color: "#d97706", top: "15%",  left: "45%"  },
      { color: "#be185d", top: "45%",  left: "20%"  },
    ],
  },
  {
    bg: "#020b07",
    blobs: [
      { color: "#059669", top: "-20%", left: "25%"  },
      { color: "#0d9488", top: "40%",  left: "-10%" },
      { color: "#16a34a", top: "10%",  left: "60%"  },
    ],
  },
  {
    bg: "#0f020a",
    blobs: [
      { color: "#e11d48", top: "-15%", left: "5%"   },
      { color: "#9333ea", top: "30%",  left: "55%"  },
      { color: "#ec4899", top: "50%",  left: "-5%"  },
    ],
  },
  {
    bg: "#020f0a",
    blobs: [
      { color: "#10b981", top: "5%",   left: "-15%" },
      { color: "#06b6d4", top: "-20%", left: "40%"  },
      { color: "#6366f1", top: "40%",  left: "25%"  },
    ],
  },
];

function slugToIndex(slug: string, count: number): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) + h) ^ slug.charCodeAt(i);
    h >>>= 0;
  }
  return h % count;
}

// Strip filler openers so the punchy part leads
const STRIP_PREFIXES = [
  "How to ", "Why ", "What ", "The ", "A ", "An ",
  "Why Your ", "What Makes ", "What to ",
];

function shortenTitle(title: string): string {
  for (const prefix of STRIP_PREFIXES) {
    if (title.startsWith(prefix)) {
      return title.slice(prefix.length);
    }
  }
  return title;
}

interface BlogCoverProps {
  slug: string;
  title?: string;
  className?: string;
}

export function BlogCover({ slug, title, className = "" }: BlogCoverProps) {
  const palette = PALETTES[slugToIndex(slug, PALETTES.length)];
  const displayTitle = title ? shortenTitle(title) : undefined;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: palette.bg }}
      aria-hidden="true"
    >
      {palette.blobs.map((blob, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: blob.top,
            left: blob.left,
            width: "65%",
            aspectRatio: "1",
            background: blob.color,
            borderRadius: "50%",
            filter: "blur(55px)",
            opacity: 0.65,
          }}
        />
      ))}

      {displayTitle && (
        <div className="absolute inset-0 flex items-end p-5">
          <p
            className="line-clamp-3 text-left font-[family-name:var(--font-display)] text-4xl uppercase leading-none tracking-wide text-white"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
          >
            {displayTitle}
          </p>
        </div>
      )}
    </div>
  );
}
