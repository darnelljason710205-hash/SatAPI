import { JSONRpcProvider } from 'opnet';
import { networks } from '@btc-vision/bitcoin';

// window.opnet and window.unisat types provided by opnet library

class OPNetSigner {
    private _signer: any = null;

    get signer(): any {
        if (!this._signer && typeof window !== 'undefined' && window.opnet) {
            this._signer = window.opnet;
        }
        return this._signer;
    }

    async signAndBroadcast(tx: any): Promise<any> {
        if (!this.signer) throw new Error('OP_WALLET not available');
        return this.signer.signAndBroadcastTransaction(tx);
    }
}

const opnetSigner = new OPNetSigner();

export function createProvider(): any {
    const url = process.env.NEXT_PUBLIC_OPNET_RPC_URL || 'https://testnet.opnet.org';
    return new (JSONRpcProvider as any)(url, networks.testnet);
}

export function createSigner(): any {
    return opnetSigner;
}

export function getBitcoinNetwork(): any {
    return networks.testnet;
}

export async function getPublicKey(): Promise<string> {
    if (typeof window === 'undefined') return '';
    const wallet = window.opnet || window.unisat;
    if (!wallet) return '';
    try {
        const pk = await wallet.getPublicKey();
        return pk || '';
    } catch {
        return '';
    }
}

export async function connectWallet(): Promise<{ address: string; publicKey: string }> {
    if (typeof window === 'undefined') throw new Error('No window');
    const wallet = window.opnet || window.unisat;
    if (!wallet) throw new Error('OP_WALLET not installed');

    const accounts = await wallet.requestAccounts();
    if (!accounts || accounts.length === 0) throw new Error('No accounts');

    const address = accounts[0];
    const publicKey = await getPublicKey();
    return { address, publicKey };
}

export async function getBalance(): Promise<number> {
    if (typeof window === 'undefined') return 0;
    const wallet = window.opnet || window.unisat;
    if (!wallet) return 0;
    try {
        const bal = await wallet.getBalance();
        return bal?.total || bal?.confirmed || 0;
    } catch {
        return 0;
    }
}

export function formatBTC(sats: number): string {
    return (sats / 1e8).toFixed(8);
}

export function formatBTCShort(sats: number): string {
    return (sats / 1e8).toFixed(6);
}

export function formatSats(sats: number): string {
    return sats.toLocaleString();
}

export function formatAddress(addr: string): string {
    if (!addr || addr.length < 12) return addr || '—';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
