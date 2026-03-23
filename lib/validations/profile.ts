import type { RegisterOptions } from "react-hook-form"
import type { CompleteProfileFormData } from "@/types"

export interface ProfileValidationMessages {
  invalidDate: string
  invalidGender: string
  invalidCountry: string
  invalidCity: string
}

export function getProfileRules(v: ProfileValidationMessages) {
  return {
    birthday: {
      validate: (value: string | undefined) => {
        if (!value) return true
        const parsedDate = new Date(value)
        if (Number.isNaN(parsedDate.getTime())) return v.invalidDate
        return parsedDate < new Date() || v.invalidDate
      },
    } satisfies RegisterOptions<CompleteProfileFormData, "birthday">,

    gender: {
      validate: (value: CompleteProfileFormData["gender"]) => {
        if (!value) return true
        return value === "male" || value === "female" || v.invalidGender
      },
    } satisfies RegisterOptions<CompleteProfileFormData, "gender">,

    country: {
      validate: (value: string | undefined) => {
        if (!value) return true
        return value.trim().length > 0 || v.invalidCountry
      },
    } satisfies RegisterOptions<CompleteProfileFormData, "country">,

    city: {
      validate: (value: string | undefined) => {
        if (!value) return true
        return value.trim().length > 0 || v.invalidCity
      },
    } satisfies RegisterOptions<CompleteProfileFormData, "city">,
  }
}
