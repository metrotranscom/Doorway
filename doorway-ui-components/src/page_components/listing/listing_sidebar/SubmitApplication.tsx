import * as React from "react"
import Markdown from "markdown-to-jsx"
import { Heading } from "@bloom-housing/ui-components"
import { Address } from "../../../helpers/MultiLineAddress"
import { ContactAddress } from "./ContactAddress"
import { OrDivider } from "./OrDivider"

export interface ApplicationAddressesProps {
  /** The dropoff address for paper applications */
  applicationDropOffAddress?: Address
  /** Office hours for developers at the dropoff address for paper applications */
  applicationDropOffAddressOfficeHours?: string
  /** The mailing address for paper applications */
  applicationMailingAddress?: Address
  /** The application organization, often the developer */
  applicationOrganization?: string
  strings: {
    postmark?: string
    mailHeader?: string
    sectionHeader?: string
    dropOffHeader?: string
    officeHoursHeader?: string
    mapString: string
  }
}

/** Displays information regarding paper applications, including two sections: (1) how to mail in applications and (2) how to drop off applications */
const SubmitApplication = ({
  applicationDropOffAddress,
  applicationDropOffAddressOfficeHours,
  applicationMailingAddress,
  applicationOrganization,
  strings,
}: ApplicationAddressesProps) => {
  return (
    <>
      <section className="aside-block is-tinted bg-gray-100">
        <div className="text-serif-xl">{strings.sectionHeader}</div>
        {applicationMailingAddress && (
          <>
            <Heading priority={3} styleType={"capsWeighted"}>
              {strings.mailHeader}
            </Heading>
            <>
              <p className="text-gray-700">{applicationOrganization}</p>
              <ContactAddress address={applicationMailingAddress} mapString={strings.mapString} />
            </>
            {strings.postmark && <p className="mt-4 text-sm text-gray-750">{strings.postmark}</p>}
          </>
        )}
        {applicationDropOffAddress && (
          <>
            {applicationMailingAddress && <OrDivider bgColor="gray-100" />}
            <Heading priority={3} styleType={"capsWeighted"}>
              {strings.dropOffHeader}
            </Heading>
            <ContactAddress address={applicationDropOffAddress} mapString={strings.mapString} />
            {applicationDropOffAddressOfficeHours && (
              <>
                <Heading priority={3} styleType={"capsWeighted"}>
                  {strings.officeHoursHeader}
                </Heading>
                <p className="mt-4 text-sm text-gray-750">
                  <Markdown
                    children={applicationDropOffAddressOfficeHours}
                    options={{ disableParsingRawHTML: true }}
                  />
                </p>
              </>
            )}
          </>
        )}
      </section>
    </>
  )
}

export { SubmitApplication as default, SubmitApplication }
