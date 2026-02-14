import { Router } from "express";
import * as contactsController from "~/controllers/contacts.controller.ts";

const router = Router();

router.get("/", contactsController.list);
router.get("/:id", contactsController.getById);
router.post("/", contactsController.create);
router.patch("/:id", contactsController.update);

export default router;
