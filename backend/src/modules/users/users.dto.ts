import { RoleDepth, User, Subscription } from "@prisma/client";

// ---------------------------------------------------------------------------
// Scalar sub-types
// ---------------------------------------------------------------------------

/** Maps directly to EvaluationMetrics in src/store/AppContext.tsx */
export interface RadarScoresDto {
  correctness: number;
  speed: number;
  architecture: number;
  communication: number;
}

/**
 * Frontend-ready profile shape.
 * Maps 1-to-1 with UserProfile in src/store/AppContext.tsx so the
 * React context can be hydrated directly from this object.
 */
export interface UserProfileDto {
  id: string;
  name: string;
  email: string;
  isLoggedIn: true;
  targetCompany: string;
  roleDepth: "Junior" | "Mid-level" | "Senior" | "Staff/Principal" | null;
  prepWeeks: number | null;
  diagnosticCompleted: boolean;
  radarScores: RadarScoresDto;
  streakCount: number;
  manualCompletedQuestions: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Internal update shape accepted by the repository
// ---------------------------------------------------------------------------

export interface UpdateUserData {
  name?: string;
  targetCompany?: string;
  roleDepth?: RoleDepth;
  prepWeeks?: number;
  diagnosticCompleted?: boolean;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Frontend label → Prisma enum */
const ROLE_DEPTH_TO_PRISMA: Record<string, RoleDepth> = {
  Junior: RoleDepth.Junior,
  "Mid-level": RoleDepth.Mid_level,
  Senior: RoleDepth.Senior,
  "Staff/Principal": RoleDepth.Staff_Principal,
};

/** Prisma enum → frontend label */
const ROLE_DEPTH_TO_API: Record<RoleDepth, UserProfileDto["roleDepth"]> = {
  Junior: "Junior",
  Mid_level: "Mid-level",
  Senior: "Senior",
  Staff_Principal: "Staff/Principal",
};

const DEFAULT_RADAR_SCORES: RadarScoresDto = {
  correctness: 0,
  speed: 0,
  architecture: 0,
  communication: 0,
};

type UserWithSubscription = User & { subscription?: Subscription | null };

/**
 * Converts a Prisma User row to the frontend-compatible UserProfileDto.
 * Never exposes password, raw enum values, or internal IDs.
 */
export function toUserProfileDto(user: UserWithSubscription): UserProfileDto {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email,
    isLoggedIn: true,
    targetCompany: user.targetCompany ?? "",
    roleDepth: user.roleDepth ? ROLE_DEPTH_TO_API[user.roleDepth] : null,
    prepWeeks: user.prepWeeks ?? null,
    diagnosticCompleted: user.diagnosticCompleted,
    radarScores: DEFAULT_RADAR_SCORES,
    streakCount: (user as any).streakCount || 0,
    manualCompletedQuestions: (user as any).manualCompletedQuestions || [],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Converts validated frontend input into a Prisma-compatible update payload.
 * Translates roleDepth string labels to Prisma enum values.
 */
export function toUpdateUserData(input: {
  name?: string;
  targetCompany?: string;
  roleDepth?: string;
  prepWeeks?: number;
  diagnosticCompleted?: boolean;
}): UpdateUserData {
  const data: UpdateUserData = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.targetCompany !== undefined) data.targetCompany = input.targetCompany;
  if (input.prepWeeks !== undefined) data.prepWeeks = input.prepWeeks;
  if (input.diagnosticCompleted !== undefined)
    data.diagnosticCompleted = input.diagnosticCompleted;

  if (input.roleDepth !== undefined) {
    const prismaRole = ROLE_DEPTH_TO_PRISMA[input.roleDepth];
    if (prismaRole) data.roleDepth = prismaRole;
  }

  return data;
}
