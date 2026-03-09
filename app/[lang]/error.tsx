"use client"

import { ServerErrorPage } from "@/components/pages/errors"

export default function Error({ reset }: { reset: () => void }) {
  return <ServerErrorPage reset={reset} />
}
