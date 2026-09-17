import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error("[Error]", err.stack || err.message);

    return res.status(500).json({
        message: "Terjadi kesalahan internal",
    });
};
