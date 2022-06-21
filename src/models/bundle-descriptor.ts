import { MicroFrontendStack, MicroserviceStack } from './component'

export type EnvironmentVariable =
  | {
      name: string
      value: string
    }
  | {
      name: string
      valueFrom: {
        secretKeyRef: {
          name: string
          key: string
        }
      }
    }

export type Permission = {
  clientId: string
  role: string
}

export enum DBMS {
  None = 'none',
  PostgreSQL = 'postgresql',
  MySQL = 'mysql',
  Embedded = 'embedded'
}

export enum SecurityLevel {
  Strict = 'strict',
  Lenient = 'lenient'
}

export type Microservice = {
  /** Component name. Version will be retrieved from the pom.xml, package.json */
  name: string
  /** Tech stack. It could be guessed from folder content or forced by the user */
  stack: MicroserviceStack
  /** Value used for defining custom pod names */
  healthCheckPath: string
  deploymentBaseName?: string
  dbms?: DBMS
  ingressPath?: string
  roles?: string[]
  permissions?: Permission[]
  securityLevel?: SecurityLevel
  env?: EnvironmentVariable[]
  commands?: {
    build?: string
  }
}

type BaseMicroFrontend = {
  name: string
  stack: MicroFrontendStack
  titles: { [lang: string]: string }
  group: string
  publicFolder?: string
  apiClaims?: Array<ApiClaim | ExternalApiClaim>
  commands?: {
    build?: string
  }
  nav?: Nav[]
}

export type WidgetMicroFrontend = BaseMicroFrontend & {
  type: MicroFrontendType.Widget
  contextParams?: WidgetContextParam[]
}

export type WidgetConfigMicroFrontend = BaseMicroFrontend & {
  type: MicroFrontendType.WidgetConfig
}

export type AppBuilderMicroFrontend = BaseMicroFrontend & {
  type: MicroFrontendType.AppBuilder
} & (
    | {
        slot: Exclude<
          MicroFrontendAppBuilderSlot,
          MicroFrontendAppBuilderSlot.Content
        >
      }
    | { slot: MicroFrontendAppBuilderSlot.Content; paths: string[] }
  )

export type MicroFrontend =
  | WidgetMicroFrontend
  | WidgetConfigMicroFrontend
  | AppBuilderMicroFrontend

export type BundleDescriptor = {
  /** Bundle project name. It will be used as default Docker image name */
  name: string
  /** Bundle version. It will be used as default Docker image tag */
  version: string
  type: string
  description?: string
  microservices: Microservice[]
  microfrontends: MicroFrontend[]
  svc?: string[]
  global?: {
    nav: Nav[]
  }
}

export type BundleGroup = {
  bundleGroupName: string
  bundleGroupVersionId: number
}

export type Bundle = {
  bundleGroupName: string
  bundleName: string
  gitSrcRepoAddress: string
  bundleGroupVersionId: number
  bundleGroupId: number
  bundleId: number
}

export enum MicroFrontendType {
  AppBuilder = 'app-builder',
  Widget = 'widget',
  WidgetConfig = 'widget-config'
}

export enum MicroFrontendAppBuilderSlot {
  PrimaryHeader = 'primary-header',
  PrimaryMenu = 'primary-menu',
  Content = 'content'
}

export enum WidgetContextParam {
  PageCode = 'pageCode',
  LangCode = 'langCode',
  ApplicationBaseUrl = 'applicationBaseUrl'
}

export enum ApiType {
  Internal = 'internal',
  External = 'external'
}

export interface ApiClaim {
  name: string
  type: ApiType
  serviceName: string
}

export interface ExternalApiClaim extends ApiClaim {
  bundle: string
}

export type Nav = {
  label: { [lang: string]: string }
  target: string
  url: string
}
