import { createFileRoute } from "@tanstack/react-router";
import { PolymarketDashboard } from "@/components/PolymarketDashboard";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return <PolymarketDashboard />;
}
