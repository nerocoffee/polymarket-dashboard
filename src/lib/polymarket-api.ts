/**
 * Polymarket API Client
 * Handles communication with Polymarket Gamma API and CLOB API
 *
 * NOTE: This is a template implementation. To use real data:
 * 1. Add API credentials to .env.local
 * 2. Uncomment the real API calls
 * 3. Remove the mock data returns
 */

import type { PolymarketMarket, OrderBook, Order, Position, ArbitrageOpportunity } from "@/lib/types/polymarket";

// API Configuration
const GAMMA_API_URL = import.meta.env.VITE_POLYMARKET_API_URL || "https://gamma-api.polymarket.com";
const CLOB_API_URL = import.meta.env.VITE_POLYMARKET_CLOB_API_URL || "https://clob.polymarket.com";
const WS_URL = import.meta.env.VITE_POLYMARKET_WS_URL || "wss://ws-subscriptions-clob.polymarket.com";

const API_KEY = import.meta.env.VITE_POLYMARKET_API_KEY;
const API_SECRET = import.meta.env.VITE_POLYMARKET_API_SECRET;

/**
 * Generic API request handler
 */
async function apiRequest<T>(
	url: string,
	options: RequestInit = {}
): Promise<T> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	// Merge existing headers
	if (options.headers) {
		const existingHeaders = new Headers(options.headers);
		existingHeaders.forEach((value, key) => {
			headers[key] = value;
		});
	}

	// Add API key if available
	if (API_KEY) {
		headers["Authorization"] = `Bearer ${API_KEY}`;
	}

	try {
		const response = await fetch(url, {
			...options,
			headers,
		});

		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("API Request failed:", error);
		throw error;
	}
}

/**
 * Fetch all active markets
 */
export async function fetchMarkets(params?: {
	status?: string;
	limit?: number;
	offset?: number;
}): Promise<PolymarketMarket[]> {
	// MOCK DATA - Replace with real API call
	console.warn("Using mock data. Configure API credentials to use real data.");

	// Real implementation (uncomment when ready):
	/*
	const queryParams = new URLSearchParams();
	if (params?.status) queryParams.set("status", params.status);
	if (params?.limit) queryParams.set("limit", params.limit.toString());
	if (params?.offset) queryParams.set("offset", params.offset.toString());

	const url = `${GAMMA_API_URL}/markets?${queryParams.toString()}`;
	return apiRequest<PolymarketMarket[]>(url);
	*/

	// Mock data for development
	return generateMockMarkets();
}

/**
 * Fetch market details by ID
 */
export async function fetchMarketById(marketId: string): Promise<PolymarketMarket | null> {
	// MOCK DATA
	console.warn("Using mock data. Configure API credentials to use real data.");

	// Real implementation:
	// return apiRequest<PolymarketMarket>(`${GAMMA_API_URL}/markets/${marketId}`);

	const markets = await fetchMarkets();
	return markets.find((m) => m.id === marketId) || null;
}

/**
 * Fetch order book for a specific asset
 */
export async function fetchOrderBook(assetId: string): Promise<OrderBook> {
	// MOCK DATA
	console.warn("Using mock data. Configure API credentials to use real data.");

	// Real implementation:
	// return apiRequest<OrderBook>(`${CLOB_API_URL}/book?token_id=${assetId}`);

	return {
		market: assetId,
		asset_id: assetId,
		bids: [
			{ price: 0.52, size: 100 },
			{ price: 0.51, size: 200 },
			{ price: 0.50, size: 300 },
		],
		asks: [
			{ price: 0.53, size: 100 },
			{ price: 0.54, size: 200 },
			{ price: 0.55, size: 300 },
		],
		timestamp: Date.now(),
	};
}

/**
 * Place an order
 * Requires authentication and wallet signature
 */
export async function placeOrder(params: {
	market: string;
	asset_id: string;
	side: "buy" | "sell";
	type: "market" | "limit";
	price?: number;
	size: number;
}): Promise<Order> {
	if (!API_KEY || !API_SECRET) {
		throw new Error("API credentials required for trading. Please configure VITE_POLYMARKET_API_KEY and VITE_POLYMARKET_API_SECRET");
	}

	// Real implementation:
	/*
	const url = `${CLOB_API_URL}/order`;
	return apiRequest<Order>(url, {
		method: "POST",
		body: JSON.stringify(params),
	});
	*/

	throw new Error("Trading not implemented. Connect wallet and configure API credentials.");
}

/**
 * Fetch user positions
 */
export async function fetchPositions(walletAddress: string): Promise<Position[]> {
	if (!walletAddress) {
		return [];
	}

	// Real implementation:
	// return apiRequest<Position[]>(`${CLOB_API_URL}/positions?wallet=${walletAddress}`);

	console.warn("Using mock positions data");
	return [];
}

/**
 * Detect arbitrage opportunities
 * Looks for markets where YES + NO price < threshold
 */
export function detectArbitrageOpportunities(
	markets: PolymarketMarket[],
	threshold: number = 0.98
): ArbitrageOpportunity[] {
	const opportunities: ArbitrageOpportunity[] = [];

	for (const market of markets) {
		// Find YES and NO tokens
		const yesToken = market.tokens.find((t) => t.outcome.toLowerCase() === "yes");
		const noToken = market.tokens.find((t) => t.outcome.toLowerCase() === "no");

		if (!yesToken || !noToken) continue;

		const totalCost = yesToken.price + noToken.price;

		if (totalCost < threshold) {
			const potentialProfit = 1 - totalCost;
			const profitPercentage = (potentialProfit / totalCost) * 100;

			opportunities.push({
				market,
				yes_token: yesToken,
				no_token: noToken,
				total_cost: totalCost,
				potential_profit: potentialProfit,
				profit_percentage: profitPercentage,
				detected_at: new Date(),
			});
		}
	}

	return opportunities.sort((a, b) => b.potential_profit - a.potential_profit);
}

/**
 * Create WebSocket connection for real-time updates
 */
export function createWebSocketConnection(
	onMessage: (data: unknown) => void,
	onError?: (error: Event) => void
): WebSocket {
	const ws = new WebSocket(WS_URL);

	ws.onopen = () => {
		console.log("WebSocket connected to Polymarket");
	};

	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			onMessage(data);
		} catch (error) {
			console.error("Failed to parse WebSocket message:", error);
		}
	};

	ws.onerror = (error) => {
		console.error("WebSocket error:", error);
		if (onError) onError(error);
	};

	ws.onclose = () => {
		console.log("WebSocket disconnected");
	};

	return ws;
}

/**
 * Subscribe to market updates via WebSocket
 */
export function subscribeToMarket(
	ws: WebSocket,
	marketId: string,
	assetId?: string
) {
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify({
			type: "subscribe",
			channel: "book",
			market: marketId,
			asset_id: assetId,
		}));
	}
}

// ============================================================================
// MOCK DATA GENERATORS (Remove when using real API)
// ============================================================================

function generateMockMarkets(): PolymarketMarket[] {
	const cryptos = ["BTC", "ETH", "SOL", "MATIC", "AVAX"];
	const now = Date.now();

	return cryptos.map((crypto, index) => {
		const yesPrice = 0.45 + Math.random() * 0.1;
		const noPrice = 0.45 + Math.random() * 0.1;

		return {
			id: `${crypto.toLowerCase()}-15min-${index}`,
			condition_id: `condition-${crypto.toLowerCase()}-${index}`,
			question: `Will ${crypto} price increase in the next 15 minutes?`,
			description: `Prediction market for ${crypto} short-term price movement`,
			tokens: [
				{
					token_id: `${crypto}-yes-${index}`,
					outcome: "Yes",
					price: yesPrice,
				},
				{
					token_id: `${crypto}-no-${index}`,
					outcome: "No",
					price: noPrice,
				},
			],
			end_date_iso: new Date(now + 15 * 60 * 1000).toISOString(),
			status: "active",
			volume: Math.floor(Math.random() * 50000) + 10000,
			liquidity: Math.floor(Math.random() * 100000) + 50000,
			created_at: new Date(now - Math.random() * 86400000).toISOString(),
		};
	});
}
