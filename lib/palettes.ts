export interface ColorPalette {
  name: string;
  colors: string[];
  description: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "Arctic",
    colors: ["#F8FAFC", "#E2E8F0", "#1E293B"],
    description: "Crisp white #F8FAFC, light silver #E2E8F0, charcoal #1E293B",
  },
  {
    name: "Midnight",
    colors: ["#0F172A", "#1E3A5F", "#60A5FA"],
    description: "Midnight navy #0F172A, steel blue #1E3A5F, sky blue #60A5FA",
  },
  {
    name: "Forest",
    colors: ["#1B4332", "#40916C", "#D8F3DC"],
    description: "Deep forest #1B4332, emerald #40916C, mint cream #D8F3DC",
  },
  {
    name: "Terracotta",
    colors: ["#7C2D12", "#EA580C", "#FED7AA"],
    description: "Burnt sienna #7C2D12, terracotta #EA580C, warm peach #FED7AA",
  },
  {
    name: "Gold & Black",
    colors: ["#0C0A09", "#292524", "#D4AF37"],
    description: "Jet black #0C0A09, deep charcoal #292524, gold #D4AF37",
  },
  {
    name: "Violet",
    colors: ["#2E1065", "#7C3AED", "#EDE9FE"],
    description: "Deep violet #2E1065, purple #7C3AED, soft lavender #EDE9FE",
  },
  {
    name: "Rose",
    colors: ["#881337", "#F43F5E", "#FFE4E6"],
    description: "Crimson #881337, rose #F43F5E, blush #FFE4E6",
  },
  {
    name: "Ocean",
    colors: ["#0C4A6E", "#0EA5E9", "#E0F2FE"],
    description: "Deep ocean #0C4A6E, sky blue #0EA5E9, pale blue #E0F2FE",
  },
  {
    name: "Sage",
    colors: ["#14532D", "#4ADE80", "#F0FDF4"],
    description: "Dark sage #14532D, fresh green #4ADE80, mint white #F0FDF4",
  },
  {
    name: "Amber",
    colors: ["#78350F", "#D97706", "#FEF3C7"],
    description: "Warm brown #78350F, amber #D97706, sand cream #FEF3C7",
  },
  {
    name: "Slate",
    colors: ["#1E293B", "#475569", "#F1F5F9"],
    description: "Dark slate #1E293B, gray-blue #475569, light gray #F1F5F9",
  },
  {
    name: "Coral",
    colors: ["#9F1239", "#FB7185", "#FFF1F2"],
    description: "Deep coral #9F1239, pink #FB7185, light blush #FFF1F2",
  },
];
