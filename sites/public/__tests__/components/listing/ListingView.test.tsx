import React from "react"
import dayjs from "dayjs"
import { ApplicationMethodType } from "@bloom-housing/backend-core/types"
import { render } from "@testing-library/react"
import { ListingView } from "../../../src/components/listing/ListingView"
import { listing, jurisdiction } from "@bloom-housing/shared-helpers/__tests__/testHelpers"

describe("<ListingView>", () => {
  describe("'Apply Online' button visibility", () => {
    it("does not show if the due date is in the past", () => {
      const pastDate = dayjs().subtract(7, "day").toDate()
      const view = render(
        <ListingView
          listing={{
            ...listing,
            applicationDueDate: pastDate,
          }}
          jurisdiction={jurisdiction}
          googleMapsApiKey="GOOGLE_MAPS_KEY"
        />
      )
      expect(view.getByText(/Applications Closed/)).toBeInTheDocument()
      expect(view.queryByText("Apply Online")).toBeNull()
    })

    it("shows if the due date is in the future", () => {
      const futureDate = dayjs().add(7, "day").toDate()
      const view = render(
        <ListingView
          listing={{
            ...listing,
            applicationDueDate: futureDate,
          }}
          jurisdiction={jurisdiction}
          googleMapsApiKey="GOOGLE_MAPS_KEY"
        />
      )
      expect(view.getByText("Apply Online")).toBeInTheDocument()
    })

    it("does not show for paper applications even with a future due date", () => {
      const futureDate = dayjs().add(7, "day").toDate()
      const view = render(
        <ListingView
          listing={{
            ...listing,
            applicationDueDate: futureDate,
            applicationMethods: [
              {
                ...listing.applicationMethods[0],
                type: ApplicationMethodType.PaperPickup,
              },
            ],
          }}
          jurisdiction={jurisdiction}
          googleMapsApiKey="GOOGLE_MAPS_KEY"
        />
      )
      expect(view.queryByText("Apply Online")).toBeNull()
    })
  })
})
