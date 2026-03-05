import { createClient, type SanityClient } from "@sanity/client";
import { env } from "../config/env.js";
import {
  courses as fallbackCourses,
  getCourseBySlug as getFallbackCourseBySlug,
  type CourseDetail,
  type CourseSummary,
  type Lesson,
} from "../data/mock-courses.js";

type SanityLesson = {
  _id?: string;
  lessonId?: string;
  title?: string;
  order?: number;
  module?: string;
  type?: "reading" | "challenge" | "video";
  kind?: "reading" | "challenge" | "video";
  lessonType?: "content" | "challenge";
  contentFormat?: "reading" | "video";
  body?: SanityPortableTextBlock[];
  videoUrl?: string;
  markdown?: string;
  starterCode?: string;
  language?: "rust" | "typescript" | "json";
};

type SanityModule = {
  _id?: string;
  title?: string;
  order?: number;
  lessons?: SanityLesson[];
};

type SanityCourse = {
  _id?: string;
  courseId?: string;
  slug?: { current?: string } | string;
  title?: string;
  summary?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  durationMinutes?: number;
  xpTotal?: number;
  track?: { title?: string; slug?: { current?: string } } | string;
  trackId?: string;
  badgeTitle?: string;
  badgeTier?: "bronze" | "silver" | "gold" | "platinum" | string;
  badgeDescription?: string;
  badgeCriteria?: string;
  badgeIcon?: { asset?: { url?: string } };
  editorialStatus?: "draft" | "published";
  modules?: SanityModule[];
  moduleCount?: number;
  lessonCount?: number;
};

type SanityPortableTextSpan = {
  _type?: "span";
  text?: string;
};

type SanityPortableTextBlock = {
  _type?: "block" | "code" | "image" | "file";
  style?: string;
  language?: string;
  code?: string;
  alt?: string;
  children?: SanityPortableTextSpan[];
};

function getSanityClient(): SanityClient | null {
  if (!env.SANITY_PROJECT_ID || !env.SANITY_DATASET) {
    return null;
  }

  const token = env.SANITY_TOKEN;
  return createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: env.SANITY_API_VERSION,
    ...(token ? { token } : {}),
    useCdn: env.SANITY_USE_CDN ?? false,
  });
}

function toSlug(slug: SanityCourse["slug"]): string {
  if (!slug) {
    return "";
  }

  if (typeof slug === "string") {
    return slug;
  }

  return slug.current ?? "";
}

function normalizeDifficulty(
  input: string | undefined,
): "beginner" | "intermediate" | "advanced" {
  if (
    input === "beginner" ||
    input === "intermediate" ||
    input === "advanced"
  ) {
    return input;
  }

  return "beginner";
}

function normalizeBadgeTier(
  input: SanityCourse["badgeTier"],
): "bronze" | "silver" | "gold" | "platinum" {
  if (
    input === "bronze" ||
    input === "silver" ||
    input === "gold" ||
    input === "platinum"
  ) {
    return input;
  }

  return "bronze";
}

function mapTrack(
  track: SanityCourse["track"],
  trackId: string | undefined,
): string {
  if (typeof track === "string") {
    return track;
  }

  if (track?.title) {
    return track.title;
  }

  return trackId ?? "General";
}

function portableTextToMarkdown(
  blocks: SanityPortableTextBlock[] | undefined,
): string {
  if (!blocks || blocks.length === 0) {
    return "";
  }

  const parts: string[] = [];
  for (const block of blocks) {
    if (block._type === "block") {
      const text = (block.children ?? [])
        .filter((child) => child._type === "span")
        .map((child) => child.text ?? "")
        .join("");
      if (!text.trim()) {
        continue;
      }

      if (block.style === "h2") {
        parts.push(`## ${text}`);
      } else if (block.style === "h3") {
        parts.push(`### ${text}`);
      } else if (block.style === "blockquote") {
        parts.push(`> ${text}`);
      } else {
        parts.push(text);
      }
      continue;
    }

    if (block._type === "code") {
      const language = block.language ?? "";
      const code = block.code ?? "";
      parts.push(`\`\`\`${language}\n${code}\n\`\`\``);
      continue;
    }

    if (block._type === "image") {
      const alt = block.alt ?? "Lesson image";
      parts.push(`![${alt}](media://sanity-image)`);
      continue;
    }

    if (block._type === "file") {
      parts.push("[Resource file](media://sanity-file)");
    }
  }

  return parts.join("\n\n");
}

function normalizeLessonKind(
  lesson: SanityLesson,
): "reading" | "challenge" | "video" {
  if (lesson.lessonType === "challenge") {
    return "challenge";
  }

  if (lesson.lessonType === "content" && lesson.contentFormat === "video") {
    return "video";
  }

  if (lesson.kind === "video" || lesson.type === "video") {
    return "video";
  }

  if (lesson.kind === "challenge" || lesson.type === "challenge") {
    return "challenge";
  }

  return "reading";
}

function mapLessons(rawModules: SanityModule[] | undefined): Lesson[] {
  if (!rawModules || rawModules.length === 0) {
    return [];
  }

  const lessons: Lesson[] = [];
  const sortedModules = [...rawModules].sort(
    (a, b) => (a.order ?? 9999) - (b.order ?? 9999),
  );

  for (const module of sortedModules) {
    const moduleTitle = module.title ?? "Module";
    const moduleLessons = [...(module.lessons ?? [])].sort(
      (a, b) => (a.order ?? 9999) - (b.order ?? 9999),
    );

    for (const lesson of moduleLessons) {
      const blockMarkdown = portableTextToMarkdown(lesson.body);
      const lessonMarkdown =
        lesson.markdown && lesson.markdown.trim().length > 0
          ? lesson.markdown
          : blockMarkdown;
      const mapped: Lesson = {
        id:
          lesson.lessonId ??
          lesson._id ??
          `${moduleTitle}-${lessons.length + 1}`,
        title: lesson.title ?? "Untitled lesson",
        module: lesson.module ?? moduleTitle,
        type: normalizeLessonKind(lesson),
        markdown: lessonMarkdown,
      };

      if (lesson.starterCode !== undefined) {
        mapped.starterCode = lesson.starterCode;
      }
      if (lesson.language !== undefined) {
        mapped.language = lesson.language;
      }

      lessons.push(mapped);
    }
  }

  return lessons;
}

function mapCourseSummary(raw: SanityCourse): CourseSummary {
  const lessons = mapLessons(raw.modules);

  return {
    id: raw.courseId ?? raw._id ?? "",
    slug: toSlug(raw.slug),
    title: raw.title ?? "Untitled course",
    description: raw.summary ?? raw.description ?? "",
    difficulty: normalizeDifficulty(raw.difficulty),
    durationMinutes: raw.durationMinutes ?? 0,
    xpTotal: raw.xpTotal ?? 0,
    track: mapTrack(raw.track, raw.trackId),
    moduleCount: raw.moduleCount ?? raw.modules?.length ?? 0,
    lessonCount: raw.lessonCount ?? lessons.length,
    badge: {
      title: raw.badgeTitle ?? "Course Completion",
      tier: normalizeBadgeTier(raw.badgeTier),
      ...(raw.badgeDescription ? { description: raw.badgeDescription } : {}),
      ...(raw.badgeCriteria ? { criteria: raw.badgeCriteria } : {}),
      ...(raw.badgeIcon?.asset?.url
        ? { iconUrl: raw.badgeIcon.asset.url }
        : {}),
    },
  };
}

function mapCourseDetail(raw: SanityCourse): CourseDetail {
  const summary = mapCourseSummary(raw);

  return {
    ...summary,
    lessons: mapLessons(raw.modules),
  };
}

async function fetchCoursesFromSanity(): Promise<CourseSummary[] | null> {
  const client = getSanityClient();
  if (!client) {
    return null;
  }

  const query = `*[_type == "course" && defined(slug.current) && (!defined(editorialStatus) || editorialStatus == "published")] | order(coalesce(publishedAt, _updatedAt) desc) {
    _id,
    courseId,
    slug,
    title,
    summary,
    description,
    difficulty,
    durationMinutes,
    xpTotal,
    badgeTitle,
    badgeTier,
    badgeDescription,
    badgeCriteria,
    badgeIcon{
      asset->{
        url
      }
    },
    "track": track->{
      title,
      slug
    },
    trackId,
    editorialStatus,
    modules[]->{
      _id,
      title,
      order,
      lessons[]->{
        _id,
        lessonId,
        title,
        order,
        module,
        type,
        kind,
        lessonType,
        contentFormat,
        videoUrl,
        body,
        markdown,
        starterCode,
        language
      }
    }
  }`;

  try {
    const rows = await client.fetch<SanityCourse[]>(query);
    return rows
      .map(mapCourseSummary)
      .filter((course) => course.id && course.slug);
  } catch {
    return null;
  }
}

async function fetchCourseBySlugFromSanity(
  slug: string,
): Promise<CourseDetail | null> {
  const client = getSanityClient();
  if (!client) {
    return null;
  }

  const query = `*[_type == "course" && slug.current == $slug && (!defined(editorialStatus) || editorialStatus == "published")][0] {
    _id,
    courseId,
    slug,
    title,
    summary,
    description,
    difficulty,
    durationMinutes,
    xpTotal,
    badgeTitle,
    badgeTier,
    badgeDescription,
    badgeCriteria,
    badgeIcon{
      asset->{
        url
      }
    },
    "track": track->{
      title,
      slug
    },
    trackId,
    editorialStatus,
    modules[]->{
      _id,
      title,
      order,
      lessons[]->{
        _id,
        lessonId,
        title,
        order,
        module,
        type,
        kind,
        lessonType,
        contentFormat,
        videoUrl,
        body,
        markdown,
        starterCode,
        language
      }
    }
  }`;

  try {
    const row = await client.fetch<SanityCourse | null>(query, { slug });
    if (!row) {
      return null;
    }

    return mapCourseDetail(row);
  } catch {
    return null;
  }
}

export async function listCourses(): Promise<CourseSummary[]> {
  const cmsCourses = await fetchCoursesFromSanity();
  if (cmsCourses && cmsCourses.length > 0) {
    return cmsCourses;
  }

  return fallbackCourses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    durationMinutes: course.durationMinutes,
    xpTotal: course.xpTotal,
    track: course.track,
    moduleCount: course.moduleCount,
    lessonCount: course.lessonCount,
    badge: course.badge,
  }));
}

export async function getCourseBySlug(
  slug: string,
): Promise<CourseDetail | null> {
  const cmsCourse = await fetchCourseBySlugFromSanity(slug);
  if (cmsCourse) {
    return cmsCourse;
  }

  return getFallbackCourseBySlug(slug) ?? null;
}
