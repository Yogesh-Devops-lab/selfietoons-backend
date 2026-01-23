import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./lib/db.js";
// import createInitialAdmin from "./intiAdmin.js";
import { Server } from "socket.io";
import http from "http";
import consumerAuthRoutes from "./routes/consumer/consumerAuthRoutes.js";
import generateVideoRoutes from "./routes/consumer/generateVideoRoutes.js";

const app = express();
dotenv.config();
// Data understanding middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 🔹 Create HTTP server
const server = http.createServer(app);

// // 🔹 Initialize Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: "*", // (you can restrict this to your front-end domain later)
//     methods: ["GET", "POST"],
//   },
// });

// // Store globally
// global.io = io;

// // Socket.IO connection logic
// io.on("connection", (socket) => {
//   console.log(`A user connected: ${socket.id}`);

//   // When a delivery person connects, they’ll join their personal room
//   socket.on("registerDeliveryPerson", (data) => {
//     const deliveryPersonId =
//       typeof data === "string" ? data : data.deliveryPersonId;

//     if (!deliveryPersonId) {
//       console.log("Missing deliveryPersonId in register event");
//       return;
//     }

//     socket.join(`dp_${deliveryPersonId}`);
//     console.log(
//       `Delivery person ${deliveryPersonId} joined room dp_${deliveryPersonId}`
//     );
//   });

//   socket.on("requestBadgeUpdate", async (dpId) => {
//     if (!dpId) return;

//     const unreadCount = await DeliveryNotification.countDocuments({
//       deliveryPersonId: dpId,
//       isRead: false,
//     });

//     socket.emit("notificationBadgeUpdate", { unreadCount });
//   });

//   // handle disconnection
//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
// });

// Ensure the functions that are async are properly awaited
const startServer = async () => {
  try {
    await connectDB();
    // await createInitialAdmin();
    // console.log("Connected to DB and initialized admin");

    app.get("/", (req, res) => res.send("API Running"));

    // for consumer
    app.use("/api/consumer", consumerAuthRoutes);
    app.use("/api/consumer/video", generateVideoRoutes);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

// Call startServer to initialize and run the app
startServer();
