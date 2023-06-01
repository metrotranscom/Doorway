import { PaperApplication } from "../../src/paper-applications/entities/paper-application.entity"
import { isEmpty } from "../shared/utils/is-empty"
import { formatLocalDate } from "../shared/utils/format-local-date"

export const cloudinaryPdfFromId = (publicId: string): string => {
  if (isEmpty(publicId)) return ""
  const cloudName = process.env.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.pdf`
}

export const getPaperAppUrls = (paperApps: PaperApplication[]) => {
  if (isEmpty(paperApps)) return ""
  const urlArr = paperApps.map((paperApplication) =>
    cloudinaryPdfFromId(paperApplication.file?.fileId)
  )
  const formattedResults = urlArr.join(", ")
  return formattedResults
}

export const formatYesNo = (value: boolean | null): string => {
  if (value === null || typeof value == "undefined") return ""
  else if (value) return "Yes"
  else return "No"
}

export const formatStatus = {
  active: "Public",
  closed: "Closed",
  pending: "Draft",
}

export const formatUnitType = {
  SRO: "SRO",
  studio: "Studio",
  oneBdrm: "1 BR",
  twoBdrm: "2 BR",
  threeBdrm: "3 BR",
  fourBdrm: "4 BR",
  fiveBdrm: "5 BR",
}

export const formatCommunityType = {
  senior55: "Seniors 55+",
  senior62: "Seniors 62+",
  specialNeeds: "Special Needs",
}

export const formatCurrency = (value: string): string => {
  return value ? `$${value}` : ""
}

export const convertToTitleCase = (value: string): string => {
  if (isEmpty(value)) return ""
  const spacedValue = value.replace(/([A-Z])/g, (match) => ` ${match}`)
  const result = spacedValue.charAt(0).toUpperCase() + spacedValue.slice(1)
  return result
}

export const formatOpenHouse = (openHouseArr: any[], tz: string): string => {
  const openHouseFormatted = []
  openHouseArr.forEach((openHouse) => {
    let openHouseStr = ""
    if (openHouse.label) openHouseStr += `${openHouse.label}`
    if (openHouse.startTime) {
      const date = formatLocalDate(openHouse.startTime, "MM-DD-YYYY", tz)
      openHouseStr += `: ${date}`
      if (openHouse.endTime) {
        const startTime = formatLocalDate(openHouse.startTime, "hh:mmA", tz)
        const endTime = formatLocalDate(openHouse.endTime, "hh:mmA z", tz)
        openHouseStr += ` (${startTime} - ${endTime})`
      }
    }
    if (openHouseStr !== "") openHouseFormatted.push(openHouseStr)
  })
  return openHouseFormatted.join(", ")
}

export const hideZero = (fieldValue: number | string) => {
  if (isEmpty(fieldValue) || fieldValue === 0 || fieldValue === "0") return ""
  return fieldValue
}

export const formatRentType = (monthlyRentAsPercentOfIncome: string, monthlyRent: string) => {
  if (!isEmpty(monthlyRentAsPercentOfIncome)) return "% of income"
  if (!isEmpty(monthlyRent)) return "Fixed amount"
  return ""
}
