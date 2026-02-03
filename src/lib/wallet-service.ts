/**
 * Wallet Connection Service
 * Handles Web3 wallet connections (MetaMask, WalletConnect, etc.)
 *
 * NOTE: This is a template implementation without external dependencies.
 * To enable real wallet functionality:
 * 1. Install: npm install ethers@^6.9.0
 * 2. Uncomment the implementation code
 * 3. Remove the mock implementations
 */

import { DEFAULT_CHAIN, getActiveChain } from "@/lib/constants/chains";
import type { ChainConfig } from "@/lib/constants/chains";

export type WalletState = {
	address: string | null;
	chainId: number | null;
	isConnected: boolean;
	balance: string | null; // In native currency (MATIC)
	usdcBalance: string | null;
};

export type WalletError = {
	code: string;
	message: string;
};

// ============================================================================
// WALLET CONNECTION (Requires ethers.js or viem)
// ============================================================================

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
	if (typeof window === "undefined") return false;

	const ethereum = (window as unknown as { ethereum?: { isMetaMask?: boolean } }).ethereum;
	return Boolean(ethereum && ethereum.isMetaMask);
}

/**
 * Connect to MetaMask wallet
 * Returns the connected wallet address
 */
export async function connectWallet(): Promise<string> {
	if (!isMetaMaskInstalled()) {
		throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
	}

	// MOCK IMPLEMENTATION
	// Real implementation with ethers.js:
	/*
	import { BrowserProvider } from 'ethers';

	const ethereum = (window as any).ethereum;
	const provider = new BrowserProvider(ethereum);

	// Request account access
	const accounts = await provider.send("eth_requestAccounts", []);

	if (!accounts || accounts.length === 0) {
		throw new Error("No accounts found");
	}

	return accounts[0];
	*/

	throw new Error("Wallet connection not implemented. Install ethers.js: npm install ethers@^6.9.0");
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
	// MetaMask doesn't have a direct disconnect method
	// This would typically clear local state
	console.log("Wallet disconnected (local state cleared)");
}

/**
 * Get current wallet address
 */
export async function getWalletAddress(): Promise<string | null> {
	if (!isMetaMaskInstalled()) return null;

	// MOCK IMPLEMENTATION
	// Real implementation:
	/*
	import { BrowserProvider } from 'ethers';

	const ethereum = (window as any).ethereum;
	const provider = new BrowserProvider(ethereum);
	const accounts = await provider.send("eth_accounts", []);

	return accounts.length > 0 ? accounts[0] : null;
	*/

	return null;
}

/**
 * Get wallet balance (MATIC)
 */
export async function getWalletBalance(address: string): Promise<string> {
	if (!address) return "0";

	// MOCK IMPLEMENTATION
	// Real implementation:
	/*
	import { BrowserProvider, formatEther } from 'ethers';

	const ethereum = (window as any).ethereum;
	const provider = new BrowserProvider(ethereum);
	const balance = await provider.getBalance(address);

	return formatEther(balance);
	*/

	return "0";
}

/**
 * Get USDC balance for an address
 */
export async function getUSDCBalance(address: string): Promise<string> {
	if (!address) return "0";

	// MOCK IMPLEMENTATION
	// Real implementation requires ERC20 contract interaction:
	/*
	import { BrowserProvider, Contract, formatUnits } from 'ethers';
	import { getActiveContracts } from '@/lib/constants/chains';

	const contracts = getActiveContracts();
	const ethereum = (window as any).ethereum;
	const provider = new BrowserProvider(ethereum);

	const usdcAbi = [
		"function balanceOf(address) view returns (uint256)",
		"function decimals() view returns (uint8)"
	];

	const usdcContract = new Contract(contracts.USDC, usdcAbi, provider);
	const balance = await usdcContract.balanceOf(address);
	const decimals = await usdcContract.decimals();

	return formatUnits(balance, decimals);
	*/

	return "0";
}

/**
 * Get current network/chain ID
 */
export async function getChainId(): Promise<number | null> {
	if (!isMetaMaskInstalled()) return null;

	// MOCK IMPLEMENTATION
	// Real implementation:
	/*
	const ethereum = (window as any).ethereum;
	const chainId = await ethereum.request({ method: 'eth_chainId' });
	return parseInt(chainId, 16);
	*/

	return null;
}

/**
 * Switch to a specific network
 */
export async function switchNetwork(chain: ChainConfig): Promise<void> {
	if (!isMetaMaskInstalled()) {
		throw new Error("MetaMask is not installed");
	}

	// MOCK IMPLEMENTATION
	// Real implementation:
	/*
	const ethereum = (window as any).ethereum;

	try {
		// Try to switch to the network
		await ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: `0x${chain.id.toString(16)}` }],
		});
	} catch (error: any) {
		// If the network doesn't exist, add it
		if (error.code === 4902) {
			await ethereum.request({
				method: 'wallet_addEthereumChain',
				params: [{
					chainId: `0x${chain.id.toString(16)}`,
					chainName: chain.name,
					nativeCurrency: chain.nativeCurrency,
					rpcUrls: chain.rpcUrls.default.http,
					blockExplorerUrls: [chain.blockExplorers.default.url],
				}],
			});
		} else {
			throw error;
		}
	}
	*/

	throw new Error("Network switching not implemented. Install ethers.js: npm install ethers@^6.9.0");
}

/**
 * Check if on correct network, switch if not
 */
export async function ensureCorrectNetwork(): Promise<boolean> {
	const currentChainId = await getChainId();
	const targetChain = getActiveChain();

	if (currentChainId !== targetChain.id) {
		try {
			await switchNetwork(targetChain);
			return true;
		} catch (error) {
			console.error("Failed to switch network:", error);
			return false;
		}
	}

	return true;
}

/**
 * Listen to wallet events (account changes, network changes)
 */
export function setupWalletListeners(
	onAccountsChanged: (accounts: string[]) => void,
	onChainChanged: (chainId: string) => void,
	onDisconnect: () => void
): () => void {
	if (!isMetaMaskInstalled()) {
		return () => {}; // Return empty cleanup function
	}

	const ethereum = (window as unknown as {
		ethereum?: {
			on: (event: string, handler: (...args: unknown[]) => void) => void;
			removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
		};
	}).ethereum;

	if (!ethereum) return () => {};

	// MOCK IMPLEMENTATION
	// Real implementation:
	/*
	ethereum.on('accountsChanged', onAccountsChanged);
	ethereum.on('chainChanged', (chainId: string) => {
		onChainChanged(chainId);
		// Reload the page on chain change (recommended by MetaMask)
		window.location.reload();
	});
	ethereum.on('disconnect', onDisconnect);

	// Return cleanup function
	return () => {
		ethereum.removeListener('accountsChanged', onAccountsChanged);
		ethereum.removeListener('chainChanged', onChainChanged);
		ethereum.removeListener('disconnect', onDisconnect);
	};
	*/

	return () => {}; // Cleanup function
}

/**
 * Get wallet state
 */
export async function getWalletState(): Promise<WalletState> {
	const address = await getWalletAddress();

	if (!address) {
		return {
			address: null,
			chainId: null,
			isConnected: false,
			balance: null,
			usdcBalance: null,
		};
	}

	const [chainId, balance, usdcBalance] = await Promise.all([
		getChainId(),
		getWalletBalance(address),
		getUSDCBalance(address),
	]);

	return {
		address,
		chainId,
		isConnected: true,
		balance,
		usdcBalance,
	};
}

/**
 * Format wallet address for display (0x1234...5678)
 */
export function formatAddress(address: string): string {
	if (!address) return "";
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format balance for display
 */
export function formatBalance(balance: string, decimals: number = 4): string {
	const num = Number.parseFloat(balance);
	if (Number.isNaN(num)) return "0";
	return num.toFixed(decimals);
}
