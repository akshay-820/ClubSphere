import express from "express";
import cors from "cors";
import pool from "./db/index.js";
import authRoutes from "./routes/auth.js";
import collegeRequestsRoutes from "./routes/collegeRequests.js";
import collegeRoutes from "./routes/colleges.js";
import userRoutes from "./routes/users.js";
import cookieParser from "cookie-parser";
import clubRequestsRoutes from "./routes/clubRequests.js";
import clubRoutes from "./routes/clubs.js";
import paymentRoutes from "./routes/payments.js";
import postRoutes from "./routes/posts.js";
import eventRoutes from "./routes/events.js";
import { startCronJobs } from "./tasks/index.js";

const app = express();

app.use(cookieParser());
app.use("/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/colleges", collegeRoutes);
app.use("/college-requests", collegeRequestsRoutes);
app.use("/club-requests", clubRequestsRoutes);
app.use("/clubs", clubRoutes);
app.use("/payments", paymentRoutes);
app.use("/posts", postRoutes);
app.use("/events", eventRoutes);

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello ClubSphere");
});

(async () => {
    try {
        const result = await pool.query("SELECT current_database() AS db_name");
        console.log("Database connected:", result.rows[0].db_name);
        startCronJobs();
        app.listen(process.env.PORT, () => {
            console.log("Server is running on port", process.env.PORT);
        });
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
})();
