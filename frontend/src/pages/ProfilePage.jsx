import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { programsAPI, curriculumsAPI } from "@/lib/api";
import { ReloadIcon } from "@radix-ui/react-icons";
import PageHeader from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/ui/loading";

const ProfilePage = () => {
  const { user } = useAuth();
  const [programTitle, setProgramTitle] = useState("Not assigned");
  const [curriculumName, setCurriculumName] = useState("Not assigned");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set default loading state
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch program details if user has a program_id
        if (user?.program_id) {
          const programData = await programsAPI.getProgramById(user.program_id);
          if (programData && programData.title) {
            setProgramTitle(programData.title);
          }
        }

        // Fetch curriculum details if user has a curriculum_id
        if (user?.curriculum_id) {
          const curriculumData = await curriculumsAPI.getCurriculumById(user.curriculum_id);
          if (curriculumData && curriculumData.name) {
            setCurriculumName(curriculumData.name);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.program_id, user?.curriculum_id]);

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="w-full max-w-full">
      <PageHeader title="Your Profile" />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                  {user ? `${user.first_name[0]}${user.last_name[0]}` : 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {user ? `${user.first_name}` : 'Loading...'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-1">Program</h3>
              <p className="text-base">{programTitle}</p>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-1">Curriculum</h3>
              <p className="text-base">{curriculumName}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Account settings coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage; 