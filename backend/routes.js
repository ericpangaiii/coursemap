const router = (app) => {
    app.get("/", (req, res) => {
        res.send("API Home");
    });
};

export default router;