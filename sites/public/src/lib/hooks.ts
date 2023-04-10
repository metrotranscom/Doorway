import { useContext, useEffect, useState } from "react"
import axios from "axios"
import qs from "qs"
import { useRouter } from "next/router"
import { ApplicationStatusProps, isInternalLink } from "@bloom-housing/ui-components"
import {
  EnumListingFilterParamsComparison,
  EnumListingFilterParamsStatus,
  Jurisdiction,
  Listing,
  ListingFilterParams,
  OrderByFieldsEnum,
  OrderParam,
} from "@bloom-housing/backend-core/types"
import { ParsedUrlQuery } from "querystring"
import { AppSubmissionContext } from "./applications/AppSubmissionContext"
import { getListingApplicationStatus } from "./helpers"

export const useRedirectToPrevPage = (defaultPath = "/") => {
  const router = useRouter()

  return (queryParams: ParsedUrlQuery = {}) => {
    const redirectUrl =
      typeof router.query.redirectUrl === "string" && isInternalLink(router.query.redirectUrl)
        ? router.query.redirectUrl
        : defaultPath
    const redirectParams = { ...queryParams }
    if (router.query.listingId) redirectParams.listingId = router.query.listingId

    return router.push({ pathname: redirectUrl, query: redirectParams })
  }
}

export const useFormConductor = (stepName: string) => {
  const context = useContext(AppSubmissionContext)
  const conductor = context.conductor

  conductor.stepTo(stepName)

  useEffect(() => {
    conductor.skipCurrentStepIfNeeded()
  }, [conductor])
  return context
}

export const useGetApplicationStatusProps = (listing: Listing): ApplicationStatusProps => {
  const [props, setProps] = useState({ content: "", subContent: "" })

  useEffect(() => {
    if (!listing) return

    const { content, subContent } = getListingApplicationStatus(listing)

    setProps({ content, subContent })
  }, [listing])

  return props
}

export async function fetchBaseListingData({
  additionalFilters,
  orderBy,
  orderDir,
}: {
  additionalFilters?: ListingFilterParams[]
  orderBy?: OrderByFieldsEnum[]
  orderDir?: OrderParam[]
}) {
  let listings = []
  try {
    const { id: jurisdictionId } = await fetchJurisdictionByName()

    if (!jurisdictionId) {
      return listings
    }
    let filter: ListingFilterParams[] = [
      {
        $comparison: EnumListingFilterParamsComparison["="],
        jurisdiction: jurisdictionId,
      },
    ]

    if (additionalFilters) {
      filter = filter.concat(additionalFilters)
    }
    const params: {
      view: string
      limit: string
      filter: ListingFilterParams[]
      orderBy?: OrderByFieldsEnum[]
      orderDir?: OrderParam[]
      bloomJurisdiction?: string[]
    } = {
      view: "base",
      limit: "all",
      filter,
    }
    if (orderBy) {
      params.orderBy = orderBy
    }
    if (orderDir) {
      params.orderDir = orderDir
    }

    if (process.env.bloomJurisdictionNames.length != 0) {
      // This function early returns if the jurisdictions have already been.
      // fetched from the Bloom API.
      const jurisdictions = await fetchBloomJurisdictionsByName()
      params.bloomJurisdiction = jurisdictions.map((jurisdiction) => jurisdiction.id)

      const response = await axios.get(process.env.listingsWithExternalServiceUrl, {
        params,
        paramsSerializer: (params) => {
          return qs.stringify(params)
        },
      })
      const listingsWithExternal = response.data
      let allListings = listingsWithExternal.local.items
      for (const k in listingsWithExternal.external) {
        allListings = allListings.concat(listingsWithExternal.external[k].items)
      }
      return allListings
    }
    const response = await axios.get(process.env.listingServiceUrl, {
      params,
      paramsSerializer: (params) => {
        return qs.stringify(params)
      },
    })

    listings = response.data?.items
  } catch (e) {
    console.log("fetchBaseListingData error: ", e)
  }

  return listings
}

export async function fetchOpenListings() {
  return await fetchBaseListingData({
    additionalFilters: [
      {
        $comparison: EnumListingFilterParamsComparison["="],
        status: EnumListingFilterParamsStatus.active,
      },
    ],
    orderBy: [OrderByFieldsEnum.mostRecentlyPublished],
    orderDir: [OrderParam.DESC],
  })
}

export async function fetchClosedListings() {
  return await fetchBaseListingData({
    additionalFilters: [
      {
        $comparison: EnumListingFilterParamsComparison["="],
        status: EnumListingFilterParamsStatus.closed,
      },
    ],
    orderBy: [OrderByFieldsEnum.mostRecentlyClosed],
    orderDir: [OrderParam.DESC],
  })
}

let jurisdiction: Jurisdiction | null = null
const bloomJurisdictions: Jurisdiction[] = []

export async function fetchBloomJurisdictionsByName() {
  if (bloomJurisdictions.length != 0) {
    return bloomJurisdictions
  }

  try {
    for (const jurisdictionName of process.env.bloomJurisdictionNames) {
      const jurisdictionRes = await axios.get(
        `${process.env.bloomJurisdictionsUrl}/${jurisdictionName}`
      )
      bloomJurisdictions.push(jurisdictionRes?.data)
    }
  } catch (error) {
    console.log("Error fetching Bloom jurisdictions, will not include")
    console.log("message = ", error)
    // clear the jurisdictions array to avoid undefined behavior
    bloomJurisdictions.length = 0
  }

  return bloomJurisdictions
}

export async function fetchJurisdictionByName() {
  try {
    if (jurisdiction) {
      return jurisdiction
    }

    const jurisdictionName = process.env.jurisdictionName
    const jurisdictionRes = await axios.get(
      `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`
    )
    jurisdiction = jurisdictionRes?.data
  } catch (error) {
    console.log("error = ", error)
  }

  return jurisdiction
}
