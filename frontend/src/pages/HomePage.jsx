import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {/* Link for logging out */}
        <Link to="/sign-in" className="text-blue-500">Log Out</Link>
      </div>
    </div>
  );
};

export default HomePage;
