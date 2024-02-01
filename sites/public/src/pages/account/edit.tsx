import React, { useContext, useEffect, useState, useRef } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)
import customParseFormat from "dayjs/plugin/customParseFormat"
dayjs.extend(customParseFormat)
import { useForm } from "react-hook-form"
import {
  Field,
  FormCard,
  Icon,
  Form,
  emailRegex,
  t,
  AlertBox,
  SiteAlert,
  AlertTypes,
  passwordRegex,
  DOBField,
  DOBFieldValues,
} from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import Link from "next/link"
import { PageView, pushGtmEvent, AuthContext, RequireLogin } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../../lib/constants"
import FormsLayout from "../../layouts/forms"

type AlertMessage = {
  type: AlertTypes
  message: string
}

const Edit = () => {
  /* Form Handler */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, watch } = useForm()
  const { profile, userProfileService } = useContext(AuthContext)
  const [passwordAlert, setPasswordAlert] = useState<AlertMessage>()
  const [nameAlert, setNameAlert] = useState<AlertMessage>()
  const [dobAlert, setDobAlert] = useState<AlertMessage>()
  const [emailAlert, setEmailAlert] = useState<AlertMessage>()
  const MIN_PASSWORD_LENGTH = 8
  const password = useRef({})
  password.current = watch("password", "")

  useEffect(() => {
    if (profile) {
      pushGtmEvent<PageView>({
        event: "pageView",
        pageTitle: "Account Settings",
        status: UserStatus.LoggedIn,
      })
    }
  }, [profile])

  const onNameSubmit = async (data: {
    firstName: string
    middleName: string
    lastName: string
  }) => {
    const { firstName, middleName, lastName } = data
    setNameAlert(null)
    try {
      await userProfileService.update({
        body: { ...profile, firstName, middleName, lastName },
      })
      setNameAlert({ type: "success", message: `${t("account.settings.alerts.nameSuccess")}` })
    } catch (err) {
      setNameAlert({ type: "alert", message: `${t("account.settings.alerts.genericError")}` })
      console.warn(err)
    }
  }

  const onBirthdateSubmit = async (data: { dateOfBirth: DOBFieldValues }) => {
    const { dateOfBirth } = data
    setDobAlert(null)
    try {
      await userProfileService.update({
        body: {
          ...profile,
          dob: dayjs(
            `${dateOfBirth.birthYear}-${dateOfBirth.birthMonth}-${dateOfBirth.birthDay}`
          ).toDate(),
        },
      })
      setDobAlert({ type: "success", message: `${t("account.settings.alerts.dobSuccess")}` })
    } catch (err) {
      setDobAlert({ type: "alert", message: `${t("account.settings.alerts.genericError")}` })
      console.warn(err)
    }
  }

  const onEmailSubmit = async (data: { email: string }) => {
    const { email } = data
    setEmailAlert(null)
    try {
      await userProfileService.update({
        body: {
          ...profile,
          appUrl: window.location.origin,
          newEmail: email,
        },
      })
      setEmailAlert({ type: "success", message: `${t("account.settings.alerts.emailSuccess")}` })
    } catch (err) {
      console.log("err = ", err)
      setEmailAlert({ type: "alert", message: `${t("account.settings.alerts.genericError")}` })
      console.warn(err)
    }
  }

  const onPasswordSubmit = async (data: {
    password: string
    passwordConfirmation: string
    currentPassword: string
  }) => {
    const { password, passwordConfirmation, currentPassword } = data
    setPasswordAlert(null)
    if (passwordConfirmation === "" || password === "") {
      setPasswordAlert({ type: "alert", message: `${t("account.settings.alerts.passwordEmpty")}` })
      return
    }
    if (passwordConfirmation !== password) {
      setPasswordAlert({ type: "alert", message: `${t("account.settings.alerts.passwordMatch")}` })
      return
    }
    try {
      await userProfileService.update({
        body: { ...profile, password, currentPassword },
      })
      setPasswordAlert({
        type: "success",
        message: `${t("account.settings.alerts.passwordSuccess")}`,
      })
    } catch (err) {
      const { status } = err.response || {}
      if (status === 401) {
        setPasswordAlert({
          type: "alert",
          message: `${t("account.settings.alerts.currentPassword")}`,
        })
      } else {
        setPasswordAlert({ type: "alert", message: `${t("account.settings.alerts.genericError")}` })
      }
      console.warn(err)
    }
  }

  return (
    <RequireLogin signInPath="/sign-in" signInMessage={t("t.loginIsRequired")}>
      <FormsLayout>
        <FormCard>
          <div className="form-card__lead text-center border-b mx-0">
            <Icon size="2xl" symbol="settings" />
            <h1 className="form-card__title">{t("account.accountSettings")}</h1>
          </div>
          <SiteAlert type="notice" dismissable />
          <Form id="update-name" onSubmit={handleSubmit(onNameSubmit)}>
            {nameAlert && (
              <AlertBox type={nameAlert.type} onClose={() => setNameAlert(null)} inverted closeable>
                {nameAlert.message}
              </AlertBox>
            )}
            <div className="form-card__group border-b">
              <label className="text__caps-spaced" htmlFor="firstName">
                {t("application.name.yourName")}
              </label>

              <Field
                controlClassName="mt-2"
                name="firstName"
                placeholder={`${t("application.name.firstName")}`}
                error={errors.firstName}
                validation={{ maxLength: 64 }}
                errorMessage={
                  errors.firstName?.type === "maxLength"
                    ? t("errors.maxLength")
                    : t("errors.firstNameError")
                }
                register={register}
                defaultValue={profile ? profile.firstName : null}
              />

              <Field
                name="middleName"
                placeholder={t("application.name.middleNameOptional")}
                register={register}
                defaultValue={profile ? profile?.middleName : null}
                label={t("application.name.middleNameOptional")}
                readerOnly
                error={errors.middleName}
                validation={{ maxLength: 64 }}
                errorMessage={t("errors.maxLength")}
              />

              <Field
                name="lastName"
                placeholder={t("application.name.lastName")}
                error={errors.lastName}
                register={register}
                defaultValue={profile ? profile.lastName : null}
                label={t("application.name.lastName")}
                validation={{ maxLength: 64 }}
                errorMessage={
                  errors.lastName?.type === "maxLength"
                    ? t("errors.maxLength")
                    : t("errors.lastNameError")
                }
                readerOnly
              />
              <div className="text-center">
                <Button type="submit" variant="primary-outlined" className="items-center">
                  {t("account.settings.update")}
                </Button>
              </div>
            </div>
          </Form>
          <Form id="update-birthdate" onSubmit={handleSubmit(onBirthdateSubmit)}>
            {dobAlert && (
              <AlertBox type={dobAlert.type} onClose={() => setDobAlert(null)} inverted closeable>
                {dobAlert.message}
              </AlertBox>
            )}
            <div className="form-card__group border-b">
              <DOBField
                id="dateOfBirth"
                name="dateOfBirth"
                register={register}
                error={errors?.dateOfBirth}
                watch={watch}
                validateAge18={true}
                errorMessage={t("errors.dateOfBirthErrorAge")}
                defaultDOB={{
                  birthDay: profile ? dayjs(new Date(profile.dob)).utc().format("DD") : null,
                  birthMonth: profile ? dayjs(new Date(profile.dob)).utc().format("MM") : null,
                  birthYear: profile ? dayjs(new Date(profile.dob)).utc().format("YYYY") : null,
                }}
                label={t("application.name.yourDateOfBirth")}
              />
              <div className="text-center mt-5">
                <Button type="submit" variant="primary-outlined" className="items-center">
                  {t("account.settings.update")}
                </Button>
              </div>
            </div>
          </Form>
          <Form id="update-email" onSubmit={handleSubmit(onEmailSubmit)}>
            {emailAlert && (
              <AlertBox
                type={emailAlert.type}
                onClose={() => setEmailAlert(null)}
                inverted
                closeable
              >
                {emailAlert.message}
              </AlertBox>
            )}
            <div className="form-card__group border-b">
              <Field
                caps={true}
                type="email"
                name="email"
                label={`${t("t.email")}`}
                placeholder="example@web.com"
                validation={{ pattern: emailRegex }}
                error={errors.email}
                errorMessage={`${t("errors.emailAddressError")}`}
                register={register}
                defaultValue={profile ? profile.email : null}
              />
              <div className="text-center">
                <Button type="submit" variant="primary-outlined" className={"items-center"}>
                  {t("account.settings.update")}
                </Button>
              </div>
            </div>
          </Form>
          <Form id="update-password" onSubmit={handleSubmit(onPasswordSubmit)}>
            {passwordAlert && (
              <AlertBox
                type={passwordAlert.type}
                onClose={() => setPasswordAlert(null)}
                inverted
                closeable
              >
                {passwordAlert.message}
              </AlertBox>
            )}
            <div className="form-card__group border-b">
              <fieldset>
                <legend className="text__caps-spaced">
                  {t("authentication.createAccount.password")}
                </legend>
                <p className="field-note mb-4">{t("account.settings.passwordRemember")}</p>
                <div className={"flex flex-col"}>
                  <Field
                    caps={true}
                    type="password"
                    name="currentPassword"
                    label={t("account.settings.currentPassword")}
                    readerOnly={true}
                    placeholder="Current password"
                    error={errors.currentPassword}
                    register={register}
                    className={"mb-1"}
                  />
                  <div className="float-left text-sm font-semibold">
                    <Link href="/forgot-password">{t("authentication.signIn.forgotPassword")}</Link>
                  </div>
                </div>

                <div className="mt-5">
                  <Field
                    type="password"
                    name="password"
                    label={t("account.settings.newPassword")}
                    note={t("authentication.createAccount.passwordInfo")}
                    placeholder={t("authentication.createAccount.mustBe8Chars")}
                    validation={{
                      minLength: MIN_PASSWORD_LENGTH,
                      pattern: passwordRegex,
                    }}
                    error={errors.password}
                    errorMessage={t("authentication.signIn.passwordError")}
                    register={register}
                    className={"mb-1"}
                  />
                </div>

                <div className="mt-5">
                  <Field
                    type="password"
                    name="passwordConfirmation"
                    label={t("account.settings.confirmNewPassword")}
                    placeholder={t("authentication.createAccount.mustBe8Chars")}
                    validation={{
                      validate: (value) =>
                        value === password.current ||
                        t("authentication.createAccount.errors.passwordMismatch"),
                    }}
                    error={errors.passwordConfirmation}
                    errorMessage={t("authentication.createAccount.errors.passwordMismatch")}
                    register={register}
                    className={"mb-1"}
                  />
                </div>

                <div className="text-center mt-5">
                  <Button type="submit" variant="primary-outlined" className={"items-center"}>
                    {t("account.settings.update")}
                  </Button>
                </div>
              </fieldset>
            </div>
          </Form>
        </FormCard>
      </FormsLayout>
    </RequireLogin>
  )
}

export default Edit
