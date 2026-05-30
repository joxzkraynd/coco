import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user
    ? { email: data.user.email ?? undefined }
    : null

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  )
}
