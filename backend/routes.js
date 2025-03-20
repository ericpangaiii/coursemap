import { getAllPrograms, getProgramById, createProgram, updateProgram, deleteProgram } from './controllers/program-controllers.js';
import { getAllUsers, getUserById, createUser, updateUser } from './controllers/user-controllers.js';
import { googleLogin, googleCallback, updateUserProgram, getAuthStatus, logoutUser } from './controllers/auth-controllers.js';

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

    // Auth Routes
    app.get("/auth/google", googleLogin);
    app.get("/auth/google/callback", googleCallback);
    app.post("/auth/update-program", updateUserProgram);
    app.get("/auth/status", getAuthStatus);
    app.get("/auth/logout", logoutUser);
};

export default router;