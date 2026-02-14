import { Router } from "express";
import * as propertiesController from "~/controllers/properties.controller.ts";

const router = Router();

router.get("/", propertiesController.list);
router.get("/contact/:contactId", propertiesController.getByContact);
router.get("/:id", propertiesController.getById);
router.post("/", propertiesController.create);
router.patch("/:id", propertiesController.update);

export default router;
