import { Link, useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    // Here, you would normally handle Google authentication
    // For now, just redirect to the homepage
    navigate('/home');
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {/* Sign In with Google button */}
        <button 
          onClick={handleGoogleSignIn} 
          className="my-4 px-4 py-2 bg-blue-500 text-white"
        >
          Sign In with Google
        </button>
        <div>
          {/* Link to go to Sign-Up page */}
          Don't have an account yet? <Link to="/sign-up" className="text-blue-500">Sign up here!</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;