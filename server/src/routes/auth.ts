import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";

const router = Router();

// This SINGLE route handles ALL auth endpoints
// /api/auth/sign-in
// /api/auth/sign-up
// /api/auth/callback/google
// etc.
router.all("/auth/*", toNodeHandler(auth));

export default router;
