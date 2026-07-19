export type StockSearchItem = { symbol: string; name: string; category: string; tags: string[] };

const groups: Array<{ category: string; tags: string[]; stocks: Array<[string, string]> }> = [
  { category: "AI / Mega Cap", tags: ["AI", "Mega Cap", "Cloud"], stocks: [["NVDA", "NVIDIA Corporation"], ["MSFT", "Microsoft Corporation"], ["GOOGL", "Alphabet Inc."], ["AMZN", "Amazon.com, Inc."], ["META", "Meta Platforms, Inc."], ["AVGO", "Broadcom Inc."]] },
  { category: "Semiconductor", tags: ["Chip", "GPU", "Foundry"], stocks: [["AMD", "Advanced Micro Devices"], ["TSM", "Taiwan Semiconductor"], ["ASML", "ASML Holding"], ["MU", "Micron Technology"], ["QCOM", "Qualcomm"]] },
  { category: "Cloud / Cybersecurity", tags: ["Cloud", "Cybersecurity"], stocks: [["CRWD", "CrowdStrike Holdings"], ["PANW", "Palo Alto Networks"], ["NET", "Cloudflare"], ["DDOG", "Datadog"], ["SNOW", "Snowflake"]] },
  { category: "Fintech / Platform", tags: ["Fintech", "Payments"], stocks: [["V", "Visa"], ["MA", "Mastercard"], ["HOOD", "Robinhood Markets"], ["SOFI", "SoFi Technologies"]] },
  { category: "Space / Defense / Infra", tags: ["Space", "Defense", "Energy"], stocks: [["RKLB", "Rocket Lab USA"], ["LMT", "Lockheed Martin"], ["GEV", "GE Vernova"], ["CEG", "Constellation Energy"], ["ASTS", "AST SpaceMobile"]] },
  { category: "Healthcare / Consumer / Quality", tags: ["Healthcare", "Consumer", "Quality"], stocks: [["LLY", "Eli Lilly"], ["UNH", "UnitedHealth Group"], ["COST", "Costco Wholesale"], ["WMT", "Walmart"], ["MCD", "McDonald's"], ["BRK.B", "Berkshire Hathaway"]] },
  { category: "ETF", tags: ["ETF", "Index", "Dividend", "Bond"], stocks: [["VOO", "Vanguard S&P 500 ETF"], ["VTI", "Vanguard Total Stock Market ETF"], ["QQQ", "Invesco QQQ Trust"], ["SCHD", "Schwab US Dividend Equity ETF"], ["BND", "Vanguard Total Bond Market ETF"]] },
  { category: "Alternative Assets", tags: ["Gold", "Crypto", "Digital Asset"], stocks: [["GLD", "SPDR Gold Shares"], ["BTC", "Bitcoin"], ["ETH", "Ethereum"], ["LINK", "Chainlink"]] },
  { category: "Future Growth Picks", tags: ["Growth", "AI", "Infrastructure"], stocks: [["ARM", "Arm Holdings"], ["MRVL", "Marvell Technology"], ["ANET", "Arista Networks"], ["VRT", "Vertiv Holdings"], ["APP", "AppLovin"], ["RDDT", "Reddit"], ["MELI", "MercadoLibre"], ["ISRG", "Intuitive Surgical"]] },
];

export const stockSearchCatalog: StockSearchItem[] = groups.flatMap((group) =>
  group.stocks.map(([symbol, name]) => ({ symbol, name, category: group.category, tags: group.tags })),
);
