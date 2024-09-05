import { serve } from "bun";
import https from "https";

interface BatchingServerResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    text(): Promise<string>;
}

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve({
    port: 3000,
    async fetch(req: Request) {
        if (req.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            const payload = await req.json();
            const batchingServerResponse = await fetchBatchingServer(payload);

            try {
                const jsonData = JSON.parse(batchingServerResponse.body);
                console.log('Parsed JSON:', jsonData);
            } catch (jsonError) {
                console.log('Response is not valid JSON');
            }

            return new Response(batchingServerResponse.body, {
                status: batchingServerResponse.status,
                statusText: batchingServerResponse.statusText,
                headers: { ...batchingServerResponse.headers, ...corsHeaders },
            });
        } catch (error) {
            console.error('Error:', error);
            return new Response('Internal Server Error', {
                status: 500,
                headers: corsHeaders
            });
        }
    },
});

async function fetchBatchingServer(payload: any): Promise<BatchingServerResponse> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'batching-server.pendulumchain.tech',
            path: '/currencies',
            method: 'POST',
            agent: httpsAgent,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    body: data,
                    text: async () => data
                });
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
    });
}