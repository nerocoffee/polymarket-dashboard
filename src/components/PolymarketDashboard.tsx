import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, TrendingUp, Activity, DollarSign, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { connectWallet, getBalance, isWalletConnected, onAccountsChanged } from "@/lib/blockchain";

type Market = {
	id: string;
	name: string;
	yesPrice: number;
	noPrice: number;
	sum: number;
	volume24h: number;
};

type LogEntry = {
	id: string;
	timestamp: Date;
	type: "INFO" | "ARB_OPPORTUNITY" | "TRADE_EXECUTED" | "ERROR" | "SETTLED";
	message: string;
};

type BotStats = {
	totalProfit: number;
	tradesExecuted: number;
	opportunitiesDetected: number;
	marketsScanned: number;
};

export function PolymarketDashboard() {
	const [botRunning, setBotRunning] = useState(false);
	const [markets, setMarkets] = useState<Market[]>([]);
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [stats, setStats] = useState<BotStats>({
		totalProfit: 0,
		tradesExecuted: 0,
		opportunitiesDetected: 0,
		marketsScanned: 0,
	});
	const [arbThreshold, setArbThreshold] = useState(0.98);
	const [walletAddress, setWalletAddress] = useState<string | null>(null);
	const [walletBalance, setWalletBalance] = useState<string>("0");
	const scrollRef = useRef<HTMLDivElement>(null);
	const eventSourceRef = useRef<EventSource | null>(null);

	// Add log entry
	const addLog = async (type: LogEntry["type"], message: string) => {
		const newLog: LogEntry = {
			id: Math.random().toString(36),
			timestamp: new Date(),
			type,
			message,
		};
		setLogs((prev) => [newLog, ...prev].slice(0, 100));

		// Save to Supabase
		try {
			await supabase.from('bot_logs').insert({
				type,
				message,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error('Error saving log to Supabase:', error);
		}
	};

	// Check wallet connection on mount
	useEffect(() => {
		const checkWallet = async () => {
			const connected = await isWalletConnected();
			if (connected && typeof window !== 'undefined' && window.ethereum) {
				const accounts = await window.ethereum.request({ method: 'eth_accounts' });
				if (accounts.length > 0) {
					setWalletAddress(accounts[0]);
					const balance = await getBalance(accounts[0]);
					setWalletBalance(balance);
				}
			}
		};
		checkWallet();

		// Listen for account changes
		onAccountsChanged(async (accounts: string[]) => {
			if (accounts.length > 0) {
				setWalletAddress(accounts[0]);
				const balance = await getBalance(accounts[0]);
				setWalletBalance(balance);
			} else {
				setWalletAddress(null);
				setWalletBalance("0");
			}
		});
	}, []);

	// Handle wallet connection
	const handleConnectWallet = async () => {
		const address = await connectWallet();
		if (address) {
			setWalletAddress(address);
			const balance = await getBalance(address);
			setWalletBalance(balance);
			addLog("INFO", `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
		}
	};

	// Load stats from Supabase on mount
	useEffect(() => {
		const loadStats = async () => {
			try {
				const { data: trades } = await supabase
					.from('trades')
					.select('profit');

				if (trades) {
					const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
					setStats(prev => ({
						...prev,
						totalProfit,
						tradesExecuted: trades.length,
					}));
				}
			} catch (error) {
				console.error('Error loading stats from Supabase:', error);
			}
		};
		loadStats();
	}, []);

	// Simulate market data updates
	useEffect(() => {
		if (!botRunning) return;

		const interval = setInterval(() => {
			// Simulate scanning top markets
			const cryptoMarkets = ["BTC", "ETH", "SOL", "MATIC", "AVAX"];
			const newMarkets: Market[] = cryptoMarkets.map((crypto) => {
				const yesPrice = 0.45 + Math.random() * 0.1;
				const noPrice = 0.45 + Math.random() * 0.1;
				const sum = yesPrice + noPrice;

				return {
					id: `${crypto}-15min`,
					name: `${crypto} price in 15 minutes`,
					yesPrice,
					noPrice,
					sum,
					volume24h: Math.floor(Math.random() * 50000) + 10000,
				};
			});

			setMarkets(newMarkets);
			setStats((prev) => ({ ...prev, marketsScanned: prev.marketsScanned + 5 }));

			// Check for arbitrage opportunities
			const opportunities = newMarkets.filter((m) => m.sum < arbThreshold);

			if (opportunities.length > 0) {
				opportunities.forEach((opp) => {
					addLog("ARB_OPPORTUNITY", `Found arbitrage on ${opp.name}: YES=${opp.yesPrice.toFixed(4)}, NO=${opp.noPrice.toFixed(4)}, SUM=${opp.sum.toFixed(4)}`);
					setStats((prev) => ({ ...prev, opportunitiesDetected: prev.opportunitiesDetected + 1 }));

					// Simulate trade execution
					const profit = (1 - opp.sum) * 100;
					setTimeout(async () => {
						addLog("TRADE_EXECUTED", `Executed arbitrage on ${opp.name}. Profit: $${profit.toFixed(2)}`);
						setStats((prev) => ({
							...prev,
							tradesExecuted: prev.tradesExecuted + 1,
							totalProfit: prev.totalProfit + profit,
						}));

						// Save trade to Supabase
						try {
							await supabase.from('trades').insert({
								market_id: opp.id,
								type: 'TRADE_EXECUTED',
								profit,
								yes_price: opp.yesPrice,
								no_price: opp.noPrice,
								sum: opp.sum,
							});
						} catch (error) {
							console.error('Error saving trade to Supabase:', error);
						}
					}, 500);
				});
			} else {
				addLog("INFO", `Scanned ${cryptoMarkets.length} markets. No arbitrage opportunities found.`);
			}

			// Occasionally simulate settlement claims
			if (Math.random() < 0.1) {
				const settledProfit = Math.random() * 20 + 5;
				addLog("SETTLED", `Claimed winnings from resolved market: $${settledProfit.toFixed(2)}`);
				setStats((prev) => ({ ...prev, totalProfit: prev.totalProfit + settledProfit }));
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [botRunning, arbThreshold]);

	const handleStartStop = () => {
		if (!botRunning) {
			addLog("INFO", "Bot started. Monitoring Polymarket for arbitrage opportunities...");
			setBotRunning(true);
		} else {
			addLog("INFO", "Bot stopped.");
			setBotRunning(false);
		}
	};

	const getLogColor = (type: LogEntry["type"]) => {
		switch (type) {
			case "INFO":
				return "text-blue-400";
			case "ARB_OPPORTUNITY":
				return "text-yellow-400";
			case "TRADE_EXECUTED":
				return "text-green-400";
			case "SETTLED":
				return "text-purple-400";
			case "ERROR":
				return "text-red-400";
			default:
				return "text-gray-400";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white">Polymarket Arbitrage Bot</h1>
						<p className="text-slate-400 mt-1">Real-time monitoring and automated trading on Polygon</p>
					</div>
					<div className="flex items-center gap-4">
						{walletAddress ? (
							<div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg">
								<Wallet className="size-4 text-green-400" />
								<div className="flex flex-col">
									<span className="text-xs text-slate-400">Connected</span>
									<span className="text-sm text-white font-mono">
										{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
									</span>
								</div>
								<div className="flex flex-col border-l border-slate-700 pl-3">
									<span className="text-xs text-slate-400">Balance</span>
									<span className="text-sm text-green-400 font-mono">
										{parseFloat(walletBalance).toFixed(4)} MATIC
									</span>
								</div>
							</div>
						) : (
							<Button
								variant="outline"
								onClick={handleConnectWallet}
								className="border-slate-700 hover:bg-slate-800"
							>
								<Wallet className="mr-2 size-4" />
								Connect Wallet
							</Button>
						)}
						<Badge variant={botRunning ? "default" : "outline"} className={cn(
							"text-sm px-4 py-2",
							botRunning && "bg-green-600 hover:bg-green-600 animate-pulse"
						)}>
							<Activity className="size-4 mr-2" />
							{botRunning ? "RUNNING" : "STOPPED"}
						</Badge>
						<Button
							size="lg"
							variant={botRunning ? "destructive" : "default"}
							onClick={handleStartStop}
						>
							{botRunning ? <Square className="mr-2" /> : <Play className="mr-2" />}
							{botRunning ? "Stop Bot" : "Start Bot"}
						</Button>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card className="bg-slate-900/50 border-slate-800">
						<CardHeader className="pb-3">
							<CardDescription className="text-slate-400">Total Profit</CardDescription>
							<CardTitle className="text-2xl text-green-400 flex items-center">
								<DollarSign className="size-5 mr-1" />
								{stats.totalProfit.toFixed(2)}
							</CardTitle>
						</CardHeader>
					</Card>
					<Card className="bg-slate-900/50 border-slate-800">
						<CardHeader className="pb-3">
							<CardDescription className="text-slate-400">Trades Executed</CardDescription>
							<CardTitle className="text-2xl text-white">{stats.tradesExecuted}</CardTitle>
						</CardHeader>
					</Card>
					<Card className="bg-slate-900/50 border-slate-800">
						<CardHeader className="pb-3">
							<CardDescription className="text-slate-400">Opportunities</CardDescription>
							<CardTitle className="text-2xl text-yellow-400">{stats.opportunitiesDetected}</CardTitle>
						</CardHeader>
					</Card>
					<Card className="bg-slate-900/50 border-slate-800">
						<CardHeader className="pb-3">
							<CardDescription className="text-slate-400">Markets Scanned</CardDescription>
							<CardTitle className="text-2xl text-blue-400">{stats.marketsScanned}</CardTitle>
						</CardHeader>
					</Card>
				</div>

				{/* Main Content */}
				<Tabs defaultValue="markets" className="space-y-4">
					<TabsList className="bg-slate-900/50 border border-slate-800">
						<TabsTrigger value="markets">Markets</TabsTrigger>
						<TabsTrigger value="logs">Activity Log</TabsTrigger>
						<TabsTrigger value="config">Configuration</TabsTrigger>
					</TabsList>

					<TabsContent value="markets" className="space-y-4">
						<Card className="bg-slate-900/50 border-slate-800">
							<CardHeader>
								<CardTitle className="text-white">Top Markets Being Monitored</CardTitle>
								<CardDescription className="text-slate-400">
									Real-time price data for 15-minute crypto prediction markets
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="rounded-md border border-slate-800">
									<Table>
										<TableHeader>
											<TableRow className="border-slate-800 hover:bg-slate-800/50">
												<TableHead className="text-slate-300">Market</TableHead>
												<TableHead className="text-slate-300 text-right">YES Price</TableHead>
												<TableHead className="text-slate-300 text-right">NO Price</TableHead>
												<TableHead className="text-slate-300 text-right">Sum</TableHead>
												<TableHead className="text-slate-300 text-right">24h Volume</TableHead>
												<TableHead className="text-slate-300 text-right">Status</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{markets.length === 0 ? (
												<TableRow className="border-slate-800">
													<TableCell colSpan={6} className="text-center text-slate-500 h-32">
														{botRunning ? "Scanning markets..." : "Start the bot to monitor markets"}
													</TableCell>
												</TableRow>
											) : (
												markets.map((market) => (
													<TableRow
														key={market.id}
														className={cn(
															"border-slate-800 transition-colors",
															market.sum < arbThreshold && "bg-yellow-900/20 hover:bg-yellow-900/30"
														)}
													>
														<TableCell className="font-medium text-white">{market.name}</TableCell>
														<TableCell className="text-right text-green-400">{market.yesPrice.toFixed(4)}</TableCell>
														<TableCell className="text-right text-red-400">{market.noPrice.toFixed(4)}</TableCell>
														<TableCell className={cn(
															"text-right font-bold",
															market.sum < arbThreshold ? "text-yellow-400" : "text-slate-400"
														)}>
															{market.sum.toFixed(4)}
														</TableCell>
														<TableCell className="text-right text-slate-400">
															${market.volume24h.toLocaleString()}
														</TableCell>
														<TableCell className="text-right">
															{market.sum < arbThreshold ? (
																<Badge variant="default" className="bg-yellow-600 hover:bg-yellow-600">
																	<TrendingUp className="size-3 mr-1" />
																	ARB
																</Badge>
															) : (
																<Badge variant="outline" className="text-slate-400">Normal</Badge>
															)}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="logs" className="space-y-4">
						<Card className="bg-slate-900/50 border-slate-800">
							<CardHeader>
								<CardTitle className="text-white">Live Activity Log</CardTitle>
								<CardDescription className="text-slate-400">
									Real-time events from the arbitrage bot
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[500px] w-full rounded-md border border-slate-800 bg-slate-950 p-4">
									<div className="font-mono text-sm space-y-2" ref={scrollRef}>
										{logs.length === 0 ? (
											<div className="text-slate-500 text-center py-8">No activity yet. Start the bot to see logs.</div>
										) : (
											logs.map((log) => (
												<div key={log.id} className="flex gap-3 items-start">
													<span className="text-slate-500 shrink-0 text-xs">
														{log.timestamp.toLocaleTimeString()}
													</span>
													<span className={cn("font-bold shrink-0", getLogColor(log.type))}>
														[{log.type}]
													</span>
													<span className="text-slate-300">{log.message}</span>
												</div>
											))
										)}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="config" className="space-y-4">
						<Card className="bg-slate-900/50 border-slate-800">
							<CardHeader>
								<CardTitle className="text-white flex items-center">
									<Settings className="mr-2" />
									Configuration
								</CardTitle>
								<CardDescription className="text-slate-400">
									Adjust bot parameters and thresholds
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-3">
									<label className="text-sm font-medium text-slate-300">
										Arbitrage Threshold
									</label>
									<div className="flex items-center gap-4">
										<input
											type="range"
											min="0.90"
											max="0.99"
											step="0.01"
											value={arbThreshold}
											onChange={(e) => setArbThreshold(parseFloat(e.target.value))}
											className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
										/>
										<span className="text-white font-mono text-sm w-16 text-right">
											{arbThreshold.toFixed(2)}
										</span>
									</div>
									<p className="text-xs text-slate-500">
										Execute trades when YES + NO price sum falls below this threshold
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
									<div className="space-y-1">
										<p className="text-xs text-slate-500">Polling Interval</p>
										<p className="text-sm text-white">2 seconds</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-slate-500">Market Type</p>
										<p className="text-sm text-white">15-minute predictions</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-slate-500">Monitored Assets</p>
										<p className="text-sm text-white">BTC, ETH, SOL, MATIC, AVAX</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-slate-500">Network</p>
										<p className="text-sm text-white">Polygon Testnet</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
