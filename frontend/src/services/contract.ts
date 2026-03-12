import { getContract, ABIDataTypes, BitcoinAbiTypes, type BaseContractProperties } from 'opnet';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const DEFAULT_FEE_RATE = 400;
export const MAX_SAT_PER_TX = 100000;

const API_MARKETPLACE_ABI = [
    {
        name: 'registerAPI',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'metadataId', type: ABIDataTypes.UINT256 },
            { name: 'priceSats', type: ABIDataTypes.UINT256 },
        ],
        outputs: [
            { name: 'apiId', type: ABIDataTypes.UINT256 },
        ],
    },
    {
        name: 'payAndCall',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'apiId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [
            { name: 'success', type: ABIDataTypes.BOOL },
        ],
    },
    {
        name: 'getAPI',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'apiId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [
            { name: 'owner', type: ABIDataTypes.ADDRESS },
            { name: 'metadataId', type: ABIDataTypes.UINT256 },
            { name: 'priceSats', type: ABIDataTypes.UINT256 },
            { name: 'active', type: ABIDataTypes.BOOL },
            { name: 'totalCalls', type: ABIDataTypes.UINT256 },
        ],
    },
    {
        name: 'getNextApiId',
        type: BitcoinAbiTypes.Function,
        inputs: [],
        outputs: [
            { name: 'nextApiId', type: ABIDataTypes.UINT256 },
        ],
    },
    {
        name: 'getTotalAPIs',
        type: BitcoinAbiTypes.Function,
        inputs: [],
        outputs: [
            { name: 'total', type: ABIDataTypes.UINT256 },
        ],
    },
    {
        name: 'deactivateAPI',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'apiId', type: ABIDataTypes.UINT256 },
        ],
        outputs: [
            { name: 'success', type: ABIDataTypes.BOOL },
        ],
    },
];

export interface IApiMarketplaceContract extends BaseContractProperties {
    registerAPI(metadataId: bigint, priceSats: bigint): Promise<any>;
    payAndCall(apiId: bigint): Promise<any>;
    getAPI(apiId: bigint): Promise<any>;
    getNextApiId(): Promise<any>;
    getTotalAPIs(): Promise<any>;
    deactivateAPI(apiId: bigint): Promise<any>;
}

export function getApiMarketplaceContract(
    provider: any,
    network: any,
    publicKey?: string,
): IApiMarketplaceContract {
    return getContract<IApiMarketplaceContract>(
        CONTRACT_ADDRESS,
        API_MARKETPLACE_ABI as any,
        provider,
        network,
        publicKey as any,
    );
}
