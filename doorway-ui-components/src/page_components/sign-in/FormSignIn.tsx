import React, { useContext } from "react"
import {
  Button,
  Field,
  Form,
  FormCard,
  Icon,
  LinkButton,
  FormSignInErrorBox,
} from "../../.."
import type { UseFormMethods } from "react-hook-form"
import { NavigationContext } from "../../config/NavigationContext"
import { AlertTypes } from "../../notifications/alertTypes"
import { AppearanceStyleType, t } from "@bloom-housing/ui-components"

export type NetworkErrorDetermineError = (status: number, error: Error) => void

export type NetworkStatusType = AlertTypes

export type NetworkErrorReset = () => void

export type NetworkStatusContent = {
  title: string
  description: string
  error?: boolean
} | null

export type NetworkStatus = {
  content: NetworkStatusContent
  type?: NetworkStatusType
  reset: NetworkErrorReset
}

export type FormSignInProps = {
  control: FormSignInControl
  onSubmit: (data: FormSignInValues) => void
  networkStatus: NetworkStatus
  showRegisterBtn?: boolean
}

export type FormSignInControl = {
  errors: UseFormMethods["errors"]
  handleSubmit: UseFormMethods["handleSubmit"]
  register: UseFormMethods["register"]
  watch: UseFormMethods["watch"]
}

export type FormSignInValues = {
  email: string
  password: string
}

const FormSignIn = ({
  onSubmit,
  networkStatus,
  showRegisterBtn,
  control: { errors, register, handleSubmit },
}: FormSignInProps) => {
  const onError = () => {
    window.scrollTo(0, 0)
  }
  const { LinkComponent } = useContext(NavigationContext)

  return (
    <FormCard>
      <div className="form-card__lead text-center">
        <Icon size="2xl" symbol="profile" />
        <h1 className="form-card__title">{t(`nav.signIn`)}</h1>
      </div>
      <FormSignInErrorBox
        errors={errors}
        networkStatus={networkStatus}
        errorMessageId={"main-sign-in"}
      />
      <div className="form-card__group pt-0">
        <Form id="sign-in" className="mt-10" onSubmit={handleSubmit(onSubmit, onError)}>
          <Field
            caps={true}
            name="email"
            label={t("t.email")}
            validation={{ required: true }}
            error={errors.email}
            errorMessage={t("authentication.signIn.enterLoginEmail")}
            register={register}
            dataTestId="sign-in-email-field"
          />

          <aside className="float-right text-sm font-semibold">
            <LinkComponent href="/forgot-password">
              {t("authentication.signIn.forgotPassword")}
            </LinkComponent>
          </aside>

          <Field
            caps={true}
            name="password"
            label={t("authentication.createAccount.password")}
            validation={{ required: true }}
            error={errors.password}
            errorMessage={t("authentication.signIn.enterLoginPassword")}
            register={register}
            type="password"
            dataTestId="sign-in-password-field"
          />

          <div className="text-center mt-6">
            <Button styleType={AppearanceStyleType.primary} data-testid="sign-in-button">
              {t("nav.signIn")}
            </Button>
          </div>
        </Form>
      </div>
      {showRegisterBtn && (
        <div className="form-card__group text-center border-t">
          <h2 className="mb-6">{t("authentication.createAccount.noAccount")}</h2>

          <LinkButton href="/create-account">{t("account.createAccount")}</LinkButton>
        </div>
      )}
    </FormCard>
  )
}

export { FormSignIn as default, FormSignIn }
