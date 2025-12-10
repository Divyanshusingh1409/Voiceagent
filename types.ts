export interface OrderItem {
  item: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'completed';
  total: number;
  timestamp: Date;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  isFinal?: boolean;
}

export const MENU_ITEMS = [
  { name: 'Espresso', price: 3.0 },
  { name: 'Latte', price: 4.5 },
  { name: 'Cappuccino', price: 4.5 },
  { name: 'Matcha Tea', price: 5.0 },
  { name: 'Croissant', price: 3.5 },
  { name: 'Bagel', price: 3.0 },
];
