const express = require("express");
const MikroNode = require("splynx-mikronode-ng2"); // Import splynx-mikronode-ng2
const app = express();

// Mikrotik API configuration
const mikrotikConfig = {
  host: "your-mikrotik-router-ip",
  username: "admin",
  password: "admin-password",
};

app.use(express.json());

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Create a connection to MikroTik using splynx-mikronode-ng2
  const connection = new MikroNode(mikrotikConfig.host, mikrotikConfig.username, mikrotikConfig.password);

  connection.connect()
    .then(client => {
      // Send the login command to MikroTik
      const cmd = "/ip/hotspot/login"; // Command to login
      const args = { user: username, password: password };

      client.write(cmd, args)
        .then(response => {
          // Check if the response is "OK" or valid
          if (response && response.length > 0 && response[0].status === "OK") {
            res.status(200).send("Login successful");
          } else {
            res.status(401).send("Invalid credentials");
          }
          client.close(); // Close the connection
        })
        .catch(err => {
          console.error("Error during login:", err);
          res.status(500).send("Login failed");
          client.close();
        });
    })
    .catch(err => {
      console.error("Connection error:", err);
      res.status(500).send("MikroTik connection failed");
    });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
