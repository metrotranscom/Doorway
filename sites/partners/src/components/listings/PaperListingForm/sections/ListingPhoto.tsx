import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import {
  t,
  AppearanceStyleType,
  Button,
  Dropzone,
  Drawer,
  GridSection,
  GridCell,
  MinimalTable,
  TableThumbnail,
  StandardTableData,
  AppearanceSizeType,
} from "@bloom-housing/ui-components"
import { fieldHasError } from "../../../../lib/helpers"
import { CloudinaryFileService, CloudinaryFileUploader } from "@bloom-housing/shared-services"

/**
 *
 * TODO: update this to use useFieldArray when adding multiple images https://react-hook-form.com/api/usefieldarray/
 */
const ListingPhoto = () => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, setValue, watch, errors, clearErrors } = formMethods

  const listingFormPhoto = watch("images")[0]
  /*
    Set state for the drawer, upload progress, and more
  */
  const [drawerState, setDrawerState] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [cloudinaryData, setCloudinaryData] = useState({
    id: "",
    url: "",
  })
  const cloudinaryFileService = new CloudinaryFileService(new CloudinaryFileUploader())
  const resetDrawerState = () => {
    setProgressValue(0)
    setCloudinaryData({
      id: "",
      url: "",
    })
    setDrawerState(false)
  }

  const savePhoto = () => {
    setValue("images.0", {
      ordinal: 0,
      image: { fileId: cloudinaryData.id, label: "cloudinaryBuilding" },
    })
  }
  const deletePhoto = () => {
    setValue("images.0", { ordinal: 0, image: { fileId: "", label: "" } })
  }

  const photoTableHeaders = {
    preview: "t.preview",
    fileName: "t.fileName",
    actions: "",
  }

  /*
    Show a preview of the uploaded file within the photo drawer
  */
  const previewTableRows: StandardTableData = []
  if (cloudinaryData.url != "") {
    previewTableRows.push({
      preview: {
        content: (
          <TableThumbnail>
            <img src={cloudinaryData.url} alt={"Preview"} />
          </TableThumbnail>
        ),
      },
      fileName: { content: cloudinaryData.id.split("/").slice(-1).join() },
      actions: {
        content: (
          <Button
            type="button"
            className="font-semibold uppercase text-alert my-0"
            onClick={() => {
              setCloudinaryData({
                id: "",
                url: "",
              })
              setProgressValue(0)
            }}
            unstyled
          >
            {t("t.delete")}
          </Button>
        ),
      },
    })
  }

  /*
    Show the selected photo in the listing form if its present
  */
  const listingPhotoTableRows: StandardTableData = []
  if (listingFormPhoto?.image?.fileId && listingFormPhoto.image.fileId != "") {
    const listingPhotoUrl = listingFormPhoto.image.fileId.match(/https?:\/\//)
      ? listingFormPhoto.image.fileId
      : cloudinaryFileService.getDownloadUrlForPhoto(listingFormPhoto.image.fileId)

    listingPhotoTableRows.push({
      preview: {
        content: (
          <TableThumbnail>
            <img src={listingPhotoUrl} alt={"Preview"} />
          </TableThumbnail>
        ),
      },
      fileName: { content: listingFormPhoto.image.fileId.split("/").slice(-1).join() },
      actions: {
        content: (
          <div className="flex">
            <Button
              type="button"
              className="font-semibold uppercase my-0"
              onClick={() => {
                setDrawerState(true)
              }}
              unstyled
            >
              {t("t.edit")}
            </Button>
            <Button
              type="button"
              className="font-semibold uppercase text-alert my-0"
              onClick={() => {
                setCloudinaryData({ ...cloudinaryData, id: "" })
                deletePhoto()
              }}
              unstyled
            >
              {t("t.delete")}
            </Button>
          </div>
        ),
      },
    })
  }

  /*
    Pass the file for the dropzone callback along to the uploader
  */
  const photoUploader = async (file: File) => {
    const setProgressValueCallback = (value: number) => {
      setProgressValue(value)
    }
    const generatedId = await cloudinaryFileService.putFile(
      "cloudinaryBuilding",
      file,
      setProgressValueCallback
    )
    setCloudinaryData({
      id: generatedId,
      url: cloudinaryFileService.getDownloadUrlForPhoto(generatedId),
    })
  }

  return (
    <>
      <input type="hidden" {...register("images.0.image.fileId")} />
      <input type="hidden" {...register("images.0.image.label")} />
      <GridSection
        grid={false}
        separator
        title={t("listings.sections.photoTitle")}
        description={t("listings.sections.photoSubtitle")}
      >
        {
          <span className={"text-sm text-gray-800 block mb-2"}>
            {t("listings.sections.photoTitle")}
          </span>
        }
        <GridSection columns={1} tinted inset>
          <GridCell>
            {listingFormPhoto?.image?.fileId && listingFormPhoto.image.fileId != "" ? (
              <MinimalTable headers={photoTableHeaders} data={listingPhotoTableRows}></MinimalTable>
            ) : (
              <Button
                id="addPhotoButton"
                type="button"
                styleType={fieldHasError(errors?.images) ? AppearanceStyleType.alert : null}
                onClick={() => {
                  setDrawerState(true)
                  clearErrors("images")
                }}
              >
                {t("listings.addPhoto")}
              </Button>
            )}
          </GridCell>
        </GridSection>
      </GridSection>
      <p className="field-sub-note">{t("listings.requiredToPublish")}</p>
      {fieldHasError(errors?.images) && (
        <span className={"text-xs text-alert"}>{errors?.images?.nested?.message}</span>
      )}

      <Drawer
        open={drawerState}
        title="Add Photo"
        onClose={() => resetDrawerState()}
        ariaDescription="Form with photo upload dropzone"
        actions={[
          <Button
            key={0}
            onClick={() => {
              savePhoto()
              resetDrawerState()
            }}
            styleType={AppearanceStyleType.primary}
            data-test-id={!cloudinaryData.url ? "listing-photo-empty" : "listing-photo-uploaded"}
            size={AppearanceSizeType.small}
          >
            Save
          </Button>,
          <Button
            key={1}
            onClick={() => {
              resetDrawerState()
            }}
            size={AppearanceSizeType.small}
          >
            Cancel
          </Button>,
        ]}
      >
        <section className="border rounded-md p-8 bg-white">
          <Dropzone
            id="listing-photo-upload"
            label={t("t.uploadFile")}
            helptext={t("listings.sections.photoHelperText")}
            uploader={photoUploader}
            accept="image/*"
            progress={progressValue}
          />
          {cloudinaryData.url !== "" && (
            <MinimalTable headers={photoTableHeaders} data={previewTableRows}></MinimalTable>
          )}
        </section>
      </Drawer>
    </>
  )
}

export default ListingPhoto
