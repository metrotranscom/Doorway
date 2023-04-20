import React, { useMemo, useContext } from "react"
import Head from "next/head"
import {
  t,
  Button,
  LocalizedLink,
  AgTable,
  useAgTable,
  AppearanceSizeType,
  SiteAlert,
} from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import dayjs from "dayjs"
import { ColDef, ColGroupDef } from "ag-grid-community"
import { useListingsData } from "../lib/hooks"
import Layout from "../layouts"
import { MetaTags } from "../components/shared/MetaTags"
import { NavigationHeader } from "../components/shared/NavigationHeader"

class formatLinkCell {
  link: HTMLAnchorElement

  init(params) {
    this.link = document.createElement("a")
    this.link.classList.add("text-blue-700")
    this.link.setAttribute("href", `/listings/${params.data.id}/applications`)
    this.link.innerText = params.valueFormatted || params.value
  }

  getGui() {
    return this.link
  }
}

class formatWaitlistStatus {
  text: HTMLSpanElement

  init({ data }) {
    const isWaitlistOpen = data.waitlistCurrentSize < data.waitlistMaxSize

    this.text = document.createElement("span")
    this.text.innerHTML = isWaitlistOpen ? t("t.yes") : t("t.no")
  }

  getGui() {
    return this.text
  }
}

class ApplicationsLink extends formatLinkCell {
  init(params) {
    super.init(params)
    this.link.setAttribute("href", `/listings/${params.data.id}/applications`)
    this.link.setAttribute("data-testid", "listing-status-cell")
  }
}

class ListingsLink extends formatLinkCell {
  init(params) {
    super.init(params)
    this.link.setAttribute("href", `/listings/${params.data.id}`)
    this.link.setAttribute("data-testid", params.data.name)
  }
}

export default function ListingsList() {
  const metaDescription = t("pageDescription.welcome", { regionName: t("region.name") })

  const { profile } = useContext(AuthContext)
  const isAdmin = profile.roles?.isAdmin || profile.roles?.isJurisdictionalAdmin || false

  const tableOptions = useAgTable()

  const gridComponents = {
    ApplicationsLink,
    formatLinkCell,
    formatWaitlistStatus,
    ListingsLink,
  }

  const columnDefs = useMemo(() => {
    const columns: (ColDef | ColGroupDef)[] = [
      {
        headerName: t("listings.listingName"),
        field: "name",
        sortable: true,
        filter: false,
        resizable: true,
        cellRenderer: "ListingsLink",
        minWidth: 200,
        flex: 1,
      },
      {
        headerName: t("listings.listingStatusText"),
        field: "status",
        sortable: false,
        filter: false,
        resizable: true,
        valueFormatter: ({ value }) => t(`listings.listingStatus.${value}`),
        cellRenderer: "ApplicationsLink",
      },
      {
        headerName: t("listings.applicationDeadline"),
        field: "applicationDueDate",
        sortable: false,
        filter: false,
        resizable: true,
        valueFormatter: ({ value }) => (value ? dayjs(value).format("MM/DD/YYYY") : t("t.none")),
      },
      {
        headerName: t("listings.availableUnits"),
        field: "unitsAvailable",
        sortable: false,
        filter: false,
        resizable: true,
      },
      {
        headerName: t("listings.waitlist.open"),
        field: "waitlistCurrentSize",
        sortable: false,
        filter: false,
        resizable: true,
        cellRenderer: "formatWaitlistStatus",
      },
    ]
    return columns
  }, [])

  const { listingDtos, listingsLoading } = useListingsData({
    page: tableOptions.pagination.currentPage,
    limit: tableOptions.pagination.itemsPerPage,
    search: tableOptions.filter.filterValue,
    userId: profile?.id,
    sort: tableOptions.sort.sortOptions,
    roles: profile?.roles,
    userJurisidctionIds: profile?.jurisdictions?.map((jurisdiction) => jurisdiction.id),
  })

  return (
    <Layout>
      <Head>
        <title>{t("nav.siteTitlePartners")}</title>
      </Head>
      <SiteAlert type="success" timeout={5000} dismissable sticky={true} />
      <MetaTags title={t("nav.siteTitlePartners")} description={metaDescription} />
      <NavigationHeader title={t("nav.listings")} />
      <section>
        <article className="flex-row flex-wrap relative max-w-screen-xl mx-auto py-8 px-4">
          <AgTable
            id="listings-table"
            pagination={{
              perPage: tableOptions.pagination.itemsPerPage,
              setPerPage: tableOptions.pagination.setItemsPerPage,
              currentPage: tableOptions.pagination.currentPage,
              setCurrentPage: tableOptions.pagination.setCurrentPage,
            }}
            config={{
              gridComponents,
              columns: columnDefs,
              totalItemsLabel: t("listings.totalListings"),
            }}
            data={{
              items: listingDtos?.items,
              loading: listingsLoading,
              totalItems: listingDtos?.meta.totalItems,
              totalPages: listingDtos?.meta.totalPages,
            }}
            search={{
              setSearch: tableOptions.filter.setFilterValue,
            }}
            sort={{
              setSort: tableOptions.sort.setSortOptions,
            }}
            headerContent={
              <div className="flex-row">
                {isAdmin && (
                  <LocalizedLink href={`/listings/add`}>
                    <Button size={AppearanceSizeType.small} className="mx-1" onClick={() => false}>
                      {t("listings.addListing")}
                    </Button>
                  </LocalizedLink>
                )}
              </div>
            }
          />
        </article>
      </section>
    </Layout>
  )
}
