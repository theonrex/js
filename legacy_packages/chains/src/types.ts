type Icon = {
  url: string;
  width: number;
  height: number;
  format: string;
};

export type ChainExplorer = {
  name: string;
  url: string;
  icon?: Icon;
  standard: string;
};

export const ChainStackType = {
  OPTIMISM_BEDROCK: "optimism_bedrock",
  ARBITRUM_NITRO: "arbitrum_nitro",
  ZKSYNC_STACK: "zksync_stack",
  POLYGON_CDK: "polygon_cdk",
  AVALANCHE_SUBNET: "avalanche_subnet"
};

export type ChainStackType = (typeof ChainStackType)[keyof typeof ChainStackType];

export type OptimismBedrockContractsType = {
  // contracts on parent chain - l1 / l2
  l1Contracts: {
    AddressManager?: string;
    L1CrossDomainMessenger?: string;
    L1CrossDomainMessengerProxy?: string;
    L1ERC721Bridge?: string;
    L1ERC721BridgeProxy?: string;
    L1StandardBridge?: string;
    // required for native bridging
    L1StandardBridgeProxy: string;
    L2OutputOracle?: string;
    // required for native bridging
    L2OutputOracleProxy: string;
    OptimismMintableERC20Factory?: string;
    OptimismMintableERC20FactoryProxy?: string;
    OptimismPortal?: string;
    // required for native bridging
    OptimismPortalProxy: string;
    ProxyAdmin?: string;
    SystemConfig?: string;
    SystemConfigProxy?: string;
  },
  // contracts on l2 / l3 chain
  l2Contracts?:
  {
    GasPriceOracle?: string;
    L1Block?: string;
    L2CrossDomainMessenger?: string;
    L2ERC721Bridge?: string;
    L2StandardBridge?: string;
    L2ToL1MessagePasser?: string;
  },
};

export type OptimismBedrockStackInfoType = {
  parentChainId: number;
  nativeTokenAddress: string;
}

export type Chain = {
  name: string;
  title?: string;
  chain: string;
  icon?: Icon;
  rpc: readonly string[];
  features?: Readonly<Array<{ name: string }>>;
  faucets?: readonly string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL?: string;
  shortName: string;
  chainId: number;
  networkId?: number;
  ens?: {
    registry: string;
  };
  explorers?: Readonly<Array<ChainExplorer>>;
  testnet: boolean;
  slug: string;
  slip44?: number;
  status?: string;
  redFlags?: readonly string[];
  parent?: {
    chain: string;
    type: string;
    bridges?: Readonly<Array<{ url: string }>>;
  };
  stackType?: ChainStackType;
  contracts?: OptimismBedrockContractsType;
  stackInfo?: OptimismBedrockStackInfoType;
};

export type ApiChain = Omit<Chain, "features"> & {
  features: string[];
};

// MinimalChain is a subset of Chain with only the fields that are required / non-optional
export type MinimalChain = Pick<
  Chain,
  | "name"
  | "chain"
  | "rpc"
  | "nativeCurrency"
  | "shortName"
  | "chainId"
  | "testnet"
  | "slug"
  | "icon"
>;
