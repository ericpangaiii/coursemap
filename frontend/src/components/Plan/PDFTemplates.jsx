import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    position: 'relative',
    minHeight: '100%',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 10,
    marginBottom: 3,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    zIndex: 1,
  },
  cell: {
    padding: 5,
    fontSize: 10,
  },
  signatorySection: {
    marginTop: 40,
    paddingTop: 20,
    paddingBottom: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatoryColumn: {
    width: '48%',
  },
  signatoryColumnLeft: {
    width: '48%',
    marginTop: 40,
  },
  signatoryRow: {
    marginBottom: 20,
  },
  signatoryLabel: {
    fontSize: 10,
    marginBottom: 5,
  },
  signatoryHeader: {
    fontSize: 10,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  signatoryLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
    height: 20,
    width: '100%',
  },
  signatoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 5,
    width: '100%',
  },
  signatoryLeft: {
    flex: 1,
  },
  signatoryRight: {
    width: 100,
    textAlign: 'right',
  },
});

// Helper function to format date using native JavaScript
const formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }
  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

// Helper function to format year and semester
const formatYearSem = (year, sem) => {
  if (!year || !sem) return "Not Scheduled";
  
  const yearText = `${year}${getOrdinalSuffix(year)} Year`;
  let semText = "";
  
  switch (Number(sem)) {
    case 1:
      semText = "1st Sem";
      break;
    case 2:
      semText = "2nd Sem";
      break;
    case 3:
      semText = "Mid Year";
      break;
    default:
      semText = "Not Scheduled";
  }
  
  return `${yearText}, ${semText}`;
};

// GE Plan of Study Template
export const GEPlanTemplate = ({ user, program, courses }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>General Education Plan of Study</Text>
        <Text style={styles.subtitle}>Student Information</Text>
        <Text style={styles.info}>Name: {user ? `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}${user.suffix ? ' ' + user.suffix : ''}` : 'N/A'}</Text>
        <Text style={styles.info}>Degree Program: {program?.title || 'N/A'}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { width: '20%' }]}>Course Code</Text>
          <Text style={[styles.tableCell, { width: '40%' }]}>Course Title</Text>
          <Text style={[styles.tableCell, { width: '15%' }]}>Units</Text>
          <Text style={[styles.tableCell, { width: '25%' }]}>When to Take</Text>
        </View>
        {courses.map((course, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '20%' }]}>{course.course_code}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{course.title}</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>{course.units}</Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>{formatYearSem(course.year, course.sem)}</Text>
          </View>
        ))}
      </View>

      {/* Signatory Section */}
      <View style={styles.signatorySection}>
        {/* Left Column */}
        <View style={styles.signatoryColumnLeft}>
          <Text style={styles.signatoryHeader}>RECOMMENDING APPROVAL:</Text>
          <View style={styles.signatoryRow}>
            <View style={styles.signatoryLine} />
            <View style={styles.signatoryContent}>
              <Text style={styles.signatoryLabel}>Printed Name and Signature of Adviser</Text>
              <Text style={styles.signatoryLabel}>Date</Text>
            </View>
          </View>

          <View style={styles.signatoryRow}>
            <View style={styles.signatoryLine} />
            <View style={styles.signatoryContent}>
              <Text style={styles.signatoryLabel}>Printed Name and Signature of Unit Head</Text>
              <Text style={styles.signatoryLabel}>Date</Text>
            </View>
          </View>

          <Text style={styles.signatoryHeader}>APPROVED/DISAPPROVED:</Text>
          <View style={styles.signatoryRow}>
            <View style={styles.signatoryLine} />
            <View style={styles.signatoryContent}>
              <Text style={styles.signatoryLabel}>Printed Name and Signature of College Secretary</Text>
              <Text style={styles.signatoryLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.signatoryColumn}>
          <View style={styles.signatoryRow}>
            <View style={styles.signatoryLine} />
            <View style={styles.signatoryContent}>
              <Text style={styles.signatoryLabel}>Printed Name and Signature of Student</Text>
              <Text style={styles.signatoryLabel}>Date</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>
        Generated on {formatDate(new Date())}
      </Text>
    </Page>
  </Document>
);

// Free Electives Plan of Study Template
export const FreeElectivesTemplate = ({ user, program, courses }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Free Electives Plan of Study</Text>
        <Text style={styles.subtitle}>Student Information</Text>
        <Text style={styles.info}>Name: {user ? `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}${user.suffix ? ' ' + user.suffix : ''}` : 'N/A'}</Text>
        <Text style={styles.info}>Degree Program: {program?.title || 'N/A'}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { width: '20%' }]}>Course Code</Text>
          <Text style={[styles.tableCell, { width: '40%' }]}>Course Title</Text>
          <Text style={[styles.tableCell, { width: '15%' }]}>Units</Text>
          <Text style={[styles.tableCell, { width: '25%' }]}>When to Take</Text>
        </View>
        {courses.map((course, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '20%' }]}>{course.course_code}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{course.title}</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>{course.units}</Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>{formatYearSem(course.year, course.sem)}</Text>
          </View>
        ))}
      </View>

      {/* Signatory Section */}
      <View style={styles.signatorySection}>
        {/* Left Column */}
        <View style={styles.signatoryColumnLeft}>
          <Text style={styles.signatoryHeader}>RECOMMENDING APPROVAL:</Text>
          <View style={styles.signatoryRow}>
            <View style={styles.signatoryLine} />
            <View style={styles.signatoryContent}>
              <Text style={styles.signatoryLabel}>Printed Name and Signature of Adviser</Text>
              <Text style={styles.signatoryLabel}>Date</Text>
            </View>
          </View>

          <View style={styles.signatoryRow}>
            <View style={styles.signatoryLine} />
            <View style={styles.signatoryContent}>
              <Text style={styles.signatoryLabel}>Printed Name and Signature of Unit Head</Text>
              <Text style={styles.signatoryLabel}>Date</Text>
            </View>
          </View>

          <Text style={styles.signatoryHeader}>APPROVED/DISAPPROVED:</Text>
          <View style={styles.signatoryRow}>
            <View style={styles.signatoryLine} />
            <View style={styles.signatoryContent}>
              <Text style={styles.signatoryLabel}>Printed Name and Signature of College Secretary</Text>
              <Text style={styles.signatoryLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.signatoryColumn}>
          <View style={styles.signatoryRow}>
            <View style={styles.signatoryLine} />
            <View style={styles.signatoryContent}>
              <Text style={styles.signatoryLabel}>Printed Name and Signature of Student</Text>
              <Text style={styles.signatoryLabel}>Date</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>
        Generated on {formatDate(new Date())}
      </Text>
    </Page>
  </Document>
);

// Plan of Coursework Template
export const PlanOfCourseworkTemplate = ({ user, program, courses }) => {
  // Group courses by year and semester
  const groupedCourses = courses.reduce((acc, course) => {
    const key = `${course.year}-${course.sem}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(course);
    return acc;
  }, {});

  // Sort the groups by year and semester
  const sortedGroups = Object.entries(groupedCourses).sort(([keyA], [keyB]) => {
    const [yearA, semA] = keyA.split('-').map(Number);
    const [yearB, semB] = keyB.split('-').map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return semA - semB;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Plan of Coursework</Text>
          <Text style={styles.subtitle}>Student Information</Text>
          <Text style={styles.info}>Name: {user ? `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}${user.suffix ? ' ' + user.suffix : ''}` : 'N/A'}</Text>
          <Text style={styles.info}>Degree Program: {program?.title || 'N/A'}</Text>
        </View>

        {sortedGroups.map(([key, groupCourses]) => {
          const [year, sem] = key.split('-').map(Number);
          return (
            <View key={key} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
                {formatYearSem(year, sem)}
              </Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { width: '25%' }]}>Course Code</Text>
                  <Text style={[styles.tableCell, { width: '45%' }]}>Course Title</Text>
                  <Text style={[styles.tableCell, { width: '10%' }]}>Units</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>Type</Text>
                </View>
                {groupCourses.map((course, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{course.course_code}</Text>
                    <Text style={[styles.tableCell, { width: '45%' }]} numberOfLines={2} ellipsizeMode="tail">{course.title}</Text>
                    <Text style={[styles.tableCell, { width: '10%' }]}>{course.units}</Text>
                    <Text style={[styles.tableCell, { width: '20%', fontSize: 8 }]}>{course.course_type}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <Text style={styles.footer}>
          Generated on {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
}; 