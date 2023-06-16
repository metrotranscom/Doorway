import React, { useEffect, useState } from "react"
import { ListingSearchParams, buildSearchString } from "../../../lib/listings/search"
import {
  Modal,
  ButtonGroup,
  FieldGroup,
  FieldSingle,
  Card,
  Button,
  ButtonGroupSpacing,
} from "@bloom-housing/doorway-ui-components"
import { useForm } from "react-hook-form"
import { LinkButton, t } from "@bloom-housing/ui-components"

const inputSectionStyle: React.CSSProperties = {
  margin: "0px 15px",
}

const textInputStyle: React.CSSProperties = {
  padding: "2px 4px",
  margin: "5px",
}

const clearButtonStyle: React.CSSProperties = {
  textDecoration: "underline",
}

export type FormOption = {
  label: string
  value: string
  isDisabled?: boolean
  labelNoteHTML?: string
}

type LandingSearchProps = {
  bedrooms: FormOption[]
  counties: FormOption[]
}

export function LandingSearch(props: LandingSearchProps) {
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
  const initialState = nullState
  const [formValues, setFormValues] = useState(initialState)
  const [openCountyMapModal, setOpenCountyMapModal] = useState(false)

  const createListingsUrl = (formValues: ListingSearchParams) => {
    const searchUrl = buildSearchString(formValues)
    return "/listings?search=" + searchUrl
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
        note: county.labelNoteHTML || "",
      } as FieldSingle)
    })
    return countyFields
  }
  const countyFields = mkCountyFields(props.counties)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register } = useForm()
  return (
    <Card className="bg-accent-cool-light">
      <div style={inputSectionStyle}>
        <div>{t("t.bedrooms")}</div>
        <ButtonGroup
          name="bedrooms"
          options={props.bedrooms}
          onChange={updateValue}
          value={formValues.bedrooms}
          className="bg-accent-cool-light"
          spacing={ButtonGroupSpacing.left}
        />
      </div>

      <div style={inputSectionStyle}>
        <div>{t("t.maxMonthlyRent")}</div>
        <input
          type="text"
          name="monthlyRent"
          value={formValues.monthlyRent}
          placeholder="$"
          style={textInputStyle}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            updateValue("monthlyRent", e.currentTarget.value)
          }}
        />
      </div>

      <div style={inputSectionStyle}>
        <div>{t("t.counties")}</div>
        <FieldGroup
          name="counties"
          fields={countyFields}
          onChange={updateValueMulti}
          register={register}
        />
      </div>

      <LinkButton href={createListingsUrl(formValues)} className="is-primary">
        {t("welcome.viewListings")}
      </LinkButton>

      <Button
        onClick={() => {
          setOpenCountyMapModal(!openCountyMapModal)
        }}
      >
        {t("welcome.viewCountyMap")}
      </Button>
      <Modal
        open={openCountyMapModal}
        title={t("welcome.bayAreaCountyMap")}
        ariaDescription={t("welcome.bayAreaCountyMap")}
        onClose={() => setOpenCountyMapModal(!openCountyMapModal)}
      >
        <img src={"images/county-map.png"} alt={t("welcome.bayAreaCountyMap")} />
      </Modal>
    </Card>
  )
}
