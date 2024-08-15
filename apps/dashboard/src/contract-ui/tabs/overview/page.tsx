import { Divider, Flex, GridItem, SimpleGrid } from "@chakra-ui/react";
import { contractType, useContract } from "@thirdweb-dev/react";
import { type Abi, getAllDetectedFeatureNames } from "@thirdweb-dev/sdk";
import { PublishedBy } from "components/contract-components/shared/published-by";
import { RelevantDataSection } from "components/dashboard/RelevantDataSection";
import { useMemo } from "react";
import { AnalyticsOverview } from "./components/Analytics";
import { BuildYourApp } from "./components/BuildYourApp";
import { ContractChecklist } from "./components/ContractChecklist";
import { Extensions } from "./components/Extensions";
import { LatestEvents } from "./components/LatestEvents";
import { MarketplaceDetails } from "./components/MarketplaceDetails";
import { NFTDetails } from "./components/NFTDetails";
import { PermissionsTable } from "./components/PermissionsTable";
import { TokenDetails } from "./components/TokenDetails";
import { getGuidesAndTemplates } from "./helpers/getGuidesAndTemplates";
import { detectFeatures } from "components/contract-components/utils";
import { useV5DashboardChain } from "lib/v5-adapter";
import { getContract } from "thirdweb";
import { thirdwebClient } from "lib/thirdweb-client";

interface ContractOverviewPageProps {
  contractAddress?: string;
}

const TRACKING_CATEGORY = "contract_overview";

export const ContractOverviewPage: React.FC<ContractOverviewPageProps> = ({
  contractAddress,
}) => {
  const { contract } = useContract(contractAddress);
  const contractTypeQuery = contractType.useQuery(contractAddress);
  const contractTypeData = contractTypeQuery?.data || "custom";

  const detectedFeatureNames = useMemo(
    () =>
      contract?.abi ? getAllDetectedFeatureNames(contract.abi as Abi) : [],
    [contract?.abi],
  );

  const { guides, templates } = useMemo(
    () => getGuidesAndTemplates(detectedFeatureNames, contractTypeData),
    [detectedFeatureNames, contractTypeData],
  );

  const chain = useV5DashboardChain(contract?.chainId);
  const contractV5 =
    chain && contract
      ? getContract({
          address: contract.getAddress(),
          chain,
          client: thirdwebClient,
        })
      : undefined;

  if (!contractAddress) {
    return <div>No contract address provided</div>;
  }

  const isLazyMintable = detectFeatures(contract, [
    "ERC721LazyMintable",
    "ERC1155LazyMintableV2",
    "ERC1155LazyMintableV1",
  ]);

  const erc721hasClaimConditions = detectFeatures(contract, [
    "ERC721ClaimPhasesV1",
    "ERC721ClaimPhasesV2",
    "ERC721ClaimConditionsV1",
    "ERC721ClaimConditionsV2",
    "ERC721ClaimCustom",
  ]);

  const erc20HasClaimConditions = detectFeatures(contract, [
    "ERC20ClaimPhasesV1",
    "ERC20ClaimPhasesV2",
    "ERC20ClaimConditionsV1",
    "ERC20ClaimConditionsV2",
  ]);

  const isErc721SharedMetadadata = detectFeatures(contract, [
    "ERC721SharedMetadata",
  ]);

  const tokenIsMintable = detectFeatures(contract, ["ERC20Mintable"]);

  const nftIsMintable = detectFeatures(contract, [
    "ERC721Mintable",
    "ERC1155Mintable",
  ]);

  const isAccountFactory = detectFeatures(contract, ["AccountFactory"]);

  const isRevealable = detectFeatures(contract, [
    "ERC721Revealable",
    "ERC1155Revealable",
  ]);

  const isErc721 = detectFeatures(contract, ["ERC721"]);

  const isErc1155 = detectFeatures(contract, ["ERC1155"]);

  return (
    <SimpleGrid columns={{ base: 1, xl: 10 }} gap={20}>
      <GridItem as={Flex} colSpan={{ xl: 7 }} direction="column" gap={16}>
        {contractV5 && (
          <ContractChecklist
            contract={contractV5}
            isLazyMintable={isLazyMintable}
            erc20HasClaimConditions={erc20HasClaimConditions}
            erc721hasClaimConditions={erc721hasClaimConditions}
            isErc721SharedMetadadata={isErc721SharedMetadadata}
            nftIsMintable={nftIsMintable}
            tokenIsMintable={tokenIsMintable}
            isAccountFactory={isAccountFactory}
            isRevealable={isRevealable}
            isErc721={isErc721}
            isErc1155={isErc1155}
          />
        )}
        {contract && (
          <AnalyticsOverview
            contractAddress={contractAddress}
            chainId={contract.chainId}
            trackingCategory={TRACKING_CATEGORY}
          />
        )}
        {contract &&
          (contractTypeData === "marketplace" ||
            ["DirectListings", "EnglishAuctions"].some((type) =>
              detectedFeatureNames.includes(type),
            )) && (
            <MarketplaceDetails
              contractAddress={contractAddress}
              trackingCategory={TRACKING_CATEGORY}
              contractType={contractTypeData as "marketplace"}
              features={detectedFeatureNames}
            />
          )}
        {contract &&
          ["ERC1155", "ERC721"].some((type) =>
            detectedFeatureNames.includes(type),
          ) && (
            <NFTDetails
              contractAddress={contract.getAddress()}
              chainId={contract.chainId}
              trackingCategory={TRACKING_CATEGORY}
              features={detectedFeatureNames}
            />
          )}
        {contract &&
          ["ERC20"].some((type) => detectedFeatureNames.includes(type)) && (
            <TokenDetails
              contractAddress={contractAddress}
              chainId={contract.chainId}
            />
          )}
        <LatestEvents
          address={contractAddress}
          trackingCategory={TRACKING_CATEGORY}
        />
        {contract &&
          ["PermissionsEnumerable"].some((type) =>
            detectedFeatureNames.includes(type),
          ) && (
            <PermissionsTable
              contract={contract}
              trackingCategory={TRACKING_CATEGORY}
            />
          )}
        <BuildYourApp trackingCategory={TRACKING_CATEGORY} />
      </GridItem>
      <GridItem colSpan={{ xl: 3 }} as={Flex} direction="column" gap={6}>
        <PublishedBy contractAddress={contractAddress} />
        {contract?.abi && <Extensions abi={contract?.abi} />}
        {(guides.length > 0 || templates.length > 0) && <Divider />}
        <RelevantDataSection
          data={guides}
          title="guide"
          TRACKING_CATEGORY={TRACKING_CATEGORY}
        />
        {guides.length > 0 && templates.length > 0 && <Divider />}
        <RelevantDataSection
          data={templates}
          title="template"
          TRACKING_CATEGORY={TRACKING_CATEGORY}
        />
        {templates.length > 0 && <Divider />}
      </GridItem>
    </SimpleGrid>
  );
};
