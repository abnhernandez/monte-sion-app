declare module "react-phone-number-input" {
  import type { ComponentType, InputHTMLAttributes } from "react"

  export type CountrySelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

  export interface PhoneInputProps {
    value?: string
    onChange?: (value?: string) => void
    defaultCountry?: string
    placeholder?: string
    className?: string
    inputComponent?: ComponentType<InputHTMLAttributes<HTMLInputElement>>
    countrySelectProps?: CountrySelectProps
  }

  const PhoneInput: ComponentType<PhoneInputProps>
  export default PhoneInput
}
