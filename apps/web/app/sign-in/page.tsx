"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconAlertCircle } from "@tabler/icons-react"
import { Controller, useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
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
import { signIn } from "@/app/actions"
import Link from "next/link"

const formSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
})

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get("error")
    if (errorParam) {
      const messages: Record<string, string> = {
        auth_callback_error:
          "Authentication failed. Please try signing in again.",
      }
      setError(messages[errorParam] ?? errorParam)
    }
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)

    const result = await signIn(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email below to sign in to your account
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form id="form-sign-in" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <IconAlertCircle />
                  <AlertTitle>Sign in failed</AlertTitle>
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
                    <FieldLabel htmlFor={field.name}>
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="form-sign-in"
            className="w-full"
            disabled={loading}
          >
            {loading && <Spinner />}
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
