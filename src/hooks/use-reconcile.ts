import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getReconcile, queryKeys } from "@/api"

export function useReconcile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: getReconcile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
    },
  })
}
