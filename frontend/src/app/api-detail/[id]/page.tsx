'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/components/providers/WalletProvider';
import { MOCK_APIS } from '@/lib/mock-data';
import { getAPIOnChain, payAndCallOnChain, callAPIProxy } from '@/lib/opnet';
import { formatSats, formatAddress } from '@/services/wallet';
import type { ApiItem } from '@/types';

export default function ApiDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const { walletAddress, opnetConfig } = useWallet();

    const [api, setApi] = useState<ApiItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [calling, setCalling] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            // Try on-chain
            if (opnetConfig.provider) {
                try {
                    const data = await getAPIOnChain(opnetConfig, id);
                    if (data) {
                        setApi({
                            id,
                            name: `API #${id}`,
                            description: `On-chain API endpoint #${id}`,
                            endpoint: '',
                            priceSats: data.priceSats,
                            owner: data.owner,
                            totalCalls: data.totalCalls,
                            active: data.active,
                            isMock: false,
                        });
                        setLoading(false);
                        return;
                    }
                } catch {}
            }
            // Fallback to mock
            const mock = MOCK_APIS.find((a) => a.id === id);
            setApi(mock ? { ...mock, isMock: true } : null);
            setLoading(false);
        };
        load();
    }, [id, opnetConfig.provider]);

    const handleCall = async () => {
        if (!api) return;

        // For mock APIs, demo the proxy call without on-chain payment
        if (api.isMock) {
            setCalling(true);
            setStatus({ type: 'info', message: 'Demo mode — calling API without on-chain payment...' });
            setResponse(null);
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
                const res = await fetch(`${backendUrl}/api/call`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        apiId: api.id,
                        txHash: 'demo_' + Date.now(),
                        endpoint: api.endpoint,
                    }),
                });
                const data = await res.json();
                setResponse(data);
                setStatus({ type: 'success', message: `API called successfully (demo mode)` });
            } catch (e: any) {
                // Fallback: call endpoint directly
                try {
                    const directRes = await fetch(api.endpoint);
                    const directData = await directRes.json();
                    setResponse({ success: true, data: directData, timestamp: new Date().toISOString() });
                    setStatus({ type: 'success', message: 'API called directly (backend not running)' });
                } catch {
                    setStatus({ type: 'error', message: e?.message || 'Failed to call API' });
                }
            } finally {
                setCalling(false);
            }
            return;
        }

        // Real on-chain flow
        if (!walletAddress) {
            setStatus({ type: 'error', message: 'Connect your wallet first' });
            return;
        }

        setCalling(true);
        setStatus({ type: 'info', message: 'Sending payment on-chain...' });
        setResponse(null);

        try {
            const txHash = await payAndCallOnChain(opnetConfig, api.id);
            setStatus({ type: 'info', message: `Payment sent (${txHash}). Calling API...` });

            if (api.endpoint) {
                const result = await callAPIProxy(api.id, txHash, api.endpoint);
                setResponse(result);
                setStatus({ type: 'success', message: `API called! TX: ${txHash}` });
            } else {
                setStatus({ type: 'success', message: `Payment recorded. TX: ${txHash}` });
            }
        } catch (e: any) {
            setStatus({ type: 'error', message: e?.message || 'Call failed' });
        } finally {
            setCalling(false);
        }
    };

    if (loading) {
        return (
            <div className="detail-grid">
                <div>
                    <div className="detail-info">
                        <div className="skeleton h-8 w-48 mb-4" />
                        <div className="skeleton h-4 w-full mb-2" />
                        <div className="skeleton h-4 w-3/4" />
                    </div>
                </div>
                <div>
                    <div className="detail-price-card">
                        <div className="skeleton h-10 w-32 mb-3" />
                        <div className="skeleton h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!api) {
        return (
            <div className="section text-center py-20">
                <p className="text-sat-text-muted text-lg mb-4">API not found</p>
                <Link href="/explore" className="btn-secondary">Back to Explore</Link>
            </div>
        );
    }

    const isOwner = walletAddress && api.owner && (
        api.owner === walletAddress ||
        api.owner.toLowerCase().includes(walletAddress.slice(-4).toLowerCase())
    );
    const btcPrice = 97500;
    const costUsd = (api.priceSats / 1e8) * btcPrice;

    return (
        <div className="detail-grid">
            {/* Left: Info */}
            <div>
                <div className="detail-info">
                    {api.category && (
                        <span className="text-[10px] bg-sat-blue/10 text-sat-blue px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {api.category}
                        </span>
                    )}
                    {api.isMock && (
                        <span className="ml-2 text-[10px] bg-sat-orange/15 text-sat-orange px-2 py-0.5 rounded font-bold uppercase">
                            Demo
                        </span>
                    )}

                    <h1 className="text-2xl font-bold mt-3 mb-2">{api.name}</h1>
                    <p className="text-sm text-sat-text-secondary leading-relaxed mb-4">{api.description}</p>

                    <div className="text-xs text-sat-text-muted">
                        Owned by <span className="text-sat-blue font-mono">{formatAddress(api.owner)}</span>
                    </div>
                </div>

                {/* Endpoint */}
                {api.endpoint && (
                    <div className="detail-info mt-4">
                        <div className="text-xs text-sat-text-muted uppercase tracking-wider font-semibold mb-2">Endpoint</div>
                        <code className="text-xs text-sat-green font-mono bg-sat-bg px-3 py-2 rounded-lg block break-all">
                            GET {api.endpoint}
                        </code>
                    </div>
                )}

                {/* Response */}
                {response && (
                    <div className="response-viewer mt-4">
                        <div className="response-header">
                            <span>Response</span>
                            <span className="text-sat-green">200 OK</span>
                        </div>
                        <div className="response-body">
                            {JSON.stringify(response.data || response, null, 2)}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Price & Actions */}
            <div className="detail-sidebar">
                <div className="detail-price-card">
                    <div className="text-xs text-sat-text-muted uppercase tracking-wider font-semibold mb-2">Price per call</div>
                    <div className="text-3xl font-bold text-sat-orange font-mono mb-1">
                        {formatSats(api.priceSats)} <span className="text-base font-normal text-sat-text-muted">sats</span>
                    </div>
                    <div className="text-xs text-sat-text-muted mb-6">
                        ≈ ${costUsd.toFixed(4)} USD
                    </div>

                    {status && (
                        <div className={`mb-4 ${status.type === 'success' ? 'status-success' : status.type === 'error' ? 'status-error' : 'status-info'}`}>
                            {status.message}
                        </div>
                    )}

                    {api.isMock ? (
                        <button
                            onClick={handleCall}
                            disabled={calling}
                            className="btn-orange"
                        >
                            {calling ? 'Calling...' : `Call API (Demo)`}
                        </button>
                    ) : isOwner ? (
                        <div className="status-info">You own this API</div>
                    ) : (
                        <button
                            onClick={handleCall}
                            disabled={calling || !walletAddress}
                            className="btn-orange"
                        >
                            {!walletAddress
                                ? 'Connect Wallet'
                                : calling
                                ? 'Processing...'
                                : `Call API — ${formatSats(api.priceSats)} sats`
                            }
                        </button>
                    )}
                </div>

                {/* Details */}
                <div className="detail-meta">
                    <div className="text-xs text-sat-text-muted uppercase tracking-wider font-semibold mb-2">Details</div>
                    <div className="detail-meta-row">
                        <span className="label">API ID</span>
                        <span className="value">#{api.id}</span>
                    </div>
                    <div className="detail-meta-row">
                        <span className="label">Total Calls</span>
                        <span className="value">{api.totalCalls.toLocaleString()}</span>
                    </div>
                    <div className="detail-meta-row">
                        <span className="label">Status</span>
                        <span className={`value ${api.active ? 'text-sat-green' : 'text-sat-red'}`}>
                            {api.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="detail-meta-row">
                        <span className="label">Network</span>
                        <span className="value text-sat-orange">Bitcoin L1 (OP_NET)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
