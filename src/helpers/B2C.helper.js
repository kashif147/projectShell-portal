import { generatePKCE } from "./crypt.helper";
import { setVerifier } from "./verifier.helper";
 
export const B2C_FLOW_STORAGE_KEY = "azure_b2c_flow";
 
const POLICY_BY_INTENT = {
  signin: "B2C_1_projectshell_signin",
  signup: "B2C_1_projectshell_signup",
  gmail: "B2C_1_projectshell_signup_signin_gmail",
  default: "B2C_1_projectshell",
};
 
export const microSoftUrlRedirect = async (intent = "default") => {
  const { code_verifier, code_challenge } = await generatePKCE();
  setVerifier(code_verifier);
 
  const selectedIntent = POLICY_BY_INTENT[intent] ? intent : "default";
  const policy = POLICY_BY_INTENT[selectedIntent];
 
  if (selectedIntent === "signin" || selectedIntent === "signup" || selectedIntent === "gmail") {
    localStorage.setItem(B2C_FLOW_STORAGE_KEY, selectedIntent);
  } else {
    localStorage.removeItem(B2C_FLOW_STORAGE_KEY);
  }
 
  const authUrl = new URL(
    "https://projectshellAB2C.b2clogin.com/projectshellAB2C.onmicrosoft.com/oauth2/v2.0/authorize"
  );
  authUrl.searchParams.append("p", policy);
  authUrl.searchParams.append("client_id", "e9460e2d-29d1-4711-be7e-e1e92d1370ef");
  authUrl.searchParams.append("nonce", "defaultNonce");
  authUrl.searchParams.append("redirect_uri", "https://project-shell-portal.vercel.app");
  authUrl.searchParams.append("scope", "openid offline_access");
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("prompt", "login");
  authUrl.searchParams.append("code_challenge", code_challenge);
  authUrl.searchParams.append("code_challenge_method", "S256");
  window.location.href = authUrl.toString();
};
 
// export const microSoftUrlRedirect = async () => {
//   const { code_verifier, code_challenge } = await generatePKCE();
//   setVerifier(code_verifier);
 
//   const authUrl = new URL(
//     'https://projectshellab2c.b2clogin.com/projectshellAB2C.onmicrosoft.com/oauth2/v2.0/authorize'
//   );
 
//   authUrl.searchParams.append('p', 'B2C_1_projectshell_signup_signin_gmail');
//   authUrl.searchParams.append('client_id', 'b0a62557-3308-4efb-954a-fb4b6a787309');
//   authUrl.searchParams.append('nonce', 'defaultNonce');
//   authUrl.searchParams.append('redirect_uri', 'com.portal://com.portal/ios/callback');
//   authUrl.searchParams.append('scope', 'openid offline_access');
//   authUrl.searchParams.append('response_type', 'code');
//   authUrl.searchParams.append('response_mode', 'query');
//   authUrl.searchParams.append('prompt', 'login');
//   authUrl.searchParams.append('code_challenge', code_challenge);
//   authUrl.searchParams.append('code_challenge_method', 'S256');
 
//   window.location.href = authUrl.toString();
// };
