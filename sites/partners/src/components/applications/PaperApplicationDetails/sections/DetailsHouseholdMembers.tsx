import React, { useContext, useMemo } from "react"
import { t, MinimalTable } from "@bloom-housing/ui-components"
import { Button, FieldValue } from "@bloom-housing/ui-seeds"
import { YesNoEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ApplicationContext } from "../../ApplicationContext"
import { MembersDrawer } from "../DetailsMemberDrawer"
import SectionWithGrid from "../../../shared/SectionWithGrid"

type DetailsHouseholdMembersProps = {
  setMembersDrawer: (member: MembersDrawer) => void
}

const DetailsHouseholdMembers = ({ setMembersDrawer }: DetailsHouseholdMembersProps) => {
  const application = useContext(ApplicationContext)

  const householdMembersHeaders = {
    name: t("t.name"),
    relationship: t("t.relationship"),
    birth: t("application.household.member.dateOfBirth"),
    sameResidence: t("application.add.sameResidence"),
    workInRegion: t("application.details.workInRegion"),
    action: "",
  }

  const householdMembersData = useMemo(() => {
    const checkAvailablility = (property) => {
      if (property === YesNoEnum.yes) {
        return t("t.yes")
      } else if (property === "no") {
        return t("t.no")
      }

      return t("t.n/a")
    }
    return application?.householdMember?.map((item) => ({
      name: { content: `${item.firstName} ${item.middleName} ${item.lastName}` },
      relationship: {
        content: item.relationship
          ? t(`application.form.options.relationship.${item.relationship}`)
          : t("t.n/a"),
      },
      birth: {
        content:
          item.birthMonth && item.birthDay && item.birthYear
            ? `${item.birthMonth}/${item.birthDay}/${item.birthYear}`
            : t("t.n/a"),
      },
      sameResidence: { content: checkAvailablility(item.sameAddress) },
      workInRegion: { content: checkAvailablility(item.workInRegion) },
      action: {
        content: (
          <Button
            type="button"
            className="font-semibold"
            onClick={() => setMembersDrawer(item)}
            variant="text"
          >
            {t("t.view")}
          </Button>
        ),
      },
    }))
  }, [application, setMembersDrawer])

  return (
    <SectionWithGrid heading={t("application.household.householdMembers")} bypassGrid inset>
      {application?.householdMember?.length ? (
        <MinimalTable headers={householdMembersHeaders} data={householdMembersData} />
      ) : (
        <FieldValue>{t("t.none")}</FieldValue>
      )}
    </SectionWithGrid>
  )
}

export { DetailsHouseholdMembers as default, DetailsHouseholdMembers }
