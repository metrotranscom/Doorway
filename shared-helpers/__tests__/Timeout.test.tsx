import React from "react"
import { render, cleanup } from "@testing-library/react"
import { LoggedInUserIdleTimeout } from "../src/auth/Timeout"
import { AuthContext } from "../src/auth/AuthContext"

afterEach(cleanup)

describe("<Timeout>", () => {
  it("creates element if user is logged in", () => {
    const onTimeoutSpy = jest.fn()
    const anchorMocked = document.createElement("div")
    const createElementSpy = jest.spyOn(document, "createElement").mockReturnValueOnce(anchorMocked)
    render(
      <AuthContext.Provider
        value={{
          profile: {
            id: "1234",
            email: "",
            firstName: "Waffle",
            lastName: "House",
            dob: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            jurisdictions: [],
            mfaEnabled: false,
            passwordUpdatedAt: new Date(),
            passwordValidForDays: 180,
            agreedToTermsOfService: true,
            listings: [],
          },
          signOut: jest.fn(),
        }}
      >
        <LoggedInUserIdleTimeout onTimeout={onTimeoutSpy} />
      </AuthContext.Provider>
    )
    expect(createElementSpy).toHaveBeenCalledTimes(2)
    createElementSpy.mockRestore()
  })

  it("does not create element if user is not logged in", () => {
    const onTimeoutSpy = jest.fn()
    const anchorMocked = document.createElement("div")
    const createElementSpy = jest.spyOn(document, "createElement").mockReturnValueOnce(anchorMocked)
    render(
      <AuthContext.Provider
        value={{
          signOut: jest.fn(),
        }}
      >
        <LoggedInUserIdleTimeout onTimeout={onTimeoutSpy} />
      </AuthContext.Provider>
    )
    expect(createElementSpy).toHaveBeenCalledTimes(1)
    createElementSpy.mockRestore()
  })
})
