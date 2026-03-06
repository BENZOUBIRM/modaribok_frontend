/**
 * ──────────────────────────────────────────────────────────────
 * Auth Form Validation — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Types, regex patterns, and i18n-aware validation rule factories
 * for use with React Hook Form's built-in `register` rules.
 */

import type { RegisterOptions } from "react-hook-form"

/* ──────────────── Form Data Types ──────────────── */

export interface LoginFormData {
  emailOrPhone: string
  password: string
}

export interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  profileImage: File | null
}

/* ──────────────── Regex Patterns ──────────────── */

/** Valid email — simple RFC-compatible pattern */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Loose phone number pattern: optional +, then 7–15 digits */
export const PHONE_LOOSE_REGEX = /^\+?\d{7,15}$/

/** Must not contain digits */
export const NO_NUMBERS_REGEX = /^[^\d]*$/

/** Must contain only letters, spaces, hyphens, and apostrophes */
export const NAME_CHARS_REGEX = /^[\p{L}\s'-]+$/u

/** At least one uppercase ASCII letter */
export const HAS_UPPERCASE = /[A-Z]/

/** At least one lowercase ASCII letter */
export const HAS_LOWERCASE = /[a-z]/

/** At least one digit */
export const HAS_NUMBER = /\d/

/** At least one special character */
export const HAS_SYMBOL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/

/* ──────────────── Validation Dictionary Type ──────────────── */

/**
 * The `auth.validation` section from the i18n dictionary.
 * Accepting a loose type so callers can pass `dictionary.auth.validation` directly.
 */
export interface ValidationMessages {
  fieldRequired: string
  looksGood: string
  nameNoNumbers: string
  nameNoSymbols: string
  nameMinLength: string
  nameMaxLength: string
  emailFormat: string
  emailOrPhoneFormat: string
  passwordMinLength: string
  passwordUppercase: string
  passwordLowercase: string
  passwordNumber: string
  passwordSymbol: string
  passwordRequirements: string
  phoneInvalid: string
  phoneRequired: string
}

/* ──────────────── Password Requirements Helper ──────────────── */

export interface PasswordRequirement {
  label: string
  met: boolean
}

/** Returns the 5 password requirements with live met/unmet state. */
export function getPasswordRequirements(
  password: string,
  v: ValidationMessages,
): PasswordRequirement[] {
  return [
    { label: v.passwordMinLength, met: password.length >= 8 },
    { label: v.passwordUppercase, met: HAS_UPPERCASE.test(password) },
    { label: v.passwordLowercase, met: HAS_LOWERCASE.test(password) },
    { label: v.passwordNumber, met: HAS_NUMBER.test(password) },
    { label: v.passwordSymbol, met: HAS_SYMBOL.test(password) },
  ]
}

/** True when all 5 password requirements are satisfied. */
export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    HAS_UPPERCASE.test(password) &&
    HAS_LOWERCASE.test(password) &&
    HAS_NUMBER.test(password) &&
    HAS_SYMBOL.test(password)
  )
}

/* ──────────────── Login Validation Rules ──────────────── */

export function getLoginRules(v: ValidationMessages) {
  return {
    emailOrPhone: {
      required: v.fieldRequired,
      validate: (value: string) => {
        const trimmed = value.trim()
        if (trimmed.includes("@")) {
          return EMAIL_REGEX.test(trimmed) || v.emailOrPhoneFormat
        }
        // Treat as phone: strip spaces, dashes, parens
        const digits = trimmed.replace(/[\s\-().]/g, "")
        return PHONE_LOOSE_REGEX.test(digits) || v.emailOrPhoneFormat
      },
    } satisfies RegisterOptions<LoginFormData, "emailOrPhone">,

    password: {
      required: v.fieldRequired,
    } satisfies RegisterOptions<LoginFormData, "password">,
  }
}

/* ──────────────── Signup Validation Rules ──────────────── */

export function getSignupRules(v: ValidationMessages) {
  return {
    firstName: {
      required: v.fieldRequired,
      minLength: { value: 2, message: v.nameMinLength },
      maxLength: { value: 30, message: v.nameMaxLength },
      validate: {
        noNumbers: (val: string) => NO_NUMBERS_REGEX.test(val) || v.nameNoNumbers,
        validChars: (val: string) => NAME_CHARS_REGEX.test(val) || v.nameNoSymbols,
      },
    } satisfies RegisterOptions<SignupFormData, "firstName">,

    lastName: {
      required: v.fieldRequired,
      minLength: { value: 2, message: v.nameMinLength },
      maxLength: { value: 30, message: v.nameMaxLength },
      validate: {
        noNumbers: (val: string) => NO_NUMBERS_REGEX.test(val) || v.nameNoNumbers,
        validChars: (val: string) => NAME_CHARS_REGEX.test(val) || v.nameNoSymbols,
      },
    } satisfies RegisterOptions<SignupFormData, "lastName">,

    email: {
      required: v.fieldRequired,
      pattern: {
        value: EMAIL_REGEX,
        message: v.emailFormat,
      },
    } satisfies RegisterOptions<SignupFormData, "email">,

    phone: {
      required: v.phoneRequired,
    },

    password: {
      required: v.fieldRequired,
      validate: {
        strong: (val: string) => isPasswordValid(val) || v.passwordMinLength,
      },
    } satisfies RegisterOptions<SignupFormData, "password">,
  }
}
