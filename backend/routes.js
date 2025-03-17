import Program from './models/program.js';

const router = (app) => {
    app.get("/", (req, res) => {
        res.send("API Home");
    });

    // Get all programs
    app.get("/api/programs", async (req, res) => {
        try {
            const programs = await Program.find().sort({ name: 1 });
            res.json(programs);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch programs" });
        }
    });

    // Get a specific program by ID
    app.get("/api/programs/:id", async (req, res) => {
        try {
            const program = await Program.findById(req.params.id);
            if (!program) {
                return res.status(404).json({ error: "Program not found" });
            }
            res.json(program);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch program" });
        }
    });
};

export default router;