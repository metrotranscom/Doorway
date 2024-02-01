import React, { useState, useMemo, useCallback, useEffect } from "react"
import {
  t,
  AppearanceStyleType,
  MinimalTable,
  Drawer,
  Modal,
  FieldGroup,
  StandardTableData,
} from "@bloom-housing/ui-components"
import { Button, FieldValue, Grid } from "@bloom-housing/ui-seeds"
import UnitForm from "../UnitForm"
import { useFormContext, useWatch } from "react-hook-form"
import { TempUnit } from "../../../../lib/listings/formTypes"
import { fieldHasError, fieldMessage } from "../../../../lib/helpers"
import { ListingReviewOrder } from "@bloom-housing/backend-core"
import SectionWithGrid from "../../../shared/SectionWithGrid"

type UnitProps = {
  units: TempUnit[]
  setUnits: (units: TempUnit[]) => void
  disableUnitsAccordion: boolean
}

const FormUnits = ({ units, setUnits, disableUnitsAccordion }: UnitProps) => {
  const [unitDrawerOpen, setUnitDrawerOpen] = useState(false)
  const [unitDeleteModal, setUnitDeleteModal] = useState<number | null>(null)
  const [defaultUnit, setDefaultUnit] = useState<TempUnit | null>(null)
  const [toastContent, setToastContent] = useState(null)

  const formMethods = useFormContext()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors, clearErrors, getValues, control, setValue } = formMethods
  const listing = getValues()

  const listingAvailability = useWatch({
    control,
    name: "listingAvailabilityQuestion",
  })

  const nextId = units && units.length > 0 ? units[units.length - 1]?.tempId + 1 : 1

  const unitTableHeaders = {
    number: "listings.unit.number",
    unitType: "listings.unit.type",
    amiPercentage: "listings.unit.ami",
    monthlyRent: "listings.unit.rent",
    sqFeet: "listings.unit.sqft",
    priorityType: "listings.unit.priorityType",
    action: "",
  }

  useEffect(() => {
    if (
      getValues("disableUnitsAccordion") === undefined ||
      getValues("disableUnitsAccordion") === null
    ) {
      setValue("disableUnitsAccordion", disableUnitsAccordion ? "true" : "false")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (units && units.length > 0 && !units[0].tempId) {
      units.forEach((unit, index) => {
        unit.tempId = index + 1
      })
    }
  }, [units])

  const editUnit = useCallback(
    (tempId: number) => {
      setDefaultUnit(units.filter((unit) => unit.tempId === tempId)[0])
      setUnitDrawerOpen(true)
    },
    [units]
  )

  const deleteUnit = useCallback(
    (tempId: number) => {
      const updatedUnits = units
        .filter((unit) => unit.tempId !== tempId)
        .map((updatedUnit, index) => ({
          ...updatedUnit,
          tempId: index + 1,
        }))

      setUnits(updatedUnits)
      setUnitDeleteModal(null)
    },
    [setUnitDeleteModal, setUnits, units]
  )

  function saveUnit(newUnit: TempUnit) {
    const exists = units.some((unit) => unit.tempId === newUnit.tempId)
    if (exists) {
      const updateUnits = units.map((unit) => (unit.tempId === newUnit.tempId ? newUnit : unit))
      setUnits(updateUnits)
    } else {
      setUnits([...units, newUnit])
    }
  }

  const unitTableData: StandardTableData = useMemo(
    () =>
      units.map((unit) => ({
        number: { content: unit.number },
        unitType: { content: unit.unitType && t(`listings.unitTypes.${unit.unitType.name}`) },
        amiPercentage: { content: unit.amiPercentage },
        monthlyRent: { content: unit.monthlyRent },
        sqFeet: { content: unit.sqFeet },
        priorityType: { content: unit.priorityType?.name },
        action: {
          content: (
            <div className="flex gap-3">
              <Button
                type="button"
                className="font-semibold"
                onClick={() => editUnit(unit.tempId)}
                variant="text"
              >
                {t("t.edit")}
              </Button>
              <Button
                type="button"
                className="font-semibold text-alert"
                onClick={() => setUnitDeleteModal(unit.tempId)}
                variant="text"
              >
                {t("t.delete")}
              </Button>
            </div>
          ),
        },
      })),
    [editUnit, units]
  )

  const disableUnitsAccordionOptions = [
    {
      id: "unitTypes",
      label: t("listings.unit.unitTypes"),
      value: "true",
      dataTestId: "unit-types",
    },
    {
      id: "individualUnits",
      label: t("listings.unit.individualUnits"),
      value: "false",
      dataTestId: "individual-units",
    },
  ]

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid heading={t("listings.units")} subheading={t("listings.unitsDescription")}>
        <Grid.Row columns={2}>
          <FieldValue label={t("listings.unitTypesOrIndividual")} className="mb-1">
            <FieldGroup
              name="disableUnitsAccordion"
              type="radio"
              register={register}
              fields={disableUnitsAccordionOptions}
              fieldClassName="m-0"
              fieldGroupClassName="flex h-12 items-center"
            />
          </FieldValue>
          <FieldValue label={t("listings.listingAvailabilityQuestion")} className={"mb-1"}>
            <FieldGroup
              name="listingAvailabilityQuestion"
              type="radio"
              register={register}
              groupSubNote={t("listings.requiredToPublish")}
              error={fieldHasError(errors?.listingAvailability) && listingAvailability === null}
              errorMessage={fieldMessage(errors?.listingAvailability)}
              fieldClassName="m-0"
              fieldGroupClassName="flex h-12 items-center"
              fields={[
                {
                  label: t("listings.availableUnits"),
                  value: "availableUnits",
                  id: "availableUnits",
                  dataTestId: "listingAvailability.availableUnits",
                  defaultChecked: listing?.reviewOrderType !== ListingReviewOrder.waitlist,
                },
                {
                  label: t("listings.waitlist.open"),
                  value: "openWaitlist",
                  id: "openWaitlist",
                  dataTestId: "listingAvailability.openWaitlist",
                  defaultChecked: listing?.reviewOrderType === ListingReviewOrder.waitlist,
                },
              ]}
            />
          </FieldValue>
        </Grid.Row>
        <SectionWithGrid.HeadingRow>{t("listings.units")}</SectionWithGrid.HeadingRow>
        <Grid.Row>
          <Grid.Cell className="grid-inset-section">
            {!!units.length && (
              <div className="mb-5">
                <MinimalTable headers={unitTableHeaders} data={unitTableData} />
              </div>
            )}
            <Button
              id="addUnitsButton"
              type="button"
              variant={fieldHasError(errors?.units) ? "alert" : "primary-outlined"}
              onClick={() => {
                editUnit(units.length + 1)
                clearErrors("units")
              }}
            >
              {t("listings.unit.add")}
            </Button>
          </Grid.Cell>
        </Grid.Row>
      </SectionWithGrid>

      <p className="field-sub-note">{t("listings.requiredToPublish")}</p>
      {fieldHasError(errors?.units) && (
        <span className={"text-xs text-alert"}>{t("errors.requiredFieldError")}</span>
      )}

      <Drawer
        open={unitDrawerOpen}
        title={t("listings.unit.add")}
        headerTag={
          units.some((unit) => unit.tempId === defaultUnit?.tempId) ? t("t.saved") : t("t.draft")
        }
        headerTagStyle={
          units.some((unit) => unit.tempId === defaultUnit?.tempId)
            ? AppearanceStyleType.success
            : null
        }
        ariaDescription={t("listings.unit.add")}
        onClose={() => setUnitDrawerOpen(false)}
        toastContent={toastContent}
        toastStyle={"success"}
      >
        <UnitForm
          onSubmit={(unit) => {
            setToastContent(null)
            saveUnit(unit)
          }}
          onClose={(openNextUnit: boolean, openCurrentUnit: boolean, defaultUnit: TempUnit) => {
            setDefaultUnit(defaultUnit)
            if (openNextUnit) {
              if (defaultUnit) {
                setToastContent(t("listings.unit.unitCopied"))
              }
              editUnit(nextId)
            } else if (!openCurrentUnit) {
              setUnitDrawerOpen(false)
            } else {
              setToastContent(t("listings.unit.unitSaved"))
            }
          }}
          draft={!units.some((unit) => unit.tempId === defaultUnit?.tempId)}
          defaultUnit={defaultUnit}
          nextId={nextId}
        />
      </Drawer>

      <Modal
        open={!!unitDeleteModal}
        title={t("listings.unit.delete")}
        ariaDescription={t("listings.unit.deleteConf")}
        onClose={() => setUnitDeleteModal(null)}
        actions={[
          <Button variant="alert" onClick={() => deleteUnit(unitDeleteModal)} size="sm">
            {t("t.delete")}
          </Button>,
          <Button
            onClick={() => {
              setUnitDeleteModal(null)
            }}
            variant="primary-outlined"
            size="sm"
          >
            {t("t.cancel")}
          </Button>,
        ]}
      >
        {t("listings.unit.deleteConf")}
      </Modal>
    </>
  )
}

export default FormUnits
