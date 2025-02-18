const express = require("express");
const MikroNode = require("mikronode-ng"); // Import mikronode-ng
const cors = require("cors");

const app = express();

// MikroTik API connection details
const host = "192.168.50.1"; // Replace with MikroTik IP
const user = "admin"; // MikroTik username
const password = "admin-password"; // MikroTik password

console.log("🔥 MikroTik API configuration initialized");

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://hotspot-login.vercel.app", // Deployed frontend URL
      "http://localhost:3000", // Local development URL
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

// Enable CORS with the specified options
app.use(cors(corsOptions));
console.log("✅ CORS enabled with allowed origins");

app.use(express.json());

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("📥 Received login request with username:", username,host);
  let connection;

  try {
    console.log("🔌 Attempting to connect to MikroTik...");
    connection = await MikroNode.getConnection(host, user, password);
    console.log("✅ Connected to MikroTik router successfully",connection);

    const channel = connection.openChannel("hotspotLogin");
    console.log("📡 Opened channel for hotspot authentication");

    // Query hotspot users to verify login
    console.log("🛜 Sending request to check user authentication...");
    channel.write("/ip/hotspot/user/print");

    channel.on("done", (data) => {
      console.log("🔍 Response received from MikroTik:", data.data);

      const userExists = data.data.some((user) => user.name === username);

      if (userExists) {
        console.log("✅ Login successful for user:", username);
        res.status(200).send("Login successful");
      } else {
        console.log("❌ Invalid credentials for user:", username);
        res.status(401).send("Invalid credentials");
      }

      console.log("🛑 Closing channel and connection...");
      channel.close();
      if (connection) connection.close();
    });

    channel.on("error", (err) => {
      console.error("⚠️ Error in MikroTik authentication request:", err);
      res.status(500).send("MikroTik authentication failed");

      console.log("🛑 Closing channel and connection due to error...");
      channel.close();
      if (connection) connection.close();
    });
  } catch (err) {
    console.error("❌ Error occurred while connecting to MikroTik:", err);
    res.status(500).send("MikroTik connection failed");

    if (connection) {
      console.log("🛑 Closing connection due to failure...");
      connection.close();
    }
  }
});

app.listen(5000, () => {
  console.log("🚀 Server is running on port 5000");
});
