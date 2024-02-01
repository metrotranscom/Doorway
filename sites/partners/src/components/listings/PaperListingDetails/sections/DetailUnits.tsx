import React, { useContext, useMemo } from "react"
import { t, MinimalTable } from "@bloom-housing/ui-components"
import { Button, FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { UnitDrawer } from "../DetailsUnitDrawer"
import { ListingReviewOrder } from "@bloom-housing/backend-core"
import SectionWithGrid from "../../../shared/SectionWithGrid"

type DetailUnitsProps = {
  setUnitDrawer: (unit: UnitDrawer) => void
}

const DetailUnits = ({ setUnitDrawer }: DetailUnitsProps) => {
  const listing = useContext(ListingContext)

  const unitTableHeaders = {
    number: "listings.unit.number",
    unitType: "listings.unit.type",
    amiPercentage: "listings.unit.ami",
    monthlyRent: "listings.unit.rent",
    sqFeet: "listings.unit.sqft",
    priorityType: "listings.unit.priorityType",
    action: "",
  }

  const unitTableData = useMemo(
    () =>
      listing?.units.map((unit) => ({
        number: { content: unit.number },
        unitType: { content: unit.unitType && t(`listings.unitTypes.${unit.unitType.name}`) },
        amiPercentage: { content: unit.amiPercentage },
        monthlyRent: { content: unit.monthlyRent },
        sqFeet: { content: unit.sqFeet },
        priorityType: { content: unit.priorityType?.name },
        action: {
          content: (
            <Button
              type="button"
              variant="text"
              className="font-semibold"
              onClick={() => setUnitDrawer(unit)}
            >
              {t("t.view")}
            </Button>
          ),
        },
      })),
    [listing, setUnitDrawer]
  )

  const listingAvailabilityText = useMemo(() => {
    if (listing.reviewOrderType !== ListingReviewOrder.waitlist) {
      return t("listings.availableUnits")
    } else if (listing.reviewOrderType === ListingReviewOrder.waitlist) {
      return t("listings.waitlist.open")
    }
    return t("t.none")
  }, [listing])

  return (
    <SectionWithGrid heading={t("listings.units")} inset>
      <Grid.Row>
        <FieldValue
          id="unitTypesOrIndividual"
          testId={"unit-types-or-individual"}
          label={t("listings.unitTypesOrIndividual")}
          children={
            listing.disableUnitsAccordion
              ? t("listings.unit.unitTypes")
              : t("listings.unit.individualUnits")
          }
        />
        <FieldValue
          id="listings.listingAvailabilityQuestion"
          testId={"listing-availability-question"}
          label={t("listings.listingAvailabilityQuestion")}
          children={listingAvailabilityText}
        />
      </Grid.Row>
      <Grid.Row>
        <Grid.Cell>
          {listing.units.length ? (
            <MinimalTable id="unitTable" headers={unitTableHeaders} data={unitTableData} />
          ) : (
            <>
              <hr className="spacer-header" />
              <span className="text-base font-semibold pt-4">{t("t.none")}</span>
            </>
          )}
        </Grid.Cell>
      </Grid.Row>
    </SectionWithGrid>
  )
}

export { DetailUnits as default, DetailUnits }
