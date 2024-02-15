import React, { useContext } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { MenuLink, setSiteAlertMessage, t } from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { getSiteFooter } from "../lib/helpers"
import { SiteHeader } from "@bloom-housing/doorway-ui-components/src/headers/SiteHeader"

const Layout = (props) => {
  const { profile, signOut } = useContext(AuthContext)

  const router = useRouter()

  const languages =
    router?.locales?.map((item) => ({
      prefix: item === "en" ? "" : item,
      label: t(`languages.${item}`),
    })) || []

  const menuLinks: MenuLink[] = [
    {
      title: t("pageTitle.welcome"),
      href: "/",
    },
    {
      title: t("nav.viewListings"),
      href: "/listings",
    },
    {
      title: t("nav.helpCenter"),
      href: "#",
      subMenuLinks: [
        {
          title: t("pageTitle.getStarted"),
          href: "/help/get-started",
        },
        {
          title: t("pageTitle.housingHelp"),
          href: "/help/housing-help",
        },
        {
          title: t("pageTitle.questions"),
          href: "/help/questions",
        },
      ],
    },
  ]
  if (process.env.housingCounselorServiceUrl) {
    menuLinks.push({
      title: t("pageTitle.getAssistance"),
      href: process.env.housingCounselorServiceUrl,
    })
  }
  if (process.env.showProfessionalPartners) {
    menuLinks.push({
      title: t("nav.professionalPartners"),
      href: "#",
      subMenuLinks: [
        {
          title: t("pageTitle.developersAndPropertyManagers"),
          href: "/professional-partners/developers-and-property-managers",
        },
        {
          title: t("pageTitle.jurisdictions"),
          href: "/professional-partners/jurisdictions",
        },
      ],
    })
  }
  if (process.env.showMandatedAccounts) {
    if (profile) {
      menuLinks.push({
        title: t("nav.myAccount"),
        subMenuLinks: [
          {
            title: t("nav.myDashboard"),
            href: "/account/dashboard",
          },
          {
            title: t("account.myApplications"),
            href: "/account/applications",
          },
          {
            title: t("account.accountSettings"),
            href: "/account/edit",
          },
          {
            title: t("nav.signOut"),
            onClick: () => {
              const signOutFxn = async () => {
                setSiteAlertMessage(t(`authentication.signOut.success`), "notice")
                await router.push("/sign-in")
                signOut()
              }
              void signOutFxn()
            },
          },
        ],
      })
    } else {
      menuLinks.push({
        title: t("nav.signIn"),
        href: "/sign-in",
      })
    }
  }

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("nav.siteTitle")}</title>
        </Head>
        <SiteHeader
          logoSrc="/images/doorway-logo.png"
          homeURL="/"
          mainContentId="main-content"
          languages={languages.map((lang) => {
            return {
              label: lang.label,
              onClick: () =>
                void router.push(router.asPath, router.asPath, { locale: lang.prefix || "en" }),
              active: t("config.routePrefix") === lang.prefix,
            }
          })}
          menuLinks={menuLinks.map((menuLink) => {
            return {
              ...menuLink,
              className:
                router.pathname === menuLink.href ||
                menuLink.subMenuLinks?.map((link) => link.href).indexOf(router.pathname) >= 0
                  ? "secondary"
                  : "",
            }
          })}
          strings={{ skipToMainContent: t("t.skipToMainContent") }}
        />
        <main id="main-content" className="md:overflow-x-hidden">
          {props.children}
        </main>
      </div>
      {getSiteFooter()}
    </div>
  )
}

export default Layout
