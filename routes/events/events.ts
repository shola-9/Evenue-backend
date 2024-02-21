import { Router } from "express";
const router = Router();

import protect from "../../middleware/auth/protect";
import { uploadEvent } from "../../controllers/events/upload";
import { getLimitedInfo } from "../../controllers/events/getLimitedInfo";
import { search } from "../../controllers/events/search";
import { getEvent } from "../../controllers/events/getEvent";

router.post("/", protect, uploadEvent);
router.post("/getLimitedInfo", getLimitedInfo);
router.get("/search", search);
router.get("/:event_id", getEvent);

export default router;
