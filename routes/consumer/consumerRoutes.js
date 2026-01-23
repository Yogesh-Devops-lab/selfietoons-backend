import express from "express";
import { getConsumers } from "../../controllers/consumer/consumerController";

const router = express.Router();

// getList
router.post("/consumer/list", getConsumers);


export default router;
