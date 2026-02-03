/**
 * Blockchain network configurations
 * Supports Mumbai Testnet and Polygon Mainnet
 */

export type ChainConfig = {
	id: number;
	name: string;
	network: string;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	rpcUrls: {
		default: { http: string[] };
		public: { http: string[] };
	};
	blockExplorers: {
		default: { name: string; url: string };
	};
	testnet: boolean;
};

/**
 * Mumbai Testnet (Polygon Testnet)
 * Chain ID: 80001
 */
export const MUMBAI_TESTNET: ChainConfig = {
	id: 80001,
	name: "Mumbai",
	network: "mumbai",
	nativeCurrency: {
		name: "MATIC",
		symbol: "MATIC",
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: [
				import.meta.env.VITE_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
			],
		},
		public: {
			http: [
				"https://rpc-mumbai.maticvigil.com",
				"https://matic-mumbai.chainstacklabs.com",
				"https://polygon-mumbai.g.alchemy.com/v2/demo",
			],
		},
	},
	blockExplorers: {
		default: {
			name: "PolygonScan",
			url: "https://mumbai.polygonscan.com",
		},
	},
	testnet: true,
};

/**
 * Polygon Mainnet
 * Chain ID: 137
 */
export const POLYGON_MAINNET: ChainConfig = {
	id: 137,
	name: "Polygon",
	network: "polygon",
	nativeCurrency: {
		name: "MATIC",
		symbol: "MATIC",
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: ["https://polygon-rpc.com"],
		},
		public: {
			http: [
				"https://polygon-rpc.com",
				"https://rpc-mainnet.matic.network",
				"https://polygon-mainnet.g.alchemy.com/v2/demo",
			],
		},
	},
	blockExplorers: {
		default: {
			name: "PolygonScan",
			url: "https://polygonscan.com",
		},
	},
	testnet: false,
};

/**
 * Contract addresses for Mumbai Testnet
 */
export const MUMBAI_CONTRACTS = {
	// Polymarket Conditional Token Framework (CTF) Exchange
	CTF_EXCHANGE: import.meta.env.VITE_CTF_EXCHANGE_ADDRESS || "0x0000000000000000000000000000000000000000",

	// USDC Test Token on Mumbai
	USDC: import.meta.env.VITE_USDC_ADDRESS || "0x0000000000000000000000000000000000000000",

	// Conditional Tokens Contract
	CONDITIONAL_TOKENS: import.meta.env.VITE_CONDITIONAL_TOKENS_ADDRESS || "0x0000000000000000000000000000000000000000",
};

/**
 * Contract addresses for Polygon Mainnet
 */
export const POLYGON_CONTRACTS = {
	// Polymarket contracts on Polygon Mainnet
	CTF_EXCHANGE: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E",
	USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
	CONDITIONAL_TOKENS: "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045",
};

/**
 * Get the active chain based on environment
 */
export function getActiveChain(): ChainConfig {
	const isTestnet = import.meta.env.VITE_USE_TESTNET !== "false";
	return isTestnet ? MUMBAI_TESTNET : POLYGON_MAINNET;
}

/**
 * Get contract addresses for active chain
 */
export function getActiveContracts() {
	const isTestnet = import.meta.env.VITE_USE_TESTNET !== "false";
	return isTestnet ? MUMBAI_CONTRACTS : POLYGON_CONTRACTS;
}

/**
 * Supported chains
 */
export const SUPPORTED_CHAINS = [MUMBAI_TESTNET, POLYGON_MAINNET];

/**
 * Default chain for the application
 */
export const DEFAULT_CHAIN = MUMBAI_TESTNET;
