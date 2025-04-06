import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { getMergedData, isPrescribedSchedule } from './utils/planUtils';
import { calculateSemesterUnits, getSemesterStatus, getSemesterStatusColor } from '@/lib/planUtils';
import { generatePlanWarnings, getWarningIcon, getWarningColor } from '@/lib/planUtils';
import { getCourseItemClass, getCourseIndicatorClass } from '@/lib/planUtils';
import CourseItemWithPlacement from './CourseItemWithPlacement';

const PlanOverview = ({ planData, coursesByType, getPrescribedSemestersForType, showFullCurriculum, selectedCourse }) => {
  const [expandedWarnings, setExpandedWarnings] = useState(false);
  const [viewByType, setViewByType] = useState(false);
  
  // Get merged data of user plan and curriculum courses
  const displayData = getMergedData(planData, coursesByType, getPrescribedSemestersForType, showFullCurriculum);
  
  // Generate warnings for the entire plan
  const warnings = generatePlanWarnings(planData);
  
  // Calculate statistics for each course type
  const courseTypeStats = {
    required_academic: 0,
    required_non_academic: 0,
    ge_elective: 0,
    elective: 0,
    major: 0
  };
  
  Object.values(planData).forEach(yearData => {
    Object.values(yearData).forEach(semData => {
      semData.forEach(course => {
        if (course.course_type in courseTypeStats) {
          courseTypeStats[course.course_type]++;
        }
      });
    });
  });
  
  return (
    <div className="space-y-4">
      {/* Warnings Panel */}
      {warnings.length > 0 && (
        <Card className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedWarnings(!expandedWarnings)}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-500" />
              <span className="font-medium">Warnings ({warnings.length})</span>
            </div>
            {expandedWarnings ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedWarnings && (
            <div className="mt-2 space-y-2">
              {warnings.map((warning, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-2 ${getWarningColor(warning.type)}`}
                >
                  <span>{getWarningIcon(warning.type)}</span>
                  <span>{warning.message}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      
      {/* View Toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setViewByType(!viewByType)}
        >
          {viewByType ? 'View by Semester' : 'View by Course Type'}
        </Button>
      </div>
      
      {/* Course Statistics */}
      <Card className="p-4">
        <h3 className="font-medium mb-2">Course Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>Required Academic: {courseTypeStats.required_academic}</p>
            <p>Required Non-Academic: {courseTypeStats.required_non_academic}</p>
          </div>
          <div>
            <p>GE Electives: {courseTypeStats.ge_elective}</p>
            <p>Electives: {courseTypeStats.elective}</p>
            <p>Majors: {courseTypeStats.major}</p>
          </div>
        </div>
      </Card>
      
      {/* Plan Display */}
      {viewByType ? (
        // View by Course Type
        <div className="space-y-4">
          {Object.entries(courseTypeStats).map(([type, count]) => (
            <Card key={type} className="p-4">
              <h3 className="font-medium mb-2">
                {type.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')} ({count})
              </h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {Object.entries(planData).map(([year, yearData]) => (
                    Object.entries(yearData).map(([sem, courses]) => (
                      courses
                        .filter(course => course.course_type === type)
                        .map((course, index) => (
                          <div 
                            key={`${year}-${sem}-${index}`}
                            className={getCourseItemClass(course)}
                          >
                            <div 
                              className={getCourseIndicatorClass(course, 'bg')}
                            />
                            <CourseItemWithPlacement 
                              course={course} 
                              planData={planData}
                            />
                          </div>
                        ))
                    ))
                  ))}
                </div>
              </ScrollArea>
            </Card>
          ))}
        </div>
      ) : (
        // View by Semester
        <div className="space-y-4">
          {Object.entries(displayData).map(([year, yearData]) => (
            <div key={year} className="space-y-2">
              <h2 className="text-lg font-medium">Year {year}</h2>
              {Object.entries(yearData).map(([sem, courses]) => {
                const semesterUnits = calculateSemesterUnits(courses);
                const status = getSemesterStatus(semesterUnits);
                
                return (
                  <Card key={sem} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{sem}</h3>
                      <span className={getSemesterStatusColor(status)}>
                        {semesterUnits} units
                      </span>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {courses.map((course, index) => (
                          <div 
                            key={index}
                            className={getCourseItemClass(course)}
                          >
                            <div 
                              className={getCourseIndicatorClass(course, 'bg')}
                            />
                            <CourseItemWithPlacement 
                              course={course} 
                              planData={planData}
                            />
                            {selectedCourse && isPrescribedSchedule(year, sem, selectedCourse, displayData) && (
                              <div className="ml-2 text-green-500">
                                ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanOverview; 