import { db } from "./db";
import { users, shoes, hands, type User, type RoundResult } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(username: string): Promise<User | undefined>;
  createUser(username: string): Promise<User>;
  updateBalance(userId: number, newBalance: number): Promise<User>;
  
  // Shoe operations
  createShoe(decks: number): Promise<number>;
  getShoe(id: number): Promise<{ id: number, decks: number, remainingCards: number } | undefined>;
  updateShoeCards(id: number, remaining: number): Promise<void>;
  
  // Hand operations
  recordHand(shoeId: number, result: RoundResult): Promise<void>;
  getShoeHistory(shoeId: number): Promise<RoundResult[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(username: string): Promise<User> {
    const [user] = await db.insert(users).values({ username, balance: 10000 }).returning();
    return user;
  }

  async updateBalance(userId: number, newBalance: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createShoe(decks: number): Promise<number> {
    const totalCards = decks * 52;
    const [shoe] = await db.insert(shoes)
      .values({ decks, remainingCards: totalCards, isActive: true })
      .returning();
    return shoe.id;
  }

  async getShoe(id: number) {
    const [shoe] = await db.select().from(shoes).where(eq(shoes.id, id));
    return shoe;
  }

  async updateShoeCards(id: number, remaining: number): Promise<void> {
    await db.update(shoes).set({ remainingCards: remaining }).where(eq(shoes.id, id));
  }

  async recordHand(shoeId: number, result: RoundResult): Promise<void> {
    await db.insert(hands).values({
      shoeId,
      result: result as any, // Cast to any for JSONB
      winner: result.winner
    });
  }

  async getShoeHistory(shoeId: number): Promise<RoundResult[]> {
    const history = await db.select()
      .from(hands)
      .where(eq(hands.shoeId, shoeId))
      .orderBy(hands.createdAt);
      
    return history.map(h => h.result as unknown as RoundResult);
  }
}

export const storage = new DatabaseStorage();
