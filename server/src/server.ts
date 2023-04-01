import http from "http";
import express, { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";

const router: Express = express();

router.use(morgan("dev"));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "origin, X-Requested-With,Content-Type,Accept, Authorization");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
    return res.status(200).json({});
  }

  next();
});

router.use("/ping", async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({
    message: "ping"
  });
});

router.use((req, res, next) => {
  const error = new Error("Not found");
  return res.status(404).json({
    message: error.message
  });
});

const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 8000;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));

export default router;
