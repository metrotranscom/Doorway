import { Unit } from "../units/entities/unit.entity"
import { MinMax } from "../units/types/min-max"
import { MinMaxCurrency } from "../units/types/min-max-currency"
import { UnitSummary } from "../units/types/unit-summary"
import { UnitsSummarized } from "../units/types/units-summarized"
import { UnitTypeDto } from "../unit-types/dto/unit-type.dto"
import { UnitType } from "../unit-types/entities/unit-type.entity"
import { UnitAccessibilityPriorityType } from "../unit-accessbility-priority-types/entities/unit-accessibility-priority-type.entity"
import { AmiChart } from "../ami-charts/entities/ami-chart.entity"
import { AmiChartItem } from "../ami-charts/entities/ami-chart-item.entity"
import { UnitAmiChartOverride } from "../units/entities/unit-ami-chart-override.entity"
import { Listing } from "../listings/entities/listing.entity"
import { ListingReviewOrder } from "../listings/types/listing-review-order-enum"

export type AnyDict = { [key: string]: unknown }
type Units = Unit[]

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const minMax = (baseValue: MinMax, newValue: number): MinMax => {
  return {
    min: Math.min(baseValue.min, newValue),
    max: Math.max(baseValue.max, newValue),
  }
}

const minMaxCurrency = (baseValue: MinMaxCurrency, newValue: number): MinMaxCurrency => {
  return {
    min: usd.format(Math.min(parseFloat(baseValue.min.replace(/[^0-9.-]+/g, "")), newValue)),
    max: usd.format(Math.max(parseFloat(baseValue.max.replace(/[^0-9.-]+/g, "")), newValue)),
  }
}

const yearlyCurrencyStringToMonthly = (currency: string) => {
  return usd.format(parseFloat(currency.replace(/[^0-9.-]+/g, "")) / 12)
}

const getAmiChartItemUniqueKey = (amiChartItem: AmiChartItem) => {
  return amiChartItem.householdSize.toString() + "-" + amiChartItem.percentOfAmi.toString()
}

export const mergeAmiChartWithOverrides = (amiChart: AmiChart, override: UnitAmiChartOverride) => {
  const householdAmiPercentageOverrideMap: Map<string, AmiChartItem> = override.items.reduce(
    (acc, amiChartItem) => {
      acc.set(getAmiChartItemUniqueKey(amiChartItem), amiChartItem)
      return acc
    },
    new Map()
  )

  for (const amiChartItem of amiChart.items) {
    const amiChartItemOverride = householdAmiPercentageOverrideMap.get(
      getAmiChartItemUniqueKey(amiChartItem)
    )
    if (amiChartItemOverride) {
      amiChartItem.income = amiChartItemOverride.income
    }
  }
  return amiChart
}

// Creates data used to display a table of household size/unit size by maximum income per the AMI charts on the units
// Unit sets can have multiple AMI charts used, in which case the table displays ranges
export const generateHmiData = (
  units: Units,
  minMaxHouseholdSize: MinMax[],
  amiCharts: AmiChart[]
) => {
  if (!units || units.length === 0) {
    return null
  }
  // Currently, BMR chart is just toggling whether or not the first column shows Household Size or Unit Type
  const showUnitType = units[0].bmrProgramChart

  type ChartAndPercentage = {
    percentage: number
    chart: AmiChart
  }

  const maxAMIChartHouseholdSize = amiCharts.reduce((maxSize, amiChart) => {
    const amiChartMax = amiChart.items.reduce((max, item) => {
      return Math.max(max, item.householdSize)
    }, 0)
    return Math.max(maxSize, amiChartMax)
  }, 0)

  // All unique AMI percentages across all units
  const allPercentages: number[] = [
    ...new Set(
      units.filter((item) => item != null).map((unit) => parseInt(unit.amiPercentage, 10))
    ),
  ].sort(function (a, b) {
    return a - b
  })

  const amiChartMap: Record<string, AmiChart> = amiCharts.reduce((acc, amiChart) => {
    acc[amiChart.id] = amiChart
    return acc
  }, {})

  // All unique combinations of an AMI percentage and an AMI chart across all units
  const uniquePercentageChartSet: ChartAndPercentage[] = [
    ...new Set(
      units
        .filter((unit) => amiChartMap[unit.amiChartId])
        .map((unit) => {
          let amiChart = amiChartMap[unit.amiChartId]
          if (unit.amiChartOverride) {
            amiChart = mergeAmiChartWithOverrides(amiChart, unit.amiChartOverride)
          }
          return JSON.stringify({
            percentage: parseInt(unit.amiPercentage, 10),
            chart: amiChart,
          })
        })
    ),
  ].map((uniqueSetString) => JSON.parse(uniqueSetString))

  const hmiHeaders = {
    sizeColumn: showUnitType ? "t.unitType" : "listings.householdSize",
  } as AnyDict

  let bmrHeaders = [
    "listings.unitTypes.SRO",
    "listings.unitTypes.studio",
    "listings.unitTypes.oneBdrm",
    "listings.unitTypes.twoBdrm",
    "listings.unitTypes.threeBdrm",
    "listings.unitTypes.fourBdrm",
  ]
  // this is to map currentHouseholdSize to a units max occupancy
  const unitOccupancy = []

  let validHouseholdSizes = minMaxHouseholdSize.reduce((validSizes, minMax) => {
    // Get all numbers between min and max
    // If min is more than the largest chart value, make sure we show the largest value
    const unitHouseholdSizes = [
      ...Array(Math.min(minMax.max, maxAMIChartHouseholdSize) + 1).keys(),
    ].filter((value) => value >= Math.min(minMax.min, maxAMIChartHouseholdSize))
    return [...new Set([...validSizes, ...unitHouseholdSizes])].sort((a, b) => (a < b ? -1 : 1))
  }, [])

  if (showUnitType) {
    // the unit types used by the listing
    const selectedUnitTypes = units.reduce((obj, unit) => {
      if (unit.unitType) {
        obj[unit.unitType.name] = {
          rooms: unit.unitType.numBedrooms,
          maxOccupancy: unit.maxOccupancy,
        }
      }
      return obj
    }, {})
    const sortedUnitTypeNames = Object.keys(selectedUnitTypes).sort((a, b) =>
      selectedUnitTypes[a].rooms < selectedUnitTypes[b].rooms
        ? -1
        : selectedUnitTypes[a].rooms > selectedUnitTypes[b].rooms
        ? 1
        : 0
    )
    // setbmrHeaders based on the actual units
    bmrHeaders = sortedUnitTypeNames.map((type) => `listings.unitTypes.${type}`)

    // set unitOccupancy based off of a units max occupancy
    sortedUnitTypeNames.forEach((name) => {
      unitOccupancy.push(selectedUnitTypes[name].maxOccupancy)
    })

    // if showUnitType, we want to set the bedroom sizes to the valid household sizes
    validHouseholdSizes = [...new Set(units.map((unit) => unit.unitType?.numBedrooms || 0))]
  }

  // 1. If there are multiple AMI levels, show each AMI level (max income per
  //    year only) for each size (number of cols = the size col + # ami levels)
  // 2. If there is only one AMI level, show max income per month and per
  //    year for each size (number of cols = the size col + 2 for each income style)
  if (allPercentages.length > 1) {
    allPercentages.forEach((percent) => {
      // Pass translation with its respective argument with format `key*argumentName:argumentValue`
      hmiHeaders[`ami${percent}`] = `listings.percentAMIUnit*percent:${percent}`
    })
  } else {
    hmiHeaders["maxIncomeMonth"] = "listings.maxIncomeMonth"
    hmiHeaders["maxIncomeYear"] = "listings.maxIncomeYear"
  }

  const findAmiValueInChart = (
    amiChart: AmiChartItem[],
    householdSize: number,
    percentOfAmi: number
  ) => {
    return amiChart.find((item) => {
      return item.householdSize === householdSize && item.percentOfAmi === percentOfAmi
    })?.income
  }

  // Build row data by household size
  const hmiRows = validHouseholdSizes.reduce((hmiRowsData, householdSize: number) => {
    const currentHouseholdSize = showUnitType ? unitOccupancy[householdSize - 1] : householdSize

    const rowData = {
      sizeColumn: showUnitType ? bmrHeaders[householdSize - 1] : currentHouseholdSize,
    }

    let rowHasData = false // Row is valid if at least one column is filled, otherwise don't push the row
    allPercentages.forEach((currentAmiPercent) => {
      // Get all the charts that we're using with this percentage and size
      const uniquePercentCharts = uniquePercentageChartSet.filter((uniqueChartAndPercentage) => {
        return uniqueChartAndPercentage.percentage === currentAmiPercent
      })
      // If we don't have data for this AMI percentage and household size, this cell is empty
      if (uniquePercentCharts.length === 0) {
        if (allPercentages.length === 1) {
          rowData["maxIncomeMonth"] = ""
          rowData["maxIncomeYear"] = ""
        } else {
          rowData[`ami${currentAmiPercent}`] = ""
        }
      } else {
        if (!uniquePercentCharts[0].chart) {
          return hmiRowsData
        }
        // If we have chart data, create a max income range string
        const firstChartValue = findAmiValueInChart(
          uniquePercentCharts[0].chart.items,
          currentHouseholdSize,
          currentAmiPercent
        )
        if (!firstChartValue) {
          return hmiRowsData
        }
        const maxIncomeRange = uniquePercentCharts.reduce(
          (incomeRange, uniqueSet) => {
            return minMaxCurrency(
              incomeRange,
              findAmiValueInChart(uniqueSet.chart.items, currentHouseholdSize, currentAmiPercent)
            )
          },
          { min: usd.format(firstChartValue), max: usd.format(firstChartValue) } as MinMaxCurrency
        )
        if (allPercentages.length === 1) {
          rowData[
            "maxIncomeMonth"
          ] = `listings.monthlyIncome*income:${yearlyCurrencyStringToMonthly(maxIncomeRange.max)}`
          rowData["maxIncomeYear"] = `listings.annualIncome*income:${maxIncomeRange.max}`
        } else {
          rowData[`ami${currentAmiPercent}`] = `listings.annualIncome*income:${maxIncomeRange.max}`
        }
        rowHasData = true
      }
    })
    if (rowHasData) {
      hmiRowsData.push(rowData)
    }
    return hmiRowsData
  }, [])

  return { columns: hmiHeaders, rows: hmiRows }
}

const getCurrencyString = (initialValue: string) => {
  const roundedValue = getRoundedNumber(initialValue)
  if (Number.isNaN(roundedValue)) return "t.n/a"
  return usd.format(roundedValue)
}

const getRoundedNumber = (initialValue: string) => {
  return parseFloat(parseFloat(initialValue).toFixed(2))
}

const getDefaultSummaryRanges = (unit: Unit) => {
  return {
    areaRange: { min: parseFloat(unit.sqFeet), max: parseFloat(unit.sqFeet) },
    minIncomeRange: {
      min: getCurrencyString(unit.monthlyIncomeMin),
      max: getCurrencyString(unit.monthlyIncomeMin),
    },
    occupancyRange: { min: unit.minOccupancy, max: unit.maxOccupancy },
    rentRange: {
      min: getCurrencyString(unit.monthlyRent),
      max: getCurrencyString(unit.monthlyRent),
    },
    rentAsPercentIncomeRange: {
      min: parseFloat(unit.monthlyRentAsPercentOfIncome),
      max: parseFloat(unit.monthlyRentAsPercentOfIncome),
    },
    floorRange: {
      min: unit.floor,
      max: unit.floor,
    },
    unitType: unit.unitType,
    totalAvailable: 0,
  }
}

const getUnitsSummary = (unit: Unit, existingSummary?: UnitSummary) => {
  if (!existingSummary) {
    return getDefaultSummaryRanges(unit)
  }
  const summary = existingSummary

  // Income Range
  summary.minIncomeRange = minMaxCurrency(
    summary.minIncomeRange,
    getRoundedNumber(unit.monthlyIncomeMin)
  )

  // Occupancy Range
  summary.occupancyRange = minMax(summary.occupancyRange, unit.minOccupancy)
  summary.occupancyRange = minMax(summary.occupancyRange, unit.maxOccupancy)

  // Rent Ranges
  summary.rentAsPercentIncomeRange = minMax(
    summary.rentAsPercentIncomeRange,
    parseFloat(unit.monthlyRentAsPercentOfIncome)
  )
  summary.rentRange = minMaxCurrency(summary.rentRange, getRoundedNumber(unit.monthlyRent))

  // Floor Range
  if (unit.floor) {
    summary.floorRange = minMax(summary.floorRange, unit.floor)
  }

  // Area Range
  summary.areaRange = minMax(summary.areaRange, parseFloat(unit.sqFeet))

  return summary
}

type UnitMap = {
  [key: string]: Unit[]
}

const UnitTypeSort = ["SRO", "studio", "oneBdrm", "twoBdrm", "threeBdrm", "fourBdrm", "fiveBdrm"]

// Allows for multiples rows under one unit type if the rent methods differ
export const summarizeUnitsByTypeAndRent = (units: Units, listing: Listing): UnitSummary[] => {
  const summaries: UnitSummary[] = []
  const unitMap: UnitMap = {}

  units.forEach((unit) => {
    const currentUnitType = unit.unitType
    const currentUnitRent = unit.monthlyRentAsPercentOfIncome
    const thisKey = currentUnitType?.name.concat(currentUnitRent)
    if (!(thisKey in unitMap)) unitMap[thisKey] = []
    unitMap[thisKey].push(unit)
  })

  for (const key in unitMap) {
    const finalSummary = unitMap[key].reduce((summary, unit, index) => {
      return getUnitsSummary(unit, index === 0 ? null : summary)
    }, {} as UnitSummary)
    if (listing.reviewOrderType !== ListingReviewOrder.waitlist) {
      finalSummary.totalAvailable = unitMap[key].length
    }
    summaries.push(finalSummary)
  }

  return summaries.sort((a, b) => {
    return (
      UnitTypeSort.indexOf(a.unitType.name) - UnitTypeSort.indexOf(b.unitType.name) ||
      Number(a.minIncomeRange.min) - Number(b.minIncomeRange.min)
    )
  })
}

// One row per unit type
export const summarizeUnitsByType = (units: Units, unitTypes: UnitTypeDto[]): UnitSummary[] => {
  const summaries = unitTypes.map((unitType: UnitTypeDto): UnitSummary => {
    const summary = {} as UnitSummary
    const unitsByType = units.filter((unit: Unit) => unit.unitType.name == unitType.name)
    const finalSummary = Array.from(unitsByType).reduce((summary, unit, index) => {
      return getUnitsSummary(unit, index === 0 ? null : summary)
    }, summary)
    return finalSummary
  })
  return summaries.sort((a, b) => {
    return (
      UnitTypeSort.indexOf(a.unitType.name) - UnitTypeSort.indexOf(b.unitType.name) ||
      Number(a.minIncomeRange.min) - Number(b.minIncomeRange.min)
    )
  })
}

const summarizeByAmi = (units: Units, amiPercentages: string[], listing: Listing) => {
  return amiPercentages.map((percent: string) => {
    const unitsByAmiPercentage = units.filter((unit: Unit) => unit.amiPercentage == percent)
    return {
      percent: percent,
      byUnitType: summarizeUnitsByTypeAndRent(unitsByAmiPercentage, listing),
    }
  })
}

export const getUnitTypes = (units: Unit[]): UnitType[] => {
  const unitTypes = new Map<string, UnitType>()
  for (const unitType of units.map((unit) => unit.unitType).filter((item) => item != null)) {
    unitTypes.set(unitType.id, unitType)
  }

  return Array.from(unitTypes.values())
}

export const summarizeUnits = (
  units: Unit[],
  amiCharts: AmiChart[],
  listing: Listing
): UnitsSummarized => {
  const data = {} as UnitsSummarized

  if (!units || (units && units.length === 0)) {
    return data
  }

  const unitTypes = new Map<string, UnitType>()
  for (const unitType of units.map((unit) => unit.unitType).filter((item) => item != null)) {
    unitTypes.set(unitType.id, unitType)
  }
  data.unitTypes = getUnitTypes(units)

  const priorityTypes = new Map<string, UnitAccessibilityPriorityType>()
  for (const priorityType of units
    .map((unit) => unit.priorityType)
    .filter((item) => item != null)) {
    priorityTypes.set(priorityType.id, priorityType)
  }
  data.priorityTypes = Array.from(priorityTypes.values())

  data.amiPercentages = Array.from(
    new Set(units.map((unit) => unit.amiPercentage).filter((item) => item != null))
  )
  data.byUnitTypeAndRent = summarizeUnitsByTypeAndRent(units, listing)
  data.byUnitType = summarizeUnitsByType(units, data.unitTypes)
  data.byAMI = summarizeByAmi(units, data.amiPercentages, listing)
  data.hmi = generateHmiData(
    units,
    data.byUnitType.map((byUnitType) => byUnitType.occupancyRange),
    amiCharts
  )
  return data
}
