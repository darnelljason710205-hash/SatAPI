'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { registerAPIOnChain } from '@/lib/opnet';

export default function PublishPage() {
    const router = useRouter();
    const { walletAddress, opnetConfig } = useWallet();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [priceSats, setPriceSats] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) {
            setStatus({ type: 'error', message: 'Connect your wallet first' });
            return;
        }
        if (!name || !description || !endpoint || !priceSats) {
            setStatus({ type: 'error', message: 'Fill in all fields' });
            return;
        }

        setSubmitting(true);
        setStatus(null);

        try {
            // metadataId = hash of name (simplified: use name length * 1000 + price as unique ID)
            const metadataId = name.length * 1000 + parseInt(priceSats);
            const txId = await registerAPIOnChain(opnetConfig, metadataId, parseInt(priceSats));
            setStatus({ type: 'success', message: `API published! TX: ${txId}` });
            setTimeout(() => router.push('/explore'), 2000);
        } catch (e: any) {
            setStatus({ type: 'error', message: e?.message || 'Failed to publish API' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="hero-section" style={{ paddingBottom: 32 }}>
                <h1>Publish API</h1>
                <p className="subtitle">
                    Register your API endpoint on the Bitcoin blockchain. Users will pay sats per call directly to your wallet.
                </p>
            </div>

            <div className="section">
                <form onSubmit={handleSubmit} className="form-card">
                    <div className="form-group">
                        <label className="form-label">API Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Bitcoin Price API"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what your API does, what data it returns..."
                            className="form-input"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Endpoint URL</label>
                        <input
                            type="url"
                            value={endpoint}
                            onChange={(e) => setEndpoint(e.target.value)}
                            placeholder="https://api.example.com/v1/data"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Price per Call (sats)</label>
                        <input
                            type="number"
                            value={priceSats}
                            onChange={(e) => setPriceSats(e.target.value)}
                            placeholder="100"
                            min="1"
                            className="form-input"
                        />
                        {priceSats && (
                            <p className="text-xs text-sat-text-muted mt-2">
                                = {(parseInt(priceSats) / 1e8).toFixed(8)} BTC per call
                            </p>
                        )}
                    </div>

                    {status && (
                        <div className={status.type === 'success' ? 'status-success' : 'status-error'} style={{ marginBottom: 20 }}>
                            {status.message}
                        </div>
                    )}

                    {/* Preview */}
                    <div className="bg-sat-bg border border-sat-border rounded-xl p-4 mb-6">
                        <div className="text-[10px] text-sat-text-muted uppercase tracking-wider font-semibold mb-3">Preview</div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="api-icon">⚡</div>
                            <div>
                                <div className="text-sm font-semibold">{name || 'API Name'}</div>
                                <div className="text-[10px] text-sat-text-muted">by {walletAddress ? `${walletAddress.slice(0, 8)}...` : 'your-wallet'}</div>
                            </div>
                        </div>
                        <p className="text-xs text-sat-text-secondary mb-3">{description || 'API description will appear here...'}</p>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-sat-orange font-mono font-bold">{priceSats || '0'} sats/call</span>
                            <span className="text-sat-text-muted font-mono">{endpoint ? new URL(endpoint).hostname : 'endpoint.com'}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !walletAddress}
                        className="btn-orange"
                    >
                        {!walletAddress
                            ? 'Connect Wallet to Publish'
                            : submitting
                            ? 'Publishing...'
                            : 'Publish API on Bitcoin'
                        }
                    </button>
                </form>
            </div>
        </>
    );
}
