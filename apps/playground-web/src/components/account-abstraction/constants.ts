import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { THIRDWEB_CLIENT } from "../../lib/client";

export const chain = sepolia;
export const editionDropAddress = "0xfa794e50883acA1D59739D4a8a93843DCdFE6099";
export const editionDropTokenId = 0n;

export const editionDropContract = getContract({
  address: editionDropAddress,
  chain,
  client: THIRDWEB_CLIENT,
});
