import { useQuery } from "@tanstack/react-query"
import { getLedger, queryKeys } from "@/api"

export function useLedger(params?: {
  tx_id?: number
  account_id?: number
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: queryKeys.ledger(params),
    queryFn: () => getLedger(params),
  })
}
