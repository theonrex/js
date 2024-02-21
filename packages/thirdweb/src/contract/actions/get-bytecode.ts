import type { Abi } from "abitype";
import type { ThirdwebContract } from "../contract.js";
import { getRpcClient } from "../../rpc/rpc.js";
import { eth_getCode } from "../../rpc/actions/eth_getCode.js";
import type { Hex } from "../../utils/encoding/hex.js";

const BYTECODE_CACHE = new WeakMap<ThirdwebContract<Abi>, Promise<Hex>>();

/**
 * Retrieves the bytecode of a contract.
 * @param contract - The ThirdwebContract instance.
 * @returns A Promise that resolves to the bytecode of the contract.
 * @example
 * ```ts
 * import { getBytecode } from "thirdweb/contract";
 * const bytecode = await getBytecode(contract);
 * ```
 */
export function getBytecode<abi extends Abi>(
  contract: ThirdwebContract<abi>,
): Promise<Hex> {
  if (BYTECODE_CACHE.has(contract)) {
    return BYTECODE_CACHE.get(contract) as Promise<Hex>;
  }

  const prom = (async () => {
    const rpcRequest = getRpcClient(contract);
    return eth_getCode(rpcRequest, {
      address: contract.address,
      blockTag: "latest",
    });
  })();
  BYTECODE_CACHE.set(contract, prom);
  return prom;
}
