'use client';

import { useWallet } from '@/components/providers/WalletProvider';
import { formatAddress, formatBTCShort } from '@/services/wallet';

export default function WalletConnectButton() {
    const { walletAddress, balance, connected, connecting, connect, disconnect } = useWallet();

    if (connected) {
        return (
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-sat-card border border-sat-border rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-sat-orange font-mono font-medium">{formatBTCShort(balance)} BTC</span>
                </div>
                <button
                    onClick={disconnect}
                    className="flex items-center gap-2 bg-sat-card hover:bg-sat-card-hover border border-sat-border rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                >
                    <span className="w-2 h-2 rounded-full bg-sat-green" />
                    <span className="font-mono text-xs">{formatAddress(walletAddress)}</span>
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            disabled={connecting}
            className="bg-sat-blue hover:bg-sat-blue-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
}
