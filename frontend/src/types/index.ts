export interface ApiItem {
    id: number;
    name: string;
    description: string;
    endpoint: string;
    priceSats: number;
    owner: string;
    totalCalls: number;
    active: boolean;
    category?: string;
    isMock?: boolean;
}

export interface ApiCallResult {
    success: boolean;
    apiId: number;
    txHash: string;
    timestamp: string;
    data: any;
}
