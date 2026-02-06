import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency } from "@/lib/format"
import type { TransferRequest } from "@/types/api"

interface PendingTransfer {
  payload: TransferRequest
  fromCurrency: string
  amount: string
  toAccountId: number
}

interface TransferConfirmDialogProps {
  open: boolean
  pending: PendingTransfer | null
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function TransferConfirmDialog({
  open,
  pending,
  isPending,
  onConfirm,
  onOpenChange,
}: TransferConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm transfer</AlertDialogTitle>
          <AlertDialogDescription>
            {pending && (
              <>
                Transfer {formatCurrency(Number(pending.amount), pending.fromCurrency)} to account{" "}
                <strong>{pending.toAccountId}</strong>. Continue?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); onConfirm() }} disabled={isPending}>
            {isPending ? "Transferring…" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
