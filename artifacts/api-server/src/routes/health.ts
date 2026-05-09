import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

import { spawn } from "child_process";
import path from "path";

const router: IRouter = Router();

// Health Check Route
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Spam Prediction Route
router.post("/predict", (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Run Python Script
    const pythonProcess = spawn("python", [
      path.join(process.cwd(), "predict.py"),
      message,
    ]);

    let result = "";

    // Get Prediction Result
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    // Handle Python Errors
    pythonProcess.stderr.on("data", (data) => {
      console.error("Python Error:", data.toString());
    });

    // Send Response
    pythonProcess.on("close", () => {
      res.json({
        prediction: result.trim(),
      });
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

export default router;