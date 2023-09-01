import React, { useContext } from "react"
import { t, GridSection, GridCell, ExpandableText } from "@bloom-housing/ui-components"
import { FieldValue } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { getDetailFieldString, getDetailFieldDate } from "./helpers"
import { ListingStatus } from "@bloom-housing/backend-core"

const DetailListingNotes = () => {
  const listing = useContext(ListingContext)

  if (!listing.requestedChanges || !(listing.status === ListingStatus.changesRequested)) return

  return (
    <GridSection
      className="bg-primary-lighter"
      title={t("listings.approval.listingNotes")}
      inset
      columns={3}
    >
      <GridCell span={2}>
        <FieldValue id="requestedChanges" label={t("listings.approval.changeRequestSummary")}>
          <ExpandableText
            buttonClassName="ml-4"
            strings={{
              readMore: t("t.more"),
              readLess: t("t.less"),
            }}
          >
            {getDetailFieldString(listing.requestedChanges)}
          </ExpandableText>
        </FieldValue>
      </GridCell>

      <GridCell span={2}>
        <FieldValue id="requestedChangesDate" label={t("listings.approval.requestDate")}>
          {getDetailFieldDate(listing.requestedChangesDate)}
        </FieldValue>
      </GridCell>
      {listing.requestedChangesUser && (
        <GridCell>
          <FieldValue id="requestedChangesUser" label={t("listings.approval.requestedBy")}>
            {`${listing.requestedChangesUser?.firstName} ${listing.requestedChangesUser?.lastName}`}
          </FieldValue>
        </GridCell>
      )}
    </GridSection>
  )
}

export default DetailListingNotes
