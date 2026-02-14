import { Router } from "express";
import * as campaignsController from "~/controllers/campaigns.controller.ts";

const router = Router();

router.get("/", campaignsController.list);
router.get("/:id", campaignsController.getById);
router.post("/", campaignsController.create);
router.post("/:id/send", campaignsController.send);

export default router;