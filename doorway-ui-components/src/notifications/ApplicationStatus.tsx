import * as React from "react"
import { Icon, IconFillColors, UniversalIconType } from "../icons/Icon"
import { ApplicationStatusType } from "../global/ApplicationStatusType"
import "./ApplicationStatus.scss"

export interface ApplicationStatusProps {
  content: string
  className?: string
  iconColor?: string
  iconType?: UniversalIconType
  status?: ApplicationStatusType
  subContent?: string
  vivid?: boolean
  withIcon?: boolean
}

const ApplicationStatus = (props: ApplicationStatusProps) => {
  let bgColor = ""
  const {
    className,
    content,
    iconColor,
    iconType = "clock",
    status = ApplicationStatusType.Open,
    subContent,
    vivid,
    withIcon = true,
  } = props

  // determine styling
  let textColor = vivid ? "text-white" : "text-gray-800"
  const textSize = vivid ? "text-2xs" : "text-xs"

  const icon = withIcon && (
    <Icon
      size="medium"
      symbol={iconType}
      fill={iconColor || (vivid ? IconFillColors.white : undefined)}
    />
  )

  switch (status) {
    case ApplicationStatusType.Open:
      bgColor = vivid ? "doorway-bg-primary" : "doorway-bg-primary-light"
      break
    case ApplicationStatusType.Closed:
      bgColor = vivid ? "bg-alert" : "bg-alert-light"
      break
    case ApplicationStatusType.PostLottery:
      bgColor = "bg-gray-850"
      textColor = "text-white"
      break
    case ApplicationStatusType.Matched:
      bgColor = "bg-green-500"
      textColor = "text-white"
      break
    default:
      bgColor = "bg-primary"
  }

  const classNames = ["application-status", textSize, textColor, bgColor]
  if (className) {
    classNames.push(className)
  }

  return (
    <div className={classNames.join(" ")}>
      {icon}
      <span>
        {content}
        {subContent && (
          <>
            <br />
            {subContent}
          </>
        )}
      </span>
    </div>
  )
}

export { ApplicationStatus as default, ApplicationStatus }
