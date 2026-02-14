import { Router } from "express";
import * as jobsController from "~/controllers/jobs.controller.ts";

const router = Router();

router.get("/", jobsController.list);

export default router;
