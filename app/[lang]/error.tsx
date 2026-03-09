"use client"

import { ServerErrorPage } from "@/components/pages/errors/server-error/ServerErrorPage"

export default function Error({ reset }: { reset: () => void }) {
  return <ServerErrorPage reset={reset} />
}
