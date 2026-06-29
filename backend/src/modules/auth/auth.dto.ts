import { RoleDepth, User, Subscription } from "@prisma/client";

/** Matches frontend EvaluationMetrics in AppContext.tsx */
export interface RadarScoresDto {
  correctness: number;
  speed: number;
  architecture: number;
  communication: number;
}

/**
 * Frontend-ready user shape for AuthLayout.tsx and OnboardingFlow.tsx.
 * Maps to UserProfile fields in src/store/AppContext.tsx.
 */
export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  isLoggedIn: true;
  targetCompany: string;
  roleDepth: "Junior" | "Mid-level" | "Senior" | "Staff/Principal" | null;
  prepWeeks: number | null;
  diagnosticCompleted: boolean;
  radarScores: RadarScoresDto;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenDto {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  token: AuthTokenDto;
}

const ROLE_DEPTH_TO_API: Record<RoleDepth, AuthUserDto["roleDepth"]> = {
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
 * Onboarding step 1 (targetCompany, roleDepth, prepWeeks) is persisted on the user.
 * diagnosticCompleted remains false until a diagnostic/evaluation flow is completed (Users module).
 */
export function toAuthUserDto(user: UserWithSubscription): AuthUserDto {
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
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toAuthResponseDto(
  user: UserWithSubscription,
  accessToken: string,
  expiresIn: string
): AuthResponseDto {
  return {
    user: toAuthUserDto(user),
    token: {
      accessToken,
      tokenType: "Bearer",
      expiresIn,
    },
  };
}
