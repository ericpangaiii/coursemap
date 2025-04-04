-- Users table
CREATE SEQUENCE IF NOT EXISTS users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  photo VARCHAR(255),
  program_id INTEGER,
  curriculum_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs table
CREATE SEQUENCE IF NOT EXISTS programs_program_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE IF NOT EXISTS programs (
  program_id BIGINT DEFAULT nextval('programs_program_id_seq') NOT NULL,
  acronym VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  career VARCHAR(20) NOT NULL,
  college VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  degree_id INTEGER NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  max_units INTEGER,
  is_visible TEXT DEFAULT 'YES' NOT NULL,
  term_type_offer VARCHAR(191),
  CONSTRAINT programs_pkey PRIMARY KEY (program_id)
);

-- Courses table
CREATE SEQUENCE IF NOT EXISTS courses_course_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 3403 CACHE 1;

CREATE TABLE IF NOT EXISTS courses (
  course_id BIGINT DEFAULT nextval('courses_course_id_seq') NOT NULL,
  sais_course_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  description TEXT NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  sem_offered VARCHAR(255),
  career VARCHAR(20) NOT NULL,
  units VARCHAR(100) NOT NULL,
  is_repeatable BOOLEAN NOT NULL,
  is_active BOOLEAN NOT NULL,
  campus VARCHAR(255) NOT NULL,
  equivalent INTEGER,
  is_multiple_enrollment BOOLEAN NOT NULL,
  subject VARCHAR(15) NOT NULL,
  course_number VARCHAR(100) NOT NULL,
  contact_hours VARCHAR(50),
  grading VARCHAR(100) NOT NULL,
  tm_id INTEGER,
  acad_org VARCHAR(10),
  acad_group VARCHAR(10),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  status VARCHAR(191),
  is_academic BOOLEAN,
  CONSTRAINT courses_pkey PRIMARY KEY (course_id)
);

-- Curriculums table
CREATE SEQUENCE IF NOT EXISTS curriculums_curriculum_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 2 CACHE 1;

CREATE TABLE IF NOT EXISTS curriculums (
  curriculum_id BIGINT DEFAULT nextval('curriculums_curriculum_id_seq') NOT NULL,
  code VARCHAR(100) NOT NULL,
  program_id INTEGER NOT NULL,
  name VARCHAR(191) NOT NULL,
  type VARCHAR(191),
  status VARCHAR(191),
  acad_org VARCHAR(10),
  acad_group VARCHAR(10),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_visible VARCHAR(191) NOT NULL,
  course_work_guide TEXT,
  approved_by TEXT,
  date_approved DATE,
  CONSTRAINT curriculums_pkey PRIMARY KEY (curriculum_id)
);

-- Curriculum Courses table
CREATE SEQUENCE IF NOT EXISTS curriculum_courses_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 12536 CACHE 1;

CREATE TABLE IF NOT EXISTS curriculum_courses (
  id BIGINT DEFAULT nextval('curriculum_courses_id_seq') NOT NULL,
  curriculum_id INTEGER NOT NULL,
  course_id INTEGER,
  year VARCHAR(1) NOT NULL,
  sem VARCHAR(1) NOT NULL,
  description TEXT,
  course_type VARCHAR(20) NOT NULL,
  sub_type VARCHAR(50) NOT NULL,
  group_id INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  units INTEGER,
  CONSTRAINT curriculum_courses_pkey PRIMARY KEY (id)
);

-- Curriculum Structures table
CREATE TABLE IF NOT EXISTS curriculum_structures (
  curriculum_id INTEGER NOT NULL,
  year VARCHAR(1) NOT NULL,
  sem VARCHAR(1) NOT NULL,
  major_units INTEGER DEFAULT 0 NOT NULL,
  ge_elective_units INTEGER DEFAULT 0 NOT NULL,
  required_units INTEGER DEFAULT 0 NOT NULL,
  elective_units INTEGER DEFAULT 0 NOT NULL,
  cognate_units INTEGER DEFAULT 0 NOT NULL,
  specialized_units INTEGER DEFAULT 0 NOT NULL,
  track_units INTEGER DEFAULT 0 NOT NULL,
  total_units INTEGER DEFAULT 0 NOT NULL,
  major_count INTEGER DEFAULT 0 NOT NULL,
  ge_elective_count INTEGER DEFAULT 0 NOT NULL,
  required_count INTEGER DEFAULT 0 NOT NULL,
  elective_count INTEGER DEFAULT 0 NOT NULL,
  cognate_count INTEGER DEFAULT 0 NOT NULL,
  specialized_count INTEGER DEFAULT 0 NOT NULL,
  track_count INTEGER DEFAULT 0 NOT NULL,
  total_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT curriculum_structures_pkey PRIMARY KEY (curriculum_id, year, sem)
);

-- Plans table
CREATE SEQUENCE IF NOT EXISTS plans_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  curriculum_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plans_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_plans_curriculums FOREIGN KEY (curriculum_id) REFERENCES curriculums(curriculum_id) ON DELETE CASCADE
);

-- Plan Courses table
CREATE SEQUENCE IF NOT EXISTS plan_courses_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE IF NOT EXISTS plan_courses (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  sem INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, dropped
  grade VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan_courses_plans FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_courses_courses FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- Add foreign key constraints
ALTER TABLE users 
ADD CONSTRAINT fk_users_programs 
FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_users_curriculums 
FOREIGN KEY (curriculum_id) REFERENCES curriculums(curriculum_id) ON DELETE SET NULL;

ALTER TABLE curriculums 
ADD CONSTRAINT fk_curriculums_programs 
FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE;

ALTER TABLE curriculum_courses 
ADD CONSTRAINT fk_curriculum_courses_curriculums 
FOREIGN KEY (curriculum_id) REFERENCES curriculums(curriculum_id) ON DELETE CASCADE;

ALTER TABLE curriculum_courses 
ADD CONSTRAINT fk_curriculum_courses_courses 
FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL;

ALTER TABLE curriculum_structures 
ADD CONSTRAINT fk_curriculum_structures_curriculums 
FOREIGN KEY (curriculum_id) REFERENCES curriculums(curriculum_id) ON DELETE CASCADE; 