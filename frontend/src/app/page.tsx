'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWallet } from '@/components/providers/WalletProvider';
import { MOCK_APIS } from '@/lib/mock-data';
import { getAllAPIs } from '@/lib/opnet';
import ApiCard from '@/components/cards/ApiCard';
import type { ApiItem } from '@/types';
import { formatSats } from '@/services/wallet';

export default function HomePage() {
    const { opnetConfig } = useWallet();
    const mockWithFlag = MOCK_APIS.map((a) => ({ ...a, isMock: true }));
    const [apis, setApis] = useState<ApiItem[]>(mockWithFlag);

    useEffect(() => {
        const load = async () => {
            if (opnetConfig.provider) {
                try {
                    const onChain = await getAllAPIs(opnetConfig);
                    if (onChain.length > 0) {
                        const mapped: ApiItem[] = onChain.map((a: any) => ({
                            id: a.id,
                            name: `API #${a.id}`,
                            description: `On-chain API #${a.id}`,
                            endpoint: '',
                            priceSats: a.priceSats,
                            owner: a.owner,
                            totalCalls: a.totalCalls,
                            active: a.active,
                        }));
                        setApis([...mapped, ...mockWithFlag]);
                    }
                } catch {}
            }
        };
        load();
    }, [opnetConfig.provider]);

    const totalCalls = apis.reduce((s, a) => s + a.totalCalls, 0);
    const avgPrice = apis.length > 0 ? Math.round(apis.reduce((s, a) => s + a.priceSats, 0) / apis.length) : 0;

    return (
        <>
            {/* Hero */}
            <div className="hero-section">
                <div className="inline-flex items-center gap-2 bg-sat-orange/10 border border-sat-orange/20 rounded-full px-3 py-1 text-xs font-semibold text-sat-orange mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-sat-orange animate-pulse" />
                    Bitcoin L1 &middot; OP_NET Testnet
                </div>
                <h1>Pay-per-API<br />on Bitcoin</h1>
                <p className="subtitle">
                    The decentralized API marketplace where developers publish APIs and users pay micro-BTC per request.
                    Every call is recorded on-chain, and payments go directly to the API owner.
                </p>
                <div className="hero-actions">
                    <Link href="/explore" className="btn-primary">
                        Explore APIs
                    </Link>
                    <Link href="/publish" className="btn-secondary">
                        Publish API
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="section">
                <div className="stats-row">
                    <div className="stat-item">
                        <div className="stat-value text-sat-blue">{apis.length}</div>
                        <div className="stat-label">Total APIs</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value text-sat-orange">{totalCalls.toLocaleString()}</div>
                        <div className="stat-label">Total Calls</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value text-sat-green">{apis.filter(a => a.active).length}</div>
                        <div className="stat-label">Active APIs</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{formatSats(avgPrice)}</div>
                        <div className="stat-label">Avg Price (sats)</div>
                    </div>
                </div>

                {/* Featured APIs */}
                <h2 className="section-title">Featured APIs</h2>
                <p className="section-desc">
                    Popular API endpoints available for micro-BTC payments. Each call is verified on the Bitcoin blockchain.
                </p>
                <div className="api-grid">
                    {apis.slice(0, 6).map((api) => (
                        <ApiCard key={api.id} api={api} />
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link href="/explore" className="btn-secondary">
                        View All APIs →
                    </Link>
                </div>
            </div>
        </>
    );
}
