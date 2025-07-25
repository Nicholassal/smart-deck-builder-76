import { FSRSData, StudySession } from '@/types/flashcard';

// FSRS Algorithm Implementation based on Jarrett Ye's specifications
// Reference: https://github.com/open-spaced-repetition/fsrs4anki

export class FSRSScheduler {
  // Default FSRS parameters
  private readonly w = [
    0.5701, 1.4436, 4.1386, 10.9355, 5.1443, 1.2006,
    0.8627, 0.0362, 1.629, 0.1342, 1.0166, 2.1174,
    0.0839, 0.3204, 1.4676, 0.219, 2.8237
  ];

  private readonly requestRetention = 0.9; // 90% target recall
  private readonly maximumInterval = 36500; // 100 years in days

  /**
   * Initialize new card FSRS data
   */
  initCard(): FSRSData {
    return {
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: 0, // new
      nextReview: new Date()
    };
  }

  /**
   * Calculate next review schedule based on response
   */
  review(card: FSRSData, response: 'again' | 'hard' | 'good' | 'easy'): FSRSData {
    const now = new Date();
    const elapsedDays = card.lastReview 
      ? Math.max(0, Math.floor((now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    let newCard = { ...card };
    newCard.elapsedDays = elapsedDays;
    newCard.lastReview = now;
    newCard.reps += 1;

    if (card.state === 0) {
      // New card
      newCard = this.initReview(newCard, response);
    } else {
      // Review card
      newCard = this.nextReview(newCard, response);
    }

    return newCard;
  }

  private initReview(card: FSRSData, response: 'again' | 'hard' | 'good' | 'easy'): FSRSData {
    card.difficulty = this.initDifficulty(response);
    card.stability = this.initStability(response);
    
    if (response === 'again') {
      card.state = 3; // relearning
      card.lapses += 1;
      card.scheduledDays = 0;
    } else {
      card.state = 1; // learning
      card.scheduledDays = this.scheduledDays(card.stability);
    }

    card.nextReview = this.getNextReviewDate(card.scheduledDays);
    return card;
  }

  private nextReview(card: FSRSData, response: 'again' | 'hard' | 'good' | 'easy'): FSRSData {
    if (response === 'again') {
      card.lapses += 1;
      card.state = 3; // relearning
      card.difficulty = this.nextDifficulty(card.difficulty, response);
      card.stability = this.nextForgetStability(card.difficulty, card.stability, card.elapsedDays);
      card.scheduledDays = 0;
    } else {
      card.state = 2; // review
      card.difficulty = this.nextDifficulty(card.difficulty, response);
      card.stability = this.nextRecallStability(card.difficulty, card.stability, card.elapsedDays, response);
      card.scheduledDays = this.scheduledDays(card.stability);
    }

    card.nextReview = this.getNextReviewDate(card.scheduledDays);
    return card;
  }

  private initStability(response: 'again' | 'hard' | 'good' | 'easy'): number {
    switch (response) {
      case 'again': return this.w[13];
      case 'hard': return this.w[14];
      case 'good': return this.w[15];
      case 'easy': return this.w[16];
      default: return this.w[15];
    }
  }

  private initDifficulty(response: 'again' | 'hard' | 'good' | 'easy'): number {
    const responseValue = { again: 1, hard: 2, good: 3, easy: 4 }[response];
    return Math.min(Math.max(this.w[4] - this.w[5] * (responseValue - 3), 1), 10);
  }

  private nextDifficulty(difficulty: number, response: 'again' | 'hard' | 'good' | 'easy'): number {
    const responseValue = { again: 1, hard: 2, good: 3, easy: 4 }[response];
    const nextDiff = difficulty - this.w[6] * (responseValue - 3);
    return Math.min(Math.max(this.meanReversion(this.w[4], nextDiff), 1), 10);
  }

  private nextRecallStability(
    difficulty: number, 
    stability: number, 
    elapsedDays: number, 
    response: 'again' | 'hard' | 'good' | 'easy'
  ): number {
    const hardPenalty = response === 'hard' ? this.w[15] : 1;
    const easyBonus = response === 'easy' ? this.w[16] : 1;
    
    return stability * (
      Math.exp(this.w[8]) *
      (11 - difficulty) *
      Math.pow(stability, -this.w[9]) *
      (Math.exp((1 - this.retrievability(stability, elapsedDays)) * this.w[10]) - 1) *
      hardPenalty *
      easyBonus
    );
  }

  private nextForgetStability(difficulty: number, stability: number, elapsedDays: number): number {
    return this.w[11] * Math.pow(difficulty, -this.w[12]) * 
           (Math.pow(stability + 1, this.w[13]) - 1) * 
           Math.exp((1 - this.retrievability(stability, elapsedDays)) * this.w[14]);
  }

  private retrievability(stability: number, elapsedDays: number): number {
    return Math.pow(1 + elapsedDays / (9 * stability), -1);
  }

  private meanReversion(init: number, current: number): number {
    return this.w[7] * init + (1 - this.w[7]) * current;
  }

  private scheduledDays(stability: number): number {
    const interval = stability * (Math.log(this.requestRetention) / Math.log(0.9));
    return Math.min(Math.max(Math.round(interval), 1), this.maximumInterval);
  }

  private getNextReviewDate(scheduledDays: number): Date {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + scheduledDays);
    return nextDate;
  }

  /**
   * Calculate recall probability for a card
   */
  getRecallProbability(card: FSRSData): number {
    if (!card.lastReview) return 0;
    
    const elapsedDays = Math.floor((Date.now() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24));
    return this.retrievability(card.stability, elapsedDays);
  }

  /**
   * Get cards due for review
   */
  getDueCards(cards: FSRSData[]): FSRSData[] {
    const now = new Date();
    return cards.filter(card => card.nextReview <= now);
  }
}

export const fsrsScheduler = new FSRSScheduler();