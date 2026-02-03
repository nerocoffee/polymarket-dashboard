/**
 * Polymarket API Type Definitions
 * Based on Polymarket Gamma API and CLOB API documentation
 */

export type MarketStatus = "active" | "closed" | "resolved" | "paused";

export type OutcomeToken = {
	token_id: string;
	outcome: string;
	price: number;
	winner?: boolean;
};

export type PolymarketMarket = {
	id: string;
	condition_id: string;
	question: string;
	description?: string;
	tokens: OutcomeToken[];
	end_date_iso: string;
	game_start_time?: string;
	status: MarketStatus;
	volume: number;
	liquidity: number;
	created_at: string;
};

export type OrderBookSide = {
	price: number;
	size: number;
};

export type OrderBook = {
	market: string;
	asset_id: string;
	bids: OrderBookSide[];
	asks: OrderBookSide[];
	timestamp: number;
};

export type OrderType = "market" | "limit";
export type OrderSide = "buy" | "sell";
export type OrderStatus = "pending" | "filled" | "cancelled" | "failed";

export type Order = {
	id: string;
	market: string;
	asset_id: string;
	type: OrderType;
	side: OrderSide;
	price: number;
	size: number;
	status: OrderStatus;
	filled_size: number;
	timestamp: number;
};

export type Position = {
	market: string;
	asset_id: string;
	size: number;
	average_price: number;
	current_price: number;
	unrealized_pnl: number;
};

export type TradeHistory = {
	id: string;
	market: string;
	asset_id: string;
	side: OrderSide;
	price: number;
	size: number;
	fee: number;
	timestamp: number;
};

/**
 * Arbitrage opportunity detected in the market
 */
export type ArbitrageOpportunity = {
	market: PolymarketMarket;
	yes_token: OutcomeToken;
	no_token: OutcomeToken;
	total_cost: number;
	potential_profit: number;
	profit_percentage: number;
	detected_at: Date;
};

/**
 * WebSocket subscription message types
 */
export type WSMessageType = "book" | "trade" | "ticker";

export type WSSubscription = {
	type: WSMessageType;
	market: string;
	asset_id?: string;
};

export type WSMessage = {
	type: WSMessageType;
	data: OrderBook | TradeHistory | OutcomeToken;
	timestamp: number;
};
