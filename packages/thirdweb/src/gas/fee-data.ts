import type { ThirdwebClient } from "../client/client.js";
import { parseUnits } from "viem";
import {
  blockByNumber,
  gasPrice,
  maxPriorityFeePerGas,
} from "../rpc/methods.js";

type FeeData = {
  maxFeePerGas: null | bigint;
  maxPriorityFeePerGas: null | bigint;
  baseFee: null | bigint;
};

export async function getDefaultGasOverrides(
  client: ThirdwebClient,
  chainId: number,
) {
  /**
   * TODO: do we want to re-enable this?
   */
  // If we're running in the browser, let users configure gas price in their wallet UI
  // if (isBrowser()) {
  //   return {};
  // }

  const feeData = await getDynamicFeeData(client, chainId);
  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    return {
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    };
  } else {
    return {
      gasPrice: await getGasPrice(client, chainId),
    };
  }
}

export async function getDynamicFeeData(
  client: ThirdwebClient,
  chainId: number,
): Promise<FeeData> {
  let maxFeePerGas: null | bigint = null;
  let maxPriorityFeePerGas_: null | bigint = null;

  const { getRpcClient } = await import("../rpc/index.js");
  const rpcClient = getRpcClient(client, { chainId });

  const [block, eth_maxPriorityFeePerGas] = await Promise.all([
    blockByNumber(rpcClient, "latest", false),
    maxPriorityFeePerGas(rpcClient).catch(() => null),
  ]);

  const baseBlockFee =
    block && block.baseFeePerGas ? block.baseFeePerGas : 100n;

  // mumbai & polygon
  if (chainId === 80001 || chainId === 137) {
    // for polygon, get fee data from gas station
    maxPriorityFeePerGas_ = await getPolygonGasPriorityFee(chainId);
  } else if (eth_maxPriorityFeePerGas) {
    // prioritize fee from eth_maxPriorityFeePerGas
    maxPriorityFeePerGas_ = eth_maxPriorityFeePerGas;
  }
  // TODO bring back(?)
  // else {
  //   // if eth_maxPriorityFeePerGas is not available, use 1.5 gwei default
  //   const feeData = await provider.getFeeData();
  //   maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

  // }

  if (!maxPriorityFeePerGas_) {
    // chain does not support eip-1559, return null for both
    return { maxFeePerGas: null, maxPriorityFeePerGas: null, baseFee: null };
  }

  // add 10% tip to maxPriorityFeePerGas for faster processing
  maxPriorityFeePerGas_ = getPreferredPriorityFee(maxPriorityFeePerGas_);
  // eip-1559 formula, doubling the base fee ensures that the tx can be included in the next 6 blocks no matter how busy the network is
  // good article on the subject: https://www.blocknative.com/blog/eip-1559-fees
  maxFeePerGas = baseBlockFee * 2n + maxPriorityFeePerGas_;

  return {
    maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas_,
    baseFee: baseBlockFee,
  };
}

function getPreferredPriorityFee(
  defaultPriorityFeePerGas: bigint,
  percentMultiplier: number = 10,
): bigint {
  const extraTip =
    (defaultPriorityFeePerGas / BigInt(100)) * BigInt(percentMultiplier);
  const totalPriorityFee = defaultPriorityFeePerGas + extraTip;
  return totalPriorityFee;
}

export async function getGasPrice(
  client: ThirdwebClient,
  chainId: number,
): Promise<bigint> {
  const { getRpcClient } = await import("../rpc/index.js");
  const rpcClient = getRpcClient(client, { chainId });
  const gasPrice_ = await gasPrice(rpcClient);
  const maxGasPrice = 300n; // 300 gwei
  const extraTip = (gasPrice_ / BigInt(100)) * BigInt(10);
  const txGasPrice = gasPrice_ + extraTip;

  if (txGasPrice > maxGasPrice) {
    return maxGasPrice;
  }

  return txGasPrice;
}

/**
 * @internal
 */
function getGasStationUrl(chainId: 137 | 80001): string {
  switch (chainId) {
    case 137:
      return "https://gasstation.polygon.technology/v2";
    case 80001:
      return "https://gasstation-testnet.polygon.technology/v2";
  }
}

const MIN_POLYGON_GAS_PRICE = 31n; // 31 gwei

const MIN_MUMBAI_GAS_PRICE = 1n; // 1 gwei

/**
 * @internal
 */
function getDefaultGasFee(chainId: 137 | 80001): bigint {
  switch (chainId) {
    case 137:
      return MIN_POLYGON_GAS_PRICE;
    case 80001:
      return MIN_MUMBAI_GAS_PRICE;
  }
}

/**
 *
 * @returns The gas price
 * @internal
 */
export async function getPolygonGasPriorityFee(
  chainId: 137 | 80001,
): Promise<bigint> {
  const gasStationUrl = getGasStationUrl(chainId);
  try {
    const data = await (await fetch(gasStationUrl)).json();
    // take the standard speed here, SDK options will define the extra tip
    const priorityFee = data["fast"]["maxPriorityFee"];
    if (priorityFee > 0) {
      const fixedFee = parseFloat(priorityFee).toFixed(9);
      return parseUnits(fixedFee, 18);
    }
  } catch (e) {
    console.error("failed to fetch gas", e);
  }
  return getDefaultGasFee(chainId);
}
