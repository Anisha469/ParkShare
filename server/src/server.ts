import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";
import bcrypt from "bcryptjs";


// ===============================
// Prisma Database Connection
// ===============================

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});


// ===============================
// Express App
// ===============================

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// Add Initial Parking Spaces
// ===============================

async function seedParkingSpaces() {
    const count = await prisma.parkingSpace.count();

    if (count === 0) {
        await prisma.parkingSpace.createMany({
            data: [
                {
                    title: "Covered Parking",
                    location: "Model Town",
                    pricePerHour: 40,
                },
                {
                    title: "Open Parking",
                    location: "Civil Lines",
                    pricePerHour: 30,
                },
            ],
        });

        console.log("Parking spaces added to database.");
    }
}


// ===============================
// Register User
// ===============================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password.",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed.",
        });
    }
});


// ===============================
// Login User
// ===============================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password.",
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed.",
        });
    }
});


// ===============================
// Home Route
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "ParkShare API is running!",
    });
});


// ===============================
// Get All Parking Spaces
// ===============================

app.get("/api/parking-spaces", async (req, res) => {
    try {
        const parkingSpaces = await prisma.parkingSpace.findMany();

        res.json(parkingSpaces);

    } catch (error) {
        console.error("Error fetching parking spaces:", error);

        res.status(500).json({
            message: "Failed to fetch parking spaces.",
        });
    }
});


// ===============================
// Create New Parking Space
// ===============================

app.post("/api/parking-spaces", async (req, res) => {
    try {
        const { title, location, pricePerHour, ownerId } = req.body;

        if (!title || !location || !pricePerHour) {
            return res.status(400).json({
                message: "Please provide title, location and price.",
            });
        }

        if (!ownerId) {
            return res.status(401).json({
                message: "Please login before listing a parking space.",
            });
        }

        const newParkingSpace = await prisma.parkingSpace.create({
            data: {
                title,
                location,
                pricePerHour: Number(pricePerHour),
                ownerId: Number(ownerId),
            },
        });

        res.status(201).json({
            message: "Parking space listed successfully!",
            parkingSpace: newParkingSpace,
        });

    } catch (error) {
        console.error("Error creating parking space:", error);

        res.status(500).json({
            message: "Failed to list parking space.",
        });
    }
});


// ===============================
// Create New Booking
// ===============================

app.post("/api/bookings", async (req, res) => {
    try {
        const {
            parkingSpaceId,
            date,
            time,
            userId
        } = req.body;

        if (!parkingSpaceId || !date || !time) {
            return res.status(400).json({
                message: "Please provide parking space, date and time.",
            });
        }

        const selectedDateTime = new Date(`${date}T${time}`);
        const currentDateTime = new Date();

        if (selectedDateTime <= currentDateTime) {
            return res.status(400).json({
                message: "Please select a future date and time.",
            });
        }

        const newBooking = await prisma.booking.create({
            data: {
                parkingSpaceId: Number(parkingSpaceId),

                userId: userId
                    ? Number(userId)
                    : null,

                date,
                time,
            },
        });

        console.log("New booking:", newBooking);

        res.json({
            message: "Booking confirmed!",
            booking: newBooking,
        });

    } catch (error: any) {
        console.error("Booking error:", error);

        // Prevent duplicate booking
        if (error.code === "P2002") {
            return res.status(409).json({
                message:
                    "This parking space is already booked for this date and time.",
            });
        }

        res.status(500).json({
            message: "Failed to create booking.",
        });
    }
});


// ===============================
// Check Parking Availability
// ===============================

app.get("/api/bookings/check", async (req, res) => {
    try {
        const {
            parkingSpaceId,
            date,
            time
        } = req.query;

        if (!parkingSpaceId || !date || !time) {
            return res.status(400).json({
                message: "Please provide parking space, date and time.",
            });
        }

        const booking = await prisma.booking.findFirst({
            where: {
                parkingSpaceId: Number(parkingSpaceId),
                date: String(date),
                time: String(time),
            },
        });

        res.json({
            available: !booking,
        });

    } catch (error) {
        console.error("Availability check error:", error);

        res.status(500).json({
            message: "Failed to check availability.",
        });
    }
});

// ===============================
// Get My Parking Spaces
// ===============================

app.get("/api/my-parking-spaces", async (req, res) => {
    try {
        const { ownerId } = req.query;

        if (!ownerId) {
            return res.status(400).json({
                message: "Please provide owner ID.",
            });
        }

        const parkingSpaces = await prisma.parkingSpace.findMany({
            where: {
                ownerId: Number(ownerId),
            },
        });

        res.json(parkingSpaces);

    } catch (error) {
        console.error("Error fetching my parking spaces:", error);

        res.status(500).json({
            message: "Failed to fetch your parking spaces.",
        });
    }
});


// ===============================
// Get Bookings
// ===============================

app.get("/api/bookings", async (req, res) => {
    try {

        // Get userId from URL
        // Example:
        // /api/bookings?userId=1

        const { userId } = req.query;

        const bookings = await prisma.booking.findMany({

            // If userId is provided,
            // only return that user's bookings.
            where: userId
                ? {
                    userId: Number(userId),
                }
                : undefined,

            include: {
                parkingSpace: true,
            },
        });

        res.json(bookings);

    } catch (error) {
        console.error("Error fetching bookings:", error);

        res.status(500).json({
            message: "Failed to fetch bookings.",
        });
    }
});

// ===============================
// Update Parking Space
// ===============================

app.put("/api/parking-spaces/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            title,
            location,
            pricePerHour,
            ownerId
        } = req.body;

        if (!title || !location || !pricePerHour || !ownerId) {
            return res.status(400).json({
                message: "Please provide all parking details.",
            });
        }

        if (Number(pricePerHour) <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0.",
            });
        }

        if (title.trim().length < 3) {
            return res.status(400).json({
                message: "Title must be at least 3 characters long.",
            });
        }

        if (location.trim().length < 3) {
            return res.status(400).json({
                message: "Location must be at least 3 characters long.",
            });
        }

        const parkingSpace = await prisma.parkingSpace.findUnique({
            where: {
                id: id,
            },
        });

        if (!parkingSpace) {
            return res.status(404).json({
                message: "Parking space not found.",
            });
        }

        if (parkingSpace.ownerId !== Number(ownerId)) {
            return res.status(403).json({
                message: "You are not allowed to edit this parking space.",
            });
        }

        const updatedParkingSpace = await prisma.parkingSpace.update({
            where: {
                id: id,
            },
            data: {
                title,
                location,
                pricePerHour: Number(pricePerHour),
            },
        });

        res.json({
            message: "Parking space updated successfully!",
            parkingSpace: updatedParkingSpace,
        });

    } catch (error) {
        console.error("Update parking space error:", error);

        res.status(500).json({
            message: "Failed to update parking space.",
        });
    }
});

// ===============================
// Delete Parking Space
// ===============================

app.delete("/api/parking-spaces/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { ownerId } = req.body;

        if (!ownerId) {
            return res.status(401).json({
                message: "Please login before deleting a parking space.",
            });
        }

        const parkingSpace = await prisma.parkingSpace.findUnique({
            where: {
                id: id,
            },
        });

        if (!parkingSpace) {
            return res.status(404).json({
                message: "Parking space not found.",
            });
        }

        if (parkingSpace.ownerId !== Number(ownerId)) {
            return res.status(403).json({
                message: "You are not allowed to delete this parking space.",
            });
        }

        await prisma.parkingSpace.delete({
            where: {
                id: id,
            },
        });

        res.json({
            message: "Parking space deleted successfully!",
        });

    } catch (error) {
        console.error("Delete parking space error:", error);

        res.status(500).json({
            message: "Failed to delete parking space.",
        });
    }
});


// ===============================
// Cancel Booking
// ===============================

app.delete("/api/bookings/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.booking.delete({
            where: {
                id: id,
            },
        });

        res.json({
            message: "Booking cancelled successfully!",
        });

    } catch (error) {
        console.error("Cancel booking error:", error);

        res.status(404).json({
            message: "Booking not found",
        });
    }
});


// ===============================
// Start Server
// ===============================

seedParkingSpaces();

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});