import * as React from "react"
import type { FieldErrors, FieldValues, Path, UseFormTrigger } from "react-hook-form"
import { useDictionary } from "@/providers/dictionary-provider"

/**
 * After a client-side language switch, re-triggers RHF validation
 * for fields that currently have errors so their messages update
 * to the new language.
 */
export function useRetriggerOnLangChange<T extends FieldValues>(
  errors: FieldErrors<T>,
  trigger: UseFormTrigger<T>,
) {
  const { lang } = useDictionary()
  const prevLangRef = React.useRef(lang)
  const errorsRef = React.useRef(errors)
  errorsRef.current = errors

  React.useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang
      const errorFieldNames = Object.keys(errorsRef.current) as Path<T>[]
      if (errorFieldNames.length > 0) {
        trigger(errorFieldNames)
      }
    }
  }, [lang, trigger])
}
