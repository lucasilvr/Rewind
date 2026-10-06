import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { 
  getAllUsers, 
  createUser,
  login,
  getMe,
  logout
} from "../controllers/user.controller";

const router = Router();

router.get("/", getAllUsers);
router.get("/me", authMiddleware, getMe);

router.post("/", createUser);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;