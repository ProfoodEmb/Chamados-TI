import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"

export default async function ExtensoesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/login")
  }

  if (
    session.user.role === "admin" ||
    session.user.role === "lider_infra" ||
    session.user.role === "lider_sistemas"
  ) {
    redirect("/ti/extensoes")
  }

  redirect("/")
}
