import * as React from "react"
import { getListings } from "../../lib/helpers"
import { Listing } from "@bloom-housing/backend-core"
import {
  Button,
  InfoCard,
  LinkButton,
  ZeroListingsItem,
  t,
} from "@bloom-housing/doorway-ui-components"

type ListingsListProps = {
  listings: Listing[]
}

const ListingsList = (props: ListingsListProps) => {
  const listingsDiv =
    props.listings.length > 0 ? (
      <div className="listingsList">{getListings(props.listings)}</div>
    ) : (
      <ZeroListingsItem title={t("t.noMatchingListings")} description={t("t.tryRemovingFilters")}>
        <Button>{t("t.clearAllFilters")}</Button>
      </ZeroListingsItem>
    )
  return (
    <div>
      {listingsDiv}
      {/* TODO: once pagination is implemented for listings, the following should only show on the last page. */}
      <InfoCard
        title={t("t.signUpForAlerts")}
        subtitle={t("t.subscribeToNewsletter")}
        className="is-normal-primary-lighter"
      >
        <Button className="is-primary">{t("t.signUp")}</Button>
      </InfoCard>
      <InfoCard
        title={t("t.needHelp")}
        subtitle={t("t.emergencyShelter")}
        className="is-normal-secondary-lighter"
      >
        <Button className="is-secondary">{t("t.helpCenter")}</Button>
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
  )
}
export { ListingsList as default, ListingsList }
