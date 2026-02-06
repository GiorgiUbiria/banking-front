import { useMutation, useQueryClient } from "@tanstack/react-query"
import { exchange, queryKeys } from "@/api"
import type { ExchangeRequest } from "@/types/api"

export function useExchange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ExchangeRequest) => exchange(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
    },
  })
}
