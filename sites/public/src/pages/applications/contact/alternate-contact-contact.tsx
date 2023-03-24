/*
1.4 - Alternate Contact
Type of alternate contact
*/
import {
  AppearanceStyleType,
  AlertBox,
  Button,
  Form,
  Field,
  FormCard,
  t,
  ProgressNav,
  emailRegex,
  Heading,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { Select } from "@bloom-housing/ui-components/src/forms/Select"
import { PhoneField } from "@bloom-housing/ui-components/src/forms/PhoneField"
import {
  OnClientSide,
  PageView,
  pushGtmEvent,
  stateKeys,
  AuthContext,
} from "@bloom-housing/shared-helpers"
import FormBackLink from "../../../components/applications/FormBackLink"
import { useFormConductor } from "../../../lib/hooks"
import { useContext, useEffect } from "react"
import { UserStatus } from "../../../lib/constants"

export default () => {
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor("alternateContactInfo")
  const currentPageSection = 1

  /* Form Handler */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { control, register, handleSubmit, errors } = useForm<Record<string, any>>({
    shouldFocusError: false,
  })
  const onSubmit = (data) => {
    application.alternateContact.phoneNumber = data.phoneNumber
    application.alternateContact.emailAddress = data.emailAddress || null
    application.alternateContact.mailingAddress.street = data.mailingAddress.street
    application.alternateContact.mailingAddress.street2 = data.mailingAddress.street2
    application.alternateContact.mailingAddress.state = data.mailingAddress.state
    application.alternateContact.mailingAddress.zipCode = data.mailingAddress.zipCode
    application.alternateContact.mailingAddress.city = data.mailingAddress.city
    conductor.completeSection(1)
    conductor.sync()
    conductor.routeToNextOrReturnUrl()
  }
  const onError = () => {
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Alternate Contact",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <FormCard header={<Heading priority={1}>{listing?.name}</Heading>}>
        <ProgressNav
          currentPageSection={currentPageSection}
          completedSections={application.completedSections}
          labels={conductor.config.sections.map((label) => t(`t.${label}`))}
          mounted={OnClientSide()}
        />
      </FormCard>
      <FormCard>
        <FormBackLink
          url={conductor.determinePreviousUrl()}
          onClick={() => conductor.setNavigatedBack(true)}
        />

        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.alternateContact.contact.title")}
          </h2>
          <p className="field-note my-4">{t("application.alternateContact.contact.description")}</p>
        </div>

        {Object.entries(errors).length > 0 && (
          <AlertBox type="alert" inverted closeable>
            {t("errors.errorsToResolve")}
          </AlertBox>
        )}

        <Form
          id="applications-contact-alternate-contact"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <div className="form-card__group border-b">
            <label className="text__caps-spaced" htmlFor="phoneNumber">
              {t("application.alternateContact.contact.phoneNumberFormLabel")}
            </label>
            <PhoneField
              id="phoneNumber"
              name="phoneNumber"
              label={t("application.alternateContact.contact.phoneNumberFormLabel")}
              readerOnly={true}
              required={true}
              error={errors.phoneNumber}
              errorMessage={t("errors.phoneNumberError")}
              controlClassName="control"
              control={control}
              defaultValue={application.alternateContact.phoneNumber}
              dataTestId={"app-alternate-phone-number"}
            />
          </div>
          <div className="form-card__group border-b">
            <h3 className="text__caps-spaced">
              {t("application.alternateContact.contact.emailAddressFormLabel")}
            </h3>
            <Field
              id="emailAddress"
              name="emailAddress"
              label={t("application.alternateContact.contact.emailAddressFormLabel")}
              readerOnly={true}
              placeholder={t("t.emailAddressPlaceholder")}
              defaultValue={application.alternateContact.emailAddress || null}
              register={register}
              type="email"
              validation={{ pattern: emailRegex }}
              error={errors.emailAddress}
              errorMessage={t("errors.emailAddressError")}
              dataTestId={"app-alternate-email"}
            />
          </div>
          <div className="form-card__group">
            <fieldset>
              <legend className="text__caps-spaced">
                {t("application.alternateContact.contact.contactMailingAddressLabel")}
              </legend>
              <p className="field-note mb-4">
                {t("application.alternateContact.contact.contactMailingAddressHelperText")}
              </p>
              <Field
                id="mailingAddress.street"
                name="mailingAddress.street"
                label={t("application.contact.streetAddress")}
                placeholder={t("application.contact.streetAddress")}
                defaultValue={application.alternateContact.mailingAddress.street}
                register={register}
                dataTestId={"app-alternate-mailing-address-street"}
              />
              <Field
                id="mailingAddress.street2"
                name="mailingAddress.street2"
                label={t("application.contact.apt")}
                register={register}
                placeholder={t("application.contact.apt")}
                dataTestId={"app-alternate-mailing-address-street2"}
                defaultValue={application.alternateContact.mailingAddress.street2}
              />
              <div className="flex max-w-2xl">
                <Field
                  id="mailingAddress.city"
                  name="mailingAddress.city"
                  label={t("application.contact.cityName")}
                  placeholder={t("application.contact.cityName")}
                  defaultValue={application.alternateContact.mailingAddress.city}
                  register={register}
                  dataTestId={"app-alternate-mailing-address-city"}
                />

                <Select
                  id="mailingAddress.state"
                  name="mailingAddress.state"
                  label={t("application.contact.state")}
                  defaultValue={application.alternateContact.mailingAddress.state}
                  register={register}
                  controlClassName="control"
                  options={stateKeys}
                  keyPrefix="states"
                  dataTestId={"app-alternate-mailing-address-state"}
                />
              </div>
              <Field
                id="mailingAddress.zipCode"
                name="mailingAddress.zipCode"
                label={t("application.contact.zip")}
                placeholder={t("application.contact.zipCode")}
                defaultValue={application.alternateContact.mailingAddress.zipCode}
                register={register}
                dataTestId={"app-alternate-mailing-address-zip"}
              />
            </fieldset>
          </div>
          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                styleType={AppearanceStyleType.primary}
                onClick={() => {
                  conductor.returnToReview = false
                  conductor.setNavigatedBack(false)
                }}
                data-test-id={"app-next-step-button"}
              >
                {t("t.next")}
              </Button>
            </div>

            {conductor.canJumpForwardToReview() && (
              <div className="form-card__pager-row">
                <Button
                  unstyled={true}
                  className="mb-4"
                  onClick={() => {
                    conductor.returnToReview = true
                    conductor.setNavigatedBack(false)
                  }}
                >
                  {t("application.form.general.saveAndReturn")}
                </Button>
              </div>
            )}
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}
