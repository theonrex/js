import {
  useIsAdmin,
  useIsMinter,
} from "@3rdweb-sdk/react/hooks/useContractRoles";
import { useBatchesToReveal, useClaimConditions } from "@thirdweb-dev/react";
import { StepsCard } from "components/dashboard/StepsCard";
import { useTabHref } from "contract-ui/utils";
import type { ThirdwebContract } from "thirdweb";
import { totalSupply as totalSupply20 } from "thirdweb/extensions/erc20";
import { getAllAccounts } from "thirdweb/extensions/erc4337";
import {
  getNFTs as get721NFTs,
  nextTokenIdToMint,
  sharedMetadata,
} from "thirdweb/extensions/erc721";
import { useReadContract } from "thirdweb/react";
import { Link, Text } from "tw-components";

interface ContractChecklistProps {
  contract: ThirdwebContract;
  isLazyMintable: boolean;
  erc721hasClaimConditions: boolean;
  erc20HasClaimConditions: boolean;
  isErc721SharedMetadadata: boolean;
  tokenIsMintable: boolean;
  nftIsMintable: boolean;
  isAccountFactory: boolean;
  isRevealable: boolean;
  isErc1155: boolean;
  isErc721: boolean;
}

type Step = {
  title: string;
  children: React.ReactNode;
  completed: boolean;
};

export const ContractChecklist: React.FC<ContractChecklistProps> = ({
  contract,
  isLazyMintable,
  erc721hasClaimConditions,
  erc20HasClaimConditions,
  isErc721SharedMetadadata,
  tokenIsMintable,
  nftIsMintable,
  isAccountFactory,
  // isRevealable,
  isErc1155,
  isErc721,
}) => {
  const nftHref = useTabHref("nfts");
  const tokenHref = useTabHref("tokens");
  const accountsHref = useTabHref("accounts");
  const claimConditionsHref = useTabHref("claim-conditions");
  const erc721Claimed = useReadContract(nextTokenIdToMint, {
    contract,
    queryOptions: { enabled: isErc721 },
  });
  const claimConditions = useClaimConditions(contractV4);
  const erc20Supply = useReadContract(totalSupply20, {
    contract,
    queryOptions: {
      enabled: !isErc1155 && !isErc721,
    },
  });

  // todo replace this
  // const batchesToReveal = useBatchesToReveal(contractV4);
  const accounts = useReadContract(getAllAccounts, {
    contract,
    // Ideally should be "is4337" but better having something than nothing
    queryOptions: { enabled: !isErc1155 && !isErc721 },
  });
  const _sharedMetadata = useReadContract(sharedMetadata, {
    contract,
    queryOptions: { enabled: isErc721 },
  });
  const nfts721 = useReadContract(get721NFTs, {
    contract,
    count: 1,
    queryOptions: { enabled: isErc721 },
  });
  const nfts1155 = useReadContract(get721NFTs, {
    contract,
    count: 1,
    queryOptions: { enabled: isErc1155 },
  });
  const hasNft =
    (nfts721.data?.length || 0) > 0 || (nfts1155.data?.length || 0) > 0;

  const steps: Step[] = [
    {
      title: "Contract deployed",
      children: null,
      completed: true,
    },
  ];

  const isAdmin = useIsAdmin(contract);
  const isMinter = useIsMinter(contract);

  if (!isAdmin) {
    return null;
  }

  if (isLazyMintable && isMinter) {
    steps.push({
      title: "First NFT uploaded",
      children: (
        <Text size="body.sm">
          Head to the{" "}
          <Link href={nftHref} color="blue.500">
            NFTs tab
          </Link>{" "}
          to upload your NFT metadata.
        </Text>
      ),
      completed: hasNft,
    });
  }

  if (isErc721SharedMetadadata) {
    steps.push({
      title: "Set NFT Metadata",
      children: (
        <Text size="label.sm">
          Head to the{" "}
          <Link href={nftHref} color="blue.500">
            NFTs tab
          </Link>{" "}
          to set your NFT metadata.
        </Text>
      ),
      completed: !!_sharedMetadata?.data?.length,
    });
  }

  if (erc721hasClaimConditions || erc20HasClaimConditions) {
    steps.push({
      title: "Set Claim Conditions",
      children: (
        <Text size="label.sm">
          Head to the{" "}
          <Link href={claimConditionsHref} color="blue.500">
            Claim Conditions tab
          </Link>{" "}
          to set your claim conditions. Users will be able to claim your drop
          only if a claim phase is active.
        </Text>
      ),
      completed:
        (claimConditions.data?.length || 0) > 0 ||
        (erc721Claimed.data || 0n) > 0n ||
        (erc20Supply.data || 0n) > 0n,
    });
  }
  if (erc721hasClaimConditions) {
    steps.push({
      title: "First NFT claimed",
      children: <Text size="label.sm">No NFTs have been claimed so far.</Text>,
      completed: (erc721Claimed.data || 0n) > 0n,
    });
  }

  if (erc20HasClaimConditions) {
    steps.push({
      title: "First token claimed",
      children: (
        <Text size="label.sm">No tokens have been claimed so far.</Text>
      ),
      completed: (erc20Supply.data || 0n) > 0n,
    });
  }

  if (tokenIsMintable && isMinter) {
    steps.push({
      title: "First token minted",
      children: (
        <Text size="label.sm">
          Head to the{" "}
          <Link href={tokenHref} color="blue.500">
            token tab
          </Link>{" "}
          to mint your first token.
        </Text>
      ),
      completed: (erc20Supply.data || 0n) > 0n,
    });
  }

  if (nftIsMintable && isMinter) {
    steps.push({
      title: "First NFT minted",
      children: (
        <Text size="label.sm">
          Head to the{" "}
          <Link href={nftHref} color="blue.500">
            NFTs tab
          </Link>{" "}
          to mint your first token.
        </Text>
      ),
      completed: hasNft,
    });
  }

  if (isAccountFactory) {
    steps.push({
      title: "First account created",
      children: (
        <Text size="label.sm">
          Head to the{" "}
          <Link href={accountsHref} color="blue.500">
            Accounts tab
          </Link>{" "}
          to create your first account.
        </Text>
      ),
      completed: (accounts.data?.length || 0) > 0,
    });
  }

  //todo un-comment once replaced useBatchesToReveal
  // const needsReveal = batchesToReveal.data?.length;
  // if (isRevealable && needsReveal) {
  //   steps.push({
  //     title: "NFTs revealed",
  //     children: (
  //       <Text size="label.sm">
  //         Head to the{" "}
  //         <Link href={nftHref} color="blue.500">
  //           NFTs tab
  //         </Link>{" "}
  //         to reveal your NFTs.
  //       </Text>
  //     ),
  //     // This is always false because if there are batches to reveal, the step doesn't show.
  //     completed: false,
  //   });
  // }

  if (steps.length === 1) {
    return null;
  }

  return <StepsCard title="Contract checklist" steps={steps} delay={1000} />;
};
