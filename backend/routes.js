import { getAllPrograms, getProgramById, createProgram, updateProgram, deleteProgram } from './controllers/program-controllers.js';
import { getAllUsers, getUserById, createUser, updateUser } from './controllers/user-controllers.js';
import { googleLogin, googleCallback, updateUserProgram, getAuthStatus, logoutUser } from './controllers/auth-controllers.js';
import { getAllCurriculums, getCurriculumById, getCurriculumsByProgramId, getCurriculumStructure, getCurrentUserCurriculumStructure, getCurrentUserCurriculumCourses } from './controllers/curriculum-controllers.js';
import { getPlanByUserId, createPlan, addCourseToPlan, updatePlanCourse, deletePlanCourse, getCurrentUserPlan } from './controllers/plan-controllers.js';
import { getCoursesByIds, updateCourse, getAllCourses } from './controllers/course-controllers.js';

const router = (app) => {
    app.get("/", (req, res) => {
        res.send("API Home");
    });

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

    // Curriculum Routes
    app.get("/api/curriculums", getAllCurriculums);
    app.get("/api/curriculums/:id", getCurriculumById);
    app.get("/api/programs/:programId/curriculums", getCurriculumsByProgramId);
    app.get("/api/curriculums/:curriculumId/structure", getCurriculumStructure);
    app.get("/api/my/curriculum/structure", getCurrentUserCurriculumStructure);
    app.get("/api/my/curriculum/courses", getCurrentUserCurriculumCourses);

    // Plan Routes
    app.get("/api/users/:userId/plan", getPlanByUserId);
    app.get("/api/my/plan", getCurrentUserPlan);
    app.post("/api/plans", createPlan);
    app.post("/api/plans/courses", addCourseToPlan);
    app.put("/api/plans/courses/:id", updatePlanCourse);
    app.delete("/api/plans/courses/:id", deletePlanCourse);

    // Course Routes
    app.get("/api/courses", getAllCourses);
    app.post("/api/courses/batch", getCoursesByIds);
    app.put("/api/courses/:courseId", updateCourse);

    // Auth Routes
    app.get("/auth/google", googleLogin);
    app.get("/auth/google/callback", googleCallback);
    app.post("/auth/update-program", updateUserProgram);
    app.get("/auth/status", getAuthStatus);
    app.get("/auth/logout", logoutUser);
};

export default router;