import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import {
  t,
  AppearanceStyleType,
  Dropzone,
  GridSection,
  GridCell,
  MinimalTable,
  TableThumbnail,
  StandardTableData,
  StandardTableCell,
  Button,
  Drawer,
} from "@bloom-housing/ui-components"
import { CLOUDINARY_BUILDING_LABEL, getImageUrlFromAsset } from "@bloom-housing/shared-helpers"
import { fieldHasError } from "../../../../lib/helpers"
import { uploadAssetAndSetData } from "../../../../lib/assets"
import { ListingImage, Asset } from "@bloom-housing/backend-core"

const ListingPhotos = () => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, errors, clearErrors } = formMethods

  const { fields, append, remove } = useFieldArray({
    name: "images",
  })
  const listingFormPhotos: ListingImage[] = watch("images").sort(
    (imageA, imageB) => imageA.ordinal - imageB.ordinal
  )

  const saveImageFields = (images: ListingImage[]) => {
    remove(fields.map((item, index) => index))
    images.forEach((item, index) => {
      append({
        ordinal: index,
        image: item.image,
      })
    })
  }

  /*
   Set state for the drawer, upload progress, images in the drawer, and more
   */
  const [drawerState, setDrawerState] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [latestUpload, setLatestUpload] = useState({
    id: "",
    url: "",
  })
  const [drawerImages, setDrawerImages] = useState<ListingImage[]>([])

  const resetDrawerState = () => {
    setDrawerState(false)
    setDrawerImages([])
  }

  const savePhoto = useCallback(() => {
    setDrawerImages([
      ...drawerImages,
      {
        ordinal: drawerImages.length,
        image: { fileId: latestUpload.id, label: CLOUDINARY_BUILDING_LABEL },
      },
    ])
    setLatestUpload({ id: "", url: "" })
    setProgressValue(0)
  }, [drawerImages, latestUpload])

  useEffect(() => {
    if (latestUpload.id != "") {
      savePhoto()
    }
  }, [latestUpload, savePhoto])

  /*
   Show list of images in the main listing form
   */
  const photoTableHeaders = {
    preview: "t.preview",
    primary: "t.primary",
    actions: "",
  }

  const listingPhotoTableRows: StandardTableData = []
  listingFormPhotos.forEach((image, index) => {
    const listingPhotoUrl = getImageUrlFromAsset(image.image)
    listingPhotoTableRows.push({
      preview: {
        content: (
          <TableThumbnail>
            <img src={listingPhotoUrl} alt="" />
          </TableThumbnail>
        ),
      },
      fileName: { content: image.image.fileId.split("/").slice(-1).join() },
      primary: {
        content: index == 0 ? t("listings.sections.photo.primaryPhoto") : "",
      },
      actions: {
        content: (
          <Button
            type="button"
            className="font-semibold uppercase text-red-700"
            onClick={() => {
              saveImageFields(fields.filter((item, i2) => i2 != index) as ListingImage[])
            }}
            unstyled
          >
            {t("t.delete")}
          </Button>
        ),
      },
    })
  })

  /*
   Show a re-orderable list of uploaded images within the drawer
   */

  const drawerTableRows: StandardTableData = useMemo(() => {
    return drawerImages.map((item, index) => {
      const image = item.image as Asset
      const imageUrl = getImageUrlFromAsset(image)
      return {
        ordinal: {
          content: item.ordinal + 1,
        },
        preview: {
          content: (
            <TableThumbnail>
              <img src={imageUrl} alt="" />
            </TableThumbnail>
          ),
        },
        fileName: { content: image.fileId.split("/").slice(-1).join() },
        primary: {
          content:
            index == 0 ? (
              t("listings.sections.photo.primaryPhoto")
            ) : (
              <Button
                unstyled
                className="ml-0"
                onClick={() => {
                  const resortedImages = [
                    drawerImages[index],
                    ...drawerImages.filter((item, i2) => i2 != index),
                  ]
                  resortedImages.forEach((item, i2) => {
                    item.ordinal = i2
                  })
                  setDrawerImages(resortedImages)
                }}
              >
                {t("t.makePrimaryPhoto")}
              </Button>
            ),
        },
        actions: {
          content: (
            <Button
              type="button"
              className="font-semibold uppercase text-red-700"
              onClick={() => {
                const filteredImages = drawerImages.filter((item, i2) => i2 != index)
                filteredImages.forEach((item, i2) => {
                  item.ordinal = i2
                })
                setDrawerImages(filteredImages)
              }}
              unstyled
            >
              {t("t.delete")}
            </Button>
          ),
        },
      }
    })
  }, [drawerImages])

  /*
   Pass the file for the dropzone callback along to the uploader
   */
  const photoUploader = async (file: File) => {
    await uploadAssetAndSetData(file, "building", setProgressValue, setLatestUpload)
  }

  /*
   Register the field array, display the main form table, and set up the drawer
   */
  return (
    <>
      {fields.map((item, index) => (
        <span key={item.id}>
          <input
            type="hidden"
            name={`images[${index}].image.fileId`}
            ref={register()}
            defaultValue={item.image.fileId}
          />
        </span>
      ))}
      <GridSection
        grid={false}
        separator
        title={t("listings.sections.photoTitle")}
        description={t("listings.sections.photoSubtitle")}
      >
        <span className={"text-tiny text-gray-800 block mb-2"}>
          {t("listings.sections.photoTitle")}
        </span>
        <GridSection columns={1} tinted inset>
          <GridCell>
            {listingFormPhotos.length > 0 && (
              <div className="mb-5" data-testid="photos-table">
                <MinimalTable
                  headers={photoTableHeaders}
                  data={listingPhotoTableRows}
                ></MinimalTable>
              </div>
            )}

            <Button
              type="button"
              styleType={fieldHasError(errors?.images) ? AppearanceStyleType.alert : null}
              onClick={() => {
                setDrawerState(true)
                setDrawerImages([...listingFormPhotos])
                clearErrors("images")
              }}
              dataTestId="add-photos-button"
            >
              {t(listingFormPhotos.length > 0 ? "listings.editPhotos" : "listings.addPhoto")}
            </Button>
          </GridCell>
        </GridSection>
      </GridSection>
      {fieldHasError(errors?.images) && (
        <span className={"text-sm text-alert"}>{errors?.images?.nested?.message}</span>
      )}

      {/* Image management and upload drawer */}
      <Drawer
        open={drawerState}
        title={t(listingFormPhotos.length > 0 ? "listings.editPhotos" : "listings.addPhoto")}
        onClose={() => resetDrawerState()}
        ariaDescription="Form with photo upload dropzone"
      >
        <section className="border rounded-md p-8 bg-white">
          <h2 className="grid-section__title mb-8">{t("listings.listingPhoto")}</h2>
          {drawerImages.length > 0 && (
            <div className="mb-10" data-testid="drawer-photos-table">
              <span className={"text-tiny text-gray-800 block mb-2"}>{t("t.photos")}</span>
              <MinimalTable
                draggable={true}
                flushLeft={true}
                setData={(newData) => {
                  setDrawerImages(
                    newData.map((item: Record<string, StandardTableCell>, index) => {
                      const foundImage = drawerImages.find(
                        (field) =>
                          field.image.fileId.split("/").slice(-1).join() == item.fileName.content
                      )
                      return { ...foundImage, ordinal: index }
                    })
                  )
                }}
                headers={photoTableHeaders}
                data={drawerTableRows}
              ></MinimalTable>
            </div>
          )}
          {drawerImages.length < 10 ? (
            <Dropzone
              id="listing-photo-upload"
              label={t("t.uploadFile")}
              helptext={t("listings.sections.photo.helperText")}
              uploader={photoUploader}
              accept="image/*"
              progress={progressValue}
            />
          ) : (
            <p className="field-note text-gray-750">{t("listings.sections.photo.maximumUpload")}</p>
          )}
        </section>
        <Button
          type="button"
          className={"mt-4"}
          onClick={() => {
            saveImageFields(drawerImages)
            resetDrawerState()
          }}
          styleType={AppearanceStyleType.primary}
          dataTestId={drawerImages.length > 0 ? "listing-photo-uploaded" : "listing-photo-empty"}
        >
          {t("t.save")}
        </Button>
      </Drawer>
    </>
  )
}

export default ListingPhotos
