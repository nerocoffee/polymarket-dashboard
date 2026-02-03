# Polymarket Arbitrage Bot - Integration Guide

## Current Implementation Status

### What's Currently Working (Mock/Simulation)
The dashboard you see is a **fully functional UI with simulated data**. Here's what's running:

- ✅ **UI Components**: Complete dashboard with real-time updates
- ✅ **Market Monitoring**: Simulated crypto markets (BTC, ETH, SOL, MATIC, AVAX)
- ✅ **Arbitrage Detection**: Mock algorithm detecting price sum < threshold
- ✅ **Activity Logging**: Real-time event logs with color coding
- ✅ **Statistics Tracking**: Profit, trades, opportunities counters
- ⚠️ **No Real API**: Uses `Math.random()` for price generation
- ⚠️ **No Wallet**: No blockchain connection or transactions

### What's NOT Connected Yet
1. **Polymarket API** - Not making real API calls to Polymarket
2. **Wallet Integration** - No Web3 wallet connection (MetaMask, WalletConnect, etc.)
3. **Mumbai Testnet** - No blockchain transactions
4. **Real Market Data** - No live price feeds

---

## Integration Architecture

### 1. Polymarket API Integration

**Current Status**: Using mock data in `PolymarketDashboard.tsx:59-116`

**What Needs to Be Done**:

#### A. Polymarket API Service (`src/lib/polymarket-api.ts`)
```typescript
// Polymarket uses:
// - REST API: https://gamma-api.polymarket.com
// - CLOB API: https://clob.polymarket.com
// - WebSocket: wss://ws-subscriptions-clob.polymarket.com

Features needed:
- Fetch active markets
- Get real-time price data
- Subscribe to order book updates
- Place buy/sell orders
- Query user positions
```

**API Endpoints to Implement**:
- `GET /markets` - List all markets
- `GET /markets/:condition_id` - Get market details
- `GET /order-book/:token_id` - Get current prices
- `POST /order` - Place orders (requires authentication)

**Authentication**:
- Polymarket uses HMAC-based API keys
- Requires private key for signing transactions
- Need to handle nonce management

---

### 2. Wallet Integration (Mumbai Testnet)

**Current Status**: Configuration shows "Polygon Testnet" but no actual connection

**What Needs to Be Done**:

#### A. Web3 Wallet Service (`src/lib/wallet-service.ts`)
```typescript
// Using ethers.js or viem for wallet connection
Features needed:
- Connect to MetaMask/WalletConnect
- Switch to Mumbai Testnet (Chain ID: 80001)
- Get wallet address and balance
- Sign transactions
- Handle network switching
```

#### B. Mumbai Testnet Configuration
```typescript
Mumbai Testnet Details:
- Chain ID: 80001
- RPC URL: https://rpc-mumbai.maticvigil.com/
- Block Explorer: https://mumbai.polygonscan.com/
- USDC Contract: (Testnet USDC address needed)
- Gas Token: MATIC (testnet)
```

**Wallet Flow**:
1. User clicks "Connect Wallet" button
2. MetaMask popup appears
3. User approves connection
4. Check if on Mumbai Testnet
5. If not, prompt to switch networks
6. Display wallet address and balance

---

### 3. Smart Contract Interaction

**What Needs to Be Done**:

#### A. Polymarket CTF Exchange Contract
Polymarket uses Conditional Token Framework (CTF):
- Contract Address: (Need Mumbai testnet address)
- Functions to interact with:
  - `splitPosition()` - Buy YES/NO shares
  - `mergePositions()` - Redeem winning shares
  - `redeemPositions()` - Claim winnings

#### B. USDC Approval
Before trading:
1. Approve USDC spending
2. Set allowance for CTF contract
3. Monitor approval status

---

## Implementation Plan

### Phase 1: API Integration (Read-Only)
**Goal**: Display real market data without trading

**Files to Create**:
1. `src/lib/polymarket-api.ts` - API client
2. `src/lib/types/polymarket.ts` - Type definitions
3. `src/hooks/usePolymarketMarkets.ts` - React hook for fetching markets
4. `src/hooks/usePolymarketPrices.ts` - Real-time price updates

**Changes to Make**:
- Replace mock data in `PolymarketDashboard.tsx`
- Use TanStack Query for API caching
- Add error handling and loading states

**Environment Variables Needed**:
```bash
VITE_POLYMARKET_API_URL=https://gamma-api.polymarket.com
VITE_POLYMARKET_CLOB_API_URL=https://clob.polymarket.com
VITE_POLYMARKET_WS_URL=wss://ws-subscriptions-clob.polymarket.com
```

---

### Phase 2: Wallet Connection (No Trading)
**Goal**: Connect wallet, show balance, switch to Mumbai

**Files to Create**:
1. `src/lib/wallet-service.ts` - Wallet connection logic
2. `src/hooks/useWallet.ts` - React hook for wallet state
3. `src/components/WalletButton.tsx` - Connect wallet UI
4. `src/lib/constants/chains.ts` - Network configurations

**Dependencies to Add**:
```bash
npm install ethers@^6.9.0
# OR
npm install viem@^2.0.0 wagmi@^2.0.0
```

**UI Changes**:
- Add "Connect Wallet" button to header
- Display wallet address when connected
- Show USDC and MATIC balance
- Network indicator (Mumbai Testnet)

---

### Phase 3: Trading Integration
**Goal**: Execute real arbitrage trades

**Files to Create**:
1. `src/lib/polymarket-trading.ts` - Trading functions
2. `src/lib/contracts/ctf-exchange.ts` - Smart contract ABI
3. `src/hooks/useArbitrageTrade.ts` - Trade execution hook

**What Gets Implemented**:
- Calculate optimal trade sizes
- Approve USDC spending
- Execute buy orders for YES and NO
- Monitor transaction status
- Update balances after trades

**Safety Features**:
- Max trade size limits
- Slippage protection
- Gas estimation
- Transaction confirmation UI

---

## Current File Structure

```
src/
├── components/
│   ├── PolymarketDashboard.tsx  ← Currently uses mock data
│   └── ui/                       ← shadcn/ui components (ready to use)
├── lib/
│   ├── utils.ts                  ← Utility functions (ready)
│   └── auth-integration.ts       ← Platform auth (not related to Polymarket)
├── hooks/
│   └── use-mobile.ts             ← Existing hook
└── routes/
    └── index.tsx                 ← Main page rendering PolymarketDashboard
```

---

## Dependencies Needed

### For Polymarket API
```json
{
  "axios": "^1.6.0",           // HTTP client
  "ws": "^8.0.0"               // WebSocket client (if needed)
}
```

### For Wallet Integration
```json
{
  "ethers": "^6.9.0",          // Ethereum library
  // OR
  "viem": "^2.0.0",            // Alternative to ethers
  "wagmi": "^2.0.0",           // React hooks for Ethereum
  "@web3modal/wagmi": "^4.0.0" // Wallet connection modal
}
```

### For Trading
```json
{
  "@polymarket/order-utils": "latest", // Polymarket SDK (if available)
  "decimal.js": "^10.4.0"              // Precise decimal math
}
```

---

## Environment Setup

### `.env.local` File
Create this file with:

```bash
# Polymarket API
VITE_POLYMARKET_API_URL=https://gamma-api.polymarket.com
VITE_POLYMARKET_CLOB_API_URL=https://clob.polymarket.com
VITE_POLYMARKET_WS_URL=wss://ws-subscriptions-clob.polymarket.com

# Polymarket API Key (if you have one)
VITE_POLYMARKET_API_KEY=your_api_key_here
VITE_POLYMARKET_API_SECRET=your_api_secret_here

# Mumbai Testnet
VITE_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/
VITE_MUMBAI_CHAIN_ID=80001

# Contract Addresses (Mumbai Testnet)
VITE_CTF_EXCHANGE_ADDRESS=0x...
VITE_USDC_ADDRESS=0x...

# Bot Configuration
VITE_DEFAULT_ARB_THRESHOLD=0.98
VITE_MAX_TRADE_SIZE=100
VITE_MIN_PROFIT_THRESHOLD=0.02
```

---

## Testing Strategy

### Phase 1 Testing (API Only)
1. Test API connectivity
2. Verify market data format
3. Check price update frequency
4. Test error handling

### Phase 2 Testing (Wallet)
1. Test wallet connection flow
2. Verify network switching
3. Check balance updates
4. Test disconnect/reconnect

### Phase 3 Testing (Trading)
1. **Testnet First**: Use Mumbai testnet MATIC and USDC
2. Test USDC approval
3. Execute small test trades
4. Verify transaction confirmations
5. Check balance updates after trades

---

## Security Considerations

### API Keys
- Never commit `.env` files
- Use environment variables only
- Rotate keys regularly

### Private Keys
- **NEVER** store private keys in code
- Use MetaMask/wallet for signing
- Implement transaction confirmation UI

### Smart Contract Interactions
- Always estimate gas first
- Set reasonable gas limits
- Implement slippage protection
- Add emergency stop functionality

---

## Next Steps

**To implement real integration, you need to decide**:

1. **Do you have Polymarket API credentials?**
   - If yes: I can implement full API integration
   - If no: We can use public endpoints (limited functionality)

2. **Which wallet library do you prefer?**
   - `ethers.js` (more mature, widely used)
   - `viem/wagmi` (modern, type-safe, better DX)

3. **Do you want to start with**:
   - **Read-only mode** (just display real data, no trading)
   - **Full trading mode** (complete arbitrage bot)

4. **Testing approach**:
   - Mumbai testnet only (safer)
   - Mainnet (requires real USDC)

---

## Current Simulation Logic

**Location**: `src/components/PolymarketDashboard.tsx:59-116`

The current implementation simulates:
- Random YES/NO prices between 0.45-0.55
- Price sum calculation
- Arbitrage detection when sum < threshold
- Simulated trade execution with profit calculation
- Random settlement claims

**To replace with real data**:
1. Remove the `useEffect` simulation (lines 60-116)
2. Import real API hooks
3. Connect to wallet service
4. Implement real trade execution

---

## Questions to Answer Before Implementation

1. Do you have Polymarket API keys?
2. Do you want to trade on Mumbai testnet or mainnet?
3. Which wallet library should we use?
4. Should we implement trading immediately or start with read-only?
5. What's your risk tolerance for automated trading?

---

**Current Status**: 🟡 **Mock Implementation Ready for Real Integration**

The UI is production-ready. We just need to replace the simulation layer with real API and wallet services.
