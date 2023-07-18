import React, { useContext, useMemo } from "react"
import { t, GridSection, MinimalTable } from "@bloom-housing/ui-components"
import { FieldValue } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { ApplicationSection } from "@bloom-housing/backend-core"
import { listingSectionQuestions } from "@bloom-housing/shared-helpers"

const DetailPreferences = () => {
  const listing = useContext(ListingContext)

  const preferencesTableHeaders = {
    order: "t.order",
    name: "t.name",
    description: "t.descriptionTitle",
  }

  const preferenceTableData = useMemo(
    () =>
      listingSectionQuestions(listing, ApplicationSection.preferences)?.map(
        (listingPreference, index) => ({
          order: { content: index + 1 },
          name: { content: listingPreference?.multiselectQuestion?.text },
          description: { content: listingPreference?.multiselectQuestion?.description },
        })
      ),
    [listing]
  )

  return (
    <GridSection
      className="bg-primary-lighter"
      title={t("listings.sections.housingPreferencesTitle")}
      grid={false}
      tinted
      inset
    >
      <FieldValue label={t("listings.activePreferences")} className={"mb-2"}>
        {preferenceTableData.length ? (
          <MinimalTable
            id="preferenceTable"
            headers={preferencesTableHeaders}
            data={preferenceTableData}
          />
        ) : (
          <span className="text-base font-semibold pt-4">{t("t.none")}</span>
        )}
      </FieldValue>
    </GridSection>
  )
}

export default DetailPreferences
