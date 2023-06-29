import React, { useEffect, useState } from "react"
import { ListingSearchParams, parseSearchString } from "../../../lib/listings/search"
import { t } from "@bloom-housing/ui-components"
import {
  Modal,
  ButtonGroup,
  ButtonGroupSpacing,
  Button,
  Field,
  FieldGroup,
  FieldSingle,
} from "@bloom-housing/doorway-ui-components"
import { useForm } from "react-hook-form"

const inputSectionStyle: React.CSSProperties = {
  margin: "0px 15px",
}

const hyphenContainerStyle: React.CSSProperties = {
  position: "relative",
}

const hyphenStyle: React.CSSProperties = {
  fontSize: "2rem",
  position: "relative",
  bottom: "1px",
  padding: ".7rem",
  width: "100%",
}

const sectionTitle: React.CSSProperties = {
  fontWeight: "bold",
}

const sectionTitleTopBorder: React.CSSProperties = {
  fontWeight: "bold",
  borderTop: "2px solid var(--bloom-color-gray-450)",
  padding: "1rem 0 1rem 0",
}

const rentStyle: React.CSSProperties = {
  margin: "0px 0px",
  display: "flex",
}

const clearButtonStyle: React.CSSProperties = {
  textDecoration: "underline",
}

export type FormOption = {
  label: string
  value: string
  isDisabled?: boolean
  labelNoteHTML?: string
  doubleColumn?: boolean
}

type ListingsSearchModalProps = {
  open: boolean
  searchString?: string
  bedrooms: FormOption[]
  bathrooms: FormOption[]
  counties: FormOption[]
  onSubmit: (params: ListingSearchParams) => void
  onClose: () => void
  onFilterChange: (count: number) => void
}

export function ListingsSearchModal(props: ListingsSearchModalProps) {
  const searchString = props.searchString || ""

  // We hold a map of county label to county FormOption
  const countyLabelMap = {}
  const countyLabels = []
  props.counties.forEach((county) => {
    countyLabelMap[county.label] = county
    countyLabels.push(county.label)
  })

  const nullState: ListingSearchParams = {
    bedrooms: null,
    bathrooms: null,
    minRent: "",
    monthlyRent: "",
    counties: countyLabels,
  }
  const initialState = parseSearchString(searchString, nullState)
  const [formValues, setFormValues] = useState(initialState)

  const countFilters = (params: ListingSearchParams) => {
    let count = 0
    // For each of our search params, count the number that aren't empty
    Object.values(params).forEach((value) => {
      if (value == null || value == "") return
      if (Array.isArray(value) && value.length == props.counties.length) return
      count++
    })
    return count
  }

  // We're factoring out the function to prevent requiring props in useEffect
  const filterChange = props.onFilterChange
  useEffect(() => {
    filterChange(countFilters(formValues))
  }, [formValues, filterChange, countFilters])

  // Run this once immediately after first render
  // Empty array is intentional; it's how we make sure it only runs once
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // Set initial filter count
    props.onFilterChange(countFilters(formValues))
    // Fetch listings
    onSubmit()
  }, [])

  const clearValues = () => {
    // TODO: fix this
    // This code gets called but the UI doesn't update in response to state change
    setFormValues(nullState)
  }

  const onSubmit = () => {
    props.onSubmit(formValues)
    props.onClose()
  }

  const updateValue = (name: string, value: string) => {
    // Create a copy of the current value to ensure re-render
    const newValues = {} as ListingSearchParams
    Object.assign(newValues, formValues)
    newValues[name] = value
    setFormValues(newValues)
    // console.log(`${name} has been set to ${value}`) // uncomment to debug
  }

  const updateValueMulti = (name: string, labels: string[]) => {
    const newValues = { ...formValues } as ListingSearchParams
    newValues[name] = labels
    setFormValues(newValues)
    // console.log(`${name} has been set to ${value}`) // uncomment to debug
  }

  const mkCountyFields = (counties: FormOption[]): FieldSingle[] => {
    const countyFields: FieldSingle[] = [] as FieldSingle[]

    const selected = {}

    formValues.counties.forEach((label) => {
      selected[label] = true
    })
    let check = false
    counties.forEach((county, idx) => {
      // FieldGroup uses the label attribute to check for selected inputs.
      check = selected[county.label] !== undefined
      if (county.isDisabled) {
        check = false
      }
      countyFields.push({
        id: `county-item-${idx}`,
        index: idx,
        label: county.label,
        value: county.value,
        defaultChecked: check,
        disabled: county.isDisabled || false,
        doubleColumn: county.doubleColumn || false,
        note: county.labelNoteHTML || "",
      } as FieldSingle)
    })
    return countyFields
  }
  const countyFields = mkCountyFields(props.counties)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register } = useForm()
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={t("search.filters")}
      headerClassNames="bottom-border"
      ariaDescription="Listing Search Filters"
      actions={[
        <Button type="button" className="is-secondary" onClick={onSubmit}>
          {t("t.showMatchingListings")}
        </Button>,
        <div style={{ flexGrow: 1 }}></div>,
        <button style={clearButtonStyle} onClick={clearValues}>
          {t("t.clearAllFilters")}
        </button>,
      ]}
    >
      <div style={inputSectionStyle}>
        <div style={sectionTitle}>{t("t.bedrooms")}</div>
        <ButtonGroup
          name="bedrooms"
          options={props.bedrooms}
          onChange={updateValue}
          value={formValues.bedrooms}
          spacing={ButtonGroupSpacing.left}
        />
      </div>

      <div style={inputSectionStyle}>
        <div style={sectionTitle}>{t("t.bathrooms")}</div>
        <ButtonGroup
          name="bathrooms"
          options={props.bathrooms}
          onChange={updateValue}
          value={formValues.bathrooms}
          spacing={ButtonGroupSpacing.left}
        />
      </div>
      <div style={inputSectionStyle}>
        <div style={sectionTitleTopBorder}>{t("t.monthlyRent")}</div>
        <div style={rentStyle}>
          <Field
            type="number"
            name="minRent"
            defaultValue={formValues.minRent}
            placeholder={t("t.minPrice")}
            className="doorway-field"
            inputClassName="rent-input"
            labelClassName="input-label"
            inputMode="numeric"
            pattern="\d*"
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              updateValue("minRent", e.currentTarget.value)
            }}
          ></Field>
          <div style={hyphenContainerStyle}>
            <div style={hyphenStyle}>-</div>
          </div>
          <Field
            type="number"
            name="monthlyRent"
            defaultValue={formValues.monthlyRent}
            placeholder={t("t.maxPrice")}
            className="doorway-field"
            inputClassName="rent-input"
            labelClassName="input-label"
            inputMode="numeric"
            pattern="\d*"
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              updateValue("monthlyRent", e.currentTarget.value)
            }}
          ></Field>
        </div>
      </div>

      <div style={inputSectionStyle}>
        <div style={sectionTitleTopBorder}>{t("t.counties")}</div>
        <FieldGroup
          name="counties"
          fields={countyFields}
          onChange={updateValueMulti}
          register={register}
          fieldGroupClassName="grid grid-cols-2"
          fieldLabelClassName="text-primary-dark font-medium tracking-wider text-2xs uppercase"
        />
      </div>
      <img src={"/images/county-map.png"} alt={t("welcome.bayAreaCountyMap")} />
    </Modal>
  )
}
