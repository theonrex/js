import type { Chain } from "../../../chains/types.js";
import { getAddress } from "../../../utils/address.js";
import { getThirdwebDomains } from "../../../utils/domains.js";

// dev only
export const DEBUG = false;

export const DUMMY_SIGNATURE =
  "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

export const DEFAULT_ACCOUNT_FACTORY =
  "0x85e23b94e7F5E9cC1fF78BCe78cfb15B81f0DF00";

export const DEFAULT_ACCOUNT_FACTORY_V0_6 = DEFAULT_ACCOUNT_FACTORY;

export const ENTRYPOINT_ADDRESS_v0_6 =
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // v0.6
export const ENTRYPOINT_ADDRESS_V0_7 =
  "0x0000000071727De22E5E9d8BAf0edAc6f37da032"; // v0.7

export const MANAGED_ACCOUNT_GAS_BUFFER = 50000n;

/**
 * @internal
 */
export const getDefaultBundlerUrl = (chain: Chain, version: "v1" | "v2") => {
  const domain = getThirdwebDomains().bundler;
  return `https://${chain.id}.${domain}/${version ?? "v1"}/`;
};

/**
 * @internal
 */
export const getDefaultPaymasterUrl = (chain: Chain, version: "v1" | "v2") => {
  const domain = getThirdwebDomains().bundler;
  return `https://${chain.id}.${domain}/${version ?? "v1"}`;
};

export const getEntryPointVersion = (address: string): "v0.6" | "v0.7" => {
  const checksummedAddress = getAddress(address);
  if (checksummedAddress === ENTRYPOINT_ADDRESS_v0_6) {
    return "v0.6";
  }
  if (checksummedAddress === ENTRYPOINT_ADDRESS_V0_7) {
    return "v0.7";
  }
  throw new Error("Unknown paymaster version");
};
