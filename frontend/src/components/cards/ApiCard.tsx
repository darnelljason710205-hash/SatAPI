'use client';

import Link from 'next/link';
import type { ApiItem } from '@/types';
import { formatSats } from '@/services/wallet';

interface Props {
    api: ApiItem;
}

export default function ApiCard({ api }: Props) {
    return (
        <Link href={`/api-detail/${api.id}`}>
            <div className="api-card group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="api-icon">
                            {api.category === 'Finance' && '💰'}
                            {api.category === 'Data' && '📊'}
                            {api.category === 'Utilities' && '🔧'}
                            {api.category === 'Entertainment' && '🎮'}
                            {api.category === 'Media' && '🖼️'}
                            {api.category === 'Blockchain' && '⛓️'}
                            {!api.category && '⚡'}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-sat-text group-hover:text-sat-blue transition-colors">
                                {api.name}
                            </h3>
                            {api.category && (
                                <span className="text-[10px] text-sat-text-muted font-medium uppercase tracking-wider">
                                    {api.category}
                                </span>
                            )}
                        </div>
                    </div>
                    {api.isMock && (
                        <span className="text-[9px] bg-sat-orange/15 text-sat-orange px-1.5 py-0.5 rounded font-bold uppercase">
                            Demo
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-xs text-sat-text-secondary leading-relaxed mb-4 line-clamp-2">
                    {api.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-sat-border">
                    <div>
                        <div className="text-[10px] text-sat-text-muted uppercase tracking-wider mb-0.5">Price</div>
                        <div className="text-sm font-bold text-sat-orange font-mono">
                            {formatSats(api.priceSats)} <span className="text-[10px] font-normal text-sat-text-muted">sats</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-sat-text-muted uppercase tracking-wider mb-0.5">Calls</div>
                        <div className="text-sm font-semibold text-sat-text font-mono">
                            {api.totalCalls.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
