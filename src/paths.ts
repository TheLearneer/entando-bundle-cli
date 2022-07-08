export const RESOURCES_FOLDER = 'resources'
export const CONFIG_FOLDER = '.entando'
export const SVC_FOLDER = 'svc'
export const KEYCLOAK_FOLDER = [SVC_FOLDER, 'keycloak']
export const KEYCLOAK_DB_FOLDER = [...KEYCLOAK_FOLDER, 'keycloak-db']
export const KEYCLOAK_REALM_CONFIG_FOLDER = [...KEYCLOAK_FOLDER, 'realm-config']
export const KEYCLOAK_REALM_FILE = 'entando-dev-realm.json'
export const KEYCLOAK_USERS_FILE = 'entando-dev-users-0.json'
export const BUNDLE_DESCRIPTOR_FILE_NAME = 'entando.json'
export const CONFIG_FILE = 'config.json'
export const DEFAULT_CONFIG_FILE = 'default-config.json'
export const OUTPUT_FOLDER = [CONFIG_FOLDER, 'output']
export const LOGS_FOLDER = [CONFIG_FOLDER, 'logs']
export const DESCRIPTORS_OUTPUT_FOLDER = [...OUTPUT_FOLDER, 'descriptors']
export const PSC_FOLDER = 'platform'
export const MICROFRONTENDS_FOLDER = 'microfrontends'
export const MICROSERVICES_FOLDER = 'microservices'
export const WIDGETS_FOLDER = 'widgets'
export const PLUGINS_FOLDER = 'plugins'
export const BUILD_FOLDER = 'build'
export const DESCRIPTOR_EXTENSION = '.yaml'
export const BUNDLE_DESCRIPTOR_NAME = 'descriptor' + DESCRIPTOR_EXTENSION
