import { React, useState, useEffect } from 'react'
// import "../../styles/Login.css"
// import loginImg from "../../assets/images/img1.png"
// import loginImg from "../../assets/images/gra_logo.png"
// import { WindowsFilled } from '@ant-design/icons';
import { Button, Checkbox, Divider, Input } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useDispatch, useSelector } from 'react-redux';
import { BatchResponseContent } from '@microsoft/microsoft-graph-client';
import { loginUser } from '../../store/slice/AuthSlice';
import { generatePKCE } from '../../helpers/crypt.helper';
import { signIn } from '../../services/auth.services'
import { setVerifier } from '../../helpers/verifier.helper';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { instance, inProgress } = useMsal(); // Get the MSAL instance and interaction status
  const navigate = useNavigate(); // Use the useHistory hook
  const { loading, error, user } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    const { code_verifier, code_challenge } = await generatePKCE();
    setVerifier(code_verifier)
    const authUrl = new URL(
      "https://projectshellAB2C.b2clogin.com/projectshellAB2C.onmicrosoft.com/oauth2/v2.0/authorize"
    );
    authUrl.searchParams.append("p", "B2C_1_projectshell");
    authUrl.searchParams.append("client_id", "e9460e2d-29d1-4711-be7e-e1e92d1370ef");
    authUrl.searchParams.append("nonce", "defaultNonce");
    authUrl.searchParams.append("redirect_uri", "http://localhost:3000");
    authUrl.searchParams.append("scope", "openid profile offline_access");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("prompt", "login");
    authUrl.searchParams.append("code_challenge", code_challenge);
    authUrl.searchParams.append("code_challenge_method", "S256");
    window.location.href = authUrl.toString();
  };

  const handleInputChange = (target, value) => {
    // Destructure the name from target
    setCredentials((prev) => ({ ...prev, [target]: value }));
  };

  const [credentials, setCredentials] = useState({ user: 'walt1', pwd: 'Aa$12345' });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = () => {
    credentials.user && credentials.pwd
      ? dispatch(signIn(credentials))
      : toast.warn('Fill all input fields');
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl max-w-6xl w-full">
        <div className="opacity-50 md:w-1/2 flex items-center justify-center p-8">
          {/* <img
            className="w-64 h-64 object-contain"
            src={loginImg}
            alt="Logo"
          /> */}
        </div>
        
        <div className="w-full md:w-1/2 p-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Login with Microsoft or enter your details
          </h1>

          <div className="w-full">
            <Button
              size="large"
              className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300"
              onClick={handleLogin}
              disabled={inProgress !== InteractionStatus.None}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
                <rect width="22" height="22" x="2" y="2" fill="#F25022" />
                <rect width="22" height="22" x="24" y="2" fill="#7FBA00" />
                <rect width="22" height="22" x="2" y="24" fill="#00A4EF" />
                <rect width="22" height="22" x="24" y="24" fill="#FFB900" />
              </svg>
              {inProgress === InteractionStatus.None ? "Login with Azure Account" : "Logging in..."}
            </Button>
          </div>

          <Divider className="text-xs font-normal">Or</Divider>

          <form className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <Input
                className="w-full rounded-md border-gray-300"
                onChange={(e) => handleInputChange("user", e.target.value)}
                value={credentials.user}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input
                  className="w-full rounded-md border-gray-300"
                  onChange={(e) => handleInputChange("pwd", e.target.value)}
                  value={credentials?.pwd}
                  type={showPassword ? 'text' : 'password'}
                  suffix={showPassword ? (
                    <AiFillEye className="text-gray-400" onClick={togglePasswordVisibility} />
                  ) : (
                    <AiFillEyeInvisible className="text-gray-400" onClick={togglePasswordVisibility} />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Checkbox>Remember me</Checkbox>
              <Link to="/reset-password" className="text-blue-600 text-sm hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button
              loading={loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md"
              onClick={handleSubmit}
            >
              Log in
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/contact-us" className="text-blue-600 hover:underline">
              Request access
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

export default LoginPage;