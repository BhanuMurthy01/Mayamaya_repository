
export const ENVIRONMENTS = {
  dev: {
    baseUrl: 'https://talent-dev.mayamaya.ai',
  },
  test: {
    baseUrl: 'https://talent-test.mayamaya.ai',
  },
  prod: {
    baseUrl: 'https://talent.mayamaya.ai',
  },

  // ✅ White‑label environments
  skillfit: {
    baseUrl: 'https://skillfit.techstargroup.com',
  },
  futureReady: {
    baseUrl: 'https://future-ready.yourgcc.com',
  },
  noah: {
    baseUrl: 'https://noahportal.e3coe.com',
  },
  ellucian: {
    baseUrl: 'https://ellucian.mayamaya.ai',
  },
  eleviq: {
    baseUrl: 'https://eleviq.stc-innovations.com',
  },
} as const;

/**
 * ✅ ENV key type
 * "dev" | "test" | "prod" | "skillfit" | ...
 */
export type EnvironmentKey = keyof typeof ENVIRONMENTS;