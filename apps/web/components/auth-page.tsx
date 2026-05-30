"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconAlertCircle } from "@tabler/icons-react"
import { Controller, useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as z from "zod"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { signIn, signUp } from "@/app/actions"

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

const signUpSchema = z
  .object({
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type Mode = "sign-in" | "sign-up"

const config = {
  "sign-in": {
    schema: signInSchema,
    action: signIn,
    title: "Sign in to your account",
    description: "Enter your email below to sign in to your account",
    actionLabel: "Sign Up",
    actionHref: "/sign-up",
    buttonLabel: "Sign in",
    buttonLoadingLabel: "Signing in...",
  },
  "sign-up": {
    schema: signUpSchema,
    action: signUp,
    title: "Create an account",
    description: "Enter your email below to create your account",
    actionLabel: "Sign In",
    actionHref: "/sign-in",
    buttonLabel: "Create Account",
    buttonLoadingLabel: "Creating account...",
  },
} as const

export function AuthPage({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const isSignUp = mode === "sign-up"
  const c = config[mode]

  const form = useForm({
    resolver: zodResolver(c.schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (isSignUp) return
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get("error")
    if (errorParam) {
      const messages: Record<string, string> = {
        auth_callback_error:
          "Authentication failed. Please try signing in again.",
      }
      setError(messages[errorParam] ?? errorParam)
    }
  }, [isSignUp])

  async function onSubmit(data: { email: string; password: string; confirmPassword?: string }) {
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    if (isSignUp) {
      formData.append("origin", window.location.origin)
    }

    const result = await c.action(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (isSignUp && "confirmationRequired" in result && result.confirmationRequired) {
      setSuccess(true)
      return
    }

    router.push("/")
    router.refresh()
  }

  if (success) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              A confirmation link has been sent to your email address.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{c.title}</CardTitle>
          <CardDescription>{c.description}</CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link href={c.actionHref}>{c.actionLabel}</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form id={`form-${mode}`} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <IconAlertCircle />
                  <AlertTitle>{c.title}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {isSignUp && (
                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm Password
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form={`form-${mode}`}
            className="w-full"
            disabled={loading}
          >
            {loading && <Spinner />}
            {loading ? c.buttonLoadingLabel : c.buttonLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
