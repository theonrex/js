import type { Chain } from "../../chains/types.js";
import type { ThirdwebClient } from "../../client/client.js";
import type { ThirdwebContract } from "../../contract/contract.js";
import { deployViaAutoFactory } from "../../contract/deployment/deploy-via-autofactory.js";
import { fetchPublishedContractMetadata } from "../../contract/deployment/publisher.js";
import {
  getOrDeployInfraContract,
  getOrDeployInfraForPublishedContract,
} from "../../contract/deployment/utils/bootstrap.js";
import { upload } from "../../storage/upload.js";
import type { FileOrBufferOrString } from "../../storage/upload/types.js";
import type { Hex } from "../../utils/encoding/hex.js";
import type { Prettify } from "../../utils/type-utils.js";
import type { ClientAndChainAndAccount } from "../../utils/types.js";
import type { Account } from "../../wallets/interfaces/wallet.js";
import { initialize as initCoreERC721 } from "../modular/__generated__/ERC721Core/write/initialize.js";
import { initialize as initDropERC721 } from "./__generated__/DropERC721/write/initialize.js";
import { initialize as initOpenEditionERC721 } from "./__generated__/OpenEditionERC721/write/initialize.js";
import { initialize as initTokenERC721 } from "./__generated__/TokenERC721/write/initialize.js";

/**
 * @extension DEPLOY
 */
export type ERC721ContractType =
  | "DropERC721"
  | "TokenERC721"
  | "OpenEditionERC721"
  | "ModularTokenERC721";

/**
 * @extension DEPLOY
 */
export type ERC721ContractParams = {
  name: string;
  description?: string;
  image?: FileOrBufferOrString;
  external_link?: string;
  social_urls?: Record<string, string>;
  symbol?: string;
  contractURI?: string;
  defaultAdmin?: string;
  saleRecipient?: string;
  platformFeeBps?: bigint;
  platformFeeRecipient?: string;
  royaltyRecipient?: string;
  royaltyBps?: bigint;
  trustedForwarders?: string[];
};

/**
 * @extension DEPLOY
 */
export type DeployERC721ContractOptions = Prettify<
  ClientAndChainAndAccount & {
    type: ERC721ContractType;
    params: ERC721ContractParams;
  }
>;

/**
 * Deploys an thirdweb ERC721 contract of the given type.
 * On chains where the thirdweb infrastructure contracts are not deployed, this function will deploy them as well.
 * @param options - The deployment options.
 * @returns The deployed contract address.
 * @extension DEPLOY
 * @example
 * ```ts
 * import { deployERC721Contract } from "thirdweb/deploys";
 * const contractAddress = await deployERC721Contract({
 *  chain,
 *  client,
 *  account,
 *  type: "DropERC721",
 *  params: {
 *    name: "MyNFT",
 *    description: "My NFT contract",
 *    symbol: "NFT",
 * });
 * ```
 */
export async function deployERC721Contract(
  options: DeployERC721ContractOptions,
) {
  const { chain, client, account, type, params } = options;

  const { cloneFactoryContract, implementationContract } =
    await getOrDeployInfraForPublishedContract({
      chain,
      client,
      account,
      contractId: type,
      constructorParams: [],
    });

  const initializeTransaction = await getInitializeTransaction({
    client,
    chain,
    account,
    implementationContract,
    type,
    params,
    accountAddress: account.address,
  });

  return deployViaAutoFactory({
    client,
    chain,
    account,
    cloneFactoryContract,
    initializeTransaction,
  });
}

async function getInitializeTransaction(options: {
  client: ThirdwebClient;
  chain: Chain;
  account: Account;
  implementationContract: ThirdwebContract;
  type: ERC721ContractType;
  params: ERC721ContractParams;
  accountAddress: string;
}) {
  const {
    client,
    implementationContract,
    type,
    params,
    accountAddress,
    chain,
    account,
  } = options;
  const contractURI =
    options.params.contractURI ||
    (await upload({
      client,
      files: [
        {
          name: params.name,
          description: params.description,
          symbol: params.symbol,
          image: params.image,
          external_link: params.external_link,
          social_urls: params.social_urls,
          seller_fee_basis_points: params.royaltyBps,
          fee_recipient: params.royaltyRecipient,
        },
      ],
    })) ||
    "";
  switch (type) {
    case "DropERC721":
      return initDropERC721({
        contract: implementationContract,
        name: params.name || "",
        symbol: params.symbol || "",
        contractURI,
        defaultAdmin: params.defaultAdmin || accountAddress,
        saleRecipient: params.saleRecipient || accountAddress,
        platformFeeBps: params.platformFeeBps || 0n,
        platformFeeRecipient: params.platformFeeRecipient || accountAddress,
        royaltyRecipient: params.royaltyRecipient || accountAddress,
        royaltyBps: params.royaltyBps || 0n,
        trustedForwarders: params.trustedForwarders || [],
      });
    case "TokenERC721":
      return initTokenERC721({
        contract: implementationContract,
        name: params.name || "",
        symbol: params.symbol || "",
        contractURI,
        defaultAdmin: params.defaultAdmin || accountAddress,
        saleRecipient: params.saleRecipient || accountAddress,
        platformFeeBps: params.platformFeeBps || 0n,
        platformFeeRecipient: params.platformFeeRecipient || accountAddress,
        royaltyRecipient: params.royaltyRecipient || accountAddress,
        royaltyBps: params.royaltyBps || 0n,
        trustedForwarders: params.trustedForwarders || [],
      });
    case "OpenEditionERC721":
      return initOpenEditionERC721({
        contract: implementationContract,
        name: params.name || "",
        symbol: params.symbol || "",
        contractURI,
        defaultAdmin: params.defaultAdmin || accountAddress,
        saleRecipient: params.saleRecipient || accountAddress,
        royaltyRecipient: params.royaltyRecipient || accountAddress,
        royaltyBps: params.royaltyBps || 0n,
        trustedForwarders: params.trustedForwarders || [],
      });
    case "ModularTokenERC721": {
      const { extendedMetadata } = await fetchPublishedContractMetadata({
        client,
        contractId: type,
      });
      const extensionNames =
        extendedMetadata?.defaultExtensions?.map((e) => e.extensionName) || [];
      // can't promise all this unfortunately, needs to be sequential because of nonces
      const extensions: string[] = [];
      const extensionInstallData: Hex[] = [];
      for (const extension of extensionNames) {
        const contract = await getOrDeployInfraContract({
          client,
          chain,
          account,
          contractId: extension,
          constructorParams: [],
        });
        extensions.push(contract.address);
        // TODO (modular) this should be more dynamic
        switch (extension) {
          case "MintableERC721": {
            const { encodeBytesOnInstallParams } = await import(
              "../../extensions/modular/__generated__/MintableERC721/encode/encodeBytesOnInstall.js"
            );
            extensionInstallData.push(
              encodeBytesOnInstallParams({
                primarySaleRecipient: params.saleRecipient || accountAddress,
              }),
            );
            break;
          }
          case "RoyaltyERC721": {
            const { encodeBytesOnInstallParams } = await import(
              "../../extensions/modular/__generated__/RoyaltyERC721/encode/encodeBytesOnInstall.js"
            );
            extensionInstallData.push(
              encodeBytesOnInstallParams({
                royaltyRecipient: params.royaltyRecipient || accountAddress,
                royaltyBps: params.royaltyBps || 0n,
              }),
            );
            break;
          }
          case "ClaimableERC721": {
            const { encodeBytesOnInstallParams } = await import(
              "../../extensions/modular/__generated__/ClaimableERC721/encode/encodeBytesOnInstall.js"
            );
            extensionInstallData.push(
              encodeBytesOnInstallParams({
                primarySaleRecipient: params.saleRecipient || accountAddress,
              }),
            );
            break;
          }
          default: {
            extensionInstallData.push("0x");
          }
        }
      }
      return initCoreERC721({
        contract: implementationContract,
        name: params.name || "",
        symbol: params.symbol || "",
        contractURI,
        owner: params.defaultAdmin || accountAddress,
        extensions,
        extensionInstallData,
      });
    }
  }
}
