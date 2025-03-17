import { Link } from 'react-router-dom';

const SignUpPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        {/* Link to go back to Sign-In page */}
        <Link to="/sign-in" className="text-blue-500">Back</Link>
      </div>
    </div>
  );
};

export default SignUpPage;