import React, { useContext, useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { Alert, FormErrorMessage } from "@bloom-housing/ui-seeds"
import {
  Field,
  FieldGroup,
  Form,
  mergeDeep,
  PhoneField,
  Select,
  t,
} from "@bloom-housing/ui-components"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import {
  contactPreferencesKeys,
  phoneNumberKeys,
  stateKeys,
  blankApplication,
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
} from "@bloom-housing/shared-helpers"
import FormsLayout from "../../../layouts/forms"
import { disableContactFormOption } from "../../../lib/helpers"
import { useFormConductor } from "../../../lib/hooks"
import {
  FoundAddress,
  findValidatedAddress,
  AddressValidationSelection,
} from "../../../components/applications/ValidateAddress"
import { UserStatus } from "../../../lib/constants"
import ApplicationFormLayout from "../../../layouts/application-form"
import styles from "../../../layouts/application-form.module.scss"

const ApplicationAddress = () => {
  const { profile } = useContext(AuthContext)
  const [verifyAddress, setVerifyAddress] = useState(false)
  const [foundAddress, setFoundAddress] = useState<FoundAddress>({})
  const [newAddressSelected, setNewAddressSelected] = useState(true)

  const { conductor, application, listing } = useFormConductor("primaryApplicantAddress")
  const currentPageSection = 1

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { control, register, handleSubmit, setValue, watch, errors } = useForm<Record<string, any>>(
    {
      defaultValues: {
        "applicant.phoneNumber": application.applicant.phoneNumber,
        "applicant.noPhone": application.applicant.noPhone,
        additionalPhone: application.additionalPhone,
        "applicant.phoneNumberType": application.applicant.phoneNumberType,
        sendMailToMailingAddress: application.sendMailToMailingAddress,
        "applicant.workInRegion": application.applicant.workInRegion,
        "applicant.address.state": application.applicant.address.state,
      },
      shouldFocusError: false,
    }
  )
  const onSubmit = (data) => {
    if (!verifyAddress) {
      setFoundAddress({})
      setVerifyAddress(true)
      findValidatedAddress(data.applicant.address, setFoundAddress, setNewAddressSelected)

      return // Skip rest of the submit process
    }

    mergeDeep(application, data)

    if (newAddressSelected && foundAddress.newAddress) {
      application.applicant.address.street = foundAddress.newAddress.street
      application.applicant.address.city = foundAddress.newAddress.city
      application.applicant.address.zipCode = foundAddress.newAddress.zipCode
      application.applicant.address.longitude = foundAddress.newAddress.longitude
      application.applicant.address.latitude = foundAddress.newAddress.latitude
    }

    if (application.applicant.noPhone) {
      application.applicant.phoneNumber = ""
      application.applicant.phoneNumberType = ""
    }
    if (!application.additionalPhone) {
      application.additionalPhoneNumber = ""
      application.additionalPhoneNumberType = ""
    }
    if (!application.sendMailToMailingAddress) {
      application.mailingAddress = blankApplication.mailingAddress
    }
    if (!application.applicant.workInRegion) {
      application.applicant.workAddress = blankApplication.applicant.workAddress
    }
    conductor.sync()

    conductor.routeToNextOrReturnUrl()
  }
  const onError = () => {
    window.scrollTo(0, 0)
  }

  const noPhone: boolean = watch("applicant.noPhone")
  const phoneNumber: string = watch("applicant.phoneNumber")
  const phonePresent = () => {
    return phoneNumber.replace(/[()\-_ ]/g, "").length > 0
  }
  const additionalPhone = watch("additionalPhone")
  const sendMailToMailingAddress = watch("sendMailToMailingAddress")
  const workInRegion = watch("applicant.workInRegion")
  const clientLoaded = OnClientSide()

  const contactPreferencesOptions = contactPreferencesKeys?.map((item) => ({
    id: item.id,
    label: t(`t.${item.id}`),
    defaultChecked: application?.contactPreferences?.includes(item.id) || false,
    disabled: disableContactFormOption(item.id, noPhone, application.applicant.noEmail),
  }))

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Contact Address",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  const backUrl = useMemo(() => {
    return verifyAddress ? window.location.pathname : conductor.determinePreviousUrl()
  }, [verifyAddress, conductor])

  return (
    <FormsLayout>
      <Form id="applications-address" onSubmit={handleSubmit(onSubmit, onError)}>
        <ApplicationFormLayout
          listingName={listing?.name}
          heading={
            verifyAddress
              ? foundAddress.invalid
                ? t("application.contact.couldntLocateAddress")
                : t("application.contact.verifyAddressTitle")
              : t("application.contact.title", { firstName: application.applicant.firstName })
          }
          progressNavProps={{
            currentPageSection: currentPageSection,
            completedSections: application.completedSections,
            labels: conductor.config.sections.map((label) => t(`t.${label}`)),
            mounted: OnClientSide(),
          }}
          backLink={{
            url: backUrl,
            onClickFxn: verifyAddress
              ? () => {
                  setVerifyAddress(false)
                }
              : undefined,
          }}
          conductor={conductor}
        >
          {Object.entries(errors).length > 0 && (
            <Alert
              className={styles["message-inside-card"]}
              variant="alert"
              fullwidth
              id={"application-alert-box"}
            >
              {t("errors.errorsToResolve")}
            </Alert>
          )}
          <div style={{ display: verifyAddress ? "none" : "block" }}>
            <CardSection divider={"inset"}>
              <fieldset>
                <legend className={"text__caps-spaced"}>
                  {t("application.contact.yourPhoneNumber")}
                </legend>
                <PhoneField
                  label={t("application.contact.number")}
                  required={true}
                  id="applicant.phoneNumber"
                  name="applicant.phoneNumber"
                  error={!noPhone ? errors.applicant?.phoneNumber : false}
                  errorMessage={t("errors.phoneNumberError")}
                  controlClassName="control"
                  control={control}
                  defaultValue={application.applicant.phoneNumber}
                  disabled={clientLoaded && noPhone}
                  dataTestId={"app-primary-phone-number"}
                  subNote={t("application.contact.number.subNote")}
                />
                <Select
                  id="applicant.phoneNumberType"
                  name="applicant.phoneNumberType"
                  placeholder={t("t.selectOne")}
                  label={t("application.contact.phoneNumberTypes.prompt")}
                  disabled={clientLoaded && noPhone}
                  validation={{ required: !noPhone }}
                  defaultValue={application.applicant.phoneNumberType}
                  error={!noPhone && errors.applicant?.phoneNumberType}
                  errorMessage={t("errors.phoneNumberTypeError")}
                  register={register}
                  controlClassName="control"
                  options={phoneNumberKeys}
                  keyPrefix="application.contact.phoneNumberTypes"
                  dataTestId={"app-primary-phone-number-type"}
                />

                <Field
                  type="checkbox"
                  id="noPhone"
                  name="applicant.noPhone"
                  label={t("application.contact.noPhoneNumber")}
                  primary={true}
                  register={register}
                  disabled={clientLoaded && phonePresent()}
                  inputProps={{
                    defaultChecked: application.applicant.noPhone,
                    onChange: (e) => {
                      if (e.target.checked) {
                        setValue("applicant.phoneNumberType", "")
                        setValue("additionalPhone", "")
                        setValue("additionalPhoneNumber", "")
                        setValue("additionalPhoneNumberType", "")
                      }
                    },
                  }}
                  dataTestId={"app-primary-no-phone"}
                  className={"mb-2"}
                />

                <Field
                  type="checkbox"
                  id="additionalPhone"
                  name="additionalPhone"
                  label={t("application.contact.additionalPhoneNumber")}
                  disabled={clientLoaded && noPhone}
                  primary={true}
                  register={register}
                  inputProps={{
                    defaultChecked: application.additionalPhone,
                    onChange: (e) => {
                      if (e.target.checked) {
                        setValue("additionalPhoneNumber", "")
                        setValue("additionalPhoneNumberType", "")
                      }
                    },
                  }}
                  dataTestId={"app-primary-additional-phone"}
                />

                {additionalPhone && (
                  <>
                    <PhoneField
                      id="additionalPhoneNumber"
                      name="additionalPhoneNumber"
                      label={t("application.contact.secondNumber")}
                      required={true}
                      error={errors.additionalPhoneNumber}
                      errorMessage={t("errors.phoneNumberError")}
                      control={control}
                      defaultValue={application.additionalPhoneNumber}
                      controlClassName="control"
                      dataTestId={"app-primary-additional-phone-number"}
                      subNote={t("application.contact.number.subNote")}
                    />
                    <Select
                      id="additionalPhoneNumberType"
                      name="additionalPhoneNumberType"
                      defaultValue={application.additionalPhoneNumberType}
                      validation={{ required: true }}
                      error={errors?.additionalPhoneNumberType}
                      errorMessage={t("errors.phoneNumberTypeError")}
                      register={register}
                      controlClassName="control"
                      label={t("application.contact.phoneNumberTypes.prompt")}
                      options={phoneNumberKeys}
                      keyPrefix="application.contact.phoneNumberTypes"
                      dataTestId={"app-primary-additional-phone-number-type"}
                    />
                  </>
                )}
              </fieldset>
            </CardSection>
            <CardSection divider={"inset"}>
              <fieldset>
                <legend
                  className={`text__caps-spaced ${errors.applicant?.address ? "text-alert" : ""}`}
                >
                  {t("application.contact.yourAddress")}
                </legend>

                <p className="field-note mb-4">
                  {t("application.contact.addressWhereYouCurrentlyLive")}
                </p>

                <Field
                  id="addressStreet"
                  name="applicant.address.street"
                  label={t("application.contact.streetAddress")}
                  defaultValue={application.applicant.address.street}
                  validation={{ required: true, maxLength: 64 }}
                  errorMessage={
                    errors.applicant?.address?.street?.type === "maxLength"
                      ? t("errors.maxLength")
                      : t("errors.streetError")
                  }
                  error={errors.applicant?.address?.street}
                  register={register}
                  dataTestId={"app-primary-address-street"}
                />

                <Field
                  id="addressStreet2"
                  name="applicant.address.street2"
                  label={t("application.contact.apt")}
                  defaultValue={application.applicant.address.street2}
                  register={register}
                  dataTestId={"app-primary-address-street2"}
                  error={errors.applicant?.address?.street2}
                  validation={{ maxLength: 64 }}
                  errorMessage={t("errors.maxLength")}
                />

                <div className="flex max-w-2xl">
                  <Field
                    id="addressCity"
                    name="applicant.address.city"
                    label={t("application.contact.city")}
                    defaultValue={application.applicant.address.city}
                    validation={{ required: true, maxLength: 64 }}
                    errorMessage={
                      errors.applicant?.address?.city?.type === "maxLength"
                        ? t("errors.maxLength")
                        : t("errors.cityError")
                    }
                    error={errors.applicant?.address?.city}
                    register={register}
                    dataTestId={"app-primary-address-city"}
                  />

                  <Select
                    id="addressState"
                    name="applicant.address.state"
                    label={t("application.contact.state")}
                    validation={{ required: true, maxLength: 64 }}
                    error={errors.applicant?.address?.state}
                    errorMessage={
                      errors.applicant?.address?.state?.type === "maxLength"
                        ? t("errors.maxLength")
                        : t("errors.stateError")
                    }
                    register={register}
                    controlClassName="control"
                    options={stateKeys}
                    keyPrefix="states"
                    dataTestId={"app-primary-address-state"}
                  />
                </div>
                <Field
                  id="addressZipCode"
                  name="applicant.address.zipCode"
                  label={t("application.contact.zip")}
                  defaultValue={application.applicant.address.zipCode}
                  validation={{ required: true, maxLength: 64 }}
                  errorMessage={
                    errors.applicant?.address?.zipCode?.type === "maxLength"
                      ? t("errors.maxLength")
                      : t("errors.zipCodeError")
                  }
                  error={errors.applicant?.address?.zipCode}
                  register={register}
                  dataTestId={"app-primary-address-zip"}
                />
                <Field
                  type="checkbox"
                  id="sendMailToMailingAddress"
                  name="sendMailToMailingAddress"
                  label={t("application.contact.sendMailToMailingAddress")}
                  primary={true}
                  register={register}
                  inputProps={{
                    defaultChecked: application.sendMailToMailingAddress,
                  }}
                  dataTestId={"app-primary-send-to-mailing"}
                />
              </fieldset>
            </CardSection>

            {clientLoaded && (sendMailToMailingAddress || application.sendMailToMailingAddress) && (
              <CardSection divider={"inset"}>
                <fieldset>
                  <legend className="text__caps-spaced">
                    {t("application.contact.mailingAddress")}
                  </legend>

                  <p className="field-note mb-4">
                    {t("application.contact.provideAMailingAddress")}
                  </p>

                  <Field
                    id="mailingAddressStreet"
                    name="mailingAddress.street"
                    label={t("application.contact.streetAddress")}
                    defaultValue={application.mailingAddress.street}
                    validation={{ required: true, maxLength: 64 }}
                    error={errors.mailingAddress?.street}
                    errorMessage={
                      errors.mailingAddress?.street?.type === "maxLength"
                        ? t("errors.maxLength")
                        : t("errors.streetError")
                    }
                    register={register}
                    dataTestId={"app-primary-mailing-address-street"}
                  />

                  <Field
                    id="mailingAddressStreet2"
                    name="mailingAddress.street2"
                    label={t("application.contact.apt")}
                    defaultValue={application.mailingAddress.street2}
                    register={register}
                    dataTestId={"app-primary-mailing-address-street2"}
                    validation={{ maxLength: 64 }}
                    error={errors.mailingAddress?.street2}
                    errorMessage={t("errors.maxLength")}
                  />

                  <div className="flex max-w-2xl">
                    <Field
                      id="mailingAddressCity"
                      name="mailingAddress.city"
                      label={t("application.contact.city")}
                      defaultValue={application.mailingAddress.city}
                      validation={{ required: true, maxLength: 64 }}
                      error={errors.mailingAddress?.city}
                      errorMessage={
                        errors.mailingAddress?.city?.type === "maxLength"
                          ? t("errors.maxLength")
                          : t("errors.cityError")
                      }
                      register={register}
                      dataTestId={"app-primary-mailing-address-city"}
                    />

                    <Select
                      id="mailingAddressState"
                      name="mailingAddress.state"
                      label={t("application.contact.state")}
                      defaultValue={application.mailingAddress.state}
                      validation={{ required: true, maxLength: 64 }}
                      errorMessage={
                        errors.mailingAddress?.state?.type === "maxLength"
                          ? t("errors.maxLength")
                          : t("errors.stateError")
                      }
                      error={errors.mailingAddress?.state}
                      register={register}
                      controlClassName="control"
                      options={stateKeys}
                      keyPrefix="states"
                      dataTestId={"app-primary-mailing-address-state"}
                    />
                  </div>

                  <Field
                    id="mailingAddressZipCode"
                    name="mailingAddress.zipCode"
                    label={t("application.contact.zip")}
                    defaultValue={application.mailingAddress.zipCode}
                    validation={{ required: true, maxLength: 64 }}
                    error={errors.mailingAddress?.zipCode}
                    errorMessage={
                      errors.mailingAddress?.zipCode?.type === "maxLength"
                        ? t("errors.maxLength")
                        : t("errors.zipCodeError")
                    }
                    register={register}
                    dataTestId={"app-primary-mailing-address-zip"}
                  />
                </fieldset>
              </CardSection>
            )}

            <CardSection divider={"inset"}>
              <fieldset>
                <legend
                  className={`text__caps-spaced ${errors?.contactPreferences ? "text-alert" : ""}`}
                >
                  {t("application.contact.contactPreference")}
                </legend>
                <FieldGroup
                  name="contactPreferences"
                  fields={contactPreferencesOptions}
                  type="checkbox"
                  validation={{ required: true }}
                  error={errors?.contactPreferences}
                  errorMessage={t("errors.selectAtLeastOne")}
                  register={register}
                  dataTestId={"app-primary-contact-preference"}
                />
              </fieldset>
            </CardSection>

            <CardSection>
              <fieldset>
                <legend
                  className={`text__caps-spaced ${
                    errors?.applicant?.workInRegion ? "text-alert" : ""
                  }`}
                >
                  {t("application.contact.doYouWorkIn", { county: listing?.countyCode })}
                </legend>

                <p className="field-note mb-4">{t("application.contact.doYouWorkInDescription")}</p>

                <Field
                  className="mb-1"
                  type="radio"
                  id="workInRegionYes"
                  name="applicant.workInRegion"
                  label={t("t.yes")}
                  register={register}
                  validation={{ required: true }}
                  error={errors?.applicant?.workInRegion}
                  inputProps={{
                    value: "yes",
                    defaultChecked: application.applicant.workInRegion == "yes",
                  }}
                  dataTestId={"app-primary-work-in-region-yes"}
                />

                <Field
                  className="mb-1"
                  type="radio"
                  id="workInRegionNo"
                  name="applicant.workInRegion"
                  label={t("t.no")}
                  register={register}
                  validation={{ required: true }}
                  error={errors?.applicant?.workInRegion}
                  inputProps={{
                    value: "no",
                    defaultChecked: application.applicant.workInRegion == "no",
                  }}
                  dataTestId={"app-primary-work-in-region-no"}
                />
                {errors?.applicant?.workInRegion && (
                  <FormErrorMessage id="applicant.workInRegion-error">
                    {t("errors.selectOption")}
                  </FormErrorMessage>
                )}
              </fieldset>

              {(workInRegion == "yes" ||
                (!workInRegion && application.applicant.workInRegion == "yes")) && (
                <div className="form-card__group mx-0 px-0 mt-2">
                  <fieldset>
                    <legend className="text__caps-spaced">
                      {t("application.contact.workAddress")}
                    </legend>

                    <Field
                      id="workAddressStreet"
                      name="applicant.workAddress.street"
                      defaultValue={application.applicant.workAddress.street}
                      validation={{ required: true, maxLength: 64 }}
                      error={errors.applicant?.workAddress?.street}
                      errorMessage={
                        errors.applicant?.workAddress?.street?.type === "maxLength"
                          ? t("errors.maxLength")
                          : t("errors.streetError")
                      }
                      register={register}
                      dataTestId={"app-primary-work-address-street"}
                      label={t("application.contact.streetAddress")}
                    />

                    <Field
                      id="workAddressStreet2"
                      name="applicant.workAddress.street2"
                      label={t("application.contact.apt")}
                      defaultValue={application.applicant.workAddress.street2}
                      register={register}
                      error={errors.applicant?.workAddress?.street2}
                      validation={{ maxLength: 64 }}
                      errorMessage={"errors.maxLength"}
                      dataTestId={"app-primary-work-address-street2"}
                    />

                    <div className="flex max-w-2xl">
                      <Field
                        id="workAddressCity"
                        name="applicant.workAddress.city"
                        label={t("application.contact.city")}
                        defaultValue={application.applicant.workAddress.city}
                        validation={{ required: true, maxLength: 64 }}
                        error={errors.applicant?.workAddress?.city}
                        errorMessage={
                          errors.applicant?.workAddress?.city?.type === "maxLength"
                            ? t("errors.maxLength")
                            : t("errors.cityError")
                        }
                        register={register}
                        dataTestId={"app-primary-work-address-city"}
                      />

                      <Select
                        id="workAddressState"
                        name="applicant.workAddress.state"
                        label={t("application.contact.state")}
                        defaultValue={application.applicant.workAddress.state}
                        validation={{ required: true, maxLength: 64 }}
                        errorMessage={
                          errors.applicant?.workAddress?.state?.type === "maxLength"
                            ? t("errors.maxLength")
                            : t("errors.stateError")
                        }
                        register={register}
                        controlClassName="control"
                        options={stateKeys}
                        keyPrefix="states"
                        dataTestId={"app-primary-work-address-state"}
                      />
                    </div>

                    <Field
                      id="workAddressZipCode"
                      name="applicant.workAddress.zipCode"
                      label={t("application.contact.zip")}
                      defaultValue={application.applicant.workAddress.zipCode}
                      validation={{ required: true, maxLength: 64 }}
                      error={errors.applicant?.workAddress?.zipCode}
                      errorMessage={
                        errors.applicant?.workAddress?.zipCode?.type === "maxLength"
                          ? t("errors.maxLength")
                          : t("errors.zipCodeError")
                      }
                      register={register}
                      dataTestId={"app-primary-work-address-zip"}
                    />
                  </fieldset>
                </div>
              )}
            </CardSection>
          </div>
          <CardSection>
            {verifyAddress && (
              <AddressValidationSelection
                {...{ foundAddress, newAddressSelected, setNewAddressSelected, setVerifyAddress }}
              />
            )}
          </CardSection>
        </ApplicationFormLayout>
      </Form>
    </FormsLayout>
  )
}

export default ApplicationAddress
