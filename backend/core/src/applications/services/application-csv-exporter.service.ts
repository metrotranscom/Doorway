import { Injectable, Scope } from "@nestjs/common"
import { CsvBuilder, KeyNumber } from "./csv-builder.service"
import { getBirthday } from "../../shared/utils/get-birthday"
import { formatBoolean } from "../../shared/utils/format-boolean"
import { ApplicationMultiselectQuestion } from "../entities/application-multiselect-question.entity"
import { AddressCreateDto } from "../../shared/dto/address.dto"
import { ApplicationReviewStatus } from "../types/application-review-status-enum"
import { formatApplicationDate, formatGeocodingValues } from "../helpers"
import { GeocodingValues } from "../../shared/types/geocoding-values"

@Injectable({ scope: Scope.REQUEST })
export class ApplicationCsvExporterService {
  constructor(private readonly csvBuilder: CsvBuilder) {}

  mapHouseholdMembers(app) {
    const obj = {
      "First Name": app.householdMembers_first_name,
      "Middle Name": app.householdMembers_middle_name,
      "Last Name": app.householdMembers_last_name,
      Birthday: getBirthday(
        app.householdMembers_birth_day,
        app.householdMembers_birth_month,
        app.householdMembers_birth_year
      ),
      "Same Address as Primary Applicant": formatBoolean(app.householdMembers_same_address),
      Relationship: app.householdMembers_relationship,
      "Work in Region": formatBoolean(app.householdMembers_work_in_region),
      Street: app.householdMembers_address_street,
      "Street 2": app.householdMembers_address_street2,
      City: app.householdMembers_address_city,
      State: app.householdMembers_address_state,
      "Zip Code": app.householdMembers_address_zip_code,
    }
    return obj
  }

  // could use translations
  unitTypeToReadable(type) {
    const typeMap = {
      SRO: "SRO",
      studio: "Studio",
      oneBdrm: "One Bedroom",
      twoBdrm: "Two Bedroom",
      threeBdrm: "Three Bedroom",
      fourBdrm: "Four+ Bedroom",
    }
    return typeMap[type] ?? type
  }

  incomeVouchersToReadable(type) {
    const typeMap = {
      issuedVouchers: "Section 8 or Housing Authority Issued Vouchers",
      rentalAssistance: "Rental assistance from other sources",
      none: "None of the above",
    }
    return typeMap[type] ?? type
  }

  raceToReadable(type) {
    const [rootKey, customValue = ""] = type.split(":")
    const typeMap = {
      asian: "Asian",
      "asian-asianIndian": "Asian[Asian Indian]",
      "asian-chinese": "Asian[Chinese]",
      "asian-filipino": "Asian[Filipino]",
      "asian-japanese": "Asian[Japanese]",
      "asian-korean": "Asian[Korean]",
      "asian-mongolian": "Asian[Mongolian]",
      "asian-otherAsian": `Asian[Other Asian:${customValue}]`,
      "asian-vietnamese": "Asian[Vietnamese]",
      "asian-centralAsian": "Asian[Central Asian]",
      "asian-southAsian": "Asian[South Asian]",
      "asian-southeastAsian": "Asian[Southeast Asian]",
      black: "Black",
      "black-african": "Black[African]",
      "black-africanAmerican": "Black[African American]",
      "black-caribbeanCentralSouthAmericanMexican":
        "Black[Caribbean, Central American, South American or Mexican]",
      "black-otherBlack": `Black[Other Black:${customValue}]`,
      indigenous: "Indigenous",
      "indigenous-alaskanNative": "Indigenous[Alaskan Native]",
      "indigenous-nativeAmerican": "Indigenous[American Indian/Native American]",
      "indigenous-indigenousFromMexicoCaribbeanCentralSouthAmerica":
        "Indigenous[Indigenous from Mexico, the Caribbean, Central America, or South America]",
      "indigenous-otherIndigenous": `Indigenous[Other Indigenous:${customValue}]`,
      latino: "Latino",
      "latino-caribbean": "Latino[Caribbean]",
      "latino-centralAmerican": "Latino[Central American]",
      "latino-mexican": "Latino[Mexican]",
      "latino-southAmerican": "Latino[South American]",
      "latino-otherLatino": `Latino[Other Latino:${customValue}]`,
      middleEasternOrAfrican: "Middle Eastern, West African or North African",
      "middleEasternOrAfrican-northAfrican":
        "Middle Eastern, West African or North African[North African]",
      "middleEasternOrAfrican-westAsian":
        "Middle Eastern, West African or North African[West Asian]",
      "middleEasternOrAfrican-otherMiddleEasternNorthAfrican": `Middle Eastern, West African or North African[Other Middle Eastern or North African:${customValue}]`,
      pacificIslander: "Pacific Islander",
      "pacificIslander-chamorro": "Pacific Islander[Chamorro]",
      "pacificIslander-nativeHawaiian": "Pacific Islander[Native Hawaiian]",
      "pacificIslander-samoan": "Pacific Islander[Samoan]",
      "pacificIslander-otherPacificIslander": `Pacific Islander[Other Pacific Islander:${customValue}]`,
      white: "White",
      "white-european": "White[European]",
      "white-otherWhite": `White[Other White:${customValue}]`,
    }
    return typeMap[rootKey] ?? rootKey
  }

  spokenLanguageToReadable(type) {
    const [rootKey, customValue = ""] = type.split(":")

    const typeMap = {
      chineseCantonese: "Chinese - Cantonese",
      chineseMandarin: "Chinese - Mandarin",
      english: "English",
      filipino: "Filipino",
      korean: "Korean",
      russian: "Russian",
      spanish: "Spanish",
      vietnamese: "Vietnamese",
      notListed: `Not Listed[${customValue}]`,
    }
    return typeMap[rootKey] ?? rootKey
  }

  genderToReadable(type) {
    const typeMap = {
      differentTerm: "I use a different term",
      dontKnow: "I don’t know or don’t understand the question",
      preferNoResponse: "Prefer not to respond",
      female: "Woman",
      "genderqueerGenderNon-Binary": "Genderqueer / Gender Nonbinary",
      male: "Man",
      notListed: "Not Listed",
      transFemale: "Trans Woman / Transfeminine / Trans Female",
      transMale: "Trans Man / Transmasculine / Trans Male",
    }
    return typeMap[type] ?? type
  }

  sexualOrientationToReadable(type) {
    const typeMap = {
      asexual: "Asexual",
      bisexual: "Bisexual",
      differentTerm: "I use a different term",
      dontKnow: "I don’t understand the question",
      preferNoResponse: "Prefer not to respond",
      gayLesbianSameGenderLoving: "Gay / Lesbian / Same-Gender Loving",
      notListed: "Not Listed",
      questioningUnsure: "Questioning / Unsure",
      straightHeterosexual: "Straight / Heterosexual",
    }
    return typeMap[type] ?? type
  }

  howDidYouHearToReadable(type) {
    const typeMap = {
      busAd: "Bus Ad",
      developerWebsite: "Developer Website",
      governmentWebsite: "Government Website",
      propertyWebsite: "Property Website",
      emailAlert: "Email Alert",
      flyer: "Flyer",
      friend: "Friend",
      housingCounselor: "Housing Counselor",
      jurisdictionWebsite: "Alameda County HCD Website",
      other: "Other",
      radioAd: "Radio Ad",
    }
    return typeMap[type] ?? type
  }

  buildMultiselectQuestion(items: ApplicationMultiselectQuestion[], preferenceKeys: KeyNumber) {
    if (!items) {
      return {}
    }

    return items.reduce((obj, preference) => {
      const root = preference.key
      let claimedString = ""
      const extraData = {}
      preference.options.forEach((option) => {
        if (option.checked) {
          claimedString = claimedString.concat(`${option.key}, `)
        }
        if (option.extraData?.length) {
          let extraKey
          let extraString = ""
          const order = [
            "address",
            "geocodingVerified",
            "addressHolderName",
            "addressHolderRelationship",
          ]

          option.extraData
            .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
            .forEach((extra) => {
              if (extra.type === "address") {
                extraKey = `${root}: ${option.key} - Provided Address`
                extraString += `${(extra.value as AddressCreateDto).street}, ${
                  (extra.value as AddressCreateDto).street2
                    ? `${(extra.value as AddressCreateDto).street2},`
                    : ""
                } ${(extra.value as AddressCreateDto).city}, ${
                  (extra.value as AddressCreateDto).state
                }, ${(extra.value as AddressCreateDto).zipCode}`
              }
              if (extra.type === "text") {
                if (extra.key === "geocodingVerified") {
                  extraKey = `${root}: ${option.key} - Passed Address Check`
                  extraString = formatGeocodingValues(extra.value as GeocodingValues)
                }
                if (extra.key === "addressHolderName") {
                  extraKey = `${root}: ${option.key} - Name of Address Holder`
                  extraString = extra.value as string
                }
                if (extra.key === "addressHolderRelationship") {
                  extraKey = `${root}: ${option.key} - Relationship to Address Holder`
                  extraString = extra.value as string
                }
              }
              extraData[extraKey] = extraString
            })
        }
      })
      preferenceKeys[root] = 1
      obj[root] = claimedString
      Object.keys(extraData).forEach((key) => {
        obj[key] = extraData[key]
        preferenceKeys[key] = 1
      })
      return obj
    }, {})
  }

  exportFromObject(
    applications: { [key: string]: any },
    timeZone: string,
    includeDemographics?: boolean
  ): string {
    const extraHeaders: KeyNumber = {
      "Household Members": 1,
      Preference: 1,
      Program: 1,
    }
    const preferenceKeys: KeyNumber = {}
    const programKeys: KeyNumber = {}
    const applicationsObj = applications.reduce((obj, app) => {
      let demographics = {}

      if (obj[app.application_id] === undefined) {
        if (includeDemographics) {
          demographics = {
            Race: app.demographics_race.map((race) => this.raceToReadable(race)).join(", "),
            "Spoken Language": this.spokenLanguageToReadable(app.demographics_spoken_language),
            Gender: this.genderToReadable(app.demographics_gender),
            "Sexual Orientation": this.sexualOrientationToReadable(
              app.demographics_sexual_orientation
            ),
            "How Did You Hear": app.demographics_how_did_you_hear
              .map((answer) => this.howDidYouHearToReadable(answer))
              .join(", "),
          }
        }

        obj[app.application_id] = {
          "Application Id": app.application_id,
          "Application Confirmation Code": app.application_confirmation_code,
          "Application Type":
            app.application_submission_type === "electronical"
              ? "electronic"
              : app.application_submission_type,
          "Application Submission Date": formatApplicationDate(
            app.application_submission_type,
            app.application_submission_date,
            timeZone
          ),
          "Primary Applicant First Name": app.applicant_first_name,
          "Primary Applicant Middle Name": app.applicant_middle_name,
          "Primary Applicant Last Name": app.applicant_last_name,
          "Primary Applicant Birthday": getBirthday(
            app.applicant_birth_day,
            app.applicant_birth_month,
            app.applicant_birth_year
          ),
          "Primary Applicant Email Address": app.applicant_email_address,
          "Primary Applicant Phone Number": app.applicant_phone_number,
          "Primary Applicant Phone Type": app.applicant_phone_number_type,
          "Primary Applicant Additional Phone Number": app.application_additional_phone_number,
          "Primary Applicant Preferred Contact Type": app.application_contact_preferences.join(","),
          "Primary Applicant Street": app.applicant_address_street,
          "Primary Applicant Street 2": app.applicant_address_street2,
          "Primary Applicant City": app.applicant_address_city,
          "Primary Applicant State": app.applicant_address_state,
          "Primary Applicant Zip Code": app.applicant_address_zip_code,
          "Primary Applicant Mailing Street": app.mailingAddress_street,
          "Primary Applicant Mailing Street 2": app.mailingAddress_street2,
          "Primary Applicant Mailing City": app.mailingAddress_city,
          "Primary Applicant Mailing State": app.mailingAddress_state,
          "Primary Applicant Mailing Zip Code": app.mailingAddress_zip_code,
          "Primary Applicant Work Street": app.applicant_workAddress_street,
          "Primary Applicant Work Street 2": app.applicant_workAddress_street2,
          "Primary Applicant Work City": app.applicant_workAddress_city,
          "Primary Applicant Work State": app.applicant_workAddress_state,
          "Primary Applicant Work Zip Code": app.applicant_workAddress_zip_code,
          "Alternate Contact First Name": app.alternateContact_first_name,
          "Alternate Contact Middle Name": app.alternateContact_middle_name,
          "Alternate Contact Last Name": app.alternateContact_last_name,
          "Alternate Contact Type": app.alternateContact_type,
          "Alternate Contact Agency": app.alternateContact_agency,
          "Alternate Contact Other Type": app.alternateContact_other_type,
          "Alternate Contact Email Address": app.alternateContact_email_address,
          "Alternate Contact Phone Number": app.alternateContact_phone_number,
          "Alternate Contact Street": app.alternateContact_mailingAddress_street,
          "Alternate Contact Street 2": app.alternateContact_mailingAddress_street2,
          "Alternate Contact City": app.alternateContact_mailingAddress_city,
          "Alternate Contact State": app.alternateContact_mailingAddress_state,
          "Alternate Contact Zip Code": app.alternateContact_mailingAddress_zip_code,
          Income: app.application_income,
          "Income Period": app.application_income_period === "perMonth" ? "per month" : "per year",
          "Accessibility Mobility": formatBoolean(app.accessibility_mobility),
          "Accessibility Vision": formatBoolean(app.accessibility_vision),
          "Accessibility Hearing": formatBoolean(app.accessibility_hearing),
          "Expecting Household Changes": formatBoolean(app.application_household_expecting_changes),
          "Household Includes Student or Member Nearing 18": formatBoolean(
            app.application_household_student
          ),
          "Vouchers or Subsidies": app.application_income_vouchers
            ? app.application_income_vouchers
                .map((answer) => this.incomeVouchersToReadable(answer))
                .join(",")
            : "n/a",
          "Requested Unit Types": {
            [app.preferredUnit_id]: this.unitTypeToReadable(app.preferredUnit_name),
          },
          Preference: this.buildMultiselectQuestion(app.application_preferences, preferenceKeys),
          Program: this.buildMultiselectQuestion(app.application_programs, programKeys),
          "Household Size": app.application_household_size,
          "Household Members": {
            [app.householdMembers_id]: this.mapHouseholdMembers(app),
          },
          "Marked As Duplicate": formatBoolean(
            app.application_review_status === ApplicationReviewStatus.duplicate
          ), // if "duplicate" then "marked as duplicate" is true else false
          "Flagged As Duplicate": formatBoolean(app.flagged), // if in "flagged" set then "flagged as duplicate" is true
          ...demographics,
        }
        /**
         * For all conditionals below, these are for mapping the n-many relationships that applications have (since we're getting the raw query).
         * While we're going through here, keep track of the extra keys created, so we don't have to loop through an extra time to create the headers
         */
      } else if (
        obj[app.application_id]["Household Members"][app.householdMembers_id] === undefined
      ) {
        obj[app.application_id]["Household Members"][app.householdMembers_id] =
          this.mapHouseholdMembers(app)
        extraHeaders["Household Members"] = Math.max(
          extraHeaders["Household Members"],
          Object.keys(obj[app.application_id]["Household Members"]).length
        )
      } else if (
        obj[app.application_id]["Requested Unit Types"][app.preferredUnit_id] === undefined
      ) {
        obj[app.application_id]["Requested Unit Types"][app.preferredUnit_id] =
          this.unitTypeToReadable(app.preferredUnit_name)
      }
      return obj
    }, {})

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    function extraGroupKeys(group, obj) {
      const groups = {
        "Household Members": {
          nested: true,
          keys: Object.keys(self.mapHouseholdMembers(obj)),
        },
        Preference: {
          nested: false,
          keys: Object.keys(preferenceKeys),
        },
        Program: {
          nested: false,
          keys: Object.keys(programKeys),
        },
      }
      return groups[group]
    }

    return this.csvBuilder.buildFromIdIndex(applicationsObj, extraHeaders, extraGroupKeys)
  }
}
