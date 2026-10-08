import { Request, Response, NextFunction } from "express";

/**
 * Membungkus async handler agar error otomatis diteruskan ke error middleware.
 * Menghilangkan kebutuhan try/catch di setiap controller.
 *
 * Contoh: router.get("/", asyncHandler(getTemplatesController));
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};
