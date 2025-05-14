import { getAllPrograms, getProgramById, createProgram, updateProgram, deleteProgram } from './controllers/program-controllers.js';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './controllers/user-controllers.js';
import { login, register, logout, updateUserProgram, getAuthStatus } from './controllers/auth-controllers.js';
import { getAllCurriculums, getCurriculumById, getCurriculumsByProgramId, getCurriculumStructure, getCurrentUserCurriculumStructure, getCurrentUserCurriculumCourses, getCurriculumCourseTypeCounts, getCurriculumRequiredCourses } from './controllers/curriculum-controllers.js';
import { getPlanByUserId, createPlan, addCourseToPlan, updatePlanCourse, deletePlanCourse, getCurrentUserPlan, getAllPlansByUserId, getAllPlans } from './controllers/plan-controllers.js';
import { getCoursesByIds, updateCourse, getAllCourses, getCoursesForPlanCreation, getAllAdminCourses } from './controllers/course-controllers.js';

const router = (app) => {
    app.get("/", (req, res) => {
        res.send("API Home");
    });

    // Auth Routes
    app.post("/auth/login", login);
    app.post("/auth/register", register);
    app.post("/auth/logout", logout);
    app.get("/auth/status", getAuthStatus);
    app.put("/auth/update-program", updateUserProgram);

    // Program Routes
    app.get("/api/programs", getAllPrograms);
    app.get("/api/programs/:id", getProgramById);
    app.post("/api/programs", createProgram);
    app.put("/api/programs/:id", updateProgram);
    app.delete("/api/programs/:id", deleteProgram);

    // User Routes
    app.get("/api/users", getAllUsers);
    app.get("/api/users/:id", getUserById);
    app.post("/api/users", createUser);
    app.put("/api/users/:id", updateUser);
    app.delete("/api/users/:id", deleteUser);

    // Curriculum Routes
    app.get("/api/curriculums", getAllCurriculums);
    app.get("/api/curriculums/:id", getCurriculumById);
    app.get("/api/programs/:programId/curriculums", getCurriculumsByProgramId);
    app.get("/api/curriculums/:curriculumId/structure", getCurriculumStructure);
    app.get("/api/curriculums/:curriculumId/required-courses", getCurriculumRequiredCourses);
    app.get("/api/my/curriculum/structure", getCurrentUserCurriculumStructure);
    app.get("/api/my/curriculum/courses", getCurrentUserCurriculumCourses);
    app.get("/api/curriculums/:curriculumId/course-type-counts", getCurriculumCourseTypeCounts);

    // Plan Routes
    app.get("/api/users/:userId/plan", getPlanByUserId);
    app.get("/api/my/plan", getCurrentUserPlan);
    app.get("/plans/user/:userId", getPlanByUserId);
    app.get("/plans/user/:userId/all", getAllPlansByUserId);
    app.get("/api/plans", getAllPlans);
    app.post("/api/plans", createPlan);
    app.post("/api/plans/courses", addCourseToPlan);
    app.put("/api/plans/courses/:id", updatePlanCourse);
    app.delete("/api/plans/courses/:id", deletePlanCourse);

    // Course Routes
    app.get("/api/courses", getAllCourses);
    app.get("/api/courses/admin", getAllAdminCourses);
    app.get("/api/courses/plan-creation", getCoursesForPlanCreation);
    app.get("/api/courses/batch", getCoursesByIds);
    app.put("/api/courses/:id", updateCourse);
};

export default router;