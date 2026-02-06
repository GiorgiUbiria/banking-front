import { NavLink, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm font-medium transition-colors rounded-md px-3 py-2",
    isActive
      ? "text-foreground bg-muted"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
  )

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  function handleLogout() {
    queryClient.clear()
    clearAuth()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="container flex items-center justify-between" style={{ height: "var(--header-height)" }}>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/transactions" className={navLinkClass}>
              Transactions
            </NavLink>
            <NavLink to="/ledger" className={navLinkClass}>
              Ledger
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm truncate max-w-[180px] sm:max-w-none">
              {user?.name ?? user?.email}
            </span>
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
