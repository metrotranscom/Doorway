/* eslint-disable @typescript-eslint/no-var-requires */
// Prints duplicate translation strings for cleanup
// example: `ts-node duplicate-translations > duplicated-keys.json`
const englishTranslations = require("../src/locales/general.json")
const spanishTranslations = require("../src/locales/es.json")
const chineseTranslations = require("../src/locales/zh.json")
const vietnameseTranslations = require("../src/locales/vi.json")
const tagalogTranslations = require("../src/locales/tl.json")

function main() {
  type TranslationsType = {
    [key: string]: string
  }

  const allTranslations = [
    { translationKeys: englishTranslations, language: "English" },
    { translationKeys: spanishTranslations, language: "Spanish" },
    { translationKeys: chineseTranslations, language: "Chinese" },
    { translationKeys: vietnameseTranslations, language: "Vietnamese" },
    { translationKeys: tagalogTranslations, language: "Tagalog" },
  ]

  const getDuplicateStrings = (translations: TranslationsType) => {
    const translationValues = Object.values(translations)
    translationValues.forEach(() => {
      translationValues.filter((value, index) => translationValues.indexOf(value) !== index)
    })

    const duplicates: string[] = translationValues.reduce(
      (acc: string[], val, index, translationValues) => {
        if (translationValues.indexOf(val) !== index && acc.indexOf(val) < 0) acc.push(val)
        return acc
      },
      []
    )

    return duplicates
  }

  allTranslations.forEach((foreignKeys) => {
    console.log("--------------------")
    console.log(`Duplicate Public Site ${foreignKeys.language} Translations:`)
    const duplicatePublicSiteTranslations = getDuplicateStrings(foreignKeys.translationKeys)
    duplicatePublicSiteTranslations.forEach((duplicateValue) => console.log(duplicateValue))
  })
}

void main()

export {}
