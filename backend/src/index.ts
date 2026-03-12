import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'SatAPI Proxy' });
});

// ── Main proxy endpoint ──
// After the user pays on-chain via payAndCall(), the frontend sends:
//   { apiId, txHash, endpoint }
// The proxy validates and forwards the request to the real API endpoint.
app.post('/api/call', async (req, res) => {
    const { apiId, txHash, endpoint } = req.body;

    if (!endpoint || typeof endpoint !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid endpoint' });
    }
    if (!txHash) {
        return res.status(400).json({ error: 'Missing txHash — payment not verified' });
    }

    console.log(`[CALL] apiId=${apiId} tx=${txHash} → ${endpoint}`);

    try {
        // In production: verify txHash on OP_NET before forwarding
        // const verified = await verifyTransaction(txHash);
        // if (!verified) return res.status(402).json({ error: 'Payment not confirmed' });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Upstream API returned ${response.status}`,
            });
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            return res.json({
                success: true,
                apiId,
                txHash,
                timestamp: new Date().toISOString(),
                data,
            });
        } else {
            const text = await response.text();
            return res.json({
                success: true,
                apiId,
                txHash,
                timestamp: new Date().toISOString(),
                data: text,
            });
        }
    } catch (error: any) {
        console.error(`[ERROR] apiId=${apiId}:`, error.message);
        return res.status(502).json({
            error: 'Failed to call upstream API',
            details: error.message,
        });
    }
});

// ── Demo: direct test of CoinDesk API ──
app.get('/api/demo/btc-price', async (_req, res) => {
    try {
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const data = await response.json();
        res.json({ success: true, data });
    } catch {
        res.status(502).json({ error: 'Failed to fetch BTC price' });
    }
});

const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n  🚀 SatAPI Proxy running on http://localhost:${PORT}`);
    console.log(`  📡 POST /api/call — proxy API requests`);
    console.log(`  💰 GET  /api/demo/btc-price — demo endpoint\n`);
});
