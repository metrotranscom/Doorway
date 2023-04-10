import { ListingEvent, ListingEventType } from "@bloom-housing/backend-core/types"
import { FileServiceProvider } from "@bloom-housing/shared-services"

export const cloudinaryPdfFromId = (publicId: string, cloudName: string) => {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.pdf`
}

export const pdfUrlFromListingEvents = (
  events: ListingEvent[],
  listingEventType: ListingEventType
) => {
  const event = events.find((event) => event?.type === listingEventType)
  const cloudinaryFileService = new FileServiceProvider().getService()
  if (event) {
    return event.file?.label == "cloudinaryPDF"
      ? cloudinaryFileService.getDownloadUrlForPdf(event.file.fileId)
      : event.url ?? null
  }
  return null
}
