import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users (Players)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  balance: integer("balance").notNull().default(10000), // Start with 10k chips
});

// Game Sessions / Shoes
export const shoes = pgTable("shoes", {
  id: serial("id").primaryKey(),
  decks: integer("decks").notNull().default(8),
  remainingCards: integer("remaining_cards").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hands / Rounds History
export const hands = pgTable("hands", {
  id: serial("id").primaryKey(),
  shoeId: integer("shoe_id").notNull(),
  
  // Storing full round details as JSONB for roadmap generation
  // Includes: { player: { cards: [], score: 0 }, banker: { cards: [], score: 0 }, result: 'player'|'banker'|'tie', isPair: boolean, isNatural: boolean }
  result: jsonb("result").notNull(), 
  
  winner: text("winner").notNull(), // 'player', 'banker', 'tie'
  createdAt: timestamp("created_at").defaultNow(),
});

// === ZOD SCHEMAS & TYPES ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

// Game Logic Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // Baccarat value (0-9)
}

export interface HandResult {
  cards: Card[];
  score: number;
  isPair: boolean;
  isNatural: boolean;
}

export interface RoundResult {
  player: HandResult;
  banker: HandResult;
  winner: 'player' | 'banker' | 'tie';
  outcome: string; // "Player Wins (Natural 9)"
}

export type BetType = 'player' | 'banker' | 'tie' | 'player_pair' | 'banker_pair';

export interface Bet {
  type: BetType;
  amount: number;
}

// Roadmap Types
export interface RoadmapCell {
  winner: 'player' | 'banker' | 'tie';
  isPair?: boolean;
  isNatural?: boolean;
}

export interface Roadmaps {
  beadPlate: RoadmapCell[][];
  bigRoad: RoadmapCell[][];
  bigEyeBoy: string[][]; // Derived roads usually just show red/blue markers
  smallRoad: string[][];
  cockroachRoad: string[][];
}

// API Request/Response Types
export type PlaceBetRequest = {
  bets: Record<BetType, number>; // { player: 100, tie: 50 }
};

export type GameStateResponse = {
  user: {
    username: string;
    balance: number;
  };
  shoe: {
    decks: number;
    remainingCards: number;
    cardsBurned?: number;
  };
  currentRound?: {
    bets: Record<BetType, number>;
    status: 'betting' | 'dealing' | 'payout';
    result?: RoundResult;
  };
  roadmaps: Roadmaps;
  history: RoundResult[]; // Last few rounds for display
};
