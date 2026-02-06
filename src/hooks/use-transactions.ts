import { useQuery } from "@tanstack/react-query"
import { getTransactions, queryKeys } from "@/api"

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: getTransactions,
  })
}
