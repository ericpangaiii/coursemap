const UnitsCounter = ({ courses }) => {
  const totalUnits = courses.reduce((sum, course) => {
    const units = course.is_academic ? Number(course.units) || 0 : 0;
    return sum + units;
  }, 0);

  return (
    <div className="text-[10px] text-gray-500 dark:text-gray-400 text-right">
      {totalUnits} unit{totalUnits !== 1 ? 's' : ''}
    </div>
  );
};

export default UnitsCounter; 