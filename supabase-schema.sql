-- Polymarket Dashboard Database Schema
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Markets table
CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  yes_price DECIMAL(10, 6) NOT NULL,
  no_price DECIMAL(10, 6) NOT NULL,
  sum DECIMAL(10, 6) NOT NULL,
  volume_24h DECIMAL(20, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ARB_OPPORTUNITY', 'TRADE_EXECUTED', 'SETTLED')),
  profit DECIMAL(20, 2) NOT NULL DEFAULT 0,
  yes_price DECIMAL(10, 6) NOT NULL,
  no_price DECIMAL(10, 6) NOT NULL,
  sum DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Bot logs table
CREATE TABLE IF NOT EXISTS bot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  type TEXT NOT NULL CHECK (type IN ('INFO', 'ARB_OPPORTUNITY', 'TRADE_EXECUTED', 'ERROR', 'SETTLED')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_market_id ON trades(market_id);
CREATE INDEX IF NOT EXISTS idx_bot_logs_timestamp ON bot_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bot_logs_type ON bot_logs(type);
CREATE INDEX IF NOT EXISTS idx_markets_updated_at ON markets(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your security needs)
CREATE POLICY "Allow public read access on markets" ON markets
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on markets" ON markets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on markets" ON markets
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on trades" ON trades
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on trades" ON trades
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on bot_logs" ON bot_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on bot_logs" ON bot_logs
  FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for aggregated statistics
CREATE OR REPLACE VIEW bot_statistics AS
SELECT
  COUNT(*) as total_trades,
  SUM(profit) as total_profit,
  AVG(profit) as average_profit,
  MAX(profit) as max_profit,
  MIN(profit) as min_profit,
  COUNT(DISTINCT market_id) as unique_markets
FROM trades
WHERE type = 'TRADE_EXECUTED';

-- Grant access to the view
GRANT SELECT ON bot_statistics TO anon;
GRANT SELECT ON bot_statistics TO authenticated;
