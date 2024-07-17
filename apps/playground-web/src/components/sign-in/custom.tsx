"use client";
import { sepolia } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";
import { darkTheme, lightTheme } from "thirdweb/react";
import { THIRDWEB_CLIENT } from "../../lib/client";

export const CustomizedConnect = () => {
  return (
    <ConnectButton
      client={THIRDWEB_CLIENT}
      chain={sepolia}
      connectButton={{
        label: "Custom Connect Button",
      }}
      supportedTokens={{
        [sepolia.id]: [
          {
            address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
            name: "USD Coin",
            symbol: "USDC",
            icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
          },
        ],
      }}
      showAllWallets={false}
      connectModal={{
        title: "Custom Connect Modal",
        size: "compact",
      }}
      theme={darkTheme({
        colors: {
          modalBg: "#281866",
          accentButtonBg: "#281866",
          connectedButtonBgHover: "#281866",
          borderColor: "rgba(256, 256,256, 0.1)",
          accentText: "rgba(256, 256,256, 0.1)",
          connectedButtonBg: "#281866",
          tertiaryBg: "rgba(256, 256,256, 0.1)",
          primaryButtonBg: "#281866",
          secondaryButtonBg: "rgba(256, 256,256, 0.1)",
          primaryButtonText: "#E7E8E9",
          primaryText: "#E7E8E9",
          separatorLine: "rgba(256, 256,256, 0.1)",
        },
      })}
    />
  );
};
