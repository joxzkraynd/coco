"use client"

import { useState } from "react"
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
import { signUp } from "@/app/actions"
import Link from "next/link"

const formSchema = z
  .object({
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("confirmPassword", data.confirmPassword)
    formData.append("origin", window.location.origin)

    const result = await signUp(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (!result.confirmationRequired) {
      router.push("/")
      router.refresh()
      return
    }

    setSuccess(true)
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
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form id="form-sign-up" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <IconAlertCircle />
                  <AlertTitle>Sign up failed</AlertTitle>
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
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="form-sign-up"
            className="w-full"
            disabled={loading}
          >
            {loading && <Spinner />}
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
