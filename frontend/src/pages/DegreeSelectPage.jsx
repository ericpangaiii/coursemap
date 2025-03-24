import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authAPI, programsAPI, curriculumsAPI } from '@/lib/api';
import { APP_NAME } from '@/lib/config';

const DegreeSelectPage = () => {
  const [programs, setPrograms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [isProgramLoading, setProgramLoading] = useState(true);
  const [isCurriculumLoading, setCurriculumLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user already has a program selected
  useEffect(() => {
    if (user && user.program_id) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setProgramLoading(true);
        const data = await programsAPI.getAllPrograms();
        setPrograms(data);
      } catch (err) {
        console.error('Error fetching programs:', err);
      } finally {
        setProgramLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch curriculums when program is selected
  useEffect(() => {
    const fetchCurriculums = async () => {
      if (!selectedProgram) {
        setCurriculums([]);
        return;
      }

      try {
        setCurriculumLoading(true);
        const data = await curriculumsAPI.getCurriculumsByProgramId(selectedProgram);
        setCurriculums(data);
        // If there's only one curriculum, auto-select it
        if (data.length === 1) {
          setSelectedCurriculum(data[0].curriculum_id);
        }
      } catch (err) {
        console.error('Error fetching curriculums:', err);
      } finally {
        setCurriculumLoading(false);
      }
    };

    fetchCurriculums();
  }, [selectedProgram]);

  const handleProgramChange = (value) => {
    setSelectedProgram(value);
    setSelectedCurriculum(''); // Reset curriculum selection when program changes
  };

  const handleCurriculumChange = (value) => {
    setSelectedCurriculum(value);
  };

  const handleContinue = async () => {
    if (!selectedProgram) {
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await authAPI.updateProgram(selectedProgram, selectedCurriculum);

      if (data.success) {
        // Update the user data in the context
        updateUser({
          program_id: selectedProgram,
          curriculum_id: selectedCurriculum
        });
        
        navigate('/dashboard');
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
          <CardDescription>Please select your degree program and curriculum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Degree Program</label>
            <Select onValueChange={handleProgramChange} value={selectedProgram} disabled={isProgramLoading || isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder={isProgramLoading ? "Loading programs..." : "Select a program"} />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.program_id} value={program.program_id}>
                    {program.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isProgramLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading available programs...</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Curriculum</label>
            <Select 
              onValueChange={handleCurriculumChange} 
              value={selectedCurriculum}
              disabled={!selectedProgram || isCurriculumLoading || isSubmitting || curriculums.length === 0}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    !selectedProgram 
                      ? "Select a program first" 
                      : isCurriculumLoading 
                        ? "Loading curriculums..." 
                        : curriculums.length === 0
                          ? "No curriculums available"
                          : "Select a curriculum"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {curriculums.map((curriculum) => (
                  <SelectItem key={curriculum.curriculum_id} value={curriculum.curriculum_id}>
                    {curriculum.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isCurriculumLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading available curriculums...</p>
            )}
            {!isCurriculumLoading && selectedProgram && curriculums.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No curriculums available for this program</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            onClick={handleContinue}
            disabled={
              isProgramLoading || 
              !selectedProgram || 
              (curriculums.length > 0 && !selectedCurriculum) || 
              isSubmitting
            }
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DegreeSelectPage; 