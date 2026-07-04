import express from "express";
import validate from "../middlewares/validate.middleware.js";
import { authenticate, isAdmin } from "../middlewares/authenticate.middleware.js";
import { createTankRefillSchema, updateTankRefillSchema } from "../validations/tank.refill.validation.js"
import { createRefill, deleteRefill, getRefill, getRefills, updateRefill } from "../controllers/tank.refill.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, isAdmin, getRefills);
router.get("/:id", authenticate, isAdmin, getRefill);
router.delete("/:id", authenticate, isAdmin, deleteRefill);

router.post("/",
    authenticate,
    isAdmin,
    validate(createTankRefillSchema),
    createRefill
);

router.patch("/:id",
    authenticate,
    isAdmin,
    validate(updateTankRefillSchema),
    updateRefill
);

export default router;