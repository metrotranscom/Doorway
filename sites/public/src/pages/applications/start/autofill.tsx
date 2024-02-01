import React, { useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { Application } from "@bloom-housing/backend-core/types"
import { Form, t } from "@bloom-housing/ui-components"
import {
  blankApplication,
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
} from "@bloom-housing/shared-helpers"
import FormsLayout from "../../../layouts/forms"
import { useFormConductor } from "../../../lib/hooks"
import FormSummaryDetails from "../../../components/shared/FormSummaryDetails"
import AutofillCleaner from "../../../lib/applications/appAutofill"
import { UserStatus } from "../../../lib/constants"
import ApplicationFormLayout from "../../../layouts/application-form"
import { Button } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"

export default () => {
  const router = useRouter()
  const context = useFormConductor("autofill")
  const { conductor, application, listing } = context
  const { initialStateLoaded, profile, applicationsService } = useContext(AuthContext)
  const [submitted, setSubmitted] = useState(false)
  const [previousApplication, setPreviousApplication] = useState<Application>(null)

  const currentPageSection = 1
  let useDetails = false

  const mounted = OnClientSide()

  const { handleSubmit } = useForm()
  const onSubmit = useCallback(() => {
    if (!submitted) {
      // Necessary to avoid infinite rerenders
      setSubmitted(true)
      if (previousApplication && useDetails) {
        const withUpdatedLang = {
          ...previousApplication,
          language: router.locale,
        }

        conductor.application = withUpdatedLang
      } else {
        const newApplication = {
          ...blankApplication,
          language: router.locale,
        }
        conductor.application = newApplication
      }

      context.syncApplication(conductor.application)
      conductor.sync()
      conductor.routeToNextOrReturnUrl()
    }
  }, [submitted, previousApplication, useDetails, context, conductor, router])

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Autofill",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  useEffect(() => {
    if (!previousApplication && initialStateLoaded) {
      if (profile) {
        void applicationsService
          .list({
            userId: profile.id,
            orderBy: "createdAt",
            order: "DESC",
            limit: 1,
          })
          .then((res) => {
            if (res && res?.items?.length) {
              setPreviousApplication(new AutofillCleaner(res.items[0]).clean())
            } else {
              onSubmit()
            }
          })
      } else {
        onSubmit()
      }
    }
  }, [profile, applicationsService, onSubmit, previousApplication, initialStateLoaded])

  return previousApplication ? (
    <FormsLayout>
      <ApplicationFormLayout
        listingName={listing?.name}
        heading={t("application.autofill.saveTime")}
        subheading={t("application.autofill.prefillYourApplication")}
        progressNavProps={{
          currentPageSection: currentPageSection,
          completedSections: application.completedSections,
          labels: conductor.config.sections.map((label) => t(`t.${label}`)),
          mounted: mounted,
        }}
        backLink={{
          url: `/applications/start/what-to-expect`,
        }}
        hideBorder={true}
      >
        <FormSummaryDetails
          application={previousApplication}
          listing={listing}
          editMode={false}
          hidePreferences={true}
          hidePrograms={true}
        />
        <Form onSubmit={handleSubmit(onSubmit)}>
          <CardSection
            id={"application-initial-page"}
            className={"bg-primary-lighter border-none"}
            divider={"flush"}
          >
            <Button
              variant={"primary"}
              onClick={() => {
                useDetails = true
              }}
              data-testid={"autofill-accept"}
              type={"submit"}
            >
              {t("application.autofill.start")}
            </Button>
          </CardSection>
          <CardSection>
            <Button
              variant={"text"}
              onClick={() => {
                useDetails = false
              }}
              type={"submit"}
              id={"autofill-decline"}
            >
              {t("application.autofill.reset")}
            </Button>
          </CardSection>
        </Form>
      </ApplicationFormLayout>
    </FormsLayout>
  ) : (
    <FormsLayout></FormsLayout>
  )
}
