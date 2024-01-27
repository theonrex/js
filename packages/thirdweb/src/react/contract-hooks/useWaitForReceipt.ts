import type { Abi } from "abitype";
import type { ThirdwebContract } from "../../contract/index.js";
import { useQuery } from "@tanstack/react-query";
import { waitForReceipt } from "../../transaction/index.js";

export function useWaitForReceipt<abi extends Abi>({
  contract,
  transactionHash,
}: {
  contract: ThirdwebContract<abi>;
  transactionHash?: string;
}) {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [contract.chainId, "waitForReceipt", transactionHash] as const,
    queryFn: async () => {
      if (!transactionHash) {
        throw new Error("No transaction hash");
      }
      return waitForReceipt({
        contract,
        transactionHash,
      });
    },
    enabled: !!transactionHash,
  });
}
