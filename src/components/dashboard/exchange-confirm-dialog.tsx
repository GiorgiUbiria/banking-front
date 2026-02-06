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
import { USD_EUR_RATE } from "@/lib/constants"

interface PendingExchange {
  payload: { from_account_id: number; to_account_id: number; amount: string }
  fromCurrency: string
  toCurrency: string
  amount: string
  convertedAmount: number
}

interface ExchangeConfirmDialogProps {
  open: boolean
  pending: PendingExchange | null
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function ExchangeConfirmDialog({
  open,
  pending,
  isPending,
  onConfirm,
  onOpenChange,
}: ExchangeConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm exchange</AlertDialogTitle>
          <AlertDialogDescription>
            {pending && (
              <>
                Exchange {formatCurrency(Number(pending.amount), pending.fromCurrency)} for{" "}
                {formatCurrency(pending.convertedAmount, pending.toCurrency)}. Rate: 1 USD = {USD_EUR_RATE} EUR. Continue?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); onConfirm() }} disabled={isPending}>
            {isPending ? "Exchanging…" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
