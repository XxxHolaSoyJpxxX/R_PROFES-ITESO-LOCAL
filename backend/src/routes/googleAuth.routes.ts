import { Router } from "express";
import { GoogleAuthController } from "../controllers/googleAuth.controller";

const router = Router();

router.post("/google", GoogleAuthController.loginGoogle);
router.get("/google",req => {
	console.log("Google auth route reached");
});
export default router;
