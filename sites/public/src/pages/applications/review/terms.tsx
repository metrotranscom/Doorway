/*
5.3 Terms
View of application terms with checkbox
*/
import React, { useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import {
  AppearanceStyleType,
  Button,
  FormCard,
  t,
  FieldGroup,
  Form,
  AlertBox,
  ProgressNav,
  Heading,
} from "@bloom-housing/ui-components"
import {
  ApplicationSection,
  ApplicationReviewStatus,
  ListingReviewOrder,
} from "@bloom-housing/backend-core"
import { useForm } from "react-hook-form"
import Markdown from "markdown-to-jsx"
import {
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
  listingSectionQuestions,
} from "@bloom-housing/shared-helpers"
import FormsLayout from "../../../layouts/forms"
import { useFormConductor } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"
import { untranslateMultiselectQuestion } from "../../../lib/helpers"
const ApplicationTerms = () => {
  const router = useRouter()
  const { conductor, application, listing } = useFormConductor("terms")
  const { applicationsService, profile } = useContext(AuthContext)
  const [apiError, setApiError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  let currentPageSection = 4
  if (listingSectionQuestions(listing, ApplicationSection.programs)?.length) currentPageSection += 1
  if (listingSectionQuestions(listing, ApplicationSection.preferences)?.length)
    currentPageSection += 1
  const applicationDueDate = new Date(listing?.applicationDueDate).toDateString()

  /* Form Handler */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = (data) => {
    setSubmitting(true)
    const acceptedTerms = data.agree === "agree"
    conductor.currentStep.save({ acceptedTerms })
    application.acceptedTerms = acceptedTerms
    application.completedSections = 6

    if (application?.programs?.length) {
      untranslateMultiselectQuestion(application.programs, listing)
    }
    if (application?.preferences?.length) {
      untranslateMultiselectQuestion(application.preferences, listing)
    }

    applicationsService
      .submit({
        body: {
          ...application,
          reviewStatus: ApplicationReviewStatus.pending,
          listing: {
            id: listing.id,
          },
          appUrl: window.location.origin,
          ...(profile && {
            user: {
              id: profile.id,
            },
          }),
        },
      })
      .then((result) => {
        conductor.currentStep.save({ confirmationCode: result.confirmationCode })
        return router.push("/applications/review/confirmation")
      })
      .catch((err) => {
        setSubmitting(false)
        setApiError(true)
        window.scrollTo(0, 0)
        console.error(`Error creating application: ${err}`)
        throw err
      })
  }

  const agreeField = [
    {
      id: "agree",
      label: t("application.review.terms.confirmCheckboxText"),
    },
  ]

  const content = useMemo(() => {
    switch (listing?.reviewOrderType) {
      case ListingReviewOrder.firstComeFirstServe:
        return {
          text: t("application.review.terms.fcfs.text"),
        }
      case ListingReviewOrder.lottery:
        return {
          text: t("application.review.terms.lottery.text"),
        }
      case ListingReviewOrder.waitlist:
        return {
          text: t("application.review.terms.waitlist.text"),
        }
      default:
        return { text: "" }
    }
  }, [listing, router.locale])

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Terms",
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
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">{t("application.review.terms.title")}</h2>
        </div>

        {apiError && (
          <AlertBox type="alert" inverted onClose={() => setApiError(false)}>
            {t("errors.alert.badRequest")}
          </AlertBox>
        )}

        <Form id="review-terms" className="mt-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-card__pager-row markdown">
            {listing?.applicationDueDate && (
              <>
                <Markdown options={{ disableParsingRawHTML: true }}>
                  {t("application.review.terms.textSubmissionDate", {
                    applicationDueDate: applicationDueDate,
                  })}
                </Markdown>
                <br />
                <br />
              </>
            )}

            <Markdown
              options={{
                disableParsingRawHTML: true,
                overrides: {
                  li: {
                    component: ({ children, ...props }) => (
                      <li {...props} className="mb-5">
                        {children}
                      </li>
                    ),
                  },
                },
              }}
            >
              {content.text}
            </Markdown>

            <div className="mt-6">
              <FieldGroup
                name="agree"
                type="checkbox"
                fields={agreeField}
                register={register}
                validation={{ required: true }}
                error={errors.agree}
                errorMessage={t("errors.agreeError")}
                fieldLabelClassName={"text-primary"}
                dataTestId={"app-terms-agree"}
              />
            </div>
          </div>
          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                loading={submitting}
                styleType={AppearanceStyleType.primary}
                type="submit"
                data-testid={"app-terms-submit-button"}
              >
                {t("t.submit")}
              </Button>
            </div>
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}

export default ApplicationTerms
