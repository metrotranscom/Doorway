describe("applications/contact/alternate-contact-type", function () {
  const route = "/applications/contact/alternate-contact-type"

  beforeEach(() => {
    cy.visit(route)
  })

  it("should render the alternate contact type sub-form", function () {
    cy.get("form").should("be.visible")
    cy.location("pathname").should("include", route)
  })

  it("should require form input", function () {
    cy.goNext()
    cy.checkErrorAlert("be.visible")
    cy.location("pathname").should("include", route)
  })

  it("should require text input when the Other type is selected", function () {
    cy.getByTestId("app-alternate-type").eq(3).check()
    cy.goNext()
    cy.checkErrorAlert("be.visible")
  })
})
