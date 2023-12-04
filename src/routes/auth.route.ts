import express from "express";
import { authenticateUser } from "../controllers/auth.controller";

import { Request, Response } from 'express';

const router = express.Router();

router.post("/", authenticateUser);
router.get("/test", (req:Request, res:Response) => {
    res.status(200).json({name: "OK", ok: 2021})
})


export default router;
