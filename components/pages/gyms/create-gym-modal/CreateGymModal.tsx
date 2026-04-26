"use client"

import * as React from "react"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import type { CityOption, CountryOption } from "@/types"
import { loadCitiesByCountry, loadCountries } from "@/lib/country-city"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/primitives/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { PhoneInputField } from "@/components/ui/phone-input-field"
import { Spinner } from "@/components/ui/spinner"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CreateGymModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRTL: boolean
  lang: string
}

type Step = 1 | 2 | 3
type FacilityKey = "lockers" | "parking" | "cafe" | "sauna" | "pool"

type FormState = {
  gymName: string
  logo: File | null
  description: string
  country: string
  city: string
  address: string
  phone: string
  email: string
  website: string
  capacity: number
  sports: Set<string>
  facilities: Set<FacilityKey>
  gallery: File[]
  social: {
    facebook: string
    instagram: string
    x: string
    tiktok: string
    snapchat: string
    linkedin: string
  }
}

const MAX_GALLERY_IMAGES = 3
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"]

const SPORT_OPTIONS = [
  { key: "basketball", icon: "mdi:basketball", labelAr: "كرة السلة", labelEn: "Basketball", colorClass: "bg-orange-500/15 text-orange-500 border-orange-500/20" },
  { key: "football", icon: "mdi:soccer", labelAr: "كرة القدم", labelEn: "Football", colorClass: "bg-indigo-500/15 text-indigo-500 border-indigo-500/20" },
  { key: "run", icon: "solar:running-2-linear", labelAr: "الجري مع الاصدقاء", labelEn: "Run with friends", colorClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20" },
  { key: "karate", icon: "mdi:karate", labelAr: "كارتيه", labelEn: "Karate", colorClass: "bg-pink-500/15 text-pink-500 border-pink-500/20" },
  { key: "swim", icon: "mdi:swim", labelAr: "السباحة", labelEn: "Swimming", colorClass: "bg-sky-500/15 text-sky-500 border-sky-500/20" },
  { key: "volleyball", icon: "mdi:volleyball", labelAr: "كرة الطائرة", labelEn: "Volleyball", colorClass: "bg-amber-500/15 text-amber-500 border-amber-500/20" },
] as const

const FACILITY_OPTIONS: Array<{ key: FacilityKey; labelAr: string; labelEn: string }> = [
  { key: "lockers", labelAr: "غرف تبديل", labelEn: "Locker rooms" },
  { key: "parking", labelAr: "موقف سيارات", labelEn: "Parking" },
  { key: "cafe", labelAr: "كافتيريا", labelEn: "Cafe" },
  { key: "sauna", labelAr: "ساونا", labelEn: "Sauna" },
  { key: "pool", labelAr: "مسبح", labelEn: "Pool" },
]

const initialFormState: FormState = {
  gymName: "",
  logo: null,
  description: "",
  country: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  capacity: 200,
  sports: new Set(["run", "football"]),
  facilities: new Set<FacilityKey>(["parking"]),
  gallery: [],
  social: {
    facebook: "",
    instagram: "",
    x: "",
    tiktok: "",
    snapchat: "",
    linkedin: "",
  },
}

function buildLabels(lang: string) {
  if (lang === "ar") {
    return {
      title: "انشاء نادي رياضي",
      stepOne: {
        gymName: "اسم النادي",
        gymNamePlaceholder: "طريقة تقديم التدريب: عبر الانترنت، حضورا، كلاهما",
        logo: "الشعار",
        logoHint: "إرفاق صورة الشعار (jpg, jpeg, png)",
        description: "وصف النادي",
        descriptionPlaceholder: "اكتب نبذة المميزة...",
        country: "الدولة",
        countryPlaceholder: "اختر الدولة...",
        city: "المدينة",
        cityPlaceholder: "اختر المدينة...",
        searchCountry: "ابحث عن الدولة",
        searchCity: "ابحث عن المدينة",
        noResults: "لا توجد نتائج",
        address: "العنوان",
        addressPlaceholder: "اكتب العنوان بالتفصيل ...",
        phone: "رقم الهاتف",
        phonePlaceholder: "طريقة تقديم التدريب: عبر الانترنت، حضورا، كلاهما",
        email: "البريد الالكتروني",
        emailPlaceholder: "طريقة تقديم التدريب: عبر الانترنت، حضورا، كلاهما",
      },
      stepTwo: {
        website: "الموقع الالكتروني",
        websitePlaceholder: "/#",
        capacity: "الطاقة الاستيعابية",
        capacityPlaceholder: "عدد الاعضاء المسموح بهم",
        sports: "الرياضات المتوفرة",
        facilities: "المرافق المتوفرة",
        facilitiesPlaceholder: "اختر المرافق...",
      },
      stepThree: {
        gallery: "الصور (المعرض)",
        galleryEmpty: "لم يتم اضافة اي صورة بعد",
        galleryHint: "إضافة صور (jpg, jpeg, png)",
        social: "روابط التواصل الاجتماعي",
      },
      mapHash: "/#",
      uploadImage: "رفع",
      next: "التالي",
      back: "رجوع",
      submit: "انشاء حساب نادي رياضي",
      oneOfThree: "صورة (1/3)",
    }
  }

  return {
    title: "Create Gym Account",
    stepOne: {
      gymName: "Gym name",
      gymNamePlaceholder: "Training mode: online, in-person, or both",
      logo: "Logo",
      logoHint: "Upload logo image (jpg, jpeg, png)",
      description: "Gym description",
      descriptionPlaceholder: "Write a short standout summary...",
      country: "Country",
      countryPlaceholder: "Select country...",
      city: "City",
      cityPlaceholder: "Select city...",
      searchCountry: "Search country",
      searchCity: "Search city",
      noResults: "No results",
      address: "Address",
      addressPlaceholder: "Write full address ...",
      phone: "Phone number",
      phonePlaceholder: "Training mode: online, in-person, or both",
      email: "Email",
      emailPlaceholder: "Training mode: online, in-person, or both",
    },
    stepTwo: {
      website: "Website",
      websitePlaceholder: "/#",
      capacity: "Capacity",
      capacityPlaceholder: "Allowed member count",
      sports: "Available sports",
      facilities: "Available facilities",
      facilitiesPlaceholder: "Select facilities...",
    },
    stepThree: {
      gallery: "Gallery photos",
      galleryEmpty: "No image was added yet",
      galleryHint: "Add images (jpg, jpeg, png)",
      social: "Social links",
    },
    mapHash: "/#",
    uploadImage: "Upload",
    next: "Next",
    back: "Back",
    submit: "Create Gym Account",
    oneOfThree: "Image (1/3)",
  }
}

function isAcceptedImage(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type)
}

function SocialInput({
  icon,
  value,
  onChange,
  placeholder,
}: {
  icon: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        startIcon={<Icon icon={icon} className="size-4.5 text-foreground/80" />}
        className="h-11 rounded-lg border-border/40 bg-muted/45"
      />
    </div>
  )
}

export function CreateGymModal({ open, onOpenChange, isRTL, lang }: CreateGymModalProps) {
  const [step, setStep] = React.useState<Step>(1)
  const [formState, setFormState] = React.useState<FormState>(initialFormState)
  const [countries, setCountries] = React.useState<CountryOption[]>([])
  const [cities, setCities] = React.useState<CityOption[]>([])
  const [isCitiesLoading, setIsCitiesLoading] = React.useState(false)
  const [countrySearch, setCountrySearch] = React.useState("")
  const [citySearch, setCitySearch] = React.useState("")
  const [countryMenuOpen, setCountryMenuOpen] = React.useState(false)
  const [cityMenuOpen, setCityMenuOpen] = React.useState(false)

  const logoInputRef = React.useRef<HTMLInputElement | null>(null)
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null)
  const countryDropdownRef = React.useRef<HTMLDivElement | null>(null)
  const cityDropdownRef = React.useRef<HTMLDivElement | null>(null)
  const countryTriggerRef = React.useRef<HTMLButtonElement | null>(null)
  const cityTriggerRef = React.useRef<HTMLButtonElement | null>(null)

  const labels = React.useMemo(() => buildLabels(lang), [lang])

  const selectedCountry = React.useMemo(
    () => countries.find((item) => String(item.id) === formState.country) ?? null,
    [countries, formState.country],
  )

  const selectedCity = React.useMemo(
    () => cities.find((item) => item.name === formState.city) ?? null,
    [cities, formState.city],
  )

  const filteredCountryOptions = React.useMemo(() => {
    const query = countrySearch.trim().toLowerCase()
    if (!query) {
      return countries.map((country) => ({
        value: String(country.id),
        label: country.name,
        iso2: country.iso2,
      }))
    }

    return countries
      .filter((country) => country.name.toLowerCase().includes(query))
      .map((country) => ({
        value: String(country.id),
        label: country.name,
        iso2: country.iso2,
      }))
  }, [countries, countrySearch])

  const filteredCityOptions = React.useMemo(() => {
    const query = citySearch.trim().toLowerCase()
    if (!query) {
      return cities.map((city) => ({ value: city.name, label: city.name }))
    }

    return cities
      .filter((city) => city.name.toLowerCase().includes(query))
      .map((city) => ({ value: city.name, label: city.name }))
  }, [cities, citySearch])

  React.useEffect(() => {
    if (!open) {
      setStep(1)
      setFormState(initialFormState)
      setCountryMenuOpen(false)
      setCityMenuOpen(false)
      setCountrySearch("")
      setCitySearch("")
    }
  }, [open])

  React.useEffect(() => {
    let active = true

    const hydrateCountries = async () => {
      const loadedCountries = await loadCountries()
      if (active) {
        setCountries(loadedCountries)
      }
    }

    void hydrateCountries()

    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => {
    let active = true

    const loadCities = async () => {
      if (!formState.country) {
        setCities([])
        setCityMenuOpen(false)
        return
      }

      setIsCitiesLoading(true)
      try {
        const loadedCities = await loadCitiesByCountry(Number(formState.country))
        if (active) {
          setCities(loadedCities)
        }
      } finally {
        if (active) {
          setIsCitiesLoading(false)
        }
      }
    }

    void loadCities()

    return () => {
      active = false
    }
  }, [formState.country])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (countryDropdownRef.current && !countryDropdownRef.current.contains(target)) {
        setCountryMenuOpen(false)
      }

      if (cityDropdownRef.current && !cityDropdownRef.current.contains(target)) {
        setCityMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const setField = React.useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((current) => ({ ...current, [key]: value }))
  }, [])

  const setSocialField = React.useCallback((key: keyof FormState["social"], value: string) => {
    setFormState((current) => ({
      ...current,
      social: {
        ...current.social,
        [key]: value,
      },
    }))
  }, [])

  const toggleSport = React.useCallback((sportKey: string) => {
    setFormState((current) => {
      const nextSports = new Set(current.sports)

      if (nextSports.has(sportKey)) {
        nextSports.delete(sportKey)
      } else {
        nextSports.add(sportKey)
      }

      return {
        ...current,
        sports: nextSports,
      }
    })
  }, [])

  const toggleFacility = React.useCallback((facility: FacilityKey) => {
    setFormState((current) => {
      const nextFacilities = new Set(current.facilities)
      if (nextFacilities.has(facility)) {
        nextFacilities.delete(facility)
      } else {
        nextFacilities.add(facility)
      }

      return {
        ...current,
        facilities: nextFacilities,
      }
    })
  }, [])

  const decrementCapacity = React.useCallback(() => {
    setFormState((current) => ({ ...current, capacity: Math.max(1, current.capacity - 1) }))
  }, [])

  const incrementCapacity = React.useCallback(() => {
    setFormState((current) => ({ ...current, capacity: Math.min(10000, current.capacity + 1) }))
  }, [])

  const onLogoSelect = React.useCallback((files: FileList | null) => {
    const file = files?.[0]
    if (!file || !isAcceptedImage(file)) {
      return
    }

    setField("logo", file)
  }, [setField])

  const onGallerySelect = React.useCallback((files: FileList | null) => {
    if (!files?.length) {
      return
    }

    setFormState((current) => {
      const nextGallery = [...current.gallery]

      for (const file of Array.from(files)) {
        if (!isAcceptedImage(file)) {
          continue
        }

        if (nextGallery.length >= MAX_GALLERY_IMAGES) {
          break
        }

        nextGallery.push(file)
      }

      return {
        ...current,
        gallery: nextGallery,
      }
    })
  }, [])

  const handleNext = React.useCallback(() => {
    setStep((current) => (current >= 3 ? 3 : ((current + 1) as Step)))
  }, [])

  const handleBack = React.useCallback(() => {
    setStep((current) => (current <= 1 ? 1 : ((current - 1) as Step)))
  }, [])

  const handleSubmit = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const selectedFacilitiesLabel = React.useMemo(() => {
    if (formState.facilities.size === 0) {
      return labels.stepTwo.facilitiesPlaceholder
    }

    return FACILITY_OPTIONS
      .filter((option) => formState.facilities.has(option.key))
      .map((option) => (lang === "ar" ? option.labelAr : option.labelEn))
      .join(", ")
  }, [formState.facilities, labels.stepTwo.facilitiesPlaceholder, lang])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[min(760px,calc(100vw-1.5rem))] gap-0 overflow-hidden rounded-[24px] border-border/60 bg-card p-0 shadow-[0_26px_60px_rgba(0,0,0,0.2)]"
      >
        <div dir={isRTL ? "rtl" : "ltr"} className="flex max-h-[88vh] flex-col">
          <div className="flex items-center justify-between border-b border-border/35 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border/45 bg-muted/35 text-foreground transition-colors hover:bg-muted"
              aria-label={lang === "ar" ? "إغلاق" : "Close"}
            >
              <Icon icon="material-symbols:close-rounded" className="size-5" />
            </button>

            <DialogTitle className="text-center text-2xl font-extrabold text-primary">
              {labels.title}
            </DialogTitle>

            <span className="inline-block size-9" aria-hidden="true" />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">

          {step === 1 ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepOne.gymName}</label>
                <Input
                  value={formState.gymName}
                  onChange={(event) => setField("gymName", event.target.value)}
                  placeholder={labels.stepOne.gymNamePlaceholder}
                  className="h-11 rounded-lg border-border/40 bg-muted/45"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepOne.logo}</label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(event) => {
                    onLogoSelect(event.target.files)
                    event.currentTarget.value = ""
                  }}
                />

                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex h-22 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#89afff] bg-[#f4f7ff] px-3 text-center transition-colors hover:bg-[#edf3ff] dark:border-[#4f6fb6] dark:bg-[#1d2434] dark:hover:bg-[#232c3d]"
                >
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    {labels.stepOne.logoHint}
                    <Icon icon="solar:gallery-add-bold" className="size-5 text-primary" />
                  </span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepOne.description}</label>
                <textarea
                  value={formState.description}
                  onChange={(event) => setField("description", event.target.value)}
                  placeholder={labels.stepOne.descriptionPlaceholder}
                  className="h-18 w-full resize-none rounded-lg border border-border/40 bg-muted/45 px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-bold text-foreground"
                    onClick={() => {
                      countryTriggerRef.current?.focus()
                      setCountryMenuOpen(true)
                    }}
                  >
                    {labels.stepOne.country}
                  </label>
                  <div ref={countryDropdownRef} className="relative">
                    <button
                      ref={countryTriggerRef}
                      type="button"
                      onClick={() => setCountryMenuOpen((current) => !current)}
                      className={cn(
                        "flex h-11 w-full items-center justify-between rounded-xl border border-field-border bg-muted/45 px-3 text-base shadow-xs transition-all outline-none hover:border-primary/50 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20",
                        isRTL ? "flex-row-reverse text-right" : "flex-row text-left",
                      )}
                    >
                      {selectedCountry ? (
                        <span className={cn("flex items-center gap-2 truncate text-foreground", isRTL ? "flex-row-reverse" : "flex-row")}>
                          <img
                            src={`https://flagcdn.com/20x15/${selectedCountry.iso2.toLowerCase()}.png`}
                            alt=""
                            className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover"
                            loading="lazy"
                          />
                          <span className="truncate">{selectedCountry.name}</span>
                        </span>
                      ) : (
                        <span className="truncate text-muted-foreground">{labels.stepOne.countryPlaceholder}</span>
                      )}
                      <Icon icon="solar:alt-arrow-down-linear" className="size-4 shrink-0 text-muted-foreground" />
                    </button>

                    {countryMenuOpen ? (
                      <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover p-2 shadow-lg">
                        <InputField
                          value={countrySearch}
                          onChange={(event) => setCountrySearch(event.target.value)}
                          autoFocus
                          placeholder={labels.stepOne.searchCountry}
                          className="h-10 rounded-lg text-sm"
                        />
                        <div className="mt-2 max-h-60 overflow-y-auto">
                          {filteredCountryOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setField("country", option.value)
                                setField("city", "")
                                setCitySearch("")
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

                          {!filteredCountryOptions.length ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">{labels.stepOne.noResults}</div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="block text-sm font-bold text-foreground"
                    onClick={() => {
                      if (!formState.country) return
                      cityTriggerRef.current?.focus()
                      setCityMenuOpen(true)
                    }}
                  >
                    {labels.stepOne.city}
                  </label>
                  <div ref={cityDropdownRef} className="relative">
                    <button
                      ref={cityTriggerRef}
                      type="button"
                      disabled={!formState.country}
                      onClick={() => {
                        if (!formState.country) return
                        setCityMenuOpen((current) => !current)
                      }}
                      className={cn(
                        "flex h-11 w-full items-center justify-between rounded-xl border border-field-border bg-muted/45 px-3 text-base shadow-xs transition-all outline-none hover:border-primary/50 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60",
                        isRTL ? "flex-row-reverse text-right" : "flex-row text-left",
                      )}
                    >
                      <span className="truncate text-muted-foreground">
                        {isCitiesLoading
                          ? "..."
                          : selectedCity?.name || labels.stepOne.cityPlaceholder}
                      </span>
                      <Icon icon="solar:alt-arrow-down-linear" className="size-4 shrink-0 text-muted-foreground" />
                    </button>

                    {cityMenuOpen && formState.country ? (
                      <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover p-2 shadow-lg">
                        <InputField
                          value={citySearch}
                          onChange={(event) => setCitySearch(event.target.value)}
                          autoFocus
                          placeholder={labels.stepOne.searchCity}
                          className="h-10 rounded-lg text-sm"
                        />
                        <div className="mt-2 max-h-60 overflow-y-auto">
                          {isCitiesLoading ? (
                            <div className="px-3 py-3">
                              <Spinner className="size-4" />
                            </div>
                          ) : null}

                          {!isCitiesLoading && filteredCityOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setField("city", option.value)
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

                          {!isCitiesLoading && !filteredCityOptions.length ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">{labels.stepOne.noResults}</div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepOne.address}</label>
                <Input
                  value={formState.address}
                  onChange={(event) => setField("address", event.target.value)}
                  placeholder={labels.stepOne.addressPlaceholder}
                  className="h-11 rounded-lg border-border/40 bg-muted/45"
                />
              </div>

              <div className="space-y-1.5">
                <PhoneInputField
                  label={labels.stepOne.phone}
                  value={formState.phone}
                  onChange={(value) => setField("phone", value)}
                  placeholder={labels.stepOne.phonePlaceholder}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepOne.email}</label>
                <Input
                  type="email"
                  value={formState.email}
                  onChange={(event) => setField("email", event.target.value)}
                  placeholder={labels.stepOne.emailPlaceholder}
                  className="h-11 rounded-lg border-border/40 bg-muted/45"
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepTwo.website}</label>
                <Input
                  value={formState.website}
                  onChange={(event) => setField("website", event.target.value)}
                  placeholder={labels.stepTwo.websitePlaceholder}
                  startIcon={<Icon icon="solar:global-linear" className="size-4.5" />}
                  className="h-11 rounded-lg border-border/40 bg-muted/45"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepTwo.capacity}</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decrementCapacity}
                    className="inline-flex size-12 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/55 text-foreground transition-colors hover:bg-muted"
                    aria-label="decrease capacity"
                  >
                    <Icon icon="material-symbols:remove-rounded" className="size-6" />
                  </button>

                  <div className="flex h-12 min-w-[5.5rem] items-center justify-center rounded-xl border border-border/40 bg-muted/45 px-3 text-2xl font-extrabold text-foreground">
                    {formState.capacity}
                  </div>

                  <button
                    type="button"
                    onClick={incrementCapacity}
                    className="inline-flex size-12 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/55 text-foreground transition-colors hover:bg-muted"
                    aria-label="increase capacity"
                  >
                    <Icon icon="material-symbols:add-rounded" className="size-6" />
                  </button>

                  <p className="ms-2 text-xs font-medium text-muted-foreground">{labels.stepTwo.capacityPlaceholder}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepTwo.sports}</label>
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-border/35 bg-muted/35 p-2">
                  {SPORT_OPTIONS.map((sport) => {
                    const selected = formState.sports.has(sport.key)
                    const label = lang === "ar" ? sport.labelAr : sport.labelEn

                    return (
                      <button
                        key={sport.key}
                        type="button"
                        onClick={() => toggleSport(sport.key)}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors",
                          sport.colorClass,
                          selected ? "ring-1 ring-primary/45" : "opacity-70 hover:opacity-100",
                        )}
                      >
                        <Icon icon={sport.icon} className="size-3.5" />
                        <span>{label}</span>
                        <span className={cn(
                          "inline-flex size-3.5 items-center justify-center rounded-[3px] border",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/55 bg-background",
                        )}>
                          {selected ? <Icon icon="material-symbols:check" className="size-3" /> : null}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepTwo.facilities}</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-border/40 bg-muted/45 px-3 text-sm text-foreground"
                    >
                      <span className="truncate text-start">{selectedFacilitiesLabel}</span>
                      <Icon icon="solar:alt-arrow-down-linear" className="size-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-[min(95vw,420px)] rounded-xl border-border/60 p-2">
                    <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                      {labels.stepTwo.facilities}
                    </DropdownMenuLabel>
                    {FACILITY_OPTIONS.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.key}
                        checked={formState.facilities.has(option.key)}
                        onSelect={(event) => {
                          event.preventDefault()
                          toggleFacility(option.key)
                        }}
                      >
                        {lang === "ar" ? option.labelAr : option.labelEn}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepThree.gallery}</label>
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(event) => {
                    onGallerySelect(event.target.files)
                    event.currentTarget.value = ""
                  }}
                />

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex h-30 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#89afff] bg-[#f4f7ff] px-3 text-center transition-colors hover:bg-[#edf3ff] dark:border-[#4f6fb6] dark:bg-[#1d2434] dark:hover:bg-[#232c3d]"
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formState.gallery.length > 0 ? `${formState.gallery.length}/${MAX_GALLERY_IMAGES}` : labels.stepThree.galleryEmpty}
                  </span>
                </button>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-orange-500">{labels.oneOfThree}</span>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    {labels.stepThree.galleryHint}
                    <Icon icon="solar:gallery-add-bold" className="size-4.5 text-primary" />
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground">{labels.stepThree.social}</label>
                <div className="space-y-2">
                  <SocialInput icon="ri:facebook-fill" value={formState.social.facebook} onChange={(value) => setSocialField("facebook", value)} placeholder={labels.mapHash} />
                  <SocialInput icon="mdi:instagram" value={formState.social.instagram} onChange={(value) => setSocialField("instagram", value)} placeholder={labels.mapHash} />
                  <SocialInput icon="ri:twitter-x-line" value={formState.social.x} onChange={(value) => setSocialField("x", value)} placeholder={labels.mapHash} />
                  <SocialInput icon="ic:baseline-tiktok" value={formState.social.tiktok} onChange={(value) => setSocialField("tiktok", value)} placeholder={labels.mapHash} />
                  <SocialInput icon="ri:snapchat-fill" value={formState.social.snapchat} onChange={(value) => setSocialField("snapchat", value)} placeholder={labels.mapHash} />
                  <SocialInput icon="ri:linkedin-fill" value={formState.social.linkedin} onChange={(value) => setSocialField("linkedin", value)} placeholder={labels.mapHash} />
                </div>
              </div>
            </div>
          ) : null}
          </div>

          <div className={cn("flex items-center gap-2 border-t border-border/35 px-4 py-3 sm:px-6", isRTL ? "flex-row-reverse" : "flex-row")}>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border/35 bg-muted/50 text-foreground transition-colors hover:bg-muted"
                aria-label={labels.back}
              >
                <Icon icon={isRTL ? "solar:alt-arrow-right-linear" : "solar:alt-arrow-left-linear"} className="size-5" />
              </button>
            ) : null}

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className={cn("h-12 rounded-full text-lg font-bold", step > 1 ? "flex-1" : "w-full")}
              >
                {labels.next}
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className={cn("h-12 cursor-pointer rounded-full bg-orange-500 px-4 text-lg font-bold text-white transition-colors hover:bg-orange-500/90", step > 1 ? "flex-1" : "w-full")}
              >
                {labels.submit}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
