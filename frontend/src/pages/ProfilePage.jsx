import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { programsAPI } from "@/lib/api";

const ProfilePage = () => {
  const { user } = useAuth();
  const [programTitle, setProgramTitle] = useState("Not assigned");

  useEffect(() => {
    // Fetch program details if user has a program_id
    if (user?.program_id) {
      programsAPI.getProgramById(user.program_id)
        .then(data => {
          if (data && data.title) {
            setProgramTitle(data.title);
          }
        })
        .catch(error => {
          console.error("Error fetching program details:", error);
        });
    }
  }, [user?.program_id]);

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

  return (
    <div className="w-full max-w-full">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user?.display_picture && <AvatarImage src={user.display_picture} alt={user?.name} />}
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold">{user?.name || "Anonymous User"}</p>
                <p className="text-muted-foreground">{user?.email || "No email"}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-1">Program</h3>
              <p className="text-base">{programTitle}</p>
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