import {
  ApiClaim,
  ApiType,
  AppBuilderMicroFrontend,
  BundleDescriptor,
  DBMS,
  EnvironmentVariable,
  ExternalApiClaim,
  MicroFrontend,
  MicroFrontendAppBuilderSlot,
  MicroFrontendType,
  Microservice,
  Nav,
  SecurityLevel,
  WidgetConfigMicroFrontend,
  WidgetContextParam,
  WidgetMicroFrontend
} from '../models/bundle-descriptor'
import { MicroFrontendStack, MicroserviceStack } from '../models/component'
import {
  fieldDependsOn,
  isMapOfStrings,
  mutualDependency,
  ObjectConstraints,
  regexp,
  UnionTypeConstraints,
  values
} from '../services/constraints-validator-service'

export const ALLOWED_NAME_REGEXP = /^[\w-]+$/
export const INVALID_NAME_MESSAGE =
  'Only alphanumeric characters, underscore and dash are allowed'
export const ALLOWED_BUNDLE_WITHOUT_REGISTRY_REGEXP = /^[\w-]+\/[\w-]+$/
export const ALLOWED_BUNDLE_WITH_REGISTRY_REGEXP =
  /^[\w.-]+(:\d+)?(?:\/[\w-]+){2}$/

const nameRegExpValidator = regexp(ALLOWED_NAME_REGEXP, INVALID_NAME_MESSAGE)
const bundleRegExpValidator = regexp(
  ALLOWED_BUNDLE_WITH_REGISTRY_REGEXP,
  'Valid format is <registry>/<organization>/<repository>'
)

// Constraints

const ENVIRONMENT_VARIABLE_CONSTRAINTS: UnionTypeConstraints<EnvironmentVariable> =
  {
    constraints: [
      {
        name: {
          required: true,
          type: 'string'
        },
        value: {
          required: true,
          type: 'string'
        }
      },
      {
        name: {
          required: true,
          type: 'string'
        },
        valueFrom: {
          required: true,
          children: {
            secretKeyRef: {
              required: true,
              children: {
                name: {
                  required: true,
                  type: 'string'
                },
                key: {
                  required: true,
                  type: 'string'
                }
              }
            }
          }
        }
      }
    ]
  }

const API_CLAIMS_CONSTRAINTS: UnionTypeConstraints<
  ApiClaim | ExternalApiClaim
> = {
  constraints: [
    {
      name: {
        required: true,
        type: 'string'
      },
      type: {
        required: true,
        type: 'string',
        validators: [values(ApiType)]
      },
      serviceName: {
        required: true,
        type: 'string'
      }
    },
    {
      name: {
        required: true,
        type: 'string'
      },
      type: {
        required: true,
        type: 'string',
        validators: [values(ApiType)]
      },
      serviceName: {
        required: true,
        type: 'string'
      },
      bundle: {
        required: true,
        type: 'string',
        validators: [bundleRegExpValidator]
      }
    }
  ],
  validators: [
    mutualDependency(
      { key: 'type', value: ApiType.External },
      { key: 'bundle' }
    )
  ]
}

const NAV_CONSTRAINTS: ObjectConstraints<Nav> = {
  label: {
    required: true,
    validators: [isMapOfStrings],
    children: {}
  },
  target: {
    required: true,
    type: 'string'
  },
  url: {
    required: true,
    type: 'string'
  }
}

const MICROSERVICE_CONSTRAINTS: ObjectConstraints<Microservice> = {
  name: {
    required: true,
    type: 'string',
    validators: [nameRegExpValidator]
  },
  stack: {
    required: true,
    type: 'string',
    validators: [values(MicroserviceStack)]
  },
  deploymentBaseName: {
    required: false,
    type: 'string'
  },
  dbms: {
    required: false,
    type: 'string',
    validators: [values(DBMS)]
  },
  ingressPath: {
    required: false,
    type: 'string'
  },
  healthCheckPath: {
    required: true,
    type: 'string'
  },
  roles: {
    isArray: true,
    required: false,
    type: 'string'
  },
  securityLevel: {
    required: false,
    type: 'string',
    validators: [values(SecurityLevel)]
  },
  permissions: {
    isArray: true,
    required: false,
    children: {
      clientId: {
        required: true,
        type: 'string'
      },
      role: {
        required: true,
        type: 'string'
      }
    }
  },
  env: {
    isArray: true,
    required: false,
    children: ENVIRONMENT_VARIABLE_CONSTRAINTS
  },
  commands: {
    required: false,
    children: {
      build: {
        required: false,
        type: 'string'
      }
    }
  }
}

const WIDGET_MICROFRONTEND_CONSTRAINTS: ObjectConstraints<WidgetMicroFrontend> =
  {
    name: {
      required: true,
      type: 'string',
      validators: [nameRegExpValidator]
    },
    stack: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendStack)]
    },
    titles: {
      required: true,
      validators: [isMapOfStrings],
      children: {}
    },
    publicFolder: {
      required: false,
      type: 'string'
    },
    group: {
      required: true,
      type: 'string'
    },
    apiClaims: {
      isArray: true,
      required: false,
      children: API_CLAIMS_CONSTRAINTS
    },
    nav: {
      isArray: true,
      required: false,
      children: NAV_CONSTRAINTS
    },
    commands: {
      required: false,
      children: {
        build: {
          required: false,
          type: 'string'
        }
      }
    },
    customElement: {
      required: true,
      type: 'string'
    },
    type: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendType)]
    },
    contextParams: {
      isArray: true,
      required: false,
      type: 'string',
      validators: [values(WidgetContextParam)]
    },
    configMfe: {
      required: false,
      type: 'string'
    }
  }

const WIDGETCONFIG_MICROFRONTEND_CONSTRAINTS: ObjectConstraints<WidgetConfigMicroFrontend> =
  {
    name: {
      required: true,
      type: 'string',
      validators: [nameRegExpValidator]
    },
    stack: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendStack)]
    },
    titles: {
      required: true,
      validators: [isMapOfStrings],
      children: {}
    },
    publicFolder: {
      required: false,
      type: 'string'
    },
    group: {
      required: true,
      type: 'string'
    },
    apiClaims: {
      isArray: true,
      required: false,
      children: API_CLAIMS_CONSTRAINTS
    },
    nav: {
      isArray: true,
      required: false,
      children: NAV_CONSTRAINTS
    },
    commands: {
      required: false,
      children: {
        build: {
          required: false,
          type: 'string'
        }
      }
    },
    customElement: {
      required: true,
      type: 'string'
    },
    type: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendType)]
    }
  }

const APPBUILDER_MICROFRONTEND_CONSTRAINTS: Array<
  ObjectConstraints<AppBuilderMicroFrontend>
> = [
  {
    name: {
      required: true,
      type: 'string',
      validators: [nameRegExpValidator]
    },
    stack: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendStack)]
    },
    titles: {
      required: true,
      validators: [isMapOfStrings],
      children: {}
    },
    publicFolder: {
      required: false,
      type: 'string'
    },
    group: {
      required: true,
      type: 'string'
    },
    apiClaims: {
      isArray: true,
      required: false,
      children: API_CLAIMS_CONSTRAINTS
    },
    nav: {
      isArray: true,
      required: false,
      children: NAV_CONSTRAINTS
    },
    commands: {
      required: false,
      children: {
        build: {
          required: false,
          type: 'string'
        }
      }
    },
    customElement: {
      required: true,
      type: 'string'
    },
    type: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendType)]
    },
    slot: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendAppBuilderSlot)]
    }
  },
  {
    name: {
      required: true,
      type: 'string',
      validators: [nameRegExpValidator]
    },
    stack: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendStack)]
    },
    titles: {
      required: true,
      validators: [isMapOfStrings],
      children: {}
    },
    publicFolder: {
      required: false,
      type: 'string'
    },
    group: {
      required: true,
      type: 'string'
    },
    apiClaims: {
      isArray: true,
      required: false,
      children: API_CLAIMS_CONSTRAINTS
    },
    nav: {
      isArray: true,
      required: false,
      children: NAV_CONSTRAINTS
    },
    commands: {
      required: false,
      children: {
        build: {
          required: false,
          type: 'string'
        }
      }
    },
    customElement: {
      required: true,
      type: 'string'
    },
    type: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendType)]
    },
    slot: {
      required: true,
      type: 'string',
      validators: [values(MicroFrontendAppBuilderSlot)]
    },
    paths: {
      isArray: true,
      required: true,
      type: 'string'
    }
  }
]

const MICROFRONTEND_CONSTRAINTS: UnionTypeConstraints<MicroFrontend> = {
  constraints: [
    WIDGET_MICROFRONTEND_CONSTRAINTS,
    WIDGETCONFIG_MICROFRONTEND_CONSTRAINTS,
    ...APPBUILDER_MICROFRONTEND_CONSTRAINTS
  ],
  validators: [
    fieldDependsOn(
      { key: 'contextParams' },
      { key: 'type', value: MicroFrontendType.Widget }
    ),
    fieldDependsOn(
      { key: 'configMfe' },
      { key: 'type', value: MicroFrontendType.Widget }
    ),    
    mutualDependency(
      { key: 'slot' },
      { key: 'type', value: MicroFrontendType.AppBuilder }
    ),
    mutualDependency(
      { key: 'paths' },
      { key: 'slot', value: MicroFrontendAppBuilderSlot.Content }
    )
  ]
}

export const BUNDLE_DESCRIPTOR_CONSTRAINTS: ObjectConstraints<BundleDescriptor> =
  {
    name: {
      required: true,
      type: 'string',
      validators: [nameRegExpValidator]
    },
    description: {
      required: false,
      type: 'string'
    },
    version: {
      required: true,
      type: 'string'
    },
    type: {
      required: true,
      type: 'string',
      validators: [values(['bundle'])]
    },
    microservices: {
      isArray: true,
      required: true,
      children: MICROSERVICE_CONSTRAINTS
    },
    microfrontends: {
      isArray: true,
      required: true,
      children: MICROFRONTEND_CONSTRAINTS
    },
    svc: {
      isArray: true,
      required: false,
      type: 'string'
    },
    global: {
      required: false,
      children: {
        nav: {
          isArray: true,
          required: true,
          children: NAV_CONSTRAINTS
        }
      }
    }
  }
