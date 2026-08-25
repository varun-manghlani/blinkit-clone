const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const existingAdmin = await Admin.findOne({
      email: "admin@blinkitclone.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");

      await mongoose.disconnect();

      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await Admin.create({
      name: "Blinkit Admin",
      email: "admin@blinkitclone.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");

    console.log("Email: admin@blinkitclone.com");

    console.log("Password: Admin@123");

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Admin creation failed:", error.message);

    process.exit(1);
  }
}

createAdmin();
