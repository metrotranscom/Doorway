import React, { useContext, useMemo } from "react"
import dayjs from "dayjs"
import {
  t,
  Button,
  GridCell,
  AppearanceStyleType,
  AppearanceBorderType,
  StatusMessages,
  LocalizedLink,
  LinkButton,
  Icon,
} from "@bloom-housing/ui-components"
import { pdfUrlFromListingEvents } from "@bloom-housing/shared-helpers"
import { ListingContext } from "./ListingContext"
import { ListingEventType, ListingStatus } from "@bloom-housing/backend-core/types"
import { StatusAside } from "../shared/StatusAside"

type AsideProps = {
  type: AsideType
  showCloseListingModal?: () => void
  showLotteryResultsDrawer?: () => void
  submitFormWithStatus?: (confirm?: boolean, status?: ListingStatus) => void
}

type AsideType = "add" | "edit" | "details"

const Aside = ({
  type,
  showCloseListingModal,
  showLotteryResultsDrawer,
  submitFormWithStatus,
}: AsideProps) => {
  const listing = useContext(ListingContext)

  const listingId = listing?.id

  const recordUpdated = useMemo(() => {
    if (!listing) return null

    const dayjsDate = dayjs(listing.updatedAt)

    return dayjsDate.format("MMMM DD, YYYY")
  }, [listing])

  const actions = useMemo(() => {
    const elements = []

    const cancel = (
      <GridCell className="flex" key="btn-cancel">
        <LinkButton
          unstyled
          fullWidth
          className="bg-opacity-0 text-blue-700"
          href={type === "add" ? "/" : `/listings/${listingId}`}
          type="button"
        >
          {t("t.cancel")}
        </LinkButton>
      </GridCell>
    )

    if (type === "details") {
      elements.push(
        <GridCell key="btn-submitNew">
          <LocalizedLink href={`/listings/${listingId}/edit`}>
            <Button
              styleType={AppearanceStyleType.primary}
              fullWidth
              onClick={() => false}
              type="button"
              dataTestId="listingEditButton"
            >
              {t("t.edit")}
            </Button>
          </LocalizedLink>
        </GridCell>
      )
    }

    if (type === "add") {
      elements.push(
        <GridCell key="btn-publish">
          <Button
            id="publishButton"
            styleType={AppearanceStyleType.success}
            type="button"
            fullWidth
            onClick={() => {
              submitFormWithStatus(true, ListingStatus.active)
            }}
          >
            {t("listings.actions.publish")}
          </Button>
        </GridCell>,
        <GridCell key="btn-draft">
          <Button
            type="button"
            fullWidth
            onClick={() => submitFormWithStatus(false, ListingStatus.pending)}
          >
            {t("listings.actions.draft")}
          </Button>
        </GridCell>
      )
    }

    if (type === "edit") {
      elements.push(
        <GridCell key="btn-save">
          <Button
            styleType={AppearanceStyleType.primary}
            type="button"
            fullWidth
            onClick={() => submitFormWithStatus(true, listing.status)}
            dataTestId={"saveAndExitButton"}
          >
            {t("t.saveExit")}
          </Button>
        </GridCell>
      )

      if (listing.status === ListingStatus.pending || listing.status === ListingStatus.closed) {
        elements.push(
          <GridCell key="btn-publish">
            <Button
              id="publishButton"
              type="button"
              styleType={AppearanceStyleType.success}
              fullWidth
              onClick={() => {
                submitFormWithStatus(true, ListingStatus.active)
              }}
            >
              {t("listings.actions.publish")}
            </Button>
          </GridCell>
        )
      }

      if (listing.status === ListingStatus.active) {
        elements.push(
          <div className="grid gap-2" key="btn-close-unpublish">
            <Button
              type="button"
              fullWidth
              onClick={() => showCloseListingModal && showCloseListingModal()}
            >
              {t("listings.actions.close")}
            </Button>

            <Button
              styleType={AppearanceStyleType.alert}
              fullWidth
              type="button"
              onClick={() => submitFormWithStatus(false, ListingStatus.pending)}
              border={AppearanceBorderType.outlined}
            >
              {t("listings.actions.unpublish")}
            </Button>
          </div>
        )
      }

      const lotteryResults = listing.events.find(
        (event) => event.type === ListingEventType.lotteryResults
      )
      if (lotteryResults) {
        elements.push(
          <GridCell className="flex" key="btn-edit-lottery">
            <Button
              type="button"
              unstyled
              fullWidth
              className="bg-opacity-0"
              onClick={() => showLotteryResultsDrawer && showLotteryResultsDrawer()}
            >
              {t("listings.actions.resultsPosted")}{" "}
              {dayjs(lotteryResults?.startTime).format("MMMM DD, YYYY")}
              <Icon size="medium" symbol="edit" className="ml-2" />
            </Button>
          </GridCell>
        )
      } else if (listing.status === ListingStatus.closed) {
        elements.push(
          <GridCell key="btn-post-results">
            <Button
              type="button"
              styleType={AppearanceStyleType.success}
              fullWidth
              onClick={() => showLotteryResultsDrawer && showLotteryResultsDrawer()}
            >
              {t("listings.actions.postResults")}
            </Button>
          </GridCell>
        )
      }
    }

    if (type === "details") {
      elements.push(
        <GridCell key="btn-preview">
          <a
            target="_blank"
            href={`${listing?.jurisdiction.publicUrl}/preview/listings/${listingId}`}
          >
            <Button fullWidth onClick={() => false} type="button">
              {t("listings.actions.preview")}
            </Button>
          </a>
        </GridCell>
      )

      if (listing.events.find((event) => event.type === ListingEventType.lotteryResults)) {
        const eventUrl = pdfUrlFromListingEvents(listing.events, ListingEventType.lotteryResults)
        elements.push(
          <GridCell className="flex" key="btn-preview-results">
            <a href={eventUrl} target="_blank" className="inline-flex w-full">
              <Button type="button" unstyled fullWidth className="bg-opacity-0">
                {t("listings.actions.previewLotteryResults")}{" "}
                <Icon size="medium" symbol="link" className="ml-2" />
              </Button>
            </a>
          </GridCell>
        )
      }
    }

    if (type === "add" || type === "edit") {
      elements.push(cancel)
    }

    return elements
  }, [
    listing,
    listingId,
    showCloseListingModal,
    showLotteryResultsDrawer,
    submitFormWithStatus,
    type,
  ])

  return (
    <>
      <StatusAside columns={1} actions={actions}>
        {type === "edit" && <StatusMessages lastTimestamp={recordUpdated} />}
      </StatusAside>
    </>
  )
}

export default Aside
