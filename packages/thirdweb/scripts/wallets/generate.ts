/* eslint-disable better-tree-shaking/no-top-level-side-effects */

import { writeFile } from "fs/promises";
import { rm, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { format } from "prettier";
import sharp from "sharp";

const allWalletsJson = JSON.parse(
  await readFile(join(__dirname, "./all-wallets.json"), "utf-8"),
);

type Wallet = {
  id: string;
  name: string;
  homepage: string;
  image_id: string;
  order: number;
  app: {
    browser: string | null;
    ios: string | null;
    android: string | null;
    mac: string | null;
    windows: string | null;
    linux: string | null;
    chrome: string | null;
    firefox: string | null;
    safari: string | null;
    edge: string | null;
    opera: string | null;
  };
  injected: Array<{
    injected_id: string;
    namespace: string;
  }> | null;
  rdns: string | null;
  mobile: {
    native: string | null;
    universal: string | null;
  };
  desktop: {
    native: string | null;
    universal: string | null;
  };
};

const allWalletsArray = Object.values(allWalletsJson.listings) as Wallet[];

function rdns(wallet: Wallet) {
  // prefer the rdns if it exists
  if (wallet.rdns) {
    return wallet.rdns;
  }
  // otherwise compute it from the homepage
  return new URL(wallet.homepage).hostname
    .split(".")
    .filter((s) => s !== "www")
    .reverse()
    .join(".");
}

const allWalletsWithIds = allWalletsArray.map((wallet) => {
  delete (wallet as any).order;
  delete (wallet as any).injected;
  return { ...wallet, id: rdns(wallet) };
});

// filter duplicate ids, we'll keep the first ones

// generate walletInfos

const walletConnectSupportedWallets = allWalletsWithIds.filter((w) => {
  // TODO bring back desktop wallets once supported
  return w.mobile.universal || w.mobile.native;
});

const injectedSupportedWallets = allWalletsWithIds.filter((w) => {
  return !!(w.rdns || w.injected);
});

const allSupportedWallets = walletConnectSupportedWallets
  .concat(injectedSupportedWallets)
  .filter(
    (wallet, index, self) =>
      index === self.findIndex((t) => t.id === wallet.id),
  );

const walletInfos = allSupportedWallets.map((wallet) => {
  return { id: wallet.id, name: wallet.name };
});

const customWalletInfos = [
  {
    id: "smart",
    name: "Smart Wallet",
  },
  {
    id: "inApp",
    name: "In-App Wallet",
  },
  {
    id: "walletConnect",
    name: "WalletConnect",
  },
];

// clean the __geneated__ folder within `src/wallets/` directory
const OUT_PATH = join(__dirname, "../../src/wallets/__generated__");

await rm(OUT_PATH, { recursive: true });
await mkdir(OUT_PATH, { recursive: true });

// generate a typescript file with all the wallet ids

await writeFile(
  join(OUT_PATH, "wallet-ids.ts"),
  await format(
    `// This file is auto-generated by the \`scripts/wallets/generate.ts\` script.
// Do not modify this file manually.

// ${walletConnectSupportedWallets.length} wallets
export type WCSupportedWalletIds = ${walletConnectSupportedWallets
      .map((w) => {
        return `"${w.id}"`;
      })
      .join(" | ")};

// ${injectedSupportedWallets.length} wallets
export type InjectedSupportedWalletIds = ${injectedSupportedWallets
      .map((w) => {
        return `"${w.id}"`;
      })
      .join(" | ")};
`,
    {
      parser: "babel-ts",
    },
  ),
);

// write wallet infos to a typescript file
await writeFile(
  join(OUT_PATH, "wallet-infos.ts"),
  await format(
    `// This file is auto-generated by the \`scripts/wallets/generate.ts\` script.
// Do not modify this file manually.

/**
 * @internal
 */
export type MinimalWalletInfo = {
  id: string;
  name: string;
};

/**
 * @internal
 */
const ALL_MINIMAL_WALLET_INFOS = <const>${JSON.stringify([...walletInfos, ...customWalletInfos], null, 2)} satisfies MinimalWalletInfo[];

export default ALL_MINIMAL_WALLET_INFOS;
`,
    {
      parser: "babel-ts",
    },
  ),
);

// for each wallet, generate a folder within the `src/wallets/__generated__` directory
// and write a `index.ts` file with the wallet's information
const p: Promise<any>[] = [];
for (const wallet of allSupportedWallets) {
  p.push(
    (async () => {
      const walletDir = join(OUT_PATH, "wallet", wallet.id);
      await mkdir(walletDir, { recursive: true });
      await writeFile(
        join(walletDir, "index.ts"),
        await format(
          `// This file is auto-generated by the \`scripts/wallets/generate.ts\` script.
// Do not modify this file manually.

export const wallet = ${JSON.stringify(wallet, null, 2)} as const;
`,
          {
            parser: "babel-ts",
          },
        ),
      );

      // download the wallet's image
      const image = await fetch(
        `https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/${wallet.image_id}?projectId=145769e410f16970a79ff77b2d89a1e0&`,
      );
      const arrBuff = await image.arrayBuffer();

      const resized = await sharp(arrBuff).resize(128, 128).webp().toBuffer();
      // arrayBuffer to base64 webp

      const base64Flag = "data:image/webp;base64,";
      // eslint-disable-next-line no-restricted-globals

      // write the image to the wallet's folder in a typescript file
      await writeFile(
        join(walletDir, "image.ts"),
        await format(
          `// This file is auto-generated by the \`scripts/wallets/generate.ts\` script.
  // Do not modify this file manually.

  const image = "${base64Flag}${resized.toString("base64")}";

  export default image;
  `,
          {
            parser: "babel-ts",
          },
        ),
      );
    })(),
  );
}

await Promise.all(p);

// generate a switch case file of lazy imports

const walletImports = allSupportedWallets
  .map(
    (wallet) =>
      `case "${wallet.id}": {
        return (
          image
            ? import("./wallet/${wallet.id}/image.js").then((img) => img.default)
            : import("./wallet/${wallet.id}/index.js").then((w) => w.wallet)
        ) as Promise<[TImage] extends [true] ? string : any>;
}`,
  )
  .join("\n");

const customWalletImports = ["smart", "inApp", "walletConnect"]
  .map(
    (walletId) =>
      `case "${walletId}": {
        return (
          image
            ? import("../custom/${walletId}/image.js").then((img) => img.default)
            : import("../custom/${walletId}/index.js").then((w) => w.wallet)
        ) as Promise<[TImage] extends [true] ? string : any>;
}`,
  )
  .join("\n");

await writeFile(
  join(OUT_PATH, "getWalletInfo.ts"),
  await format(
    `// This file is auto-generated by the \`scripts/wallets/generate.ts\` script.
// Do not modify this file manually.
import type { WalletInfo } from "../wallet-info.js";
import type { WalletId } from "../wallet-types.js";

/**
 * Retrieves the wallet based on the provided ID.
 * @param id - The ID of the wallet.
 * @returns A promise that resolves to the wallet.
 * @internal
 */
export async function getWalletInfo<TImage extends boolean>(id: WalletId, image?: TImage): Promise<[TImage] extends [true] ? string : WalletInfo> {
  switch (id) {
    ${customWalletImports}
    ${walletImports}
    default: {
      throw new Error(\`Wallet with id \${id} not found\`);
    }
  }
}
`,
    {
      parser: "babel-ts",
    },
  ),
);
