import React, { useEffect, useContext, useMemo } from "react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import Markdown from "markdown-to-jsx"
import { t, Form } from "@bloom-housing/ui-components"
import { ListingReviewOrder } from "@bloom-housing/backend-core/types"
import { OnClientSide, PageView, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import FormsLayout from "../../../layouts/forms"
import { useFormConductor } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"
import ApplicationFormLayout from "../../../layouts/application-form"
import { Button } from "@bloom-housing/ui-seeds"

const ApplicationWhatToExpect = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, listing } = useFormConductor("whatToExpect")
  const router = useRouter()

  const { handleSubmit } = useForm()
  const onSubmit = () => {
    conductor.routeToNextOrReturnUrl()
  }

  const content = useMemo(() => {
    switch (listing?.reviewOrderType) {
      case ListingReviewOrder.firstComeFirstServe:
        return {
          steps: t("application.start.whatToExpect.fcfs.steps"),
          finePrint: t("application.start.whatToExpect.fcfs.finePrint"),
        }
      case ListingReviewOrder.lottery:
        return {
          steps: t("application.start.whatToExpect.lottery.steps"),
          finePrint: t("application.start.whatToExpect.lottery.finePrint"),
        }
      case ListingReviewOrder.waitlist:
        return {
          steps: t("application.start.whatToExpect.waitlist.steps"),
          finePrint: t("application.start.whatToExpect.waitlist.finePrint"),
        }
      default:
        return { steps: "", finePrint: "" }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, router.locale])

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - What to Expect",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <ApplicationFormLayout
        listingName={listing?.name}
        heading={t("application.start.whatToExpect.title")}
        progressNavProps={{
          currentPageSection: 0,
          completedSections: 0,
          labels: conductor.config.sections.map((label) => t(`t.${label}`)),
          mounted: OnClientSide(),
        }}
        backLink={{
          url: `/applications/start/choose-language?listingId=${listing?.id}`,
        }}
      >
        <CardSection>
          <div className="markdown">
            <Markdown
              options={{
                disableParsingRawHTML: true,
                overrides: {
                  ol: {
                    component: ({ children, ...props }) => (
                      <ol {...props} className="large-numbers">
                        {children}
                      </ol>
                    ),
                  },
                },
              }}
            >
              {content.steps}
            </Markdown>

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
              {content.finePrint}
            </Markdown>
          </div>
        </CardSection>
        <CardSection className={"bg-primary-lighter"}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Button
              type="submit"
              variant="primary"
              onClick={() => conductor.setNavigatedBack(false)}
              id={"app-next-step-button"}
            >
              {t("t.next")}
            </Button>
          </Form>
        </CardSection>
      </ApplicationFormLayout>
    </FormsLayout>
  )
}

export default ApplicationWhatToExpect
