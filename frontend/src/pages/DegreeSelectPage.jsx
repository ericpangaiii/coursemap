import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authAPI, programsAPI } from '@/lib/api';
import { APP_NAME } from '@/lib/config';

const DegreeSelectPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if user already has a program selected
  useEffect(() => {
    if (user && user.program_id) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Fetch programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        const data = await programsAPI.getAllPrograms();
        setPrograms(data);
      } catch (err) {
        console.error('Error fetching programs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleProgramChange = (value) => {
    setSelectedProgram(value);
  };

  const handleContinue = async () => {
    if (!selectedProgram) {
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await authAPI.updateProgram(selectedProgram);

      if (data.success) {
        navigate('/home');
      } else {
        console.error('Failed to update program:', data.error);
      }
    } catch (err) {
      console.error('Error updating program:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{APP_NAME}</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">One last step</CardTitle>
          <CardDescription>Please select your degree program</CardDescription>
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
                  <SelectItem key={program.program_id} value={program.program_id}>
                    {program.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading available programs...</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            onClick={handleContinue}
            disabled={isLoading || !selectedProgram || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DegreeSelectPage; 