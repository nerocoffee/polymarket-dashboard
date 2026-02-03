import { ethers } from 'ethers';

// Polygon Network Configuration
export const POLYGON_NETWORKS = {
  mainnet: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
  testnet: {
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
  },
};

// Polymarket CTF Exchange Contract Address on Polygon
export const POLYMARKET_CTF_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E';

// Initialize provider
export const getProvider = (network: 'mainnet' | 'testnet' = 'testnet') => {
  return new ethers.JsonRpcProvider(POLYGON_NETWORKS[network].rpcUrl);
};

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return false;
    }
  }
  return false;
};

// Connect wallet
export const connectWallet = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Switch to Polygon network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + POLYGON_NETWORKS.testnet.chainId.toString(16) }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x' + POLYGON_NETWORKS.testnet.chainId.toString(16),
              chainName: POLYGON_NETWORKS.testnet.name,
              rpcUrls: [POLYGON_NETWORKS.testnet.rpcUrl],
              blockExplorerUrls: [POLYGON_NETWORKS.testnet.blockExplorer],
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
            }],
          });
        }
      }

      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  } else {
    alert('Please install MetaMask or another Web3 wallet!');
    return null;
  }
};

// Get wallet balance
export const getBalance = async (address: string): Promise<string> => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

// Get current network
export const getCurrentNetwork = async (): Promise<number | null> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return parseInt(chainId, 16);
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }
  return null;
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// Listen for network changes
export const onChainChanged = (callback: (chainId: string) => void) => {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('chainChanged', callback);
  }
};

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Polymarket API helper (for fetching real market data)
export const fetchPolymarketMarkets = async () => {
  try {
    // Polymarket API endpoint for active markets
    const response = await fetch('https://clob.polymarket.com/markets');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Polymarket markets:', error);
    return [];
  }
};

// Get market prices from Polymarket
export const getMarketPrices = async (marketId: string) => {
  try {
    const response = await fetch(`https://clob.polymarket.com/prices/${marketId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return null;
  }
};
