import React, { useContext, useMemo } from "react"
import { t, GridSection, MinimalTable } from "@bloom-housing/ui-components"
import { FieldValue } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { ApplicationSection } from "@bloom-housing/backend-core"
import { listingSectionQuestions } from "@bloom-housing/shared-helpers"

const DetailPrograms = () => {
  const listing = useContext(ListingContext)

  const programsTableHeaders = {
    order: "t.order",
    name: "t.name",
    description: "t.descriptionTitle",
  }

  const programsTableData = useMemo(
    () =>
      listingSectionQuestions(listing, ApplicationSection.programs)
        ?.sort((firstEl, secondEl) => firstEl.ordinal - secondEl.ordinal)
        .map((program, index) => ({
          order: { content: index + 1 },
          name: { content: program?.multiselectQuestion?.text },
          description: { content: program?.multiselectQuestion?.description },
        })),
    [listing]
  )

  return (
    <GridSection
      className="bg-primary-lighter"
      title={"Housing Programs"}
      grid={false}
      tinted
      inset
    >
      <FieldValue label={"Active Programs"} className={"mb-2"}>
        {programsTableData.length ? (
          <MinimalTable headers={programsTableHeaders} data={programsTableData} />
        ) : (
          <span className="text-base font-semibold pt-4">{t("t.none")}</span>
        )}
      </FieldValue>
    </GridSection>
  )
}

export default DetailPrograms
