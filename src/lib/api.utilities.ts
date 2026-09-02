/* eslint-disable @typescript-eslint/no-unnecessary-condition */
// Toggle backend target with a single change:
//   true  -> local NestJS backend (http://localhost:3000)
//   false -> original SAP / proxy backend
export const USE_LOCAL_BACKEND = true

// --- Original (SAP) backend ---
const SAP_PROXY_PATH = '/proxy'
const SAP_SERVICE_DOMAIN = 'gw.dev.erp.idf'

// --- Local NestJS backend ---
const LOCAL_PROXY_PATH = '/api/lgt/pp/food-board/v1'
const LOCAL_SERVICE_DOMAIN = 'localhost:3000'

export const PROXY_PATH = USE_LOCAL_BACKEND ? LOCAL_PROXY_PATH : SAP_PROXY_PATH
export const SERVICE_DOMAIN = USE_LOCAL_BACKEND ? LOCAL_SERVICE_DOMAIN : SAP_SERVICE_DOMAIN
