import React, { useState } from "react"
import { Button } from "./Button"
import { FormOption } from "./ListingsSearchModal"

type ButtonGroupProps = {
  name: string
  options: FormOption[]
  value?: string
  showBorder?: boolean
  onChange: (name: string, value: string) => void
}

/**
 * This component groups together multiple buttons, of which only one is
 * selectable, and sets a value based on the active button's value when a new
 * buttom is selected.
 *
 * @param props
 * @returns
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const nullState = {
    index: null,
    value: null,
  }

  let initialState = nullState

  if (props.value) {
    props.options.forEach((button, index) => {
      if (button.value == props.value) {
        initialState = {
          index: index,
          value: button.value,
        }
      }
    })
  }

  const [selection, setSelection] = useState(initialState)

  const setActiveButton = (index: number) => {
    const value = props.options[index].value

    setSelection({
      index: index,
      value: value,
    })

    props.onChange(props.name, value)
  }

  const deselectHandler = (index: number) => {
    if (selection.index == index) {
      setSelection(nullState)
      props.onChange(props.name, null)
    }
  }

  return (
    <div>
      {props.options.map((button, index) => {
        return (
          <Button
            isActive={selection.index == index}
            label={button.label}
            value={button.value}
            index={index}
            key={index}
            onSelect={setActiveButton}
            onDeselect={deselectHandler}
          />
        )
      })}
    </div>
  )
}
