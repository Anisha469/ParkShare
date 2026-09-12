import { useEffect, useState } from "react";
import ParkingCard from "./components/ParkingCard";
import Register from "./Register";
import Login from "./Login";
import "./App.css";

function App() {
  // Store parking spaces from the backend
  const [parkingSpaces, setParkingSpaces] = useState([]);

  // Store what the user types in the search box
  const [search, setSearch] = useState("");

  // Store bookings from the backend
  const [bookings, setBookings] = useState([]);
  const [myParkingSpaces, setMyParkingSpaces] = useState([]);
  const [editingSpace, setEditingSpace] = useState(null);
  const handleDeleteSpace = async (space) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${space.title}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/parking-spaces/${space.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ownerId: currentUser.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete parking space.");
        return;
      }

      alert(data.message);

      setMyParkingSpaces((prev) =>
        prev.filter((parkingSpace) => parkingSpace.id !== space.id)
      );

    } catch (error) {
      console.error("Delete parking space error:", error);
      alert("Failed to delete parking space.");
    }
  };

  const [showListForm, setShowListForm] = useState(false);
  const [spaceTitle, setSpaceTitle] = useState("");
  const [spaceLocation, setSpaceLocation] = useState("");
  const [spacePrice, setSpacePrice] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const handleListSpace = async () => {
    if (!currentUser) {
      alert("Please login before listing a parking space.");
      return;
    }
    if (!spaceTitle || !spaceLocation || !spacePrice) {
      alert("Please fill all fields.");
      return;
    }
    if (Number(spacePrice) <= 0) {
      alert("Price must be greater than 0.");
      return;
    }
    if (spaceTitle.trim().length < 3) {
      alert("Parking title must be at least 3 characters long.");
      return;
    }
    if (spaceLocation.trim().length < 3) {
      alert("Location must be at least 3 characters long.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/parking-spaces",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: spaceTitle,
            location: spaceLocation,
            pricePerHour: Number(spacePrice),
            ownerId: currentUser?.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to list parking space.");
        return;
      }

      alert(data.message);
      setMyParkingSpaces((prev) => [
  ...prev,
  data.parkingSpace,
]);

      // Add the new parking space to the screen
      setParkingSpaces((currentSpaces) => [
        ...currentSpaces,
        data.parkingSpace,
      ]);

      // Clear the form
      setSpaceTitle("");
      setSpaceLocation("");
      setSpacePrice("");

      // Close the form
      setShowListForm(false);

    } catch (error) {
      console.error("List space error:", error);
      alert("Failed to list parking space.");
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);

      // Remove the cancelled booking from the screen
      setBookings((currentBookings) =>
        currentBookings.filter(
          (booking) => booking.id !== bookingId
        )
      );
    } catch (error) {
      console.error("Cancel booking error:", error);
      alert("Failed to cancel booking.");
    }
  };

  // Get parking spaces from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/parking-spaces")
      .then((response) => response.json())
      .then((data) => {
        setParkingSpaces(data);
      })
      .catch((error) => {
        console.error("Error fetching parking spaces:", error);
      });
  }, []);

  // Get bookings from backend
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setBookings([]);
      return;
    }

    fetch(
      `http://localhost:5000/api/bookings?userId=${user.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setBookings(data);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      });
  }, [currentUser]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setMyParkingSpaces([]);
      return;
    }

    fetch(
      `http://localhost:5000/api/my-parking-spaces?ownerId=${user.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setMyParkingSpaces(data);
      })
      .catch((error) => {
        console.error("Error fetching my parking spaces:", error);
      });
  }, [currentUser]);

  // Filter parking spaces based on search
  const filteredSpaces = parkingSpaces.filter((space) =>
    space.title.toLowerCase().includes(search.toLowerCase()) ||
    space.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">



      {/* Navbar */}
      <header className="navbar">
        <h2>ParkShare</h2>

        <nav>

          {currentUser && (
            <span>Welcome, {currentUser.name}</span>
          )}

          {currentUser && (
            <button
              onClick={() => {
                localStorage.removeItem("user");
                setCurrentUser(null);
              }}
            >
              Logout
            </button>
          )}

          <a href="#find-parking">Find Parking</a>

          <button onClick={() => setShowListForm(true)}>
            List Your Space
          </button>

          <button onClick={() => setShowRegister(true)}>
            Register
          </button>

          <button onClick={() => setShowLogin(true)}>
            Login
          </button>

        </nav>
      </header>

      {showRegister && (
        <Register />
      )}

      {showLogin && (
        <Login onLogin={(user) => setCurrentUser(user)} />
      )}

      {showListForm && (
        <section className="list-space-form">

          <h2>List Your Parking Space</h2>

          <label>Parking Title:</label>
          <input
            type="text"
            placeholder="e.g. Home Parking"
            value={spaceTitle}
            onChange={(e) => setSpaceTitle(e.target.value)}
          />

          <label>Location:</label>
          <input
            type="text"
            placeholder="e.g. Model Town"
            value={spaceLocation}
            onChange={(e) => setSpaceLocation(e.target.value)}
          />

          <label>Price per Hour:</label>
          <input
            type="number"
            placeholder="e.g. 50"
            value={spacePrice}
            onChange={(e) => setSpacePrice(e.target.value)}
          />

          <button onClick={handleListSpace}>
            List Parking Space
          </button>

          <button onClick={() => setShowListForm(false)}>
            Cancel
          </button>

        </section>
      )}

      {/* Main content */}
      <main>

        {/* Hero Section */}
        <section className="hero">

          <h1>
            Find a parking space
            <br />
            near you.
          </h1>

          <p>
            Park smarter. Save time. Find your spot.
          </p>

          {/* Search box */}
          <input
            type="text"
            placeholder="🔍 Search by parking name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </section>

        {/* Parking Section */}
        <section className="parking-section" id="find-parking">
          <h2>Find Parking Near You</h2>

          <p className="parking-description">
            Search for available parking spaces by location or parking name.
          </p>

          <div className="parking-grid">

            {filteredSpaces.length === 0 ? (
              <p>No parking spaces found.</p>
            ) : (
              filteredSpaces.map((space) => (
                <ParkingCard
                  key={space.id}
                  space={space}
                  onBookingCreated={(newBooking) => {
                    setBookings((currentBookings) => [
                      ...currentBookings,
                      newBooking,
                    ]);
                  }}
                />
              ))
            )}

          </div>

        </section>

        <section className="my-parking-section">
          <h2>My Parking Spaces</h2>

          {editingSpace && (
            <div className="edit-parking-form">
              <h3>Edit Parking Space</h3>

              <input
                type="text"
                value={editingSpace.title}
                onChange={(e) =>
                  setEditingSpace({
                    ...editingSpace,
                    title: e.target.value,
                  })
                }
              />

              <input
                type="text"
                value={editingSpace.location}
                onChange={(e) =>
                  setEditingSpace({
                    ...editingSpace,
                    location: e.target.value,
                  })
                }
              />

              <input
                type="number"
                value={editingSpace.pricePerHour}
                onChange={(e) =>
                  setEditingSpace({
                    ...editingSpace,
                    pricePerHour: e.target.value,
                  })
                }
              />

              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `http://localhost:5000/api/parking-spaces/${editingSpace.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          title: editingSpace.title,
                          location: editingSpace.location,
                          pricePerHour: editingSpace.pricePerHour,
                          ownerId: currentUser.id,
                        }),
                      }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      alert(data.message || "Failed to update parking space.");
                      return;
                    }

                    alert(data.message);

                    setMyParkingSpaces((prev) =>
                      prev.map((space) =>
                        space.id === data.parkingSpace.id
                          ? data.parkingSpace
                          : space
                      )
                    );

                    setEditingSpace(null);

                  } catch (error) {
                    console.error("Update parking space error:", error);
                    alert("Failed to update parking space.");
                  }
                }}
              >
                Save Changes
              </button>

              <button onClick={() => setEditingSpace(null)}>
                Cancel
              </button>
            </div>
          )}

          {myParkingSpaces.length === 0 ? (
            <p>You haven't listed any parking spaces yet.</p>
          ) : (
            <div className="parking-grid">
              {myParkingSpaces.map((space) => (
                <ParkingCard
                  key={space.id}
                  space={space}
                  isOwner={true}
                  onEdit={(space) => setEditingSpace(space)}
                  onDelete={handleDeleteSpace}
                  onBookingCreated={(booking) => {
                    setBookings((prev) => [...prev, booking]);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* My Bookings Section */}
        <section className="bookings-section">

          <h2>My Bookings</h2>

          {bookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            bookings.map((booking) => (
              <div
                className="booking-card"
                key={booking.id}
              >
                <h3>Booking #{booking.id}</h3>

                <p>
                  <strong>Parking:</strong>{" "}
                  {booking.parkingSpace?.title ||
                    parkingSpaces.find(
                      (space) =>
                        space.id === booking.parkingSpaceId
                    )?.title ||
                    "Unknown Parking"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {booking.parkingSpace?.location ||
                    parkingSpaces.find(
                      (space) =>
                        space.id === booking.parkingSpaceId
                    )?.location ||
                    "Unknown Location"}
                </p>

                <p>
                  <strong>Date:</strong> {booking.date}
                </p>

                <p>
                  <strong>Time:</strong> {booking.time}
                </p>

                <button
                  onClick={() =>
                    cancelBooking(booking.id)
                  }
                >
                  Cancel Booking
                </button>

              </div>
            ))
          )}

        </section>

      </main>

    </div>
  );
}

export default App;