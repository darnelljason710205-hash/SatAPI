# SatAPI — Pay-per-API Marketplace on Bitcoin L1

Decentralized API marketplace where developers publish APIs and users pay micro-BTC per request using OP_NET smart contracts on Bitcoin Layer 1.

## Architecture

```
satapi/
├── contracts/          # OP_NET smart contract (AssemblyScript → WASM)
│   ├── src/
│   │   ├── index.ts
│   │   └── ApiMarketplace.ts
│   ├── build/          # Compiled WASM
│   ├── asconfig.json
│   └── package.json
├── frontend/           # Next.js 14 + Tailwind CSS
│   └── src/
│       ├── app/        # Pages: /, /explore, /publish, /api-detail/[id]
│       ├── components/ # Navbar, Sidebar, WalletProvider, ApiCard
│       ├── services/   # wallet.ts, contract.ts
│       ├── lib/        # opnet.ts, mock-data.ts
│       └── types/      # TypeScript interfaces
├── backend/            # Node.js proxy for API calls
│   └── src/index.ts
├── scripts/            # Deployment scripts
└── README.md
```

## Smart Contract Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `registerAPI` | `metadataId`, `priceSats` | Register a new API endpoint |
| `payAndCall` | `apiId` | Pay and record an API call |
| `getAPI` | `apiId` | Get API details (owner, price, calls, active) |
| `getNextApiId` | — | Get next available API ID |
| `getTotalAPIs` | — | Get total number of registered APIs |
| `deactivateAPI` | `apiId` | Deactivate an API (owner only) |

## Setup

### Prerequisites
- Node.js 18+
- OP_WALLET browser extension

### Install Dependencies
```bash
# All at once
cd contracts && npm install && cd ../frontend && npm install && cd ../backend && npm install

# Or individually
cd contracts && npm install
cd frontend && npm install
cd backend && npm install
```

### Build Contract
```bash
cd contracts
npm run build
# Output: build/ApiMarketplace.wasm
```

### Deploy Contract
1. Build the contract (see above)
2. Use OP_NET deployer to upload `contracts/build/ApiMarketplace.wasm`
3. Connect your OP_WALLET
4. Deploy to testnet
5. Copy the contract address to `frontend/.env`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_your_contract_address_here
```

### Run Frontend
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### Run Backend Proxy
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

## Flow

1. **Connect Wallet** — Connect OP_WALLET browser extension
2. **Publish API** — Fill in name, description, endpoint URL, price in sats → registers on-chain
3. **Explore APIs** — Browse available API endpoints with prices and call counts
4. **Call API** — Click "Call API" → wallet signs `payAndCall` tx → backend proxy forwards request → response displayed

## Demo API

The project includes a demo using the CoinDesk Bitcoin Price API:
- **Endpoint:** `https://api.coindesk.com/v1/bpi/currentprice.json`
- **Price:** 100 sats per call

## Tech Stack

- **Smart Contracts:** OP_NET (AssemblyScript → WASM)
- **Frontend:** Next.js 14 + React 18 + Tailwind CSS + TypeScript
- **Backend:** Express.js proxy server
- **Wallet:** OP_WALLET browser extension
- **Network:** Bitcoin L1 (OP_NET Testnet)

## Environment Variables

```env
# Frontend (.env)
NEXT_PUBLIC_CONTRACT_ADDRESS=      # Deployed contract address
NEXT_PUBLIC_OPNET_RPC_URL=https://testnet.opnet.org
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Backend
BACKEND_PORT=3001
```
