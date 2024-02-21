import { Router } from "express";
const router = Router();

import protect from "../../middleware/auth/protect";
import { uploadEventService } from "../../controllers/eventServices/upload";
import { getLimitedInfoForAll } from "../../controllers/eventServices/getLimitedInfoForAll";
import { search } from "../../controllers/eventServices/search";
import { getServiceProvider } from "../../controllers/eventServices/dynamicServiceProviders";

router.post("/", protect, uploadEventService);
router.post("/getLimitedInfoForAll", getLimitedInfoForAll);
router.get("/search", search);
router.get("/getServiceProvider/:sProvider_id", getServiceProvider);

export default router;
