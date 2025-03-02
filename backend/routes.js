const appRoutes = (app) => {
    app.get("/", (req, res) => {
        res.send("API Home");
    });
};

export default appRoutes;