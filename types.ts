
export interface RaffleHistory {
  id: string;
  round: number;
  winners: string[];
  timestamp: number;
}

export interface RaffleSettings {
  drawCount: number;
  excludeWinners: boolean;
}

export interface Participant {
  name: string;
  id: string;
}
