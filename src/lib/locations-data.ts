import { Country as CountryData, State as StateData } from 'country-state-city'

export interface Country {
  code: string
  name: string
  flag: string
  states: string[]
}

/**
 * ISO country data with flags and the matching first-level administrative
 * areas (state/province/region) supplied by country-state-city.
 */
export const COUNTRIES: Country[] = CountryData.getAllCountries()
  .map(country => ({
    code: country.isoCode,
    name: country.name,
    flag: country.flag,
    states: StateData.getStatesOfCountry(country.isoCode)
      .map(state => state.name)
      .sort((a, b) => a.localeCompare(b)),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(country => country.code === code)
}
