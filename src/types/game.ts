export type GameMode = 'classic' | 'freeplay' | 'daily';
export type GameStatus = 'setup' | 'playing' | 'won';

export interface Article {
  title: string;
  displayTitle: string;
}

export interface ArticleContent extends Article {
  html: string;
}

export interface PathEntry extends Article {
  timestamp: number;
}

export interface GameState {
  mode: GameMode;
  startArticle: Article | null;
  targetArticle: Article | null;
  currentArticle: ArticleContent | null;
  path: PathEntry[];
  steps: number;
  status: GameStatus;
}
