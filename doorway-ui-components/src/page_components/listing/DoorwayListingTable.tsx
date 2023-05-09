import React from "react"
import { StandardTableCell, StandardTableData, TableHeaders } from "tables/StandardTable"
import "./DoorwayListingTable.scss"

type DoorwayListingTableProps = {
  headers: TableHeaders
  data: StandardTableData
}

const DoorwayListingTable = (props: DoorwayListingTableProps) => {
  let data = props.data
  console.log(data)
  const rows = []
  props.data.forEach((row: Record<string, StandardTableCell>) => {
    let cols = []
    Object.values(row).forEach((col: StandardTableCell, index: number) => {
      cols.push(<span className={"table-content-" + index.toString()}>{col.content}</span>)
    })
    rows.push(<div className="doorway-listing_table-row">{cols}</div>)
    // Object.values(props.headers).forEach((headerPath: string) => {
    //   const header = headerPath.split(".").slice(-1)[0]
    //   rows.push(row[header])
    // })
  })
  return <div className="doorway-listing_table text__small-normal">{rows}</div>
}

export { DoorwayListingTable as default, DoorwayListingTable }
