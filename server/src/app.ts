import express from "express";
import cors from "cors";
import pool from "./db/index.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));

app.use("/auth", authRoutes);

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello ClubSphere");
});

(async () => {
    try {
        const result = await pool.query("SELECT current_database() AS db_name");
        console.log("Database connected:", result.rows[0].db_name);
        app.listen(process.env.PORT, () => {
            console.log("Server is running on port", process.env.PORT);
        });
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
})();
