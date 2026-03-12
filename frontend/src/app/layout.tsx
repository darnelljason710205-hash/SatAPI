import type { Metadata } from 'next';
import './globals.css';
import WalletProvider from '@/components/providers/WalletProvider';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
    title: 'SatAPI — Pay-per-API on Bitcoin',
    description: 'Decentralized API marketplace on Bitcoin L1 using OP_NET. Pay micro-BTC per API call.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-sat-bg text-sat-text antialiased">
                <WalletProvider>
                    <Navbar />
                    <div className="flex">
                        <Sidebar />
                        <main className="main-content">
                            {children}
                        </main>
                    </div>
                </WalletProvider>
            </body>
        </html>
    );
}
