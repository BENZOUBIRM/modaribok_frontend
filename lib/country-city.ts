import { City, Country } from "country-state-city"
import type { CityOption, CountryOption } from "@/types"

const countriesCache: { value: CountryOption[] | null } = { value: null }
const citiesCache = new Map<number, CityOption[]>()
const countryIdToIso2 = new Map<number, string>()

export async function loadCountries(): Promise<CountryOption[]> {
  if (countriesCache.value) {
    return countriesCache.value
  }

  const countries = Country.getAllCountries()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))

  const mapped = countries
    .map((country, index) => ({
      id: index + 1,
      name: country.name,
      iso2: country.isoCode,
      flag: iso2ToFlagEmoji(country.isoCode),
    }))

  countryIdToIso2.clear()
  mapped.forEach((country) => {
    countryIdToIso2.set(country.id, country.iso2)
  })

  countriesCache.value = mapped
  return mapped
}

export async function loadCitiesByCountry(countryId: number): Promise<CityOption[]> {
  if (citiesCache.has(countryId)) {
    return citiesCache.get(countryId) ?? []
  }

  if (!countriesCache.value) {
    await loadCountries()
  }

  const iso2 = countryIdToIso2.get(countryId)
  if (!iso2) {
    return []
  }

  const rawCities = City.getCitiesOfCountry(iso2) ?? []

  const unique = new Map<string, CityOption>()

  rawCities.forEach((city, index) => {
    const key = city.name.trim().toLowerCase()

    if (!key || unique.has(key)) {
      return
    }

    unique.set(key, {
      id: index + 1,
      name: city.name,
    })
  })

  const options = Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
  citiesCache.set(countryId, options)

  return options
}

function iso2ToFlagEmoji(iso2: string): string {
  const normalized = iso2.trim().slice(0, 2).toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return "🏳️"
  }

  const first = 127397 + normalized.charCodeAt(0)
  const second = 127397 + normalized.charCodeAt(1)

  return String.fromCodePoint(first, second)
}
