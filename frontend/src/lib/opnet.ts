import { getApiMarketplaceContract, CONTRACT_ADDRESS, DEFAULT_FEE_RATE, MAX_SAT_PER_TX } from '@/services/contract';

export interface OpnetConfig {
    provider: any;
    network: any;
    publicKey?: string;
    signer?: any;
    walletAddress?: string;
}

function getContract(config: OpnetConfig) {
    return getApiMarketplaceContract(config.provider, config.network, config.publicKey);
}

async function sendTx(config: OpnetConfig, simulation: any) {
    if (!config.signer) throw new Error('Wallet signer not available');
    return await simulation.sendTransaction({
        signer: config.signer,
        refundTo: config.walletAddress,
        maximumAllowedSatToSpend: MAX_SAT_PER_TX,
        feeRate: DEFAULT_FEE_RATE,
        network: config.network,
    } as any);
}

// ── Read ──

export async function getNextApiId(config: OpnetConfig): Promise<number> {
    if (!CONTRACT_ADDRESS || !config.provider) return 0;
    try {
        const contract = getContract(config);
        const result = await contract.getNextApiId();
        const props = result?.properties as any;
        return Number(props?.nextApiId?.toString() || '0');
    } catch (e) {
        console.error('getNextApiId error:', e);
        return 0;
    }
}

export async function getAPIOnChain(config: OpnetConfig, apiId: number) {
    if (!CONTRACT_ADDRESS || !config.provider) return null;
    try {
        const contract = getContract(config);
        const result = await contract.getAPI(BigInt(apiId));
        const props = result?.properties as any;
        return {
            owner: props?.owner?.toString() || '',
            metadataId: Number(props?.metadataId?.toString() || '0'),
            priceSats: Number(props?.priceSats?.toString() || '0'),
            active: props?.active === true || props?.active?.toString() === 'true',
            totalCalls: Number(props?.totalCalls?.toString() || '0'),
        };
    } catch (e) {
        console.error(`getAPI(${apiId}) error:`, e);
        return null;
    }
}

export async function getAllAPIs(config: OpnetConfig) {
    const apis: any[] = [];
    const total = await getNextApiId(config);
    for (let i = 0; i < total; i++) {
        const data = await getAPIOnChain(config, i);
        if (data) apis.push({ id: i, ...data });
    }
    return apis;
}

// ── Write ──

export async function registerAPIOnChain(
    config: OpnetConfig,
    metadataId: number,
    priceSats: number,
): Promise<string> {
    const contract = getContract(config);
    const sim = await contract.registerAPI(BigInt(metadataId), BigInt(priceSats));
    if ('revert' in sim && (sim as any).revert) throw new Error((sim as any).revert);
    if ((sim as any).error) throw new Error((sim as any).error);
    const tx = await sendTx(config, sim);
    return tx?.transactionId || tx?.toString() || 'sent';
}

export async function payAndCallOnChain(config: OpnetConfig, apiId: number): Promise<string> {
    const contract = getContract(config);
    const sim = await contract.payAndCall(BigInt(apiId));
    if ('revert' in sim && (sim as any).revert) throw new Error((sim as any).revert);
    if ((sim as any).error) throw new Error((sim as any).error);
    const tx = await sendTx(config, sim);
    return tx?.transactionId || tx?.toString() || 'sent';
}

export async function deactivateAPIOnChain(config: OpnetConfig, apiId: number): Promise<string> {
    const contract = getContract(config);
    const sim = await contract.deactivateAPI(BigInt(apiId));
    if ('revert' in sim && (sim as any).revert) throw new Error((sim as any).revert);
    if ((sim as any).error) throw new Error((sim as any).error);
    const tx = await sendTx(config, sim);
    return tx?.transactionId || tx?.toString() || 'sent';
}

// ── Backend proxy call ──

export async function callAPIProxy(apiId: number, txHash: string, endpoint: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const res = await fetch(`${backendUrl}/api/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId, txHash, endpoint }),
    });
    return res.json();
}
