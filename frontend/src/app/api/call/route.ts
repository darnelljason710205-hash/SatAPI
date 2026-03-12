import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { apiId, txHash, endpoint } = await req.json();

        if (!endpoint || typeof endpoint !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid endpoint' }, { status: 400 });
        }
        if (!txHash) {
            return NextResponse.json({ error: 'Missing txHash — payment not verified' }, { status: 400 });
        }

        console.log(`[PROXY] Calling ${endpoint} for apiId=${apiId}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(endpoint, { 
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            clearTimeout(timeout);

            if (!response.ok) {
                return NextResponse.json({
                    error: `Upstream API returned ${response.status}`,
                }, { status: 502 });
            }

            const contentType = response.headers.get('content-type') || '';
            let data;
            
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            return NextResponse.json({
                success: true,
                apiId,
                txHash,
                timestamp: new Date().toISOString(),
                data,
            });

        } catch (fetchError: any) {
            clearTimeout(timeout);
            return NextResponse.json({
                error: 'Failed to call upstream API',
                details: fetchError.message,
            }, { status: 502 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
