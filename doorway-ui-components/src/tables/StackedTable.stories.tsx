import React from "react"

import { StackedTable } from "./StackedTable"

export default {
  title: "Tables/StackedTable",
  decorators: [(storyFn: any) => <div style={{ padding: "1rem" }}>{storyFn()}</div>],
  component: StackedTable,
}

const basicTableHeaders = {
  one: { name: "t.unitType" },
  two: { name: "t.availability" },
  three: { name: "t.incomeRange" },
}

const basicTableHeadersHiddenDesktop = {
  one: { name: "t.unitType" },
  two: { name: "t.availability" },
  three: { name: "t.incomeRange" },
  four: { name: "t.rent" },
}

const basicTableRows = [
  {
    one: { cellText: "Cell 1" },
    two: { cellText: "Cell 2" },
    three: { cellText: "Cell 3" },
  },
  {
    one: { cellText: "Cell 1" },
    two: { cellText: "Cell 2" },
    three: { cellText: "Cell 3" },
  },
  {
    one: { cellText: "Cell 1 Cell 1 Cell 1 Cell 1 Cell 1 Cell 1 Cell 1" },
    two: { cellText: "Cell 2 Cell 2 Cell 2 Cell 2 Cell 2 Cell 2 Cell 2" },
    three: { cellText: "Cell 3 Cell 3 Cell 3 Cell 3 Cell 3 Cell 3 Cell 3" },
  },
]

const basicTableRowsWithMultipleCellElements = [
  {
    one: [
      { cellText: "Cell 1", cellSubText: "Cell Subtext 1" },
      { cellText: "Cell 2", cellSubText: "Cell Subtext 2" },
    ],
    two: [
      { cellText: "Cell 3", cellSubText: "Cell Subtext 3" },
      { cellText: "Cell 4", cellSubText: "Cell Subtext 4" },
    ],
    three: { cellText: "Cell 5", cellSubText: "Cell Subtext 5" },
  },
  {
    one: { cellText: "Cell 1", cellSubText: "Cell Subtext 1" },
    two: { cellText: "Cell 2", cellSubText: "Cell Subtext 2" },
    three: [
      { cellText: "Cell 3", cellSubText: "Cell Subtext 3" },
      { cellText: "Cell 4", cellSubText: "Cell Subtext 4" },
      { cellText: "Cell 5", cellSubText: "Cell Subtext 5" },
    ],
  },
]

const basicTableRowsHiddenDesktop = [
  {
    one: { cellText: "Cell 1", cellSubText: "Subtext 1" },
    two: { cellText: "Cell 2", cellSubText: "Subtext 2" },
    three: { cellText: "Cell 3", cellSubText: "Subtext 3" },
    four: { cellText: "Cell 4", cellSubText: "Subtext 4" },
  },
  {
    one: { cellText: "Cell 1", cellSubText: "Subtext 1" },
    two: { cellText: "Cell 2", cellSubText: "Subtext 2" },
    three: { cellText: "Cell 3", cellSubText: "Subtext 3" },
    four: { cellText: "Cell 4", cellSubText: "Subtext 4" },
  },
  {
    one: {
      cellText: "Cell 1 Cell 1 Cell 1 Cell 1 Cell 1 Cell 1 Cell 1",
      cellSubText: "Subtext 1 Subtext 1 Subtext 1 Subtext 1 Subtext 1 Subtext 1",
    },
    two: {
      cellText: "Cell 2 Cell 2 Cell 2 Cell 2 Cell 2 Cell 2 Cell 2",
      cellSubText: "Subtext 2 Subtext 2 Subtext 2 Subtext 2 Subtext 2 Subtext 2",
    },
    three: {
      cellText: "Cell 3 Cell 3 Cell 3 Cell 3 Cell 3 Cell 3 Cell 3",
      cellSubText: "Subtext 3 Subtext 3 Subtext 3 Subtext 3 Subtext 3 Subtext 3",
    },
    four: {
      cellText: "Cell 4 Cell 4 Cell 4 Cell 4 Cell 4 Cell 4 Cell 4",
      cellSubText: "Subtext 4 Subtext 4 Subtext 4 Subtext 4 Subtext 4 Subtext 4 Subtext 4",
    },
  },
]

const basicTableRowsSubtext = [
  {
    one: { cellText: "Cell 1", cellSubText: "Subtext 1" },
    two: { cellText: "Cell 2", cellSubText: "Subtext 2" },
    three: { cellText: "Cell 3", cellSubText: "Subtext 3" },
  },
  {
    one: { cellText: "Cell 1", cellSubText: "Subtext 1" },
    two: { cellText: "Cell 2", cellSubText: "Subtext 2" },
    three: { cellText: "Cell 3", cellSubText: "Subtext 3" },
  },
  {
    one: {
      cellText: "Cell 1 Cell 1 Cell 1 Cell 1 Cell 1 Cell 1 Cell 1",
      cellSubText: "Subtext 1 Subtext 1 Subtext 1 Subtext 1 Subtext 1 Subtext 1",
    },
    two: {
      cellText: "Cell 2 Cell 2 Cell 2 Cell 2 Cell 2 Cell 2 Cell 2",
      cellSubText: "Subtext 2 Subtext 2 Subtext 2 Subtext 2 Subtext 2 Subtext 2",
    },
    three: {
      cellText: "Cell 3 Cell 3 Cell 3 Cell 3 Cell 3 Cell 3 Cell 3",
      cellSubText: "Subtext 3 Subtext 3 Subtext 3 Subtext 3 Subtext 3 Subtext 3",
    },
  },
]

const responsiveTableHeaders = {
  units: { name: "t.unitType" },
  availability: { name: "t.availability" },
  income: { name: "t.incomeRange" },
  rent: { name: "t.rent" },
}

const responsiveTableRows = [
  {
    units: { cellText: "Studio", cellSubText: "23 available", hideSubTextMobile: true },
    availability: { cellText: "23", cellSubText: "available" },
    income: { cellText: "$0 to $6,854", cellSubText: "per month" },
    rent: { cellText: "30%", cellSubText: "income" },
  },
  {
    units: { cellText: "1 BR", cellSubText: "3 available" },
    availability: { cellText: "3", cellSubText: "available" },
    income: { cellText: "$2,194 to $6,854", cellSubText: "per month" },
    rent: { cellText: "$1,295", cellSubText: "income" },
  },
]
export const Basic = () => <StackedTable stackedData={basicTableRows} headers={basicTableHeaders} />
export const BasicWithSubtext = () => (
  <StackedTable stackedData={basicTableRowsSubtext} headers={basicTableHeaders} />
)

export const BasicWithSubtextAndHiddenDesktopRow = () => (
  <StackedTable
    stackedData={basicTableRowsHiddenDesktop}
    headers={basicTableHeadersHiddenDesktop}
    headersHiddenDesktop={["two"]}
  />
)

export const UnitSummaryDefault = () => (
  <StackedTable
    stackedData={responsiveTableRows}
    headers={responsiveTableHeaders}
    headersHiddenDesktop={["availability"]}
  />
)

export const BasicWithMultipleCellElements = () => (
  <StackedTable stackedData={basicTableRowsWithMultipleCellElements} headers={basicTableHeaders} />
)
