"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { useAuth } from "@/providers/auth-provider"
import { useDictionary } from "@/providers/dictionary-provider"
import { useNavRouter } from "@/hooks/use-nav-router"
import { profileService } from "@/services/api"
import { setStoredUser } from "@/services/api/client"
import type { CompleteProfileFormData, CompleteProfileRequest, CountryOption, Sport, UserProfile } from "@/types"
import { InputField } from "@/components/ui/input-field"
import { SelectField } from "@/components/ui/select-field"
import { Callout } from "@/components/ui/callout"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/primitives/label"
import { Calendar } from "@/components/ui/primitives/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover"
import { cn } from "@/lib/utils"
import { loadCitiesByCountry, loadCountries } from "@/lib/country-city"
import { getProfileRules } from "@/lib/validations/profile"

type ProfileFormData = Omit<CompleteProfileFormData, "country"> & {
  country: string
}

function getIncompleteProfile(profile: UserProfile): boolean {
  return !profile.gender || !profile.birthday || !profile.country || !profile.city
}

function toDateInputValue(date: string | null): string {
  if (!date) return ""
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().slice(0, 10)
}

function fromDateInputValue(date: string): Date | undefined {
  if (!date) return undefined
  const [year, month, day] = date.split("-").map(Number)
  if (!year || !month || !day) return undefined

  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed
}

function toLocalDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface ProfileSectionLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

function ProfileSectionLayoutEn({ title, description, children }: ProfileSectionLayoutProps) {
  return (
    <div dir="ltr" className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="border-b bg-muted/20 px-6 py-8 text-left xl:border-b-0">
        <h3 className="text-2xl font-extrabold text-primary">{title}</h3>
        <p className="mt-3 max-w-[14rem] text-sm leading-7 text-muted-foreground">{description}</p>
      </div>

      <div className="px-6 py-8 md:px-8 xl:border-l">
        {children}
      </div>
    </div>
  )
}

function ProfileSectionLayoutAr({ title, description, children }: ProfileSectionLayoutProps) {
  return (
    <div dir="ltr" className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px]">
      <div className="order-2 px-6 py-8 md:px-8 xl:order-1">
        {children}
      </div>

      <div className="order-1 border-b bg-muted/20 px-6 py-8 text-right xl:order-2 xl:border-b-0 xl:border-l">
        <h3 className="text-2xl font-extrabold text-primary">{title}</h3>
        <p className="mt-3 max-w-[14rem] text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { dictionary, lang, isRTL } = useDictionary()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useNavRouter()

  const t = dictionary.profile

  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [sports, setSports] = React.useState<Sport[]>([])
  const [countries, setCountries] = React.useState<CountryOption[]>([])
  const [cities, setCities] = React.useState<Array<{ id: number; name: string }>>([])
  const [isCitiesLoading, setIsCitiesLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(true)
  const [showIncompleteReminder, setShowIncompleteReminder] = React.useState(false)
  const [phoneDraft, setPhoneDraft] = React.useState("")
  const [emailDraft, setEmailDraft] = React.useState("")
  const [countrySearch, setCountrySearch] = React.useState("")
  const [countryMenuOpen, setCountryMenuOpen] = React.useState(false)
  const [citySearch, setCitySearch] = React.useState("")
  const [cityMenuOpen, setCityMenuOpen] = React.useState(false)
  const [birthdayOpen, setBirthdayOpen] = React.useState(false)
  const countryDropdownRef = React.useRef<HTMLDivElement | null>(null)
  const cityDropdownRef = React.useRef<HTMLDivElement | null>(null)
  const countryTriggerRef = React.useRef<HTMLButtonElement | null>(null)
  const cityTriggerRef = React.useRef<HTMLButtonElement | null>(null)
  const birthdayTriggerId = React.useId()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = useForm<ProfileFormData>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      birthday: "",
      country: "",
      city: "",
      sports: [],
    },
  })

  const rules = getProfileRules({
    invalidDate: t.validation.invalidDate,
    invalidGender: t.validation.invalidGender,
    invalidCountry: t.validation.invalidCountry,
    invalidCity: t.validation.invalidCity,
  })

  const selectedCountryId = useWatch({ control, name: "country" })
  const selectedCityValue = useWatch({ control, name: "city" })
  const watchedFirstName = useWatch({ control, name: "firstName" })
  const watchedLastName = useWatch({ control, name: "lastName" })

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${lang}/login`)
    }
  }, [isAuthenticated, isLoading, lang, router])

  React.useEffect(() => {
    if (!isAuthenticated) return

    let isMounted = true

    const hydrate = async () => {
      setIsFetching(true)

      const [profileResult, sportsResult, countriesResult] = await Promise.all([
        profileService.getMyProfile(),
        profileService.getSports(),
        loadCountries(),
      ])

      if (!isMounted) return

      if (sportsResult.success && sportsResult.data) {
        setSports(sportsResult.data)
      }

      setCountries(countriesResult)

      if (profileResult.success && profileResult.data) {
        const loadedProfile = profileResult.data
        setProfile(loadedProfile)

        const simpleUser = {
          id: loadedProfile.id,
          firstName: loadedProfile.firstName,
          lastName: loadedProfile.lastName,
          email: loadedProfile.email,
          phone: loadedProfile.phone,
          role: loadedProfile.role === "ADMIN" ? "ADMIN" : "USER",
          profileImageUrl: loadedProfile.profileImageUrl,
        }
        setStoredUser(simpleUser)

        reset({
          firstName: loadedProfile.firstName,
          lastName: loadedProfile.lastName,
          gender: loadedProfile.gender ?? undefined,
          birthday: toDateInputValue(loadedProfile.birthday),
          country: "",
          city: loadedProfile.city ?? "",
          sports: loadedProfile.sports ?? [],
        })

        if (loadedProfile.country) {
          const selectedCountry = countriesResult.find((country) => country.name === loadedProfile.country)
          if (selectedCountry) {
            setValue("country", String(selectedCountry.id), {
              shouldDirty: false,
              shouldValidate: false,
            })

            try {
              setIsCitiesLoading(true)
              const cityOptions = await loadCitiesByCountry(selectedCountry.id)
              if (isMounted) {
                setCities(cityOptions)
              }
            } catch {
              if (isMounted) {
                setCities([])
              }
            } finally {
              if (isMounted) {
                setIsCitiesLoading(false)
              }
            }
          }
        }

        setShowIncompleteReminder(getIncompleteProfile(loadedProfile))
        setPhoneDraft(loadedProfile.phone ?? "")
        setEmailDraft(loadedProfile.email ?? "")
      }

      setIsFetching(false)
    }

    hydrate()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, reset, setValue])

  React.useEffect(() => {
    let isMounted = true

    const loadCities = async () => {
      if (!selectedCountryId) {
        setCities([])
        setCityMenuOpen(false)
        setValue("city", "", { shouldDirty: true, shouldValidate: true })
        return
      }

      const selectedCountry = countries.find((country) => String(country.id) === selectedCountryId)
      if (!selectedCountry) {
        setCities([])
        setCityMenuOpen(false)
        setValue("city", "", { shouldDirty: true, shouldValidate: true })
        return
      }

      try {
        setIsCitiesLoading(true)
        const options = await loadCitiesByCountry(selectedCountry.id)

        if (isMounted) {
          setCities(options)

          const currentCity = getValues("city")
          if (currentCity) {
            const isValidCity = options.some((city) => city.name === currentCity)
            if (!isValidCity) {
              setValue("city", "", { shouldDirty: true, shouldValidate: true })
            }
          }
        }
      } catch {
        if (isMounted) {
          setCities([])
        }
      } finally {
        if (isMounted) {
          setIsCitiesLoading(false)
        }
      }
    }

    loadCities()

    return () => {
      isMounted = false
    }
  }, [selectedCountryId, countries, getValues, setValue])

  React.useEffect(() => {
    if (!countryMenuOpen) {
      setCountrySearch("")
    }
  }, [countryMenuOpen])

  React.useEffect(() => {
    if (!cityMenuOpen) {
      setCitySearch("")
    }
  }, [cityMenuOpen])

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node

      if (countryMenuOpen && countryDropdownRef.current && !countryDropdownRef.current.contains(target)) {
        setCountryMenuOpen(false)
      }

      if (cityMenuOpen && cityDropdownRef.current && !cityDropdownRef.current.contains(target)) {
        setCityMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [countryMenuOpen, cityMenuOpen])

  const countrySelectOptions = React.useMemo(
    () =>
      countries.map((country) => ({
        value: String(country.id),
        label: country.name,
        iso2: country.iso2,
        searchText: `${country.iso2} ${country.name}`,
      })),
    [countries],
  )

  const citySelectOptions = React.useMemo(
    () =>
      cities.map((city) => ({
        value: city.name,
        label: city.name,
      })),
    [cities],
  )

  const filteredCountryOptions = React.useMemo(
    () =>
      countrySelectOptions.filter((country) =>
        country.searchText.toLowerCase().includes(countrySearch.trim().toLowerCase()),
      ),
    [countrySearch, countrySelectOptions],
  )

  const filteredCityOptions = React.useMemo(
    () =>
      citySelectOptions.filter((city) =>
        String(city.label).toLowerCase().includes(citySearch.trim().toLowerCase()),
      ),
    [citySearch, citySelectOptions],
  )

  const selectedCountryOption =
    countrySelectOptions.find((country) => country.value === selectedCountryId)

  const selectedCityLabel =
    citySelectOptions.find((city) => city.value === selectedCityValue)?.label ?? ""

  const onSubmit = async (formData: ProfileFormData) => {
    const selectedCountryName = countries.find((country) => String(country.id) === formData.country)?.name

    const selectedSports = (formData.sports ?? [])
      .map((sport) => sports.find((sportItem) => sportItem.id === sport.id))
      .filter((sport): sport is Sport => !!sport)

    const payload: CompleteProfileRequest = {
      gender: formData.gender || undefined,
      birthday: formData.birthday || undefined,
      country: selectedCountryName || undefined,
      city: formData.city || undefined,
      sports: selectedSports.length ? selectedSports : undefined,
    }

    const result = await profileService.completeProfile(payload)
    if (!result.success) {
      return
    }

    const profileResult = await profileService.getMyProfile()
    if (!profileResult.success || !profileResult.data) {
      return
    }

    const refreshedProfile = profileResult.data

    setProfile(refreshedProfile)
    setShowIncompleteReminder(getIncompleteProfile(refreshedProfile))
    setPhoneDraft(refreshedProfile.phone ?? "")
    setEmailDraft(refreshedProfile.email ?? "")

    reset({
      firstName: refreshedProfile.firstName,
      lastName: refreshedProfile.lastName,
      gender: refreshedProfile.gender ?? undefined,
      birthday: toDateInputValue(refreshedProfile.birthday),
      country: countries.find((country) => country.name === refreshedProfile.country)?.id?.toString() ?? "",
      city: refreshedProfile.city ?? "",
      sports: refreshedProfile.sports ?? [],
    })
  }

  if (isLoading || !isAuthenticated || isFetching || !profile || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  const isProfileIncomplete = getIncompleteProfile(profile)
  const avatarSrc = profile.profileImageUrl || "/images/default-user.jpg"

  const hasPhoneChanges = phoneDraft.trim() !== (profile.phone ?? "").trim()
  const hasEmailChanges = emailDraft.trim() !== profile.email.trim()

  const SectionLayout = isRTL ? ProfileSectionLayoutAr : ProfileSectionLayoutEn

  return (
    <div className={cn("mx-auto max-w-6xl px-4 py-6", isRTL ? "text-right" : "text-left")}>
      <div className="space-y-4">
        <div className="px-1">
          <h1 className="text-3xl font-black tracking-tight text-primary">{t.title}</h1>
          <p className="mt-1 text-base font-medium text-muted-foreground">{t.subtitle}</p>
        </div>

        {showIncompleteReminder && isProfileIncomplete && (
          <Callout variant="warning" title={t.incompleteAlertTitle}>
            {t.incompleteAlertDescription}
          </Callout>
        )}

        <section
          id="complete-profile-form"
          className="overflow-hidden rounded-[24px] bg-card shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="divide-y divide-border/70">
              <SectionLayout
                title={t.avatarSection.title}
                description={t.sections.avatarHelp}
              >
                  <div className="flex min-h-[180px] items-center">
                    <div className="flex w-full flex-col items-center gap-5 text-center xl:flex-row xl:items-center xl:justify-between">
                      <div
                        className={cn(
                          "flex shrink-0 justify-center",
                          isRTL ? "xl:order-3" : "xl:order-1",
                        )}
                      >
                        <Image
                          src={avatarSrc}
                          alt={t.avatarSection.previewAlt}
                          width={144}
                          height={144}
                          className="size-36 rounded-full border-4 border-primary object-cover shadow-sm"
                        />
                      </div>

                      <div
                        className={cn(
                          "flex w-full flex-1 flex-col gap-2 xl:max-w-[420px]",
                          isRTL
                            ? "items-center text-center xl:items-end xl:text-right xl:order-2"
                            : "items-center text-center xl:items-start xl:text-left xl:order-2",
                        )}
                      >
                        <h4 className="text-2xl font-extrabold text-primary">{t.avatarSection.title}</h4>
                        <p className="text-sm leading-7 text-muted-foreground">{t.avatarSection.description}</p>
                      </div>

                      <div
                        className={cn(
                          "flex flex-wrap items-center justify-center gap-3",
                          isRTL ? "xl:justify-start xl:order-1" : "xl:justify-end xl:order-3",
                        )}
                      >
                        <button
                          type="button"
                          className="inline-flex h-10 min-w-34 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm"
                        >
                          {t.avatarSection.changeButton}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-10 min-w-22 items-center justify-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {t.avatarSection.removeButton}
                        </button>
                      </div>
                    </div>
                  </div>
              </SectionLayout>

              <SectionLayout
                title={t.sections.personalInfo}
                description={t.sections.personalInfoHelp}
              >
                  <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
                    <div className="space-y-4">
                      <div className={cn("text-sm font-semibold text-muted-foreground", isRTL ? "text-right" : "text-left")}>
                        {t.sections.personalInfo}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InputField
                          label={t.form.firstName}
                          value={watchedFirstName}
                          readOnly
                          disabled
                          className="h-11 rounded-xl text-base"
                        />
                        <InputField
                          label={t.form.lastName}
                          value={watchedLastName}
                          readOnly
                          disabled
                          className="h-11 rounded-xl text-base"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Controller
                          control={control}
                          name="gender"
                          rules={rules.gender}
                          render={({ field }) => (
                            <SelectField
                              label={t.form.gender}
                              placeholder={t.form.genderPlaceholder}
                              value={field.value}
                              onValueChange={field.onChange}
                              options={[
                                { value: "male", label: t.form.genders.male },
                                { value: "female", label: t.form.genders.female },
                              ]}
                              triggerClassName="!h-11 rounded-xl px-3 text-base"
                            />
                          )}
                        />

                        <Controller
                          control={control}
                          name="birthday"
                          rules={rules.birthday}
                          render={({ field }) => {
                            const selectedDate = fromDateInputValue(field.value || "")
                            const birthdayDisplay = selectedDate
                              ? new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }).format(selectedDate)
                              : t.form.birthday

                            return (
                              <div className="group flex flex-col gap-1.5">
                                <Label htmlFor={birthdayTriggerId} className="text-sm font-medium">
                                  {t.form.birthday}
                                </Label>
                                <Popover open={birthdayOpen} onOpenChange={setBirthdayOpen}>
                                  <PopoverTrigger asChild>
                                    <button
                                      id={birthdayTriggerId}
                                      type="button"
                                      className={cn(
                                        "flex h-11 w-full items-center justify-between rounded-xl border border-field-border bg-transparent px-3 text-base shadow-xs transition-all outline-none hover:border-primary/50 group-hover:border-primary/50 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20",
                                        isRTL ? "flex-row-reverse text-right" : "flex-row text-left",
                                      )}
                                    >
                                      <span className={cn("truncate", selectedDate ? "text-foreground" : "text-muted-foreground")}>
                                        {birthdayDisplay}
                                      </span>
                                      <Icon icon="solar:calendar-linear" className="size-4 shrink-0 text-muted-foreground" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto rounded-xl border-border p-2" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={selectedDate}
                                      onSelect={(date) => {
                                        if (!date) return
                                        field.onChange(toLocalDateValue(date))
                                        setBirthdayOpen(false)
                                      }}
                                      disabled={(date) => date > new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={cn("text-sm font-semibold text-muted-foreground", isRTL ? "text-right" : "text-left")}>
                        {lang === "ar" ? "الموقع" : "Location"}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="group flex flex-col gap-1.5">
                          <Label
                            className="text-sm font-medium"
                            onClick={() => {
                              countryTriggerRef.current?.focus()
                              setCountryMenuOpen(true)
                            }}
                          >
                            {t.form.country}
                          </Label>
                          <div ref={countryDropdownRef} className="relative">
                            <button
                              ref={countryTriggerRef}
                              type="button"
                              onClick={() => setCountryMenuOpen((prev) => !prev)}
                              className={cn(
                                "flex h-11 w-full items-center justify-between rounded-xl border border-field-border bg-transparent px-3 text-base shadow-xs transition-all outline-none hover:border-primary/50 group-hover:border-primary/50 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20",
                                isRTL ? "flex-row-reverse" : "flex-row",
                                isRTL ? "text-right" : "text-left",
                              )}
                            >
                              {selectedCountryOption ? (
                                <span
                                  className={cn(
                                    "flex items-center gap-2 truncate text-foreground",
                                    isRTL ? "flex-row-reverse justify-start text-right" : "flex-row justify-start text-left",
                                  )}
                                >
                                  <img
                                    src={`https://flagcdn.com/20x15/${selectedCountryOption.iso2.toLowerCase()}.png`}
                                    alt=""
                                    className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover"
                                    loading="lazy"
                                  />
                                  <span className="truncate">{selectedCountryOption.label}</span>
                                </span>
                              ) : (
                                <span className="truncate text-foreground">{t.form.countryPlaceholder}</span>
                              )}
                              <Icon icon="solar:alt-arrow-down-linear" className="size-4 shrink-0 text-muted-foreground" />
                            </button>

                            {countryMenuOpen && (
                              <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover p-2 shadow-lg">
                                <InputField
                                  value={countrySearch}
                                  onChange={(event) => setCountrySearch(event.target.value)}
                                  autoFocus
                                  placeholder={lang === "ar" ? "ابحث عن الدولة" : "Search country"}
                                  className="h-10 rounded-lg text-sm"
                                />
                                <div className="mt-2 max-h-60 overflow-y-auto">
                                  {filteredCountryOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => {
                                        setValue("country", option.value, { shouldDirty: true, shouldValidate: true })
                                        setCountryMenuOpen(false)
                                      }}
                                      className={cn(
                                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                                        isRTL ? "flex-row-reverse text-right" : "flex-row text-left",
                                      )}
                                    >
                                      <img
                                        src={`https://flagcdn.com/20x15/${option.iso2.toLowerCase()}.png`}
                                        alt=""
                                        className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover"
                                        loading="lazy"
                                      />
                                      <span className="truncate">{option.label}</span>
                                    </button>
                                  ))}

                                  {!filteredCountryOptions.length && (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                      {lang === "ar" ? "لا توجد نتائج" : "No results"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Controller
                          control={control}
                          name="city"
                          rules={rules.city}
                          render={({ field }) => (
                            <div className="group flex flex-col gap-1.5">
                              <Label
                                className="text-sm font-medium"
                                onClick={() => {
                                  if (!selectedCountryId) return
                                  cityTriggerRef.current?.focus()
                                  setCityMenuOpen(true)
                                }}
                              >
                                {t.form.city}
                              </Label>
                              <div ref={cityDropdownRef} className="relative">
                                <button
                                  ref={cityTriggerRef}
                                  type="button"
                                  disabled={!selectedCountryId}
                                  onClick={() => {
                                    if (!selectedCountryId) return
                                    setCityMenuOpen((prev) => !prev)
                                  }}
                                  className={cn(
                                    "flex h-11 w-full items-center justify-between rounded-xl border border-field-border bg-transparent px-3 text-base shadow-xs transition-all outline-none hover:border-primary/50 group-hover:border-primary/50 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60",
                                    isRTL ? "flex-row-reverse" : "flex-row",
                                    isRTL ? "text-right" : "text-left",
                                  )}
                                >
                                  <span className="truncate text-foreground">
                                    {isCitiesLoading
                                      ? <Spinner className="size-4" />
                                      : selectedCityLabel || t.form.cityPlaceholder}
                                  </span>
                                  <Icon icon="solar:alt-arrow-down-linear" className="size-4 shrink-0 text-muted-foreground" />
                                </button>

                                {cityMenuOpen && !!selectedCountryId && (
                                  <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover p-2 shadow-lg">
                                    <InputField
                                      value={citySearch}
                                      onChange={(event) => setCitySearch(event.target.value)}
                                      autoFocus
                                      placeholder={lang === "ar" ? "ابحث عن المدينة" : "Search city"}
                                      className="h-10 rounded-lg text-sm"
                                    />
                                    <div className="mt-2 max-h-60 overflow-y-auto">
                                      {filteredCityOptions.map((option) => (
                                        <button
                                          key={option.value}
                                          type="button"
                                          onClick={() => {
                                            field.onChange(option.value)
                                            setCityMenuOpen(false)
                                          }}
                                          className={cn(
                                            "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                                            isRTL ? "text-right" : "text-left",
                                          )}
                                        >
                                          {option.label}
                                        </button>
                                      ))}

                                      {!filteredCityOptions.length && (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                          {lang === "ar" ? "لا توجد نتائج" : "No results"}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="mt-8 h-12 w-full rounded-full text-base font-bold">
                    {isProfileIncomplete ? t.form.completeButton : t.form.saveButton}
                  </Button>
              </SectionLayout>

              <SectionLayout
                title={t.sections.securityInfo}
                description={t.sections.securityInfoHelp}
              >
                  <div className="space-y-6">
                    <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
                      <InputField
                        label={t.security.phone}
                        value={phoneDraft}
                        onChange={(event) => setPhoneDraft(event.target.value)}
                        className="h-11 rounded-xl text-base"
                      />
                      <Button
                        type="button"
                        disabled={!hasPhoneChanges}
                        className="h-11 rounded-full px-4 text-sm font-semibold"
                      >
                        {t.actions.save}
                      </Button>
                    </div>

                    <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
                      <InputField
                        label={t.security.email}
                        value={emailDraft}
                        onChange={(event) => setEmailDraft(event.target.value)}
                        className="h-11 rounded-xl text-base"
                      />
                      <Button
                        type="button"
                        disabled={!hasEmailChanges}
                        className="h-11 rounded-full px-4 text-sm font-semibold"
                      >
                        {t.actions.save}
                      </Button>
                    </div>
                  </div>
              </SectionLayout>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
