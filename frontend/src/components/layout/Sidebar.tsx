'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { label: 'Home', href: '/', icon: '←' },
    { label: 'Explore APIs', href: '/explore' },
    { label: 'Publish API', href: '/publish' },
    { label: 'Pricing', href: '/explore', badge: 'sats' },
    { label: 'Documentation', href: '#' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <nav className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="ml-auto text-[10px] bg-sat-orange/20 text-sat-orange px-1.5 py-0.5 rounded font-mono">
                                    {item.badge}
                                </span>
                            )}
                            {item.icon === '←' && <span className="ml-auto text-sat-text-muted text-xs">{item.icon}</span>}
                        </Link>
                    );
                })}
                <div className="my-3 border-t border-sat-border" />
                <a
                    href="https://opnet.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sidebar-link text-sat-text-muted"
                >
                    OP_NET Docs <span className="ml-auto">↗</span>
                </a>
            </nav>
        </aside>
    );
}
