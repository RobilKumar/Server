const express = require("express");
const Mikrotik = require("splynx-mikronode-ng2"); // Import the new library
const app = express();

const { Connection } = Mikrotik;

// MikroTik API configuration
const mikrotik = new Connection({
  host: "your-mikrotik-router-ip",
  user: "admin",
  password: "admin-password",
});

app.use(express.json());

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  mikrotik
    .connect()
    .then(() => {
      // Send authentication request to MikroTik Hotspot
      return mikrotik.write("/ip/hotspot/login", {
        user: username,
        password: password,
      });
    })
    .then(response => {
      if (response && response[0] && response[0].status === "success") {
        res.status(200).send("Login successful");
      } else {
        res.status(401).send("Invalid credentials");
      }
    })
    .catch(err => {
      res.status(500).send("MikroTik connection failed");
    });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
