
import express from "express";
import eventsRouter from "./routes/events";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "tessera",
    });
});

app.use("/events", eventsRouter);

export default app;
