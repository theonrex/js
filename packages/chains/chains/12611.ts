import type { Chain } from "../src/types";
export default {
  "chain": "ETH",
  "chainId": 12611,
  "explorers": [],
  "faucets": [],
  "features": [],
  "icon": {
    "url": "ipfs://QmRySLe3su59dE5x5JPm2b1GeZfz6DR9qUzcbp3rt4SD3A",
    "width": 300,
    "height": 300,
    "format": "png"
  },
  "infoURL": "https://astar.network",
  "name": "Astar zkEVM (deprecated)",
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "networkId": 12611,
  "parent": {
    "type": "L2",
    "chain": "eip155-1",
    "bridges": []
  },
  "redFlags": [],
  "rpc": [],
  "shortName": "astrzk",
  "slug": "astar-zkevm-deprecated",
  "status": "incubating",
  "testnet": false,
  "title": "Astar zkEVM Mainnet"
} as const satisfies Chain;