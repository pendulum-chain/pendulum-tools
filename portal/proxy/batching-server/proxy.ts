import {serve} from "bun";
import https from "https";
import http from "http";

interface BatchingServerResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;

    text(): Promise<string>;
}

// Change this to false to use the production batching server
const LOCAL_BATCHING_SERVER = true;

const agent = LOCAL_BATCHING_SERVER ?
    new http.Agent({
        rejectUnauthorized: false,
    })
    : new https.Agent({
        rejectUnauthorized: false,
    });


const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const server = serve({
    port: 3000,
    async fetch(req: Request) {
        if (req.method === "OPTIONS") {
            return new Response(null, {headers: corsHeaders});
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
                headers: {...batchingServerResponse.headers, ...corsHeaders},
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

console.log(`Listening on localhost:${server.port}`);

async function fetchBatchingServer(payload: any): Promise<BatchingServerResponse> {
    return new Promise((resolve, reject) => {
        const hostname = LOCAL_BATCHING_SERVER ? 'localhost:8070' : 'batching-server.pendulumchain.tech';
        const options = {
            hostname,
            path: '/currencies',
            method: 'POST',
            agent,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const queryFunction = LOCAL_BATCHING_SERVER ? http : https;

        const req = queryFunction.request(options, (res) => {
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