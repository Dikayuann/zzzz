import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Error bisnis yang sudah diketahui — kirim status + message yang sesuai
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    // Error tak terduga — log stack trace, kirim 500 generic
    console.error("[Error]", err.stack || err.message);

    return res.status(500).json({
        message: "Terjadi kesalahan internal",
    });
};
