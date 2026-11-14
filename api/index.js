let app;
let startupError = null;

try {
    app = require("../app");
} catch (err) {
    startupError = err;
    console.error("Vercel startup error:", err);
}

module.exports = (req, res) => {
    if (startupError) {
        return res.status(500).json({
            error: "Serverless startup failed",
            message: startupError.message,
            stack: startupError.stack
        });
    }
    return app(req, res);
};
