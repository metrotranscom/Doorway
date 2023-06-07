import { LatitudeLongitude } from "@bloom-housing/ui-components"
import AdditionalMetadataFormatter from "../../../src/lib/listings/AdditionalMetadataFormatter"
import { FormListing, FormMetadata } from "../../../src/lib/listings/formTypes"

const latLong: LatitudeLongitude = {
  latitude: 37.44522,
  longitude: -121.81524,
}

const formatData = (data, metadata) => {
  return new AdditionalMetadataFormatter({ ...data }, metadata).format().data
}

const fixtureData = { reservedCommunityType: { id: "12345" } } as FormListing

describe("AdditionalMetadataFormatter", () => {
  it("should format preferences", () => {
    const metadata = {
      latLong,
      preferences: [
        {
          text: "Preference 1",
        },
        {
          text: "Preference 2",
        },
      ],
      programs: [],
    } as FormMetadata

    expect(formatData(fixtureData, metadata).listingMultiselectQuestions).toEqual([
      { multiselectQuestion: { text: "Preference 1" }, ordinal: 1 },
      { multiselectQuestion: { text: "Preference 2" }, ordinal: 2 },
    ])
  })

  it("should format buildingAddress", () => {
    const address = { street: "123 Anywhere St.", city: "Anytown", state: "CA" }
    const data = {
      ...fixtureData,
      buildingAddress: address,
    }
    const metadata = {
      preferences: [],
      programs: [],
      latLong,
    }

    expect(formatData(data, metadata).buildingAddress).toEqual({ ...address, ...latLong })
  })
})
