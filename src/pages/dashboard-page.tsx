import { useState } from "react"
import { DashboardLayout } from "@/components/layout"
import { BalanceCards } from "@/components/dashboard/balance-cards"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { TransferConfirmDialog } from "@/components/dashboard/transfer-confirm-dialog"
import { ExchangeConfirmDialog } from "@/components/dashboard/exchange-confirm-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAccounts } from "@/hooks/use-accounts"
import { useTransactions } from "@/hooks/use-transactions"
import { useTransfer } from "@/hooks/use-transfer"
import { useExchange } from "@/hooks/use-exchange"
import { useReconcile } from "@/hooks/use-reconcile"
import { formatCurrency } from "@/lib/format"
import { USD_EUR_RATE } from "@/lib/constants"
import { transferSchema, exchangeSchema } from "@/lib/schemas"
import type { Account, TransferRequest } from "@/types/api"

export function DashboardPage() {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions()
  const transferMutation = useTransfer()
  const exchangeMutation = useExchange()
  const reconcileMutation = useReconcile()

  const accounts = Array.isArray(accountsData) ? accountsData : []
  const transactions = Array.isArray(transactionsData) ? transactionsData : []

  const [transferToId, setTransferToId] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferFromId, setTransferFromId] = useState<string>("")
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferFieldErrors, setTransferFieldErrors] = useState<Record<string, string>>({})

  const [exchangeFromId, setExchangeFromId] = useState<string>("")
  const [exchangeAmount, setExchangeAmount] = useState("")
  const [exchangeError, setExchangeError] = useState<string | null>(null)
  const [exchangeFieldErrors, setExchangeFieldErrors] = useState<Record<string, string>>({})

  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [pendingTransfer, setPendingTransfer] = useState<{
    payload: TransferRequest
    fromCurrency: string
    amount: string
    toAccountId: number
  } | null>(null)
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false)
  const [pendingExchange, setPendingExchange] = useState<{
    payload: { from_account_id: number; to_account_id: number; amount: string }
    fromCurrency: string
    toCurrency: string
    amount: string
    convertedAmount: number
  } | null>(null)

  const usdAccount = accounts.find((a) => a.currency === "USD")
  const eurAccount = accounts.find((a) => a.currency === "EUR")

  function getAccountById(id: number): Account | undefined {
    return accounts.find((a) => a.id === id)
  }

  function handleTransfer(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setTransferError(null)
    setTransferFieldErrors({})
    const fromId = transferFromId === "" ? undefined : Number(transferFromId)
    const result = transferSchema.safeParse({
      from_account_id: fromId,
      to_account_id: transferToId,
      amount: transferAmount,
    })
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string
        if (path) errors[path] = issue.message
      }
      setTransferFieldErrors(errors)
      return
    }
    const fromAccount = getAccountById(result.data.from_account_id)
    if (fromAccount && result.data.amount && Number(result.data.amount) > fromAccount.balance) {
      setTransferError("Insufficient funds")
      return
    }
    setPendingTransfer({
      payload: result.data,
      fromCurrency: fromAccount?.currency ?? "",
      amount: result.data.amount,
      toAccountId: result.data.to_account_id,
    })
    setTransferDialogOpen(true)
  }

  function confirmTransfer() {
    if (!pendingTransfer) return
    transferMutation.mutate(pendingTransfer.payload, {
      onSuccess: () => {
        setTransferDialogOpen(false)
        setPendingTransfer(null)
        setTransferToId("")
        setTransferAmount("")
        setTransferFromId("")
      },
      onError: (err: unknown) => {
        const msg =
          err && typeof err === "object" && "response" in err
            ? String((err as { response?: { data?: unknown } }).response?.data ?? "Transfer failed")
            : "Transfer failed"
        setTransferError(msg)
        setTransferDialogOpen(false)
        setPendingTransfer(null)
      },
    })
  }

  function handleExchange(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setExchangeError(null)
    setExchangeFieldErrors({})
    const fromId = exchangeFromId === "" ? undefined : Number(exchangeFromId)
    const toId =
      fromId === usdAccount?.id ? eurAccount?.id : fromId === eurAccount?.id ? usdAccount?.id : undefined
    if (fromId == null || toId == null) {
      setExchangeFieldErrors({ from_account_id: "Select source currency" })
      return
    }
    const result = exchangeSchema.safeParse({
      from_account_id: fromId,
      to_account_id: toId,
      amount: exchangeAmount,
    })
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string
        if (path) errors[path] = issue.message
      }
      setExchangeFieldErrors(errors)
      return
    }
    const fromAccount = getAccountById(result.data.from_account_id)
    if (fromAccount && result.data.amount && Number(result.data.amount) > fromAccount.balance) {
      setExchangeError("Insufficient funds")
      return
    }
    const toAccount = getAccountById(result.data.to_account_id)
    const amountNum = Number(result.data.amount)
    const converted =
      fromAccount?.currency === "USD"
        ? amountNum * USD_EUR_RATE
        : fromAccount?.currency === "EUR"
          ? amountNum / USD_EUR_RATE
          : 0
    setPendingExchange({
      payload: result.data,
      fromCurrency: fromAccount?.currency ?? "",
      toCurrency: toAccount?.currency ?? "",
      amount: result.data.amount,
      convertedAmount: converted,
    })
    setExchangeDialogOpen(true)
  }

  function confirmExchange() {
    if (!pendingExchange) return
    exchangeMutation.mutate(pendingExchange.payload, {
      onSuccess: () => {
        setExchangeDialogOpen(false)
        setPendingExchange(null)
        setExchangeAmount("")
        setExchangeFromId("")
      },
      onError: (err: unknown) => {
        const msg =
          err && typeof err === "object" && "response" in err
            ? String((err as { response?: { data?: unknown } }).response?.data ?? "Exchange failed")
            : "Exchange failed"
        setExchangeError(msg)
        setExchangeDialogOpen(false)
        setPendingExchange(null)
      },
    })
  }

  const exchangeFromAccount = exchangeFromId ? getAccountById(Number(exchangeFromId)) : null
  const exchangeToAccount =
    exchangeFromAccount?.currency === "USD" ? eurAccount : exchangeFromAccount?.currency === "EUR" ? usdAccount : null
  const exchangeAmountNum = exchangeAmount ? Number(exchangeAmount) : 0
  const convertedAmount =
    exchangeFromAccount?.currency === "USD" && exchangeToAccount
      ? exchangeAmountNum * USD_EUR_RATE
      : exchangeFromAccount?.currency === "EUR" && exchangeToAccount
        ? exchangeAmountNum / USD_EUR_RATE
        : 0

  return (
    <DashboardLayout>
      <div className="page-container space-y-8">
        <h1 className="page-title">Dashboard</h1>

        <section className="page-section">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="section-title mb-0">Balances</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reconcileMutation.mutate()}
              disabled={reconcileMutation.isPending}
            >
              {reconcileMutation.isPending ? "Verifying…" : "Verify balances"}
            </Button>
          </div>
          {reconcileMutation.data && (
            <p
              className={`text-sm mb-2 ${
                reconcileMutation.data.all_match ? "text-muted-foreground" : "text-destructive"
              }`}
            >
              {reconcileMutation.data.all_match
                ? "All balances OK"
                : `Mismatch: ${reconcileMutation.data.accounts
                    .filter((a) => !a.match)
                    .map((a) => `${a.currency} (stored ${a.stored_balance} vs ledger ${a.ledger_sum})`)
                    .join("; ")}`}
            </p>
          )}
          <BalanceCards accounts={accounts} isLoading={accountsLoading} />
        </section>

        <section className="page-section">
          <h2 className="section-title">Recent transactions</h2>
          <RecentTransactions transactions={transactions} isLoading={transactionsLoading} />
        </section>

        <section className="page-section">
          <Card className="shadow-(--shadow-card)">
            <CardHeader>
              <CardTitle>Transfer</CardTitle>
              <CardDescription>Send money to another account (same currency).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>From account</FieldLabel>
                      <Select
                        value={transferFromId}
                        onValueChange={setTransferFromId}
                        disabled={transferMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc, i) => (
                            <SelectItem key={acc.id ?? `acc-${i}`} value={String(acc.id)}>
                              {acc.currency} — {formatCurrency(acc.balance, acc.currency)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={
                          transferFieldErrors.from_account_id
                            ? [{ message: transferFieldErrors.from_account_id }]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="transfer-to">Recipient account ID</FieldLabel>
                      <Input
                        id="transfer-to"
                        type="number"
                        min={1}
                        placeholder="Account ID"
                        value={transferToId}
                        onChange={(e) => setTransferToId(e.target.value)}
                        disabled={transferMutation.isPending}
                        aria-invalid={!!transferFieldErrors.to_account_id}
                      />
                      <FieldError
                        errors={
                          transferFieldErrors.to_account_id
                            ? [{ message: transferFieldErrors.to_account_id }]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="transfer-amount">Amount</FieldLabel>
                      <Input
                        id="transfer-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        disabled={transferMutation.isPending}
                        aria-invalid={!!transferFieldErrors.amount}
                      />
                      <FieldError
                        errors={
                          transferFieldErrors.amount ? [{ message: transferFieldErrors.amount }] : undefined
                        }
                      />
                    </Field>
                  </FieldGroup>
                  {transferError && (
                    <p role="alert" className="text-destructive text-sm">
                      {transferError}
                    </p>
                  )}
                  <Button type="submit" disabled={transferMutation.isPending}>
                    {transferMutation.isPending ? "Transferring…" : "Transfer"}
                  </Button>
                </FieldSet>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="page-section">
          <Card className="shadow-(--shadow-card)">
            <CardHeader>
              <CardTitle>Exchange</CardTitle>
              <CardDescription>
                Convert between your USD and EUR accounts. Rate: 1 USD = {USD_EUR_RATE} EUR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExchange} className="space-y-4">
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>From currency</FieldLabel>
                      <Select
                        value={exchangeFromId}
                        onValueChange={setExchangeFromId}
                        disabled={exchangeMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {usdAccount && (
                            <SelectItem key="usd" value={String(usdAccount.id)}>
                              USD — {formatCurrency(usdAccount.balance, "USD")}
                            </SelectItem>
                          )}
                          {eurAccount && (
                            <SelectItem key="eur" value={String(eurAccount.id)}>
                              EUR — {formatCurrency(eurAccount.balance, "EUR")}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={
                          exchangeFieldErrors.from_account_id
                            ? [{ message: exchangeFieldErrors.from_account_id }]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="exchange-amount">Amount</FieldLabel>
                      <Input
                        id="exchange-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(e.target.value)}
                        disabled={exchangeMutation.isPending}
                        aria-invalid={!!exchangeFieldErrors.amount}
                      />
                      <FieldError
                        errors={
                          exchangeFieldErrors.amount ? [{ message: exchangeFieldErrors.amount }] : undefined
                        }
                      />
                    </Field>
                    {exchangeFromAccount && exchangeToAccount && exchangeAmountNum > 0 && (
                      <p className="text-muted-foreground text-sm">
                        You will receive{" "}
                        <strong>
                          {formatCurrency(convertedAmount, exchangeToAccount.currency)}
                        </strong>{" "}
                        ({exchangeToAccount.currency})
                      </p>
                    )}
                  </FieldGroup>
                  {exchangeError && (
                    <p role="alert" className="text-destructive text-sm">
                      {exchangeError}
                    </p>
                  )}
                  <Button type="submit" disabled={exchangeMutation.isPending}>
                    {exchangeMutation.isPending ? "Exchanging…" : "Exchange"}
                  </Button>
                </FieldSet>
              </form>
            </CardContent>
          </Card>
        </section>

        <TransferConfirmDialog
          open={transferDialogOpen}
          pending={pendingTransfer}
          isPending={transferMutation.isPending}
          onConfirm={confirmTransfer}
          onOpenChange={(open) => {
            setTransferDialogOpen(open)
            if (!open) setPendingTransfer(null)
          }}
        />

        <ExchangeConfirmDialog
          open={exchangeDialogOpen}
          pending={pendingExchange}
          isPending={exchangeMutation.isPending}
          onConfirm={confirmExchange}
          onOpenChange={(open) => {
            setExchangeDialogOpen(open)
            if (!open) setPendingExchange(null)
          }}
        />
      </div>
    </DashboardLayout>
  )
}
