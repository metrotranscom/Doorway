import React from "react"
import { useFormContext } from "react-hook-form"
import { t, GridSection, GridCell, Field, FieldGroup } from "@bloom-housing/ui-components"
import { FieldValue } from "@bloom-housing/ui-seeds"
import { getUniqueUnitTypes, adaFeatureKeys } from "@bloom-housing/shared-helpers"
import { Accessibility, Unit, UnitType } from "@bloom-housing/backend-core/types"
import { YesNoAnswer } from "../../../../lib/helpers"

type FormHouseholdDetailsProps = {
  listingUnits: Unit[]
  applicationUnitTypes: UnitType[]
  applicationAccessibilityFeatures: Accessibility
}

const FormHouseholdDetails = ({
  listingUnits,
  applicationUnitTypes,
  applicationAccessibilityFeatures,
}: FormHouseholdDetailsProps) => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register } = formMethods

  const unitTypes = getUniqueUnitTypes(listingUnits)

  const preferredUnitOptions = unitTypes?.map((item) => {
    const isChecked = !!applicationUnitTypes?.find((unit) => unit.id === item.id) ?? false

    return {
      id: item.id,
      label: t(`application.household.preferredUnit.options.${item.name}`),
      value: item.id,
      defaultChecked: isChecked,
      dataTestId: `preferredUnit.${item.name}`,
    }
  })

  const adaFeaturesOptions = adaFeatureKeys.map((item) => {
    const isChecked =
      applicationAccessibilityFeatures &&
      Object.keys(applicationAccessibilityFeatures).includes(item) &&
      applicationAccessibilityFeatures[item] === true

    return {
      id: item,
      label: t(`application.add.${item}`),
      value: item,
      defaultChecked: isChecked,
      dataTestId: `adaFeature.${item}`,
    }
  })

  return (
    <GridSection title={t("application.review.householdDetails")} separator>
      <GridCell>
        <FieldValue label={t("application.details.preferredUnitSizes")}>
          <FieldGroup
            type="checkbox"
            name="application.preferredUnit"
            fields={preferredUnitOptions}
            register={register}
            fieldGroupClassName="grid grid-cols-1 mt-4"
            fieldClassName="ml-0"
          />
        </FieldValue>
      </GridCell>
      <GridCell>
        <FieldValue label={t("application.details.adaPriorities")}>
          <fieldset>
            <legend className="sr-only">{t("application.details.adaPriorities")}</legend>
            <FieldGroup
              type="checkbox"
              name="application.accessibility"
              fields={adaFeaturesOptions}
              register={register}
              fieldGroupClassName="grid grid-cols-1 mt-4"
              fieldClassName="ml-0"
            />
          </fieldset>
        </FieldValue>
      </GridCell>
      <GridCell>
        <FieldValue label={t("application.household.expectingChanges.title")}>
          <div className="flex h-12 items-center">
            <Field
              id="application.householdExpectingChangesYes"
              name="application.householdExpectingChanges"
              className="m-0"
              type="radio"
              label={t("t.yes")}
              register={register}
              inputProps={{
                value: YesNoAnswer.Yes,
              }}
            />

            <Field
              id="application.householdExpectingChangesNo"
              name="application.householdExpectingChanges"
              className="m-0"
              type="radio"
              label={t("t.no")}
              register={register}
              inputProps={{
                value: YesNoAnswer.No,
              }}
            />
          </div>
        </FieldValue>
      </GridCell>
      <GridCell>
        <FieldValue label={t("application.household.householdStudent.title")}>
          <div className="flex h-12 items-center">
            <Field
              id="application.householdStudentYes"
              name="application.householdStudent"
              className="m-0"
              type="radio"
              label={t("t.yes")}
              register={register}
              inputProps={{
                value: YesNoAnswer.Yes,
              }}
            />

            <Field
              id="application.householdStudentNo"
              name="application.householdStudent"
              className="m-0"
              type="radio"
              label={t("t.no")}
              register={register}
              inputProps={{
                value: YesNoAnswer.No,
              }}
            />
          </div>
        </FieldValue>
      </GridCell>
    </GridSection>
  )
}

export { FormHouseholdDetails as default, FormHouseholdDetails }
