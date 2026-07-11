export interface Person {
  id: string;
  name: string;
  venmoUsername?: string;
}

export interface LineItem {
  id: string;
  name: string;
  price: number;
  claimedBy: string[];
}
