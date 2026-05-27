
import { ENVIRONMENTS, EnvironmentKey } from './environments';

export function getEnvConfig() {
  const env = (process.env.ENV || 'dev') as EnvironmentKey;

  if (!(env in ENVIRONMENTS)) {
    throw new Error(`❌ Invalid ENV value: ${env}`);
  }

  const baseUrl = ENVIRONMENTS[env].baseUrl;

  return {
    env,
    baseUrl,
    signinUrl: `${baseUrl}/signin`,
    signupUrl: `${baseUrl}/signup`,
  };
}