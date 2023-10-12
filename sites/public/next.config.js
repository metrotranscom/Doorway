/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const withTM = require("next-transpile-modules")([
  "@bloom-housing/ui-seeds",
  "@bloom-housing/shared-helpers",
  "@bloom-housing/ui-components",
  "@bloom-housing/backend-core",
  "@bloom-housing/doorway-ui-components",
])
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}
// Set up app-wide constants
let BACKEND_API_BASE = "http://localhost:3100"
if (process.env.INCOMING_HOOK_BODY && process.env.INCOMING_HOOK_BODY.startsWith("http")) {
  // This is a value that can get set via a Netlify webhook for branch deploys
  BACKEND_API_BASE = decodeURIComponent(process.env.INCOMING_HOOK_BODY)
} else if (process.env.BACKEND_PROXY_BASE) {
  BACKEND_API_BASE = process.env.BACKEND_PROXY_BASE
} else if (process.env.BACKEND_API_BASE) {
  BACKEND_API_BASE = process.env.BACKEND_API_BASE
}
const LISTINGS_QUERY = process.env.LISTINGS_QUERY || "/listings"
console.log(`Using ${BACKEND_API_BASE}${LISTINGS_QUERY} for the listing service.`)

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN
const HOUSING_COUNSELOR_SERVICE_URL = process.env.HOUSING_COUNSELOR_SERVICE_URL

// Load the Tailwind theme and set up SASS vars
const bloomTheme = require("./tailwind.config.js")
const tailwindVars = require("@bloom-housing/ui-components/tailwind.tosass.js")(bloomTheme)

// Tell webpack to compile the ui components package
// https://www.npmjs.com/package/next-transpile-modules
module.exports = withBundleAnalyzer(
  withTM({
    env: {
      backendApiBase: BACKEND_API_BASE, // this has to be set for tests
      backendProxyBase: process.env.BACKEND_PROXY_BASE,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      listingsQuery: LISTINGS_QUERY,
      listingPhotoSize: process.env.LISTING_PHOTO_SIZE || "1302",
      mapBoxToken: MAPBOX_TOKEN,
      housingCounselorServiceUrl: HOUSING_COUNSELOR_SERVICE_URL,
      gtmKey: process.env.GTM_KEY || null,
      idleTimeout: process.env.IDLE_TIMEOUT,
      jurisdictionName: process.env.JURISDICTION_NAME,
      cacheRevalidate: process.env.CACHE_REVALIDATE ? Number(process.env.CACHE_REVALIDATE) : 60,
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      showProfessionalPartners: process.env.SHOW_PROFESSIONAL_PARTNERS === "TRUE",
      notificationsSignUpUrl: process.env.NOTIFICATIONS_SIGN_UP_URL || null,

      // start Doorway env variables
      //googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, // moved to runtime config
      awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
      awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_KEY,
      awsRegion: process.env.AWS_REGION,
      fileService: process.env.FILE_SERVICE,
    },
    i18n: {
      locales: process.env.LANGUAGES ? process.env.LANGUAGES.split(",") : ["en"],
      defaultLocale: "en",
    },
    sassOptions: {
      additionalData: tailwindVars,
    },
    webpack: (config) => {
      config.module.rules.push(
        {
          test: /\.md$/,
          type: "asset/source",
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
              },
            },
          ],
        }
      )
      return config
    },
    // Uncomment line below before building when using symlink for UI-C
    // experimental: { esmExternals: "loose" },
  })
)

if (process.env.SENTRY_ORG) {
  // Injected content via Sentry wizard below

  const { withSentryConfig } = require("@sentry/nextjs")

  module.exports = withSentryConfig(
    module.exports,
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      // Suppresses source map uploading logs during build
      silent: true,

      org: process.env.SENTRY_ORG,
      project: "public",
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: "/monitoring",

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    }
  )
}
