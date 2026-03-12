'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { OpnetConfig } from '@/lib/opnet';

interface WalletContextType {
    walletAddress: string;
    balance: number;
    publicKey: string;
    connected: boolean;
    connecting: boolean;
    opnetConfig: OpnetConfig;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
    walletAddress: '',
    balance: 0,
    publicKey: '',
    connected: false,
    connecting: false,
    opnetConfig: { provider: null, network: null },
    connect: async () => {},
    disconnect: () => {},
});

export function useWallet() {
    return useContext(WalletContext);
}

export default function WalletProvider({ children }: { children: ReactNode }) {
    const [walletAddress, setWalletAddress] = useState('');
    const [balance, setBalance] = useState(0);
    const [publicKey, setPublicKey] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [provider, setProvider] = useState<any>(null);
    const [signer, setSigner] = useState<any>(null);
    const [network, setNetwork] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const { createProvider, createSigner, getBitcoinNetwork } = await import('@/services/wallet');
                const p = createProvider();
                const s = createSigner();
                const n = getBitcoinNetwork();
                setProvider(p);
                setSigner(s);
                setNetwork(n);
            } catch (e) {
                console.error('Failed to init wallet service:', e);
            }
        };
        init();
    }, []);

    const connect = useCallback(async () => {
        setConnecting(true);
        try {
            const { connectWallet, getBalance: getWalletBalance } = await import('@/services/wallet');
            const { address, publicKey: pk } = await connectWallet();
            setWalletAddress(address);
            setPublicKey(pk);

            const bal = await getWalletBalance();
            setBalance(bal);
        } catch (e: any) {
            console.error('Connect failed:', e);
            alert(e?.message || 'Failed to connect wallet');
        } finally {
            setConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setWalletAddress('');
        setBalance(0);
        setPublicKey('');
    }, []);

    const opnetConfig: OpnetConfig = {
        provider,
        network,
        publicKey: publicKey || undefined,
        signer,
        walletAddress: walletAddress || undefined,
    };

    return (
        <WalletContext.Provider value={{
            walletAddress, balance, publicKey,
            connected: !!walletAddress,
            connecting, opnetConfig, connect, disconnect,
        }}>
            {children}
        </WalletContext.Provider>
    );
}
