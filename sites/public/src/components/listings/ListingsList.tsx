import * as React from "react"
import { getListings } from "../../lib/helpers"
import { Listing, Jurisdiction } from "@bloom-housing/backend-core"
import { LinkButton, ZeroListingsItem } from "@bloom-housing/doorway-ui-components"
import { Pagination } from "./Pagination"
import { LoadingOverlay, t, InfoCard } from "@bloom-housing/ui-components"

type ListingsListProps = {
  jurisdiction: Jurisdiction
  listings: Listing[]
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  loading: boolean
}

const ListingsList = (props: ListingsListProps) => {
  const listingsDiv = (
    <div id="listingsList">
      {props.listings.length > 0 || props.loading ? (
        <div className="listingsList">{getListings(props.listings)}</div>
      ) : (
        <ZeroListingsItem title={t("t.noMatchingListings")} description={t("t.tryRemovingFilters")}>
          {/* <Button>{t("t.clearAllFilters")}</Button> */}
        </ZeroListingsItem>
      )}
    </div>
  )

  const infoCards =
    props.currentPage == props.lastPage || props.lastPage == 0 ? (
      <div>
        <InfoCard
          title={t("t.signUpForAlerts")}
          subtitle={t("t.subscribeToListingAlerts")}
          className="is-normal-primary-lighter"
        >
          <LinkButton
            href={props.jurisdiction.notificationsSignUpURL}
            newTab={true}
            className="is-primary"
          >
            {t("t.signUp")}
          </LinkButton>
        </InfoCard>
        <InfoCard
          title={t("t.needHelp")}
          subtitle={t("t.emergencyShelter")}
          className="is-normal-secondary-lighter"
        >
          <LinkButton href="/help/housing-help" className="is-secondary">
            {t("t.helpCenter")}
          </LinkButton>
        </InfoCard>
        <InfoCard
          title={t("t.housingInSanFrancisco")}
          subtitle={t("t.seeSanFranciscoListings")}
          className="is-normal-secondary-lighter"
        >
          <LinkButton href="https://housing.sfgov.org/" newTab={true} className="is-secondary">
            {t("t.seeListings")}
          </LinkButton>
        </InfoCard>
      </div>
    ) : (
      <div></div>
    )
  const pagination =
    props.lastPage != 0 ? (
      <Pagination
        currentPage={props.currentPage}
        lastPage={props.lastPage}
        onPageChange={props.onPageChange}
      />
    ) : (
      <></>
    )
  return (
    <div>
      <LoadingOverlay isLoading={props.loading}>{listingsDiv}</LoadingOverlay>
      {pagination}
      {infoCards}
    </div>
  )
}
export { ListingsList as default, ListingsList }
