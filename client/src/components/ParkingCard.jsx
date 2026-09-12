import { useState } from "react";

function ParkingCard({
    space,
    onBookingCreated,
    isOwner,
    onEdit,
    onDelete
}) {
    const [showForm, setShowForm] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [availability, setAvailability] = useState(null);
    const [bookingMessage, setBookingMessage] = useState("");

    const checkAvailability = async () => {
        if (!date || !time) {
            alert("Please select date and time.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/bookings/check?parkingSpaceId=${space.id}&date=${date}&time=${time}`
            );

            const data = await response.json();

            setAvailability(data.available);

        } catch (error) {
            console.error("Availability check error:", error);
            alert("Failed to check availability.");
        }
    };

    const handleBooking = async () => {
        if (!date || !time) {
            alert("Please select date and time.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/bookings",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        parkingSpaceId: space.id,
                        userId: JSON.parse(localStorage.getItem("user"))?.id,
                        date: date,
                        time: time,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Booking failed.");
                return;
            }

            setBookingMessage(data.message);
            // Send the new booking to App.jsx
            onBookingCreated(data.booking);

            // Close the booking form


            // Clear the form
            setDate("");
            setTime("");
            setAvailability(null);

        } catch (error) {
            console.error("Booking error:", error);
            alert("Booking failed.");
        }
    };

    return (
        <div className="parking-card">

            <h2>{space.title}</h2>

            <p>
                <strong>Location:</strong> {space.location}
            </p>

            <p>
                <strong>Price:</strong> ₹{space.pricePerHour} per hour
            </p>

            <button
                onClick={() => {
                    setShowForm(true);
                    setAvailability(null);
                }}
            >
                Book Now
            </button>

            {isOwner && (
                <button onClick={() => onEdit(space)}>
                    Edit
                </button>
            )}

            {isOwner && (
                <button onClick={() => onDelete(space)}>
                    Delete
                </button>
            )}

            {showForm && (
                <div className="booking-form">

                    <h3>Book Parking</h3>

                    <label>Date:</label>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    <label>Time:</label>

                    <input
                        type="time"
                        value={time}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setTime(e.target.value)}
                    />

                    <button onClick={checkAvailability}>
                        Check Availability
                    </button>

                    {availability === true && (
                        <button onClick={handleBooking}>
                            Confirm Booking
                        </button>
                    )}

                    {bookingMessage && (
                        <p className="booking-success-message">
                            ✅ {bookingMessage}
                        </p>
                    )}

                    {availability === false && (
                        <p>❌ This parking space is already booked.</p>
                    )}

                    <button onClick={() => setShowForm(false)}>
                        Cancel
                    </button>

                </div>
            )}

        </div>
    );
}

export default ParkingCard;