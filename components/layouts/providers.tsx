"use client"

import { SimpleToast } from "@/components/shared/toasts/simple-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SimpleToast />
    </>
  )
}
