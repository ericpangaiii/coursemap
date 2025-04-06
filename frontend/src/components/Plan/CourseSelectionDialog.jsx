import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

export const CourseSelectionDialog = ({ 
  open, 
  onOpenChange, 
  courses, 
  onSelect, 
  type = "HIST 1/KAS 1" // or "HK 12/13"
}) => {
  const isHistKas = type === "HIST 1/KAS 1";
  
  const courseInfo = {
    "HIST 1": {
      title: "Philippine History",
      subtitle: "English",
      icon: "🏛️"
    },
    "KAS 1": {
      title: "Kasaysayan ng Pilipinas",
      subtitle: "Filipino",
      icon: "📚"
    },
    "HK 12": {
      title: "Physical Education 1",
      subtitle: "Physical Fitness",
      icon: "🏃"
    },
    "HK 13": {
      title: "Physical Education 2",
      subtitle: "Sports Skills",
      icon: "⚽"
    }
  };

  // Get the sequence number for HK courses based on prescribed timing
  const getHKSequence = (course) => {
    if (!course.combined_courses) return null;
    
    // Find all HK courses and sort them by timing
    const allHKCourses = courses
      .filter(c => c.combined_courses)
      .sort((a, b) => {
        const aTime = (a.prescribed_year || 1) * 10 + (a.prescribed_semester || 1);
        const bTime = (b.prescribed_year || 1) * 10 + (b.prescribed_semester || 1);
        return aTime - bTime;
      });
    
    // Find the index of current course in the sorted array
    const index = allHKCourses.findIndex(c => 
      c.prescribed_year === course.prescribed_year && 
      c.prescribed_semester === course.prescribed_semester
    );
    
    return index >= 0 ? `${index + 1}${getOrdinalSuffix(index + 1)} PE` : null;
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-center mb-4">
            Select {isHistKas ? "Language" : "PE Focus"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3">
          {courses.map((course) => {
            const info = courseInfo[course.course_code];
            const hkSequence = !isHistKas ? getHKSequence(course) : null;
            
            return (
              <Card 
                key={course.course_id}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border hover:border-blue-500 flex flex-col items-center text-center"
                onClick={() => onSelect(course)}
              >
                <div className="text-3xl mb-2">{info.icon}</div>
                <div className="font-medium">{course.course_code}</div>
                <div className="text-sm text-gray-500 mt-1">{info.subtitle}</div>
                {hkSequence && (
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    {hkSequence}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 