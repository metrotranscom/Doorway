import React, { useContext } from "react"
import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "@bloom-housing/ui-components"
import "./Button.scss"
import { buttonClassesForProps, buttonInner, ButtonProps } from "./Button"
import { NavigationContext } from "../config/NavigationContext"
import { isExternalLink } from "../helpers/links"

export interface LinkButtonProps extends Omit<ButtonProps, "onClick"> {
  href: string
  dataTestId?: string
  newTab?: boolean
  newTabIcon?: boolean
}

const LinkButton = (props: LinkButtonProps) => {
  const { LinkComponent } = useContext(NavigationContext)
  const buttonClasses = buttonClassesForProps(props)

  if (isExternalLink(props.href)) {
    return (
      <a
        href={props.href}
        className={buttonClasses.join(" ")}
        data-testid={props.dataTestId}
        target={props.newTab ? "_blank" : "_self"}
      >
        {buttonInner(props)}
        {props.newTabIcon && (
          <>
            <Icon symbol={faUpRightFromSquare} size={"small"} className={"ml-2"} />
            <span className="sr-only">{"Opens in a new tab"}</span>
          </>
        )}
      </a>
    )
  } else {
    return (
      <LinkComponent
        href={props.href}
        aria-hidden={props.ariaHidden}
        tabIndex={props.ariaHidden ? -1 : 0}
        className={buttonClasses.join(" ")}
        data-testid={props.dataTestId}
      >
        {buttonInner(props)}
      </LinkComponent>
    )
  }
}

export { LinkButton as default, LinkButton }
