import "dotenv/config";
import express from 'express';
import cors from 'cors';
import {setupSwagger} from "./config/swagger";
import {errorHandler} from "./middlewares/error.middleware";
import authRoutes from './routes/auth.routes';
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import contactRoutes from "./routes/contact.routes";
import listRoutes from "./routes/list.routes";
import tagRoutes from "./routes/tag.routes";
import smtpRoutes from "./routes/smtp.routes";
import templateRoutes from "./routes/template.routes";
import telegramRoutes from "./routes/telegram.routes";
import whatsappQrRoutes from './routes/whatsapp-qr.routes';
import { restoreActiveWhatsappSessions } from "./services/whatsapp-qr.service";



const app = express();

app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(express.json());

// mengaktifkan swagger ui
setupSwagger(app);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/settings/smtp', smtpRoutes);
app.use('/api/v1/channels/telegram', telegramRoutes);
app.use('/api/v1/channels/whatsapp/qr', whatsappQrRoutes)
app.use(errorHandler);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📑 Dokumentasi Swagger: http://localhost:${PORT}/api-docs`);
    // Memulihkan sesi WhatsApp Web yang sudah tersambung
    restoreActiveWhatsappSessions();
});