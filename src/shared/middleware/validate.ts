import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Middleware factory untuk validasi request menggunakan Zod schema.
 * Hasil parsing disimpan di req.body / req.query / req.params agar controller
 * langsung pakai data yang sudah tervalidasi.
 *
 * Contoh: router.post("/", validate({ body: createTemplateSchema }), handler);
 */
export const validate = (schemas: {
    body?: z.ZodType;
    query?: z.ZodType;
    params?: z.ZodType;
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: "Data tidak valid",
                    errors: result.error.issues.map((i) => i.message),
                });
            }
            req.body = result.data;
        }

        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (!result.success) {
                return res.status(400).json({
                    message: "Parameter query tidak valid",
                    errors: result.error.issues.map((i) => i.message),
                });
            }
            Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
        }

        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (!result.success) {
                return res.status(400).json({
                    message: "Parameter tidak valid",
                    errors: result.error.issues.map((i) => i.message),
                });
            }
            Object.defineProperty(req, "params", { value: result.data, writable: true, configurable: true });
        }

        next();
    };
};
