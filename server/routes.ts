import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { 
  type Card, type RoundResult, type HandResult, type Roadmaps, type RoadmapCell,
  type BetType
} from "@shared/schema";

// === Baccarat Logic Engine ===

class CardEngine {
  private deck: Card[] = [];
  
  constructor(private decks: number = 8) {
    this.shuffle();
  }

  shuffle() {
    this.deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
    
    for (let i = 0; i < this.decks; i++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          let value = 0;
          if (['10', 'J', 'Q', 'K'].includes(rank)) value = 0;
          else if (rank === 'A') value = 1;
          else value = parseInt(rank);
          
          this.deck.push({ suit, rank, value });
        }
      }
    }
    
    // Fisher-Yates shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  draw(): Card {
    if (this.deck.length === 0) this.shuffle();
    return this.deck.pop()!;
  }

  get remaining() {
    return this.deck.length;
  }
}

// Global active shoe for simplicity in this single-session demo
// In a real multi-user app, this would be stored in DB or Redis per table
let activeShoe = new CardEngine(8);
let currentShoeId: number | null = null;

class BaccaratRules {
  static calculateScore(cards: Card[]): number {
    return cards.reduce((sum, card) => sum + card.value, 0) % 10;
  }

  static playRound(shoe: CardEngine): RoundResult {
    const player: Card[] = [shoe.draw(), shoe.draw()];
    const banker: Card[] = [shoe.draw(), shoe.draw()];
    
    let playerScore = this.calculateScore(player);
    let bankerScore = this.calculateScore(banker);
    
    const isNatural = playerScore >= 8 || bankerScore >= 8;
    
    if (!isNatural) {
      // Player 3rd card rule
      let playerThirdCard: Card | null = null;
      if (playerScore <= 5) {
        playerThirdCard = shoe.draw();
        player.push(playerThirdCard);
        playerScore = this.calculateScore(player);
      }
      
      // Banker 3rd card rule
      let bankerDraws = false;
      if (bankerScore <= 2) {
        bankerDraws = true;
      } else if (bankerScore === 3) {
        // If player didn't draw 3rd, banker draws on 0-5. 
        // If player drew, banker draws unless player's 3rd was 8.
        if (!playerThirdCard) bankerDraws = true;
        else bankerDraws = playerThirdCard.value !== 8;
      } else if (bankerScore === 4) {
        if (!playerThirdCard) bankerDraws = true; // Rules vary slightly here but usually Bank stands on 6,7. If Player stands, Bank draws 0-5. 
        // Actually: If Player stands (6,7), Banker draws on 0-5.
        // If Player draws:
        else bankerDraws = [2, 3, 4, 5, 6, 7].includes(playerThirdCard.value);
      } else if (bankerScore === 5) {
         if (!playerThirdCard) bankerDraws = false; // Player stood on 6/7, Banker (5) draws? No, Banker draws 0-5 if Player stands.
         // Wait, standard rule: If Player stands, Banker draws 0-5, stands 6-7.
         // So if !playerThirdCard (Player stood), Banker draws if score <= 5.
         
         if (playerThirdCard) bankerDraws = [4, 5, 6, 7].includes(playerThirdCard.value);
         else bankerDraws = true; // Score is 5.
      } else if (bankerScore === 6) {
        if (playerThirdCard) bankerDraws = [6, 7].includes(playerThirdCard.value);
        else bankerDraws = false; // Player stood, Banker stands on 6.
      } else { // 7
        bankerDraws = false;
      }
      
      // Correction on "If Player Stands" rule:
      // If Player stands (has 6 or 7), Banker draws on 0-5 and stands on 6-7.
      if (!playerThirdCard) {
         bankerDraws = bankerScore <= 5;
      }

      if (bankerDraws) {
        banker.push(shoe.draw());
        bankerScore = this.calculateScore(banker);
      }
    }

    let winner: 'player' | 'banker' | 'tie' = 'tie';
    if (playerScore > bankerScore) winner = 'player';
    else if (bankerScore > playerScore) winner = 'banker';

    const winnerName = {
      'player': '閒家',
      'banker': '莊家',
      'tie': '和局'
    }[winner];

    const outcome = isNatural 
      ? `天生贏家 - ${winner === 'tie' ? '和局' : winnerName + '勝'}` 
      : `${winnerName}${winner === 'tie' ? '' : '勝'}`;

    return {
      player: {
        cards: player,
        score: playerScore,
        isPair: player[0].rank === player[1].rank,
        isNatural: playerScore >= 8 && player.length === 2
      },
      banker: {
        cards: banker,
        score: bankerScore,
        isPair: banker[0].rank === banker[1].rank,
        isNatural: bankerScore >= 8 && banker.length === 2
      },
      winner,
      outcome
    };
  }
}

class RoadEngine {
  static generate(history: RoundResult[]): Roadmaps {
    // 1. Bead Plate (simple grid history)
    const beadPlate: RoadmapCell[][] = [];
    const BEAD_ROWS = 6;
    
    // Initialize standard bead plate grid (e.g., 20 cols)
    for(let i=0; i<20; i++) beadPlate.push(new Array(BEAD_ROWS).fill(null));

    let beadRow = 0, beadCol = 0;
    
    history.forEach(round => {
      // Expand grid if needed
      if (!beadPlate[beadCol]) beadPlate[beadCol] = new Array(BEAD_ROWS).fill(null);
      
      beadPlate[beadCol][beadRow] = {
        winner: round.winner,
        isPair: round.player.isPair || round.banker.isPair, 
        isNatural: round.player.isNatural || round.banker.isNatural
      };
      
      beadRow++;
      if (beadRow >= BEAD_ROWS) {
        beadRow = 0;
        beadCol++;
      }
    });

    // 2. Big Road (Logic with Dragon Tail)
    const bigRoad: RoadmapCell[][] = [];
    const BIG_ROWS = 6;
    
    // Initialize
    for(let i=0; i<40; i++) bigRoad.push(new Array(BIG_ROWS).fill(null));

    let col = 0;
    let row = 0;
    let lastWinner: string | null = null;
    
    // Helper to find next empty spot in Dragon Tail mode
    // If logical row > 5, we move to next col, same visual row (5).
    // But conceptually, big road is a 2D array.
    // We will simulate "logical" placement.
    
    // Simplified Dragon Tail:
    // If (winner changes) -> New Col, Row 0.
    // If (winner same) -> 
    //    If (cell below is empty AND row < 5) -> Row++
    //    Else -> Col++ (Dragon Tail - turns right)

    history.forEach(round => {
       if (round.winner === 'tie') {
          // In Big Road, ties are usually just a green line on the previous bead.
          // We will SKIP adding a new cell for ties in Big Road to keep structure clean.
          // Real apps overlay this. For MVP, we ignore ties in Big Road structure.
          return; 
       }

       if (lastWinner === null) {
         // First non-tie hand
         bigRoad[col][row] = { winner: round.winner };
         lastWinner = round.winner;
         return;
       }

       if (round.winner !== lastWinner) {
         // New Column
         // Find next empty column at row 0
         col++;
         while (bigRoad[col] && bigRoad[col][0] !== null) col++; // Skip occupied
         if (!bigRoad[col]) bigRoad[col] = new Array(BIG_ROWS).fill(null);
         
         row = 0;
         bigRoad[col][row] = { winner: round.winner };
         lastWinner = round.winner;
       } else {
         // Same Winner - Stack Down or Turn Right
         if (row < 5 && bigRoad[col][row + 1] === null) {
           // Can go down
           row++;
           bigRoad[col][row] = { winner: round.winner };
         } else {
           // Must turn right (Dragon Tail)
           col++;
           if (!bigRoad[col]) bigRoad[col] = new Array(BIG_ROWS).fill(null);
           
           // In Dragon Tail, we stay on the same row or the one that caused the turn?
           // Usually we occupy the bottom-most available slot or the same row if we are turning from a collision.
           // Standard: If collision or bottom, move right.
           bigRoad[col][row] = { winner: round.winner };
         }
       }
    });

    return {
      beadPlate,
      bigRoad,
      bigEyeBoy: [], // Placeholder
      smallRoad: [], // Placeholder
      cockroachRoad: [] // Placeholder
    };
  }
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Initialize shoe on startup
  if (!currentShoeId) {
    currentShoeId = await storage.createShoe(8);
  }

  // Helper to get full state
  async function getGameState(username: string) {
    const user = await storage.getUser(username);
    const shoe = await storage.getShoe(currentShoeId!);
    const history = await storage.getShoeHistory(currentShoeId!);
    const roadmaps = RoadEngine.generate(history);
    
    return {
      user: { username: user!.username, balance: user!.balance },
      shoe: { decks: shoe!.decks, remainingCards: activeShoe.remaining },
      roadmaps,
      history: history.slice(-10), // Send last 10 for quick list
      currentRound: { bets: {}, status: 'betting' }
    };
  }

  app.get(api.game.state.path, async (req, res) => {
    // For demo, we use a single fixed user or create if not exists
    // In real app, req.session.userId
    const defaultUser = "player1";
    let user = await storage.getUser(defaultUser);
    if (!user) user = await storage.createUser(defaultUser);
    
    const state = await getGameState(defaultUser);
    res.json(state);
  });

  app.post(api.game.deal.path, async (req, res) => {
    try {
      const { bets } = req.body;
      const defaultUser = "player1";
      const user = await storage.getUser(defaultUser);
      
      if (!user) return res.status(401).send("User not found");
      
      // 1. Validate Balance
      const totalBet = Object.values(bets).reduce((a: number, b: number) => a + b, 0);
      if (totalBet > user.balance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // 2. Play Round
      const roundResult = BaccaratRules.playRound(activeShoe);
      await storage.recordHand(currentShoeId!, roundResult);
      await storage.updateShoeCards(currentShoeId!, activeShoe.remaining);

      // 3. Calculate Payouts
      let winnings = 0;
      
      // Return initial stake + profit for wins
      if (roundResult.winner === 'player' && bets.player) {
        winnings += bets.player * 2; // 1:1
      }
      if (roundResult.winner === 'banker' && bets.banker) {
        winnings += bets.banker * 1.95; // 1:0.95 (5% commission)
      }
      if (roundResult.winner === 'tie' && bets.tie) {
        winnings += bets.tie * 9; // 1:8
      }
      if (roundResult.player.isPair && bets.player_pair) {
        winnings += bets.player_pair * 12; // 1:11
      }
      if (roundResult.banker.isPair && bets.banker_pair) {
        winnings += bets.banker_pair * 12; // 1:11
      }
      
      // Tie Rule: If tie, Player/Banker bets push (return stake)
      if (roundResult.winner === 'tie') {
        if (bets.player) winnings += bets.player;
        if (bets.banker) winnings += bets.banker;
      }

      // 4. Update Balance (Deduct bet first, then add winnings)
      // Actually simpler: NewBalance = OldBalance - TotalBet + Winnings
      const newBalance = user.balance - totalBet + winnings;
      await storage.updateBalance(user.id, newBalance);

      // 5. Return Result
      const state = await getGameState(defaultUser);
      state.currentRound = {
        bets,
        status: 'payout',
        result: roundResult
      };
      
      res.json(state);
      
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal game error" });
    }
  });

  app.post(api.game.reset.path, async (req, res) => {
    const { decks } = req.body;
    activeShoe = new CardEngine(decks || 8);
    currentShoeId = await storage.createShoe(decks || 8);
    
    const defaultUser = "player1";
    const state = await getGameState(defaultUser);
    res.json(state);
  });
  
  app.post(api.user.resetBalance.path, async (req, res) => {
      const defaultUser = "player1";
      const user = await storage.getUser(defaultUser);
      if (user) {
          const updated = await storage.updateBalance(user.id, 10000);
          res.json({ balance: updated.balance });
      } else {
          res.status(404).json({ message: "User not found" });
      }
  });

  return httpServer;
}
