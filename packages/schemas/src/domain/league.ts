import { z } from 'zod';
import { dateTimeSchema, leagueIdSchema, rankIdSchema } from './people';

/** Weekly leagues, ranks and badges (architecture P2–P3). Leagues show nicknames only. */

export const leagueRowSchema = z.object({
  place: z.number().int().positive(),
  nickname: z.string().min(1),
  points: z.number().int().nonnegative(),
  me: z.boolean().optional(),
});

export const LEAGUE_SCOPES = ['country', 'class'] as const;
export const leagueScopeSchema = z.enum(LEAGUE_SCOPES);

/** GET /v1/league?scope=: this week's table. */
export const leagueTableSchema = z.object({
  scope: leagueScopeSchema,
  league: leagueIdSchema,
  /** The student's place; null when the student is not in the table (no class yet). */
  place: z.number().int().positive().nullable(),
  /** Days until the week closes (Sunday 23:59). */
  daysLeft: z.number().int().nonnegative(),
  /** How many go up and down when the week closes (0 in a class table). */
  promote: z.number().int().nonnegative(),
  demote: z.number().int().nonnegative(),
  rows: z.array(leagueRowSchema),
});

/** A rank and the points it starts at. */
export const rankSchema = z.object({
  id: rankIdSchema,
  minPoints: z.number().int().nonnegative(),
});

export const BADGE_IDS = ['firstHoney', 'week', 'precise', 'mock', 'sealMaster'] as const;
export const badgeIdSchema = z.enum(BADGE_IDS);

export const badgeSchema = z.object({
  id: badgeIdSchema,
  /** Null for a badge not earned yet. */
  earnedAt: dateTimeSchema.nullable(),
});
