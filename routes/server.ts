import express from "express";
import { connectDatabase } from "~/configs/db.config.ts";
import { Env } from "~/configs/env.config.ts";
import { createLogger } from "~/configs/logger.config.ts";

import contactsRoutes from "~/routes/contacts.routes.ts";
import campaignsRoutes from "~/routes/campaigns.routes.ts";
import emailsRoutes from "~/routes/emails.routes.ts";
import propertiesRoutes from "~/routes/properties.routes.ts";
import jobsRoutes from "~/routes/jobs.routes.ts";

const logger = createLogger("server");

export async function createServer() {
  await connectDatabase();

  const app = express();
  app.use(express.json());

  app.use("/contacts", contactsRoutes);
  app.use("/campaigns", campaignsRoutes);
  app.use("/emails", emailsRoutes);
  app.use("/properties", propertiesRoutes);
  app.use("/jobs", jobsRoutes);

  app.get("/", (_req, res) => {
    res.json({
      name: "LeadState AI API",
      version: "1.0",
      endpoints: ["/contacts", "/campaigns", "/emails", "/properties", "/jobs", "/health"],
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  });

  return app;
}

export async function startServer() {
  const app = await createServer();
  const port = Env.PORT;
  app.listen(port, () => {
    logger.info("Server listening", { port });
  });
  return app;
}
