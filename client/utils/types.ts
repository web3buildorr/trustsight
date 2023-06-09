export type Metadata = {
  username: string;
  subtitle: string;
  image: string;
  score: number;
  address: string;
  reviews: number;
  category: string;
  createdAt: string;
  description: string;
  subscores: string[];
  tokenomics: number;
  liquidity: number;
  governance: number;
  innovative: number;
  flags: number;
  followers: any;
  following: any;
};

export type Scores = {
  [key: string]: number;
};

export type Review = Record<string, any>;
