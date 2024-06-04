import type { AbiParameterToPrimitiveType } from "abitype";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";
import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";
import type { ThirdwebContract } from "../../../../../contract/contract.js";
import { detectMethod } from "../../../../../utils/bytecode/detectExtension.js";

/**
 * Represents the parameters for the "isApprovedForAll" function.
 */
export type IsApprovedForAllParams = {
  owner: AbiParameterToPrimitiveType<{
    name: "owner";
    type: "address";
    internalType: "address";
  }>;
  operator: AbiParameterToPrimitiveType<{
    name: "operator";
    type: "address";
    internalType: "address";
  }>;
};

export const FN_SELECTOR = "0xe985e9c5" as const;
const FN_INPUTS = [
  {
    name: "owner",
    type: "address",
    internalType: "address",
  },
  {
    name: "operator",
    type: "address",
    internalType: "address",
  },
] as const;
const FN_OUTPUTS = [
  {
    name: "result",
    type: "bool",
    internalType: "bool",
  },
] as const;

/**
 * Checks if the `isApprovedForAll` method is supported by the given contract.
 * @param contract The ThirdwebContract.
 * @returns A promise that resolves to a boolean indicating if the `isApprovedForAll` method is supported.
 * @extension MODULAR
 * @example
 * ```ts
 * import { isIsApprovedForAllSupported } from "thirdweb/extensions/modular";
 *
 * const supported = await isIsApprovedForAllSupported(contract);
 * ```
 */
export async function isIsApprovedForAllSupported(
  contract: ThirdwebContract<any>,
) {
  return detectMethod({
    contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
  });
}

/**
 * Encodes the parameters for the "isApprovedForAll" function.
 * @param options - The options for the isApprovedForAll function.
 * @returns The encoded ABI parameters.
 * @extension MODULAR
 * @example
 * ```ts
 * import { encodeIsApprovedForAllParams } "thirdweb/extensions/modular";
 * const result = encodeIsApprovedForAllParams({
 *  owner: ...,
 *  operator: ...,
 * });
 * ```
 */
export function encodeIsApprovedForAllParams(options: IsApprovedForAllParams) {
  return encodeAbiParameters(FN_INPUTS, [options.owner, options.operator]);
}

/**
 * Encodes the "isApprovedForAll" function into a Hex string with its parameters.
 * @param options - The options for the isApprovedForAll function.
 * @returns The encoded hexadecimal string.
 * @extension MODULAR
 * @example
 * ```ts
 * import { encodeIsApprovedForAll } "thirdweb/extensions/modular";
 * const result = encodeIsApprovedForAll({
 *  owner: ...,
 *  operator: ...,
 * });
 * ```
 */
export function encodeIsApprovedForAll(options: IsApprovedForAllParams) {
  // we do a "manual" concat here to avoid the overhead of the "concatHex" function
  // we can do this because we know the specific formats of the values
  return (FN_SELECTOR +
    encodeIsApprovedForAllParams(options).slice(
      2,
    )) as `${typeof FN_SELECTOR}${string}`;
}

/**
 * Decodes the result of the isApprovedForAll function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension MODULAR
 * @example
 * ```ts
 * import { decodeIsApprovedForAllResult } from "thirdweb/extensions/modular";
 * const result = decodeIsApprovedForAllResult("...");
 * ```
 */
export function decodeIsApprovedForAllResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "isApprovedForAll" function on the contract.
 * @param options - The options for the isApprovedForAll function.
 * @returns The parsed result of the function call.
 * @extension MODULAR
 * @example
 * ```ts
 * import { isApprovedForAll } from "thirdweb/extensions/modular";
 *
 * const result = await isApprovedForAll({
 *  contract,
 *  owner: ...,
 *  operator: ...,
 * });
 *
 * ```
 */
export async function isApprovedForAll(
  options: BaseTransactionOptions<IsApprovedForAllParams>,
) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [options.owner, options.operator],
  });
}
