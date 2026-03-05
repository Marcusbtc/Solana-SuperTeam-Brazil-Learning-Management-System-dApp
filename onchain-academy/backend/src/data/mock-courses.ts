export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  xpTotal: number;
  track: string;
  moduleCount: number;
  lessonCount: number;
};

export type Lesson = {
  id: string;
  title: string;
  module: string;
  type: "reading" | "challenge" | "video";
  markdown: string;
  videoUrl?: string;
  starterCode?: string;
  language?: "rust" | "typescript" | "json";
};

export type CourseDetail = CourseSummary & {
  lessons: Lesson[];
};

export const courses: CourseDetail[] = [
  {
    id: "course-anchor-101",
    slug: "solana-fundamentals",
    title: "Solana Fundamentals",
    description:
      "Understand accounts, PDAs, and transaction flow with practical lessons.",
    difficulty: "beginner",
    durationMinutes: 240,
    xpTotal: 1200,
    track: "Core",
    moduleCount: 3,
    lessonCount: 8,
    lessons: [
      {
        id: "1",
        title: "What Makes Solana Fast",
        module: "Foundations",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/rywOYfGu4EA",
        markdown:
          "# What Makes Solana Fast\n\nWatch the overview, then explore Proof of History, parallel transaction execution, and account locking in depth.",
      },
      {
        id: "1b",
        title: "PoH Deep Dive",
        module: "Foundations",
        type: "reading",
        markdown:
          "# Proof of History\n\nLearn PoH, runtime parallelism, and account locking.",
      },
      {
        id: "2",
        title: "Your First Program",
        module: "Foundations",
        type: "challenge",
        markdown: "# Challenge\n\nWrite a function that logs `Hello, Solana!`.",
        starterCode:
          "use solana_program::msg;\n\npub fn process_instruction() {\n  // TODO\n}\n",
        language: "rust",
      },
    ],
  },
  {
    id: "course-anchor-201",
    slug: "anchor-in-practice",
    title: "Anchor in Practice",
    description:
      "Build robust program instructions with constraints and events.",
    difficulty: "intermediate",
    durationMinutes: 320,
    xpTotal: 1800,
    track: "Anchor",
    moduleCount: 4,
    lessonCount: 12,
    lessons: [
      {
        id: "1",
        title: "Accounts and Constraints",
        module: "Anchor Core",
        type: "reading",
        markdown:
          "# Accounts and Constraints\n\nDefine account invariants with macros.",
      },
    ],
  },
  {
    id: "course-defi-301",
    slug: "defi-systems",
    title: "DeFi Systems on Solana",
    description: "Model AMM and lending logic with risk-aware architecture.",
    difficulty: "advanced",
    durationMinutes: 420,
    xpTotal: 2400,
    track: "DeFi",
    moduleCount: 5,
    lessonCount: 16,
    lessons: [
      {
        id: "1",
        title: "Liquidity Curves",
        module: "Mechanisms",
        type: "reading",
        markdown:
          "# Liquidity Curves\n\nCompare CPMM and concentrated liquidity.",
      },
    ],
  },
];

export function getCourseBySlug(slug: string): CourseDetail | undefined {
  return courses.find((course) => course.slug === slug);
}
