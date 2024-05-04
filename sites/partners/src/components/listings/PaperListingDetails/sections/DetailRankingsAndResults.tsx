import React, { useContext } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)
import { t } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { getLotteryEvent } from "@bloom-housing/shared-helpers"
import { ReviewOrderTypeEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { getDetailFieldNumber, getDetailFieldString, getDetailBoolean } from "./helpers"
import SectionWithGrid from "../../../shared/SectionWithGrid"

const DetailRankingsAndResults = () => {
  const listing = useContext(ListingContext)

  const lotteryEvent = getLotteryEvent(listing)
  const getReviewOrderType = () => {
    if (!listing.reviewOrderType) {
      return lotteryEvent ? ReviewOrderTypeEnum.lottery : ReviewOrderTypeEnum.firstComeFirstServe
    } else {
      return listing.reviewOrderType
    }
  }
  return (
    <SectionWithGrid heading={t("listings.sections.rankingsResultsTitle")} inset>
      {listing.reviewOrderType !== ReviewOrderTypeEnum.waitlist && (
        <Grid.Row>
          <FieldValue id="reviewOrderQuestion" label={t("listings.reviewOrderQuestion")}>
            {getReviewOrderType() === ReviewOrderTypeEnum.firstComeFirstServe
              ? t("listings.firstComeFirstServe")
              : t("listings.lotteryTitle")}
          </FieldValue>
        </Grid.Row>
      )}
      {lotteryEvent && (
        <>
          <Grid.Row>
            <FieldValue id="lotteryEvent.startTime.date" label={t("listings.lotteryDateQuestion")}>
              {dayjs(new Date(lotteryEvent?.startTime)).utc().format("MM/DD/YYYY")}
            </FieldValue>
            <FieldValue id="lotteryEvent.startTime.time" label={t("listings.lotteryStartTime")}>
              {dayjs(new Date(lotteryEvent?.startTime)).format("hh:mm A")}
            </FieldValue>
            <FieldValue id="lotteryEvent.lotteryEndTime.time" label={t("listings.lotteryEndTime")}>
              {dayjs(new Date(lotteryEvent?.endTime)).format("hh:mm A")}
            </FieldValue>
          </Grid.Row>
          <Grid.Row>
            <FieldValue id="lotteryDateNotes" label={t("listings.lotteryDateNotes")}>
              {lotteryEvent?.note}
            </FieldValue>
          </Grid.Row>
        </>
      )}
      {getReviewOrderType() === ReviewOrderTypeEnum.firstComeFirstServe && (
        <Grid.Row>
          <FieldValue id="dueDateQuestion" label={t("listings.dueDateQuestion")}>
            {listing.applicationDueDate ? t("t.yes") : t("t.no")}
          </FieldValue>
        </Grid.Row>
      )}
      {listing.reviewOrderType === ReviewOrderTypeEnum.waitlist && (
        <>
          <Grid.Row>
            <FieldValue id="waitlist.openQuestion" label={t("listings.waitlist.openQuestion")}>
              {getDetailBoolean(listing.isWaitlistOpen)}
            </FieldValue>
          </Grid.Row>
          <Grid.Row>
            <FieldValue id="waitlistOpenSpots" label={t("listings.waitlist.openSize")}>
              {getDetailFieldNumber(listing.waitlistOpenSpots)}
            </FieldValue>
          </Grid.Row>
        </>
      )}

      <Grid.Row>
        <FieldValue id="whatToExpect" label={t("listings.whatToExpectLabel")}>
          {getDetailFieldString(listing.whatToExpect)}
        </FieldValue>
      </Grid.Row>
    </SectionWithGrid>
  )
}

export default DetailRankingsAndResults
