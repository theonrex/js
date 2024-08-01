import type { AbiParameterToPrimitiveType } from "abitype";

import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";

/**
 * Represents the parameters for the "encodeBytesBeforeMintERC20" function.
 */
export type EncodeBytesBeforeMintERC20Params = {
  params: AbiParameterToPrimitiveType<{
    name: "params";
    type: "tuple";
    internalType: "struct MintableERC20.MintParamsERC20";
    components: [
      {
        name: "request";
        type: "tuple";
        internalType: "struct MintableERC20.MintRequestERC20";
        components: [
          { name: "startTimestamp"; type: "uint48"; internalType: "uint48" },
          { name: "endTimestamp"; type: "uint48"; internalType: "uint48" },
          { name: "recipient"; type: "address"; internalType: "address" },
          { name: "quantity"; type: "uint256"; internalType: "uint256" },
          { name: "currency"; type: "address"; internalType: "address" },
          { name: "pricePerUnit"; type: "uint256"; internalType: "uint256" },
          { name: "uid"; type: "bytes32"; internalType: "bytes32" },
        ];
      },
      { name: "signature"; type: "bytes"; internalType: "bytes" },
    ];
  }>;
};

export const FN_SELECTOR = "0xc7a090f4" as const;
const FN_INPUTS = [
  {
    name: "params",
    type: "tuple",
    internalType: "struct MintableERC20.MintParamsERC20",
    components: [
      {
        name: "request",
        type: "tuple",
        internalType: "struct MintableERC20.MintRequestERC20",
        components: [
          {
            name: "startTimestamp",
            type: "uint48",
            internalType: "uint48",
          },
          {
            name: "endTimestamp",
            type: "uint48",
            internalType: "uint48",
          },
          {
            name: "recipient",
            type: "address",
            internalType: "address",
          },
          {
            name: "quantity",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "currency",
            type: "address",
            internalType: "address",
          },
          {
            name: "pricePerUnit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "uid",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
] as const;

/**
 * Encodes the parameters for the "encodeBytesBeforeMintERC20" function.
 * @param options - The options for the encodeBytesBeforeMintERC20 function.
 * @returns The encoded ABI parameters.
 * @extension MODULAR
 * @example
 * ```ts
 * import { encodeEncodeBytesBeforeMintERC20Params } "thirdweb/extensions/modular";
 * const result = encodeEncodeBytesBeforeMintERC20Params({
 *  params: ...,
 * });
 * ```
 */
export function encodeBytesBeforeMintERC20Params(
  options: EncodeBytesBeforeMintERC20Params,
) {
  return encodeAbiParameters(FN_INPUTS, [options.params]);
}
