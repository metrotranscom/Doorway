import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { AlertBox, Form, t } from "@bloom-housing/ui-components"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { ApplicationSection, MultiselectOption } from "@bloom-housing/backend-core/types"
import {
  AuthContext,
  getAllOptions,
  getCheckboxOption,
  getExclusiveKeys,
  getInputType,
  getPageQuestion,
  getRadioFields,
  listingSectionQuestions,
  mapApiToMultiselectForm,
  mapCheckboxesToApi,
  mapRadiosToApi,
  OnClientSide,
  PageView,
  pushGtmEvent,
} from "@bloom-housing/shared-helpers"
import FormsLayout from "../../layouts/forms"
import { useFormConductor } from "../../lib/hooks"

import { UserStatus } from "../../lib/constants"
import { AddressValidationSelection, findValidatedAddress, FoundAddress } from "./ValidateAddress"
import ApplicationFormLayout from "../../layouts/application-form"

export interface ApplicationMultiselectQuestionStepProps {
  applicationSection: ApplicationSection
  applicationStep: string
  applicationSectionNumber: number
  strings?: {
    title?: string
    subTitle?: string
  }
}

const ApplicationMultiselectQuestionStep = ({
  applicationSection,
  applicationStep,
  applicationSectionNumber,
  strings,
}: ApplicationMultiselectQuestionStepProps) => {
  const [verifyAddress, setVerifyAddress] = useState(false)
  const [verifyAddressStep, setVerifyAddressStep] = useState(0)
  const [foundAddress, setFoundAddress] = useState<FoundAddress>({})
  const [newAddressSelected, setNewAddressSelected] = useState(true)

  const clientLoaded = OnClientSide()
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor(applicationStep)

  const questions = listingSectionQuestions(listing, applicationSection)
  const [page, setPage] = useState(conductor.navigatedThroughBack ? questions.length : 1)
  const [applicationQuestions, setApplicationQuestions] = useState(application[applicationSection])
  const question = getPageQuestion(questions, page)

  const questionSetInputType = getInputType(question?.options)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, setValue, watch, handleSubmit, errors, getValues, reset, trigger } = useForm({
    defaultValues: mapApiToMultiselectForm(applicationQuestions, questions, applicationSection),
  })

  const [exclusiveKeys, setExclusiveKeys] = useState(getExclusiveKeys(question, applicationSection))

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: `Application - All ${applicationSection}`,
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  // Required to keep the form up to date before submitting this section if you're moving between pages
  useEffect(() => {
    reset(mapApiToMultiselectForm(applicationQuestions, questions, applicationSection))
    setExclusiveKeys(getExclusiveKeys(question, applicationSection))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, applicationQuestions, reset])

  const allOptionNames = useMemo(() => {
    return getAllOptions(question, applicationSection)
  }, [question])

  const body = useRef(null)

  const onSubmit = (data) => {
    if (verifyAddressStep === 0) {
      body.current =
        questionSetInputType === "checkbox"
          ? mapCheckboxesToApi(data, question, applicationSection)
          : mapRadiosToApi(data.application[applicationSection], question)
    }

    // Verify address on preferences
    if (question?.options.some((item) => item?.collectAddress)) {
      const step: number = body.current.options.findIndex(
        (option, index) =>
          index >= verifyAddressStep && option.checked === true && option.extraData?.[0]?.value
      )

      if (
        newAddressSelected &&
        foundAddress.newAddress &&
        body.current.options[verifyAddressStep - 1]?.extraData?.[0]?.value
      ) {
        body.current.options[verifyAddressStep - 1].extraData[0].value = foundAddress.newAddress
      }

      if (step !== -1) {
        if (body.current.options[step].extraData[0]?.value) {
          setFoundAddress({})
          setVerifyAddress(true)
          findValidatedAddress(
            body.current.options[step].extraData[0]?.value,
            setFoundAddress,
            setNewAddressSelected
          )
          setVerifyAddressStep(step + 1)
        }

        return // Skip rest of the submit process
      }
    }

    if (questions.length > 1 && body.current) {
      // If there is more than one question, save the data in segments
      const currentQuestions = conductor.currentStep.application[applicationSection].filter(
        (question) => {
          return question.key !== body.current.key
        }
      )

      conductor.currentStep.save([...currentQuestions, body.current])
      setApplicationQuestions([...currentQuestions, body.current])
    } else {
      // Otherwise, submit all at once
      conductor.currentStep.save([body.current])
    }
    // Update to the next page if we have more pages
    if (page !== questions.length) {
      setVerifyAddressStep(0)
      setVerifyAddress(false)
      setPage(page + 1)
      body.current = null
      return
    }
    // Otherwise complete the section and move to the next URL
    conductor.completeSection(applicationSectionNumber)
    conductor.sync()
    conductor.routeToNextOrReturnUrl()
  }

  const watchQuestions = watch(allOptionNames)

  if (!clientLoaded || !allOptionNames) {
    return null
  }

  const checkboxOption = (option: MultiselectOption) => {
    return getCheckboxOption(
      option,
      question,
      applicationSection,
      register,
      setValue,
      getValues,
      allOptionNames,
      watchQuestions,
      errors,
      trigger,
      exclusiveKeys
    )
  }

  const allOptions = question ? [...question?.options] : []
  if (question?.optOutText) {
    allOptions.push({
      text: question?.optOutText,
      description: null,
      links: [],
      collectAddress: false,
      exclusive: true,
      ordinal: question.options.length + 1,
    })
  }

  const getSubtitle = () => {
    if (verifyAddress) {
      if (body.current.options.filter((option) => option.checked).length > 1) {
        return t("application.contact.verifyMultipleAddresses")
      }
      return null
    }
    return strings?.subTitle ?? question?.description
  }

  return (
    <FormsLayout>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ApplicationFormLayout
          listingName={listing?.name}
          heading={
            verifyAddress
              ? foundAddress.invalid
                ? t("application.contact.couldntLocateAddress")
                : t("application.contact.verifyAddressTitle")
              : strings?.title ?? question?.text
          }
          subheading={getSubtitle()}
          progressNavProps={{
            currentPageSection: applicationSectionNumber,
            completedSections: application.completedSections,
            labels: conductor.config.sections.map((label) => t(`t.${label}`)),
            mounted: clientLoaded,
          }}
          backLink={
            !verifyAddress
              ? {
                  url: conductor.determinePreviousUrl(),
                  onClickFxn:
                    page !== 1
                      ? () => {
                          conductor.setNavigatedBack(true)
                          setPage(page - 1)
                          body.current = null
                        }
                      : undefined,
                }
              : null
          }
          conductor={conductor}
        >
          {!!Object.keys(errors).length && (
            <AlertBox type="alert" inverted closeable>
              {t("errors.errorsToResolve")}
            </AlertBox>
          )}

          <div style={{ display: verifyAddress ? "none" : "block" }} key={question?.id}>
            <CardSection>
              {questionSetInputType === "checkbox" ? (
                <fieldset>
                  <legend className="text__caps-spaced mb-4 sr-only">{question?.text}</legend>
                  {applicationSection === ApplicationSection.preferences && (
                    <>
                      <p className="text__caps-spaced">{question?.text}</p>
                      <p className="field-note mb-8">{question?.description}</p>
                    </>
                  )}
                  <p className="field-note mb-8">
                    {t("application.household.preferredUnit.optionsLabel")}
                  </p>
                  {allOptions
                    ?.sort((a, b) => (a.ordinal > b.ordinal ? 1 : -1))
                    .map((option) => {
                      return checkboxOption(option)
                    })}
                </fieldset>
              ) : (
                getRadioFields(allOptions, register, question, applicationSection, errors)
              )}
            </CardSection>
          </div>
          <CardSection>
            {verifyAddress && (
              <AddressValidationSelection
                {...{
                  foundAddress,
                  newAddressSelected,
                  setNewAddressSelected,
                  setVerifyAddress,
                  setVerifyAddressStep,
                }}
              />
            )}
          </CardSection>
        </ApplicationFormLayout>
      </Form>
    </FormsLayout>
  )
}

export default ApplicationMultiselectQuestionStep
