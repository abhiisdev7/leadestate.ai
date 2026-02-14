import { Router } from "express";
import * as emailsController from "~/controllers/emails.controller.ts";

const router = Router();

router.get("/", emailsController.list);
router.get("/conversation/:conversationId", emailsController.getConversation);
router.get("/contact/:contactId", emailsController.getByContact);
router.get("/campaign/:campaignId", emailsController.getByCampaign);

export default router;
