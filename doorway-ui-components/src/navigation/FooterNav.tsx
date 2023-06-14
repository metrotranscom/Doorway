import * as React from "react"
import "./FooterNav.scss"

export interface FooterNavProps {
  children?: React.ReactNode
  copyright?: string
}

const FooterNav = (props: FooterNavProps) => (
  <section className="footer-sock">
    <div className="footer-sock__inner">
      {props.copyright && <p className="footer-copyright">{props.copyright}</p>}
      {props.children && (
        <nav className="footer-nav" aria-label={"Footer"}>
          {props.children}
        </nav>
      )}
    </div>
  </section>
)

export { FooterNav as default, FooterNav }
