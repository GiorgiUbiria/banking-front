import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    clearAuth()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-12 items-center justify-between">
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link to="/transactions" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Transactions
            </Link>
            <Link to="/ledger" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Ledger
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">{user?.name ?? user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
