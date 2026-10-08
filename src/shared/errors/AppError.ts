/**
 * Custom error class untuk error bisnis yang sudah diketahui.
 * Service throw AppError → error middleware otomatis kirim response yang benar.
 */
export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        // Agar instanceof check bekerja dengan benar di TypeScript
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
