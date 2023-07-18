import React, { useContext, useMemo, useState } from "react"
import dayjs from "dayjs"
import {
  t,
  GridSection,
  GridCell,
  MinimalTable,
  Button,
  Drawer,
  AppearanceStyleType,
  LinkButton,
} from "@bloom-housing/ui-components"
import { FieldValue } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { getDetailFieldDate, getDetailFieldTime } from "./helpers"
import { ListingEvent, ListingEventType } from "@bloom-housing/backend-core/types"

const DetailApplicationDates = () => {
  const listing = useContext(ListingContext)

  const [drawer, setDrawer] = useState<ListingEvent | null>(null)

  const openHouseHeaders = {
    date: "t.date",
    startTime: "t.startTime",
    endTime: "t.endTime",
    url: "t.link",
    view: "",
  }

  const openHouseEvents = useMemo(
    () =>
      listing.events
        .filter((item) => item.type === ListingEventType.openHouse)
        .sort((a, b) => (dayjs(a.startTime).isAfter(b.startTime) ? 1 : -1))
        .map((event) => {
          const { startTime, endTime, url } = event

          return {
            date: { content: startTime && getDetailFieldDate(startTime) },
            startTime: { content: startTime && getDetailFieldTime(startTime) },
            endTime: { content: endTime && getDetailFieldTime(endTime) },
            url: {
              content: url ? (
                <LinkButton className="mx-0" href={url} unstyled>
                  {t("t.url")}
                </LinkButton>
              ) : (
                t("t.n/a")
              ),
            },
            view: {
              content: (
                <div className="flex">
                  <Button
                    type="button"
                    className="front-semibold uppercase my-0"
                    onClick={() => setDrawer(event)}
                    unstyled
                  >
                    {t("t.view")}
                  </Button>
                </div>
              ),
            },
          }
        }),
    [listing]
  )

  return (
    <>
      <GridSection
        className="bg-primary-lighter"
        title={t("listings.sections.applicationDatesTitle")}
        grid={false}
        inset
      >
        <GridSection columns={3}>
          <GridCell>
            <FieldValue id="applicationDeadline" label={t("listings.applicationDeadline")}>
              {getDetailFieldDate(listing.applicationDueDate) ?? t("t.n/a")}
            </FieldValue>
          </GridCell>
          <GridCell>
            <FieldValue id="applicationDueTime" label={t("listings.applicationDueTime")}>
              {getDetailFieldTime(listing.applicationDueDate) ?? t("t.n/a")}
            </FieldValue>
          </GridCell>
        </GridSection>

        {!!openHouseEvents.length && (
          <GridSection columns={1}>
            <FieldValue id="openHouseEvent.header" label={t("listings.openHouseEvent.header")}>
              <div className="mt-5">
                <div className="mb-5">
                  <MinimalTable
                    id="openhouseHeader"
                    headers={openHouseHeaders}
                    data={openHouseEvents}
                  />
                </div>
              </div>
            </FieldValue>
          </GridSection>
        )}

        <Drawer
          open={!!drawer}
          title={t("listings.sections.openHouse")}
          ariaDescription={t("listings.unit.title")}
          onClose={() => setDrawer(null)}
        >
          <section className="border rounded-md p-8 bg-white mb-8">
            <GridSection tinted={true} inset={true} grid={false}>
              <GridSection grid columns={3}>
                <FieldValue id="drawer.startTime.date" label={t("t.date")}>
                  {drawer?.startTime && getDetailFieldDate(drawer.startTime)}
                </FieldValue>
                <FieldValue id="drawer.startTime.time" label={t("t.startTime")}>
                  {getDetailFieldTime(drawer?.startTime)}
                </FieldValue>
                <FieldValue id="drawer.endTime.time" label={t("t.endTime")}>
                  {drawer?.endTime && getDetailFieldTime(drawer?.endTime)}
                </FieldValue>
                <FieldValue id="drawer.url" label={t("t.url")}>
                  {drawer?.url ? (
                    <LinkButton className="mx-0 my-0" href={drawer.url} unstyled>
                      {drawer?.label ?? t("t.url")}
                    </LinkButton>
                  ) : (
                    t("t.n/a")
                  )}
                </FieldValue>
                <FieldValue id="events.openHouseNotes" label={t("listings.events.openHouseNotes")}>
                  {drawer?.note || t("t.n/a")}
                </FieldValue>
              </GridSection>
            </GridSection>
          </section>

          <Button styleType={AppearanceStyleType.primary} onClick={() => setDrawer(null)}>
            {t("t.done")}
          </Button>
        </Drawer>
      </GridSection>
    </>
  )
}

export default DetailApplicationDates
