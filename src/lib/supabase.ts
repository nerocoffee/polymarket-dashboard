import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Database types
export type Market = {
  id: string;
  name: string;
  yes_price: number;
  no_price: number;
  sum: number;
  volume_24h: number;
  created_at?: string;
  updated_at?: string;
};

export type Trade = {
  id: string;
  market_id: string;
  type: 'ARB_OPPORTUNITY' | 'TRADE_EXECUTED' | 'SETTLED';
  profit: number;
  yes_price: number;
  no_price: number;
  sum: number;
  created_at?: string;
};

export type BotLog = {
  id: string;
  timestamp: string;
  type: 'INFO' | 'ARB_OPPORTUNITY' | 'TRADE_EXECUTED' | 'ERROR' | 'SETTLED';
  message: string;
  created_at?: string;
};
