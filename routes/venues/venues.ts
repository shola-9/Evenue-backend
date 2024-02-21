import { Router } from "express";
const router = Router();

import { uploadVenue } from "../../controllers/venues/upload";
import { getAll } from "../../controllers/venues/getAll";
import { search } from "../../controllers/venues/search";
import { getVenue } from "../../controllers/venues/getVenue";

router.post("/", uploadVenue);
router.post("/getAll", getAll);
router.get("/search", search);
router.get("/:venue_id", getVenue);

export default router;
