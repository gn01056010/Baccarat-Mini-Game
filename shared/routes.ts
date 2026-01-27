import { z } from 'zod';
import { insertUserSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  gameError: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
};

export const api = {
  game: {
    state: {
      method: 'GET' as const,
      path: '/api/game/state',
      responses: {
        200: z.any(), // Returns GameStateResponse
      },
    },
    reset: {
      method: 'POST' as const,
      path: '/api/game/reset', // Shuffle / New Shoe
      input: z.object({ decks: z.number().min(6).max(8).optional() }),
      responses: {
        200: z.any(),
      },
    },
    deal: {
      method: 'POST' as const,
      path: '/api/game/deal',
      input: z.object({
        bets: z.record(z.enum(['player', 'banker', 'tie', 'player_pair', 'banker_pair']), z.number()),
      }),
      responses: {
        200: z.any(), // Returns updated GameStateResponse with round result
        400: errorSchemas.validation,
      },
    }
  },
  user: {
    resetBalance: {
      method: 'POST' as const,
      path: '/api/user/reset-balance',
      responses: {
        200: z.object({ balance: z.number() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
