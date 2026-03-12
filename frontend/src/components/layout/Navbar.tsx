'use client';

import Link from 'next/link';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

export default function Navbar() {
    return (
        <header className="navbar">
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sat-orange flex items-center justify-center text-white font-black text-xs">
                        S
                    </div>
                    <span className="text-lg font-bold text-sat-text tracking-tight">SatAPI</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    <Link href="/explore" className="nav-link">Explore</Link>
                    <Link href="/publish" className="nav-link">Publish</Link>
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-sat-card border border-sat-border rounded-lg px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-sat-green animate-pulse" />
                    <span className="text-xs text-sat-text-muted font-medium">Testnet</span>
                </div>
                <WalletConnectButton />
            </div>
        </header>
    );
}
