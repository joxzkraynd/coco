import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default function VerifyEmailPage() {
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
