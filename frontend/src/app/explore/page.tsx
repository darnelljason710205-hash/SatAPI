'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/components/providers/WalletProvider';
import { MOCK_APIS, CATEGORIES } from '@/lib/mock-data';
import { getAllAPIs } from '@/lib/opnet';
import ApiCard from '@/components/cards/ApiCard';
import type { ApiItem } from '@/types';

export default function ExplorePage() {
    const { opnetConfig } = useWallet();
    const mockWithFlag = MOCK_APIS.map((a) => ({ ...a, isMock: true }));
    const [apis, setApis] = useState<ApiItem[]>(mockWithFlag);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            if (opnetConfig.provider) {
                setLoading(true);
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
                            category: 'On-chain',
                        }));
                        setApis([...mapped, ...mockWithFlag]);
                    }
                } catch {}
                setLoading(false);
            }
        };
        load();
    }, [opnetConfig.provider]);

    const filtered = apis.filter((api) => {
        const matchCat = category === 'All' || api.category === category;
        const matchSearch = !search ||
            api.name.toLowerCase().includes(search.toLowerCase()) ||
            api.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch && api.active;
    });

    return (
        <>
            <div className="hero-section" style={{ paddingBottom: 32 }}>
                <h1>Explore APIs</h1>
                <p className="subtitle">
                    Browse available API endpoints. Pay per call with micro-BTC transactions on Bitcoin L1.
                </p>

                {/* Search */}
                <div className="max-w-md mt-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search APIs..."
                        className="form-input"
                    />
                </div>
            </div>

            <div className="section">
                {/* Category Filters */}
                <div className="filter-tabs">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`filter-tab ${category === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="api-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="api-card">
                                <div className="skeleton h-10 w-10 rounded-lg mb-3" />
                                <div className="skeleton h-4 w-3/4 mb-2" />
                                <div className="skeleton h-3 w-full mb-1" />
                                <div className="skeleton h-3 w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="api-grid">
                        {filtered.map((api) => (
                            <ApiCard key={`${api.id}-${api.isMock}`} api={api} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-sat-text-muted text-lg mb-2">No APIs found</p>
                        <p className="text-sat-text-muted text-sm">Try a different search or category</p>
                    </div>
                )}
            </div>
        </>
    );
}
