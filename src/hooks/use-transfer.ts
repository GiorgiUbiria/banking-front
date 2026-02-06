import { useMutation, useQueryClient } from "@tanstack/react-query"
import { transfer, queryKeys } from "@/api"
import type { TransferRequest } from "@/types/api"

export function useTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: TransferRequest) => transfer(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
    },
  })
}
