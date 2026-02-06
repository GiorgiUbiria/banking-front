import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { login, getMe } from "@/api"
import { setAuthToken } from "@/lib/api-client"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
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

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/"

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormValues, string>> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof LoginFormValues
        if (path) errors[path] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      const { token } = await login(result.data)
      setAuthToken(token)
      const user = await getMe()
      setAuth(token, user)
      queryClient.clear()
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: unknown; status?: number } }).response?.status === 401
            ? "Invalid email or password"
            : String((err as { response?: { data?: unknown } }).response?.data ?? "Login failed")
          : err instanceof Error
            ? err.message
            : "Login failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldSet className="gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!fieldErrors.email}
                  />
                  <FieldError errors={fieldErrors.email ? [{ message: fieldErrors.email }] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!fieldErrors.password}
                  />
                  <FieldError errors={fieldErrors.password ? [{ message: fieldErrors.password }] : undefined} />
                </Field>
              </FieldGroup>
              {error && (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
