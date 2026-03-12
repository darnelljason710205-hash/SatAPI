import { CONFIG } from './config';

async function deploy() {
    console.log('=== SatAPI Contract Deployment ===');
    console.log(`Network: ${CONFIG.NETWORK}`);
    console.log(`RPC: ${CONFIG.RPC_URL}`);
    console.log(`Contract: ${CONFIG.CONTRACT_NAME}`);
    console.log(`WASM: ${CONFIG.WASM_PATH}`);
    console.log('');
    console.log('Deployment steps:');
    console.log('1. Build contract:  cd contracts && npm run build');
    console.log('2. Open OP_NET deployer or use opnet-cli');
    console.log('3. Upload the WASM file: contracts/build/ApiMarketplace.wasm');
    console.log('4. Connect your OP_WALLET');
    console.log('5. Deploy to testnet');
    console.log('6. Copy the deployed contract address');
    console.log('7. Set NEXT_PUBLIC_CONTRACT_ADDRESS in frontend/.env');
    console.log('');
    console.log('After deployment, start the frontend:');
    console.log('  cd frontend && npm run dev');
    console.log('');
    console.log('And the backend proxy:');
    console.log('  cd backend && npm run dev');
}

deploy().catch(console.error);
