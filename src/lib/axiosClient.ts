import { USE_LOCAL_BACKEND } from '@/lib/api.utilities'
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

export type Headers = Record<string, string | number | null | undefined>

export interface RequestOptions {
  headers?: Headers
  params?: AxiosRequestConfig['params']
}

const API_PREFIX = '/api/lgt/pp/food-board/v1'

// --- Original (SAP) backend config ---
const BACKEND_HOST = window.location.host.includes('localhost')
  ? 'ecc.dev.erp.idf'
  : window.location.host.replace('gw', 'ecc')
const API_BASE_URL = `https://${BACKEND_HOST}${API_PREFIX}`

const SAP_USERNAME = import.meta.env.VITE_SAP_USERNAME
const SAP_PASSWORD = import.meta.env.VITE_SAP_PASSWORD

const sapAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  ...(SAP_USERNAME &&
    SAP_PASSWORD && {
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD },
    }),
  params: {
    ...(BACKEND_HOST === 'ecc.dev.erp.idf' ? { 'sap-client': 120 } : undefined),
  },
})

// --- Local NestJS backend config ---
const localAxiosInstance = axios.create({
  baseURL: API_PREFIX,
  withCredentials: true,
})

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const axiosInstance = USE_LOCAL_BACKEND ? localAxiosInstance : sapAxiosInstance
