import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SignUpPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/api/programs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        
        const data = await response.json();
        setPrograms(data);
      } catch (err) {
        console.error('Error fetching programs:', err);
        // Fall back to dummy data if API fails
        setPrograms([
          { _id: '1', code: 'BSCS', name: 'BS Computer Science' },
          { _id: '2', code: 'BSEE', name: 'BS Electrical Engineering' },
          { _id: '3', code: 'BSME', name: 'BS Mechanical Engineering' },
          { _id: '4', code: 'BBA', name: 'Business Administration' },
          { _id: '5', code: 'BSPSY', name: 'Psychology' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleGoogleSignUp = () => {
    try {
      if (!selectedProgram) {
        console.error('Please select a degree program before continuing');
        return;
      }
      
      // Save selected program to localStorage
      localStorage.setItem('selectedProgram', selectedProgram);
      
      // Redirect to the backend's Google auth route
      window.location.href = 'http://localhost:3000/auth/google';
    } catch (error) {
      console.error('Failed to connect to authentication service:', error);
    }
  };

  const handleProgramChange = (value) => {
    setSelectedProgram(value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">CourseMap</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Join CourseMap</CardTitle>
          <CardDescription>Create an account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Degree Program</label>
            <Select onValueChange={handleProgramChange} value={selectedProgram} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading programs..." : "Select a program"} />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program._id} value={program._id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading available programs...</p>
            )}
          </div>
          
          <Button 
            onClick={handleGoogleSignUp} 
            className="w-full mt-4 flex items-center justify-center gap-2"
            variant="outline"
            disabled={isLoading || !selectedProgram}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/sign-in" className="text-blue-600 hover:underline font-medium">Sign in here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;