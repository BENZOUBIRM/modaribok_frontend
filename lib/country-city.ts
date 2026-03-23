import { GetCity, GetCountries, GetState } from "react-country-state-city"
import type { CityOption, CountryOption } from "@/types"

const countriesCache: { value: CountryOption[] | null } = { value: null }
const citiesCache = new Map<number, CityOption[]>()

export async function loadCountries(): Promise<CountryOption[]> {
  if (countriesCache.value) {
    return countriesCache.value
  }

  const countries = await GetCountries()

  const mapped = countries
    .map((country) => ({
      id: country.id,
      name: country.name,
      iso2: country.iso2,
      flag: iso2ToFlagEmoji(country.iso2),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))

  countriesCache.value = mapped
  return mapped
}

export async function loadCitiesByCountry(countryId: number): Promise<CityOption[]> {
  if (citiesCache.has(countryId)) {
    return citiesCache.get(countryId) ?? []
  }

  const states = await GetState(countryId)

  const cityLists = await Promise.all(states.map((state) => GetCity(countryId, state.id)))

  const unique = new Map<string, CityOption>()

  cityLists.flat().forEach((city) => {
    const key = city.name.trim().toLowerCase()

    if (!key || unique.has(key)) {
      return
    }

    unique.set(key, {
      id: city.id,
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
