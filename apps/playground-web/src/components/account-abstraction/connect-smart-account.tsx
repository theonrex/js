"use client";

import { useEffect } from "react";
import { sepolia } from "thirdweb/chains";
import {
  useActiveAccount,
  useActiveWallet,
  useConnect,
  useDisconnect,
} from "thirdweb/react";
import { concatHex, shortenAddress } from "thirdweb/utils";
import { createWallet } from "thirdweb/wallets";
import { THIRDWEB_CLIENT } from "../../lib/client";
import { StyledConnectButton } from "../styled-connect-button";
import { Button } from "../ui/button";
import { chain, editionDropAddress } from "./constants";

const circleUSDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const aaveUSDC = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

export function ConnectSmartAccountPreview() {
  // force disconnect if not smart wallet already
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  useEffect(() => {
    if (wallet && wallet.id !== "smart") {
      disconnect(wallet);
    }
  }, [wallet, disconnect]);
  return (
    <div className="flex flex-col">
      <StyledConnectButton
        detailsButton={{
          displayBalanceToken: {
            [sepolia.id]: aaveUSDC,
          },
        }}
        supportedNFTs={{
          [sepolia.id]: [editionDropAddress],
        }}
        supportedTokens={{
          [sepolia.id]: [
            {
              address: aaveUSDC,
              name: "USD Coin",
              symbol: "USDC",
              icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
            },
          ],
        }}
        accountAbstraction={{
          chain: sepolia,
          sponsorGas: true,
          overrides: {
            erc20Paymaster: {
              address: "0xEc87d96E3F324Dcc828750b52994C6DC69C8162b",
              token: aaveUSDC,
            },
          },
        }}
      />
    </div>
  );
}

export function ConnectSmartAccountCustomPreview() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const connectMutation = useConnect({
    client: THIRDWEB_CLIENT,
    accountAbstraction: { chain, sponsorGas: true },
  });
  const { disconnect } = useDisconnect();

  const connect = async () => {
    const wallet = await connectMutation.connect(async () => {
      const adminWallet = createWallet("io.metamask");
      await adminWallet.connect({
        client: THIRDWEB_CLIENT,
      });
      return adminWallet;
    });
    return wallet;
  };

  return (
    <div className="flex flex-col">
      {account && wallet ? (
        <>
          <p className="py-4">Connected as {shortenAddress(account.address)}</p>
          <Button variant={"outline"} onClick={() => disconnect(wallet)}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button variant={"default"} onClick={connect}>
          Connect (metamask)
        </Button>
      )}
    </div>
  );
}
