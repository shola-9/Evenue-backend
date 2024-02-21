import express, { Request, Response } from "express";
import helmet from "helmet";
import http from "http";
import cors from "cors";
import "dotenv/config";

const app = express();
const server = http.createServer(app);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import routes
import usersRouter from "./routes/users/users";
import eventsRouter from "./routes/events/events";
import venuesRouter from "./routes/venues/venues";
import eventServicesRouter from "./routes/eventServices/eventServices";
import eventsShowcaseRouter from "./routes/eventsShowcase/eventsShowcase";
import shortVideoRouter from "./routes/shortVideos/shortVideos";
import storyRouter from "./routes/story/story";
import groupRouter from "./routes/groups/groups";

// use routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/venues", venuesRouter);
app.use("/api/v1/eventServices", eventServicesRouter);
app.use("/api/v1/eventsShowcase", eventsShowcaseRouter);
app.use("/api/v1/shortVideos", shortVideoRouter);
app.use("/api/v1/story", storyRouter);
app.use("/api/v1/groups", groupRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}...`);
});
