"use client";
import { generatePayload, isLoggedIn, login, logout } from "@/lib/auth";
import { client } from "@/lib/client";
import { useTheme } from "next-themes";
import {
  arbitrum,
  base,
  blast,
  mainnet,
  optimism,
  zkSync,
} from "thirdweb/chains";
import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react";
import { ecosystemWallet } from "thirdweb/wallets";

export default function ConnectButton({
  ecosystem,
}: { ecosystem: `ecosystem.${string}` }) {
  const { theme } = useTheme();

  return (
    <ThirdwebConnectButton
      chains={[mainnet, base, optimism, arbitrum, blast, zkSync]}
      wallets={[ecosystemWallet(ecosystem)]}
      client={client}
      theme={theme as "light" | "dark"}
      auth={{
        getLoginPayload: generatePayload,
        doLogin: login,
        isLoggedIn,
        doLogout: logout,
      }}
    />
  );
}
