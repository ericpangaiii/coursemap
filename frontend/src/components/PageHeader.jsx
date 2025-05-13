import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { programsAPI, curriculumsAPI } from "@/lib/api";

const PageHeader = ({ title }) => {
  const { user } = useAuth();
  const [programTitle, setProgramTitle] = useState("Not assigned");
  const [curriculumName, setCurriculumName] = useState("Not assigned");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch program details if user has a program_id
        if (user?.program_id) {
          const programData = await programsAPI.getProgramById(user.program_id);
          if (programData) {
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
      }
    };

    fetchData();
  }, [user?.program_id, user?.curriculum_id]);

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">{title}</h1>
      {!user?.isAdmin && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarImage src={user?.photo} alt={user?.name} />
                <AvatarFallback className="dark:bg-gray-800 dark:text-gray-200">{getInitials(user?.name || "")}</AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-4" side="left" align="start" sideOffset={5} alignOffset={-30}>
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100">{user?.name || "Guest"}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ""}</p>
              </div>
              <div className="space-y-1.5">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Degree Program</p>
                  <p className="text-xs text-gray-900 dark:text-gray-100">{programTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Curriculum</p>
                  <p className="text-xs text-gray-900 dark:text-gray-100">{curriculumName}</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default PageHeader; 