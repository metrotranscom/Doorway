import React, { useContext, useMemo, useState } from "react"
import dayjs from "dayjs"
import { t, MinimalTable, Drawer } from "@bloom-housing/ui-components"
import { Button, Card, FieldValue, Grid, Link } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { getDetailFieldDate, getDetailFieldTime } from "./helpers"
import { ListingEvent, ListingEventType } from "@bloom-housing/backend-core/types"
import SectionWithGrid from "../../../shared/SectionWithGrid"

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
              content: url ? <Link href={url}>{t("t.url")}</Link> : t("t.n/a"),
            },
            view: {
              content: (
                <div className="flex">
                  <Button
                    type="button"
                    variant="text"
                    className="font-semibold"
                    onClick={() => setDrawer(event)}
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
      <SectionWithGrid heading={t("listings.sections.applicationDatesTitle")} inset>
        <Grid.Row columns={3}>
          <FieldValue id="applicationDeadline" label={t("listings.applicationDeadline")}>
            {getDetailFieldDate(listing.applicationDueDate) ?? t("t.n/a")}
          </FieldValue>
          <FieldValue
            id="applicationDueTime"
            className="seeds-grid-span-2"
            label={t("listings.applicationDueTime")}
          >
            {getDetailFieldTime(listing.applicationDueDate) ?? t("t.n/a")}
          </FieldValue>
        </Grid.Row>

        {!!openHouseEvents.length && (
          <Grid.Row columns={1}>
            <FieldValue id="openHouseEvent.header" label={t("listings.openHouseEvent.header")}>
              <MinimalTable
                id="openhouseHeader"
                className="spacer-heading-above"
                headers={openHouseHeaders}
                data={openHouseEvents}
              />
            </FieldValue>
          </Grid.Row>
        )}

        <Drawer
          open={!!drawer}
          title={t("listings.sections.openHouse")}
          ariaDescription={t("listings.unit.title")}
          onClose={() => setDrawer(null)}
        >
          <Card spacing="lg" className="spacer-section">
            <Card.Section>
              <Grid className="grid-inset-section">
                <Grid.Row columns={3}>
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
                      <Link className="mx-0 my-0" href={drawer.url}>
                        {drawer?.label ?? t("t.url")}
                      </Link>
                    ) : (
                      t("t.n/a")
                    )}
                  </FieldValue>
                  <FieldValue
                    id="events.openHouseNotes"
                    label={t("listings.events.openHouseNotes")}
                  >
                    {drawer?.note || t("t.n/a")}
                  </FieldValue>
                </Grid.Row>
              </Grid>
            </Card.Section>
          </Card>

          <Button variant="primary" onClick={() => setDrawer(null)}>
            {t("t.done")}
          </Button>
        </Drawer>
      </SectionWithGrid>
    </>
  )
}

export default DetailApplicationDates
