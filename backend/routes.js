import { getAllPrograms, getProgramById, createProgram, updateProgram, deleteProgram } from './controllers/program-controllers.js';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './controllers/user-controllers.js';
import { login, register, logout, updateUserProgram, getAuthStatus } from './controllers/auth-controllers.js';
import { getAllCurriculums, getCurriculumById, getCurriculumsByProgramId, getCurriculumStructure, getCurrentUserCurriculumStructure, getCurrentUserCurriculumCourses, getCurriculumCourseTypeCounts, getCurriculumRequiredCourses } from './controllers/curriculum-controllers.js';
import { getPlanByUserId, createPlan, addCourseToPlan, updatePlanCourse, deletePlanCourse, getCurrentUserPlan, getAllPlansByUserId, getAllPlans } from './controllers/plan-controllers.js';
import { getCoursesByIds, updateCourse, getAllCourses, getCoursesForPlanCreation, getAllAdminCourses } from './controllers/course-controllers.js';
import { authMiddleware, isAuthenticated } from './middlewares/auth-middleware.js';

const router = (app) => {
    app.get("/", (req, res) => {
        res.send("API Home");
    });

    // Auth Routes
    app.post("/auth/login", login);
    app.post("/auth/register", register);
    app.post("/auth/logout", isAuthenticated, logout);
    app.get("/auth/status", getAuthStatus);
    app.put("/auth/update-program", isAuthenticated, updateUserProgram);

    // Program Routes
    app.get("/api/programs", getAllPrograms);
    app.get("/api/programs/:id", getProgramById);
    app.post("/api/programs", authMiddleware, createProgram);
    app.put("/api/programs/:id", authMiddleware, updateProgram);
    app.delete("/api/programs/:id", authMiddleware, deleteProgram);

    // User Routes (Admin only)
    app.get("/api/users", authMiddleware, getAllUsers);
    app.get("/api/users/:id", authMiddleware, getUserById);
    app.post("/api/users", authMiddleware, createUser);
    app.put("/api/users/:id", authMiddleware, updateUser);
    app.delete("/api/users/:id", authMiddleware, deleteUser);

    // Curriculum Routes
    app.get("/api/curriculums", getAllCurriculums);
    app.get("/api/curriculums/:id", getCurriculumById);
    app.get("/api/programs/:programId/curriculums", getCurriculumsByProgramId);
    app.get("/api/curriculums/:curriculumId/structure", getCurriculumStructure);
    app.get("/api/curriculums/:curriculumId/required-courses", getCurriculumRequiredCourses);
    app.get("/api/my/curriculum/structure", isAuthenticated, getCurrentUserCurriculumStructure);
    app.get("/api/my/curriculum/courses", isAuthenticated, getCurrentUserCurriculumCourses);
    app.get("/api/curriculums/:curriculumId/course-type-counts", getCurriculumCourseTypeCounts);

    // Plan Routes
    app.get("/api/users/:userId/plan", authMiddleware, getPlanByUserId);
    app.get("/api/my/plan", isAuthenticated, getCurrentUserPlan);
    app.get("/plans/user/:userId", authMiddleware, getPlanByUserId);
    app.get("/plans/user/:userId/all", authMiddleware, getAllPlansByUserId);
    app.get("/api/plans", authMiddleware, getAllPlans);
    app.post("/api/plans", isAuthenticated, createPlan);
    app.post("/api/plans/courses", isAuthenticated, addCourseToPlan);
    app.put("/api/plans/courses/:id", isAuthenticated, updatePlanCourse);
    app.delete("/api/plans/courses/:id", isAuthenticated, deletePlanCourse);

    // Course Routes
    app.get("/api/courses", getAllCourses);
    app.get("/api/courses/admin", authMiddleware, getAllAdminCourses);
    app.get("/api/courses/plan-creation", isAuthenticated, getCoursesForPlanCreation);
    app.get("/api/courses/batch", isAuthenticated, getCoursesByIds);
    app.put("/api/courses/:id", authMiddleware, updateCourse);
};

export default router;