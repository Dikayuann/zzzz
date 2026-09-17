export const errorHandler = (err, _req, res, _next) => {
    console.error("[Error]", err.stack || err.message);
    return res.status(500).json({
        message: "Terjadi kesalahan internal",
    });
};
