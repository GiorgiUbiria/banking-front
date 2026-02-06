import { useQuery } from "@tanstack/react-query"
import { getTransactions, queryKeys } from "@/api"

export function useTransactions(params?: {
  type?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.transactionsFiltered(
      params?.type,
      params?.page,
      params?.limit,
    ),
    queryFn: () => getTransactions(params),
  })
}
