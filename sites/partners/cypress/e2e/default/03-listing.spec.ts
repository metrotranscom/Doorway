describe("Listing Management Tests", () => {
  beforeEach(() => {
    cy.login()
  })

  after(() => {
    cy.signOut()
  })

  it("full listing publish", () => {
    cy.intercept("POST", "/api/adapter/upload", {
      body: {
        id: "123",
        url:
          "https://assets.website-files.com/5fbfdd121e108ea418ede824/5fbfdea9a7287d45a63d821b_Exygy%20Logo.svg",
      },
    })
    cy.visit("/")
    cy.get("a").contains("Add Listing").click()
    cy.contains("New Listing")
    cy.fixture("listing").then((listing) => {
      fillOutListing(cy, listing)
      verifyDetails(cy, listing)
      verifyOpenListingWarning(cy, listing)
    })
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function fillOutListing(cy: Cypress.cy, listing: any): void {
    cy.getByID("jurisdiction.id").select(listing["jurisdiction.id"])
    cy.getByID("name").type(listing["name"])
    cy.getByID("developer").type(listing["developer"])
    // Test photo upload
    cy.getByID("add-photos-button").contains("Add Photo").click()
    cy.getByTestId("dropzone-input").attachFile(
      "cypress-automated-image-upload-071e2ab9-5a52-4f34-85f0-e41f696f4b96.jpeg",
      {
        subjectType: "drag-n-drop",
      }
    )

    cy.getByTestId("drawer-photos-table")
      .find("img")
      .should("have.attr", "src")
      .should(
        "include",
        "https://assets.website-files.com/5fbfdd121e108ea418ede824/5fbfdea9a7287d45a63d821b_Exygy%20Logo.svg"
      )
    cy.getByID("listing-photo-uploaded").contains("Save").click()
    cy.getByTestId("photos-table")
      .find("img")
      .should("have.attr", "src")
      .should(
        "include",
        "https://assets.website-files.com/5fbfdd121e108ea418ede824/5fbfdea9a7287d45a63d821b_Exygy%20Logo.svg"
      )

    cy.getByID("add-photos-button").contains("Edit Photos").click()
    cy.getByTestId("dropzone-input").attachFile(
      "cypress-automated-image-upload-46806882-b98d-49d7-ac83-8016ab4b2f08.jpg",
      {
        subjectType: "drag-n-drop",
      }
    )
    cy.intercept("/api/adapter/upload", {
      body: {
        id: "123",
        url:
          "https://assets.website-files.com/5fbfdd121e108ea418ede824/5fd24fe68d7d2422b6297ed4_Frame%2085.svg",
      },
    })
    cy.getByTestId("drawer-photos-table")
      .find("img")
      .eq(1)
      .should("have.attr", "src")
      .should(
        "include",
        "https://assets.website-files.com/5fbfdd121e108ea418ede824/5fd24fe68d7d2422b6297ed4_Frame%2085.svg"
      )
    cy.getByID("listing-photo-uploaded").contains("Save").click()
    cy.getByTestId("photos-table")
      .find("img")
      .eq(1)
      .should("have.attr", "src")
      .should(
        "include",
        "https://assets.website-files.com/5fbfdd121e108ea418ede824/5fd24fe68d7d2422b6297ed4_Frame%2085.svg"
      )
    cy.getByTestId("photos-table").get("tbody > tr").should("have.length", 2)
    cy.getByTestId("photos-table")
      .get("tbody > tr:nth-of-type(2)")
      .should("not.contain", "Primary photo")

    cy.getByID("buildingAddress.street").type(listing["buildingAddress.street"])
    cy.getByID("neighborhood").type(listing["neighborhood"])
    cy.getByID("buildingAddress.city").type(listing["buildingAddress.city"])
    cy.getByID("buildingAddress.county").select(listing["buildingAddress.county"])
    cy.getByID("buildingAddress.state").select(listing["buildingAddress.state"])
    cy.getByID("buildingAddress.zipCode").type(listing["buildingAddress.zipCode"])
    cy.getByID("yearBuilt").type(listing["yearBuilt"])
    cy.get(".addressPopup").contains(listing["buildingAddress.street"])
    cy.getByID("reservedCommunityType.id").select(listing["reservedCommunityType.id"])
    cy.getByID("reservedCommunityDescription").type(listing["reservedCommunityDescription"])
    cy.getByTestId("unit-types").check()
    cy.getByTestId("listingAvailability.availableUnits").check()
    cy.getByID("addUnitsButton").contains("Add Unit").click()
    cy.getByID("number").type(listing["number"])
    cy.getByID("unitType.id").select(listing["unitType.id"])
    cy.getByID("numBathrooms").select(listing["numBathrooms"])
    cy.getByID("floor").select(listing["floor"])
    cy.getByID("sqFeet").type(listing["sqFeet"])
    cy.getByID("minOccupancy").select(listing["minOccupancy"])
    cy.getByID("maxOccupancy").select(listing["maxOccupancy"])
    cy.getByID("fixed").check()
    cy.getByID("monthlyIncomeMin").type(listing["monthlyIncomeMin"])
    cy.getByID("monthlyRent").type(listing["monthlyRent"])
    cy.getByID("priorityType.id").select(listing["priorityType.id"])
    cy.get("button").contains("Save & Exit").click()
    cy.getByID("add-preferences-button").contains("Add Preference").click()
    cy.get(".border > button").contains("Select Preferences").click()
    cy.get(
      ":nth-child(1) > .seeds-grid > .seeds-grid-row > .seeds-grid-cell > .field > div > .label"
    )
      .contains("Live/Work in County")
      .click()
    cy.getByID("addPreferenceSaveButton").contains("Save").click()

    cy.get(".drawer__content > button").contains("Save").click()
    cy.getByID("applicationFee").type(listing["applicationFee"])
    cy.getByID("depositMin").type(listing["depositMin"])
    cy.getByID("depositMax").type(listing["depositMax"])
    cy.getByID("costsNotIncluded").type(listing["costsNotIncluded"])
    cy.getByID("applicationFee").type(listing["applicationFee"])
    cy.getByID("depositMin").type(listing["depositMin"])
    cy.getByID("depositMax").type(listing["depositMax"])
    cy.getByID("costsNotIncluded").type(listing["costsNotIncluded"])
    cy.getByID("amenities").type(listing["amenities"])
    cy.getByID("accessibility").type(listing["accessibility"])
    cy.getByID("unitAmenities").type(listing["unitAmenities"])
    cy.getByID("smokingPolicy").type(listing["smokingPolicy"])
    cy.getByID("petPolicy").type(listing["petPolicy"])
    cy.getByID("servicesOffered").type(listing["servicesOffered"])
    cy.getByID("creditHistory").type(listing["creditHistory"])
    cy.getByID("rentalHistory").type(listing["rentalHistory"])
    cy.getByID("criminalBackground").type(listing["criminalBackground"])
    cy.getByID("addBuildingSelectionCriteriaButton")
      .contains("Add Building Selection Criteria")
      .click()
    cy.getByID("criteriaAttachTypeURL").check()
    cy.getByID("buildingSelectionCriteriaURL").type(listing["buildingSelectionCriteriaURL"])
    cy.get(".drawer button").contains("Save").click()
    cy.getByID("requiredDocuments").type(listing["requiredDocuments"])
    cy.getByID("programRules").type(listing["programRules"])
    cy.getByID("specialNotes").type(listing["specialNotes"])
    cy.get("button").contains("Application Process").click()
    cy.getByID("reviewOrderFCFS").check()
    cy.getByID("dueDateQuestionNo").check()
    cy.getByID("waitlistOpenNo").check()
    cy.getByID("leasingAgentName").type(listing["leasingAgentName"])
    cy.getByID("leasingAgentEmail").type(listing["leasingAgentEmail"])
    cy.getByID("leasingAgentPhone").type(listing["leasingAgentPhone"])
    cy.getByID("leasingAgentTitle").type(listing["leasingAgentTitle"])
    cy.getByID("leasingAgentOfficeHours").type(listing["leasingAgentOfficeHours"])
    cy.getByID("digitalApplicationChoiceYes").check()
    cy.getByID("customOnlineApplicationUrl").type(listing["url"])
    cy.getByID("paperApplicationNo").check()

    cy.getByID("leasingAgentAddress.street").type(listing["leasingAgentAddress.street"])
    cy.getByID("leasingAgentAddress.street2").type(listing["leasingAgentAddress.street2"])
    cy.getByID("leasingAgentAddress.city").type(listing["leasingAgentAddress.city"])
    cy.getByID("leasingAgentAddress.zipCode").type(listing["leasingAgentAddress.zipCode"])
    cy.getByID("leasingAgentAddress.state").select(listing["leasingAgentAddress.state"])

    cy.getByID("applicationsMailedInYes").check()
    cy.getByID("mailInAnotherAddress").check()
    cy.getByTestId("mailing-address-street").type(listing["leasingAgentAddress.street"])
    cy.getByTestId("mailing-address-street2").type(listing["leasingAgentAddress.street2"])
    cy.getByTestId("mailing-address-city").type(listing["leasingAgentAddress.city"])
    cy.getByTestId("mailing-address-zip").type(listing["leasingAgentAddress.zipCode"])
    cy.getByTestId("mailing-address-state").select(listing["leasingAgentAddress.state"])

    cy.getByID("applicationsPickedUpNo").check()
    cy.getByID("applicationsDroppedOffNo").check()
    cy.getByID("postmarksConsideredYes").check()
    cy.getByTestId("postmark-date-field-month").type("12")
    cy.getByTestId("postmark-date-field-day").type("17")
    cy.getByTestId("postmark-date-field-year").type("2022")
    cy.getByTestId("postmark-time-field-hours").type("5")
    cy.getByTestId("postmark-time-field-minutes").type("45")
    cy.getByTestId("postmark-time-field-period").select("PM")
    cy.getByID("additionalApplicationSubmissionNotes").type(
      listing["additionalApplicationSubmissionNotes"]
    )

    cy.getByID("addOpenHouseButton").contains("Add Open House").click()

    cy.getByID("date.month").type(listing["date.month"])
    cy.getByID("date.day").type(listing["date.day"])
    cy.getByID("date.year").type(listing["date.year"])
    cy.getByID("label").type(listing["label"])
    cy.getByID("url").type(listing["url"])
    cy.getByID("startTime.hours").type(listing["startTime.hours"])
    cy.getByID("startTime.minutes").type(listing["startTime.minutes"])
    cy.getByID("endTime.hours").type(listing["endTime.hours"])
    cy.getByID("endTime.minutes").type(listing["endTime.minutes"])
    cy.getByID("note").type(listing["note"])
    cy.getByID("startTime.period").select("AM")
    cy.getByID("endTime.period").select("PM")
    cy.get(".drawer button").contains("Save").click()
    cy.getByID("publishButton").contains("Publish").click()

    cy.getByID("publishButtonConfirm").contains("Publish").click()
    cy.get("[data-testid=page-header]").should("be.visible")
    cy.getByTestId("page-header").should("have.text", listing["name"])
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function verifyDetails(cy: Cypress.cy, listing: any): void {
    cy.visit("/")
    cy.getByTestId("ag-search-input").type(listing["name"])
    cy.getByTestId(listing["name"]).first().click()
    cy.getByID("jurisdiction.name").contains(listing["jurisdiction.id"])
    cy.getByID("name").contains(listing["name"])
    cy.getByID("developer").contains(listing["developer"])
    cy.get('[data-label="Preview"]')
      .find("img")
      .should("have.attr", "src")
      .should(
        "include",
        "https://assets.website-files.com/5fbfdd121e108ea418ede824/5fbfdea9a7287d45a63d821b_Exygy%20Logo.svg"
      )
    cy.getByID("buildingAddress.street").contains(listing["buildingAddress.street"])
    cy.getByID("neighborhood").contains(listing.neighborhood)
    cy.getByID("neighborhood").contains(listing.neighborhood)
    cy.getByID("buildingAddress.city").contains(listing["buildingAddress.city"])
    cy.getByID("buildingAddress.county").contains(listing["buildingAddress.county"])
    cy.getByID("buildingAddress.state").contains("CA")
    cy.getByID("buildingAddress.zipCode").contains(listing["buildingAddress.zipCode"])
    cy.getByID("yearBuilt").contains(listing["yearBuilt"])
    cy.getByID("longitude").contains("-121.950481")
    cy.getByID("latitude").contains("37.762983")
    cy.getByID("reservedCommunityType").contains(listing["reservedCommunityType.id"])
    cy.getByID("reservedCommunityDescription").contains(listing["reservedCommunityDescription"])
    cy.getByTestId("unit-types-or-individual").contains("Unit Types")
    cy.getByTestId("listing-availability-question").contains("Available Units")
    cy.getByID("unitTable").contains(listing["number"])
    cy.getByID("unitTable").contains(listing["monthlyRent"])
    cy.getByID("unitTable").contains(listing["sqFeet"])
    cy.getByID("unitTable").contains(listing["priorityType.id"])
    cy.getByID("preferenceTable").contains("1")
    cy.getByID("preferenceTable").contains("Live/Work in County")
    cy.getByID("preferenceTable").contains("At least one household member lives or works in County")
    cy.getByID("applicationFee").contains(listing["applicationFee"])
    cy.getByID("applicationFee").contains(listing["applicationFee"])
    cy.getByID("applicationFee").contains(listing["applicationFee"])
    cy.getByID("depositMin").contains(listing["depositMin"])
    cy.getByID("depositMax").contains(listing["depositMax"])
    cy.getByID("costsNotIncluded").contains(listing["costsNotIncluded"])
    cy.getByID("amenities").contains(listing["amenities"])
    cy.getByID("unitAmenities").contains(listing["unitAmenities"])
    cy.getByID("accessibility").contains(listing["accessibility"])
    cy.getByID("smokingPolicy").contains(listing["smokingPolicy"])
    cy.getByID("petPolicy").contains(listing["petPolicy"])
    cy.getByID("servicesOffered").contains(listing["servicesOffered"])
    cy.getByID("creditHistory").contains(listing["creditHistory"])
    cy.getByID("rentalHistory").contains(listing["rentalHistory"])
    cy.getByID("criminalBackground").contains(listing["criminalBackground"])
    cy.getByID("rentalAssistance").contains(
      "Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy."
    )
    cy.getByID("buildingSelectionCriteriaTable").contains(listing["buildingSelectionCriteriaURL"])
    cy.getByID("requiredDocuments").contains(listing["requiredDocuments"])
    cy.getByID("programRules").contains(listing["programRules"])
    cy.getByID("specialNotes").contains(listing["specialNotes"])
    cy.getByID("reviewOrderQuestion").contains("First come first serve")
    cy.getByID("dueDateQuestion").contains("No")
    cy.getByID("whatToExpect").contains(
      "Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents."
    )
    cy.getByID("leasingAgentName").contains(listing["leasingAgentName"])
    cy.getByID("leasingAgentEmail").contains(listing["leasingAgentEmail"].toLowerCase())
    cy.getByID("leasingAgentPhone").contains("(520) 245-8811")
    cy.getByID("leasingAgentOfficeHours").contains(listing["leasingAgentOfficeHours"])
    cy.getByID("leasingAgentTitle").contains(listing["leasingAgentTitle"])
    cy.getByID("digitalApplication").contains("Yes")
    cy.getByID("digitalMethod.type").contains("No")
    cy.getByID("customOnlineApplicationUrl").contains(listing["url"])
    cy.getByID("paperApplication").contains("No")
    cy.getByID("leasingAgentAddress.street").contains(listing["leasingAgentAddress.street"])
    cy.getByID("leasingAgentAddress.street2").contains(listing["leasingAgentAddress.street2"])
    cy.getByID("leasingAgentAddress.city").contains(listing["leasingAgentAddress.city"])
    cy.getByID("leasingAgentAddress.state").contains("CA")
    cy.getByID("leasingAgentAddress.zipCode").contains(listing["leasingAgentAddress.zipCode"])
    cy.getByID("applicationPickupQuestion").contains("No")
    cy.getByID("applicationMailingSection").contains("Yes")
    cy.getByTestId("applicationMailingAddress.street").contains(
      listing["leasingAgentAddress.street"]
    )
    cy.getByTestId("applicationMailingAddress.street2").contains(
      listing["leasingAgentAddress.street2"]
    )
    cy.getByTestId("applicationMailingAddress.city").contains(listing["leasingAgentAddress.city"])
    cy.getByTestId("applicationMailingAddress.zipCode").contains(
      listing["leasingAgentAddress.zipCode"]
    )
    cy.getByTestId("applicationMailingAddress.state").contains("CA")
    cy.getByID("applicationDropOffQuestion").contains("No")
    cy.getByID("postmarksConsideredQuestion").contains("Yes")
    cy.getByTestId("postmark-date").contains("12")
    cy.getByTestId("postmark-date").contains("17")
    cy.getByTestId("postmark-date").contains("2022")
    cy.getByTestId("postmark-time").contains("5")
    cy.getByTestId("postmark-time").contains("45")
    cy.getByTestId("postmark-time").contains("PM")
    cy.getByID("additionalApplicationSubmissionNotes").contains(
      listing["additionalApplicationSubmissionNotes"]
    )
    cy.getByID("openhouseHeader").contains("10/04/2022")
    cy.getByID("openhouseHeader").contains("10:04 AM")
    cy.getByID("openhouseHeader").contains("11:05 PM")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function verifyOpenListingWarning(cy: Cypress.cy, listing: any): void {
    cy.visit("/")
    cy.getByTestId("ag-search-input").type(listing["name"])
    cy.getByTestId(listing["name"]).first().click()
    cy.getByID("listingEditButton").contains("Edit").click()
    cy.getByTestId("nameField")
      .should("be.visible")
      .click()
      .clear()
      .clear()
      .type(listing["editedName"])
    cy.getByID("saveAndExitButton").contains("Save & Exit").click()
    cy.getByID("saveAlreadyLiveListingButtonConfirm").contains("Save").click()
    cy.getByTestId("page-header").should("have.text", listing["editedName"])
  }
  it("as admin user, should be able to download listings export zip", () => {
    const convertToString = (value: number) => {
      return value < 10 ? `0${value}` : `${value}`
    }
    cy.visit("/")
    cy.getByID("export-listings").click()
    const now = new Date()
    const dateString = `${now.getFullYear()}-${convertToString(
      now.getMonth() + 1
    )}-${convertToString(now.getDate())}`
    const timeString = `${convertToString(now.getHours())}-${convertToString(now.getMinutes())}`
    const zipName = `${dateString}_${timeString}-complete-listing-data.zip`
    const downloadFolder = Cypress.config("downloadsFolder")
    const completeZipPath = `${downloadFolder}/${zipName}`
    cy.readFile(completeZipPath)
  })
})
