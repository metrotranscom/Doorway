import React from "react"

export type ButtonProps = {
  isActive: boolean
  index: number
  label: string
  value: string
  onSelect: (index: number) => void
  onDeselect: (index: number) => void
}

const buttonStyleBase: React.CSSProperties = {
  margin: "5px 10px",
  padding: "5px 10px",
  display: "inline-block",
}

const buttonStyleInactive: React.CSSProperties = {
  ...buttonStyleBase,
  border: "1px solid gray",
}

const buttonStyleActive: React.CSSProperties = {
  ...buttonStyleBase,
  border: "1px solid black",
  backgroundColor: "lightgray",
}

/**
 * A generic button that has an active (selected) and inactive (deselected) state
 *
 * @param props
 * @returns
 */
const Button = (props: ButtonProps) => {
  const toggleState = () => {
    if (!props.isActive) {
      props.onSelect(props.index)
    } else {
      props.onDeselect(props.index)
    }
  }

  const keyDownHandler = (event) => {
    // TODO: keyboard-based navigation?
    if (event.charCode == " ") {
      toggleState()
    }
  }

  return (
    <div
      role="button"
      style={props.isActive ? buttonStyleActive : buttonStyleInactive}
      onClick={toggleState}
      onKeyDown={keyDownHandler}
      tabIndex={props.index}
    >
      {props.label}
    </div>
  )
}

export { Button as default, Button }
