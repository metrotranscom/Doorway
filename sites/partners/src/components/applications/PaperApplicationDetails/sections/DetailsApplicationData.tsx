import React, { useContext, useMemo } from "react"
import { t, GridSection, ViewItem, GridCell } from "@bloom-housing/ui-components"
import { ApplicationContext } from "../../ApplicationContext"
import { convertDataToLocal } from "../../../../lib/helpers"
import { ApplicationSubmissionType } from "@bloom-housing/backend-core/types"

const DetailsApplicationData = () => {
  const application = useContext(ApplicationContext)

  const applicationDate = useMemo(() => {
    if (!application) return null

    return convertDataToLocal(
      application?.submissionDate,
      application?.submissionType || ApplicationSubmissionType.electronical
    )
  }, [application])

  return (
    <GridSection
      className="bg-primary-lighter"
      title={t("application.details.applicationData")}
      inset
    >
      <GridCell>
        <ViewItem label={t("application.details.number")} dataTestId="number">
          {application.confirmationCode || application.id}
        </ViewItem>
      </GridCell>

      {application.submissionType && (
        <GridCell>
          <ViewItem label={t("application.details.type")} dataTestId="type">
            {t(`application.details.submissionType.${application.submissionType}`)}
          </ViewItem>
        </GridCell>
      )}

      <GridCell>
        <ViewItem label={t("application.details.submittedDate")} dataTestId="submittedDate">
          {applicationDate.date}
        </ViewItem>
      </GridCell>

      <GridCell>
        <ViewItem label={t("application.details.timeDate")} dataTestId="timeDate">
          {applicationDate.time}
        </ViewItem>
      </GridCell>

      <GridCell>
        <ViewItem label={t("application.details.language")} dataTestId="language">
          {application.language ? t(`languages.${application.language}`) : t("t.n/a")}
        </ViewItem>
      </GridCell>

      <GridCell>
        <ViewItem label={t("application.details.totalSize")} dataTestId="totalSize">
          {!application.householdSize ? 1 : application.householdSize}
        </ViewItem>
      </GridCell>

      <GridCell>
        <ViewItem label={t("application.details.submittedBy")} dataTestId="submittedBy">
          {application.applicant.firstName && application.applicant.lastName
            ? `${application.applicant.firstName} ${application.applicant.lastName}`
            : t("t.n/a")}
        </ViewItem>
      </GridCell>
    </GridSection>
  )
}

export { DetailsApplicationData as default, DetailsApplicationData }
