import express from "express";
import { authenticate, isAdmin } from "../middlewares/authenticate.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createNozzleSchema, updateNozzleSchema } from "../validations/nozzle.validation.js";
import { getNozzles, getNozzle, createNozzle, updateNozzle, deleteNozzle } from "../controllers/nozzle.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, isAdmin, getNozzles);
router.get("/:id", authenticate, isAdmin, getNozzle);
router.delete("/:id", authenticate, isAdmin, deleteNozzle);

router.post("/",
    authenticate,
    isAdmin,
    validate(createNozzleSchema),
    createNozzle
);

router.patch("/:id",
    authenticate,
    isAdmin,
    validate(updateNozzleSchema),
    updateNozzle
);

export default router;