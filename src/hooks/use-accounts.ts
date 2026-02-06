import { useQuery } from "@tanstack/react-query"
import { getAccounts, queryKeys } from "@/api"

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: getAccounts,
  })
}
