import { ListingEvent, ListingEventType } from "@bloom-housing/backend-core/types"

export const cloudinaryPdfFromId = (publicId: string) => {
  const cloudName = process.env.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.pdf`
}

export const pdfUrlFromListingEvents = (
  events: ListingEvent[],
  listingEventType: ListingEventType
) => {
  const event = events.find((event) => event?.type === listingEventType)
  if (event) {
    return event.file?.label == "cloudinaryPDF"
      ? cloudinaryPdfFromId(event.file.fileId)
      : event.url ?? null
  }
  return null
}
