import { useNavigate } from 'react-router-dom';
// import { RouterHelper } from '../helpers/router.helper';

export const ErrorPage = () => {
  const navigate = useNavigate()

  return (
    <div className="text-center">
      <p className="mt-40 text-9xl font-bold text-blue-400">404</p>
      <p className="my-8 text-6xl font-medium">Oops! Page not found.</p>
      <p className="mb-8 text-2xl font-medium">
        The page you're looking for doesn't exist.
      </p>

      {/* <button
        onClick={() => navigate(RouterHelper.homePath())}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-md">
        HOME
      </button> */}
    </div>
  );
};
