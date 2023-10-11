import * as React from "react"
import { Heading, t, Icon, IconFillColors } from "@bloom-housing/ui-components"

interface ReferralApplicationProps {
  description: string
  phoneNumber: string
  strings: {
    call?: string
    title: string
  }
}

const ReferralApplication = (props: ReferralApplicationProps) => {
  const linkedPhoneNumber = `tel:${props.phoneNumber.replace(/[-()]/g, "")}`

  return (
    <section className="aside-block">
      <Heading priority={2} styleType={"underlineWeighted"}>
        {props.strings.title}
      </Heading>
      <p>
        <a href={linkedPhoneNumber}>
          <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />{" "}
          {props.strings.call ?? t("t.call")} {props.phoneNumber}
        </a>
      </p>
      <p className="text-sm mt-4 text-gray-800">{props.description}</p>
    </section>
  )
}

export { ReferralApplication as default, ReferralApplication }
