# Polymarket Dashboard - Deployment Guide

A real-time arbitrage bot dashboard for Polymarket with Supabase integration and Web3 wallet connectivity.

## Features

- 🔗 **Blockchain Integration**: Connect your MetaMask wallet and interact with Polygon network
- 📊 **Real-time Market Monitoring**: Track arbitrage opportunities across crypto prediction markets
- 💾 **Supabase Backend**: Persistent storage for trades, logs, and market data
- 🚀 **Netlify Deployment**: One-click deployment with automatic builds
- 📈 **Live Statistics**: Track profits, trades executed, and opportunities detected

## Prerequisites

1. **Supabase Account**: Already configured at `https://hfskemmqydycawhhymhg.supabase.co`
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **MetaMask Wallet**: For blockchain interactions
4. **Node.js 20+**: For local development

## Setup Instructions

### 1. Setup Supabase Database

1. Go to your Supabase project: https://hfskemmqydycawhhymhg.supabase.co
2. Navigate to the **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to create all tables and policies

This will create:
- `markets` - Store market data
- `trades` - Store executed trades
- `bot_logs` - Store activity logs
- `bot_statistics` - View for aggregated stats

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify UI

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect to GitHub and select `nerocoffee/polymarket-dashboard`
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL` = `https://hfskemmqydycawhhymhg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc2tlbW1xeWR5Y2F3aGh5bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzQwMTUsImV4cCI6MjA4NTcxMDAxNX0.vI6Q4s-wZG0oNCSP6elr_cyc9ORBqbVZUdCjCGbOTwo`
6. Click **Deploy site**

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### 3. Local Development

```bash
# Install dependencies
npm install

# Create .env file with your credentials (already done)
# VITE_SUPABASE_URL=https://hfskemmqydycawhhymhg.supabase.co
# VITE_SUPABASE_ANON_KEY=your-key

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve
```

## Blockchain Integration

### Supported Networks

- **Polygon Amoy Testnet** (Default)
  - Chain ID: 80002
  - RPC: https://rpc-amoy.polygon.technology
  - Faucet: https://faucet.polygon.technology

- **Polygon Mainnet**
  - Chain ID: 137
  - RPC: https://polygon-rpc.com

### Wallet Connection

1. Install [MetaMask](https://metamask.io) browser extension
2. Click **Connect Wallet** in the dashboard
3. Approve the connection request
4. The app will automatically switch to Polygon Amoy Testnet
5. Get free testnet MATIC from the [faucet](https://faucet.polygon.technology)

### Features Available with Wallet

- View your wallet address and MATIC balance
- Track transactions on Polygon network
- Ready for future trading integration with Polymarket smart contracts

## Environment Variables

The following environment variables are required:

```env
VITE_SUPABASE_URL=https://hfskemmqydycawhhymhg.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Important**: Never commit the `.env` file. Use Netlify's environment variables UI for production.

## Architecture

```
polymarket-dashboard/
├── src/
│   ├── components/
│   │   └── PolymarketDashboard.tsx  # Main dashboard component
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client & types
│   │   └── blockchain.ts            # Web3 integration
│   └── routes/                      # React Router pages
├── supabase-schema.sql              # Database schema
├── netlify.toml                     # Netlify config
└── .env                             # Local environment variables
```

## API Integration

### Polymarket API

The dashboard can connect to Polymarket's public API:

```typescript
// Fetch active markets
GET https://clob.polymarket.com/markets

// Get market prices
GET https://clob.polymarket.com/prices/{marketId}
```

### Supabase Queries

```typescript
// Save a trade
await supabase.from('trades').insert({
  market_id: 'BTC-15min',
  type: 'TRADE_EXECUTED',
  profit: 12.50,
  yes_price: 0.48,
  no_price: 0.49,
  sum: 0.97
});

// Get statistics
const { data } = await supabase
  .from('bot_statistics')
  .select('*')
  .single();
```

## Monitoring & Logs

- **Activity Logs**: View in the "Activity Log" tab
- **Supabase Logs**: Monitor database queries in Supabase dashboard
- **Netlify Logs**: Check deployment and function logs in Netlify

## Troubleshooting

### Wallet Connection Issues

- Make sure MetaMask is installed
- Check you're on a supported browser (Chrome, Firefox, Brave)
- Clear browser cache and try again

### Database Connection Issues

- Verify Supabase credentials in environment variables
- Check Row Level Security policies are enabled
- Ensure tables are created with the SQL schema

### Build Failures

- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 20+)
- Review build logs in Netlify dashboard

## Next Steps

1. **Add Real Trading**: Integrate with Polymarket smart contracts
2. **Enhanced Analytics**: Add charts and historical data visualization
3. **Notifications**: Set up alerts for arbitrage opportunities
4. **Authentication**: Add user accounts for personalized tracking
5. **Automated Trading**: Implement bot logic for automatic trade execution

## Security Notes

- Never commit API keys or private keys to Git
- Use environment variables for all secrets
- Enable RLS policies in Supabase for production
- Always test on testnet before using mainnet

## Support

- **Issues**: https://github.com/nerocoffee/polymarket-dashboard/issues
- **Supabase Docs**: https://supabase.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Polymarket API**: https://docs.polymarket.com

## License

MIT License - feel free to use and modify as needed.
