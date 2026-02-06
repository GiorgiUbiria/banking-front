import { DashboardLayout } from "@/components/dashboard-layout"

export function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-semibold">Transaction history</h1>
        <p className="text-muted-foreground">Table with filters and pagination (placeholder)</p>
      </div>
    </DashboardLayout>
  )
}
