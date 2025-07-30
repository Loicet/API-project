// Sample venue data (local)
const sampleVenues = [
    {
        id: 1,
        name: "Kigali Convention Centre",
        location: "Kigali City Center",
        type: "convention",
        capacity: 500,
        price: "500,000 - 1,000,000 RWF",
        features: ["Parking", "AC", "Sound System", "Catering"],
        rating: 4.8,
        availability: "available"
    },
    {
        id: 2,
        name: "Serena Hotel",
        location: "Kiyovu",
        type: "garden",
        capacity: 200,
        price: "300,000 - 600,000 RWF",
        features: ["Garden", "Parking", "Catering", "Photography"],
        rating: 4.6,
        availability: "busy"
    },
    {
        id: 3,
        name: "Marriott Hotel",
        location: "City Center",
        type: "hall",
        capacity: 300,
        price: "400,000 - 800,000 RWF",
        features: ["AC", "Sound System", "Lighting", "Parking"],
        rating: 4.7,
        availability: "available"
    },
    {
        id: 4,
        name: "Nyanza Cultural Site",
        location: "Nyanza",
        type: "cultural",
        capacity: 150,
        price: "150,000 - 300,000 RWF",
        features: ["Traditional Setup", "Parking", "Cultural Activities"],
        rating: 4.3,
        availability: "booked"
    }
];

let currentSearchType = 'location';
let filteredVenues = [...sampleVenues];

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    displayVenues(sampleVenues);
    setupEventListeners();
});

function setupEventListeners() {
    // Search form submission
    document.getElementById('searchForm').addEventListener('submit', function (e) {
        e.preventDefault();
        performSearch();
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Click outside modal to close
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// Switch between search tabs
function switchTab(type) {
    currentSearchType = type;

    // Reset tabs
    document.querySelectorAll('.search-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Reset search input based on type
    const searchInput = document.getElementById('searchInput');
    const searchLabel = document.getElementById('searchLabel');

    // Clear previous input to avoid mixing
    searchInput.value = "";
    searchInput.type = "text";

    switch (type) {
        case 'location':
            searchLabel.textContent = 'Location';
            searchInput.placeholder = 'Enter city or area';
            break;
        case 'name':
            searchLabel.textContent = 'Venue Name';
            searchInput.placeholder = 'Enter venue name';
            break;
        case 'type':
            searchLabel.textContent = 'Venue Type';
            searchInput.placeholder = 'Enter venue type (e.g., garden, hall)';
            break;
        case 'date':
            searchLabel.textContent = 'Event Date';
            searchInput.type = 'date';
            searchInput.placeholder = '';
            break;
    }
}

function toggleFilters() {
    const filtersGrid = document.getElementById('filtersGrid');
    filtersGrid.classList.toggle('active');
}

// Perform search based on current tab
async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const capacity = document.getElementById('capacity').value;

    // LOCATION search using OpenStreetMap API
    if (currentSearchType === 'location' && searchTerm) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&addressdetails=1&limit=5`);
            const data = await res.json();

            filteredVenues = data.length > 0 ? data.map((place, index) => ({
                id: index + 100,
                name: place.display_name.split(",")[0],
                location: place.display_name,
                type: "general",
                capacity: 100,
                price: "Contact for price",
                features: ["Parking", "Accessible"],
                rating: 4,
                availability: "available",
                lat: place.lat,
                lon: place.lon
            })) : [];
        } catch (error) {
            console.error("API failed, using fallback data:", error);
            filteredVenues = [];
        }

    } else {
        // LOCAL filtering for Name, Type, and Date
        filteredVenues = sampleVenues.filter(venue => {
            let matches = true;

            if (searchTerm) {
                if (currentSearchType === 'name') {
                    matches = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (currentSearchType === 'type') {
                    matches = venue.type.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (currentSearchType === 'date') {
                    // Assume all venues are available on any searched date
                    matches = true;
                }
            }

            // Capacity filter
            if (capacity) {
                const [min, max] = capacity.split('-').map(n => parseInt(n.replace('+', '')));
                matches = matches && (max ? (venue.capacity >= min && venue.capacity <= max) : (venue.capacity >= min));
            }

            return matches;
        });
    }

    displayVenues(filteredVenues);
}

function displayVenues(venues) {
    const venueGrid = document.getElementById('venueGrid');

    if (venues.length === 0) {
        venueGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No venues found matching your criteria.</p>';
        return;
    }

    venueGrid.innerHTML = venues.map(venue => `
        <div class="venue-card" onclick="viewVenueDetails(${venue.id})">
            <div class="venue-image">
                📸 ${venue.name}
            </div>
            <div class="venue-content">
                <h3 class="venue-title">${venue.name}</h3>
                <div class="venue-location">
                    📍 ${venue.location}
                </div>
                <div class="venue-features">
                    ${venue.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="venue-price">${venue.price}</div>
                <div class="availability-indicator">
                    <div class="availability-dot ${venue.availability}"></div>
                    <span>${getAvailabilityText(venue.availability)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>⭐ ${venue.rating}</span>
                    <span>👥 Up to ${venue.capacity} guests</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getAvailabilityText(status) {
    switch (status) {
        case 'available': return 'Available';
        case 'busy': return 'Limited availability';
        case 'booked': return 'Fully booked';
        default: return 'Check availability';
    }
}

function viewVenueDetails(venueId) {
    // This would navigate to a detailed venue page
    alert(`Viewing details for venue ID: ${venueId}\n\nThis would open the venue detail page with:\n- Photo gallery\n- Full description\n- Availability calendar\n- Booking form\n- Contact information`);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function toggleUserType() {
    alert('This would switch to the venue owner interface where you can:\n\n• Add and manage your venues\n• Set availability calendars\n• Approve/reject bookings\n• View analytics and earnings\n• Communicate with customers');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const userType = document.getElementById('userType').value;

    // Simulate login success
    alert(`Login successful!\n\nWelcome back, ${email}\nUser type: ${userType === 'user' ? 'Event Organizer' : 'Venue Owner'}`);
    document.getElementById('loginModal').style.display = 'none';

    updateUIForLoggedInUser(userType);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const userType = document.getElementById('registerType').value;

    // Simulate registration success
    alert(`Registration successful!\n\nWelcome to VenueFinder, ${name}!\nUser type: ${userType === 'user' ? 'Event Organizer' : 'Venue Owner'}`);
    document.getElementById('registerModal').style.display = 'none';

    updateUIForLoggedInUser(userType);
}

function updateUIForLoggedInUser(userType) {
    const authButtons = document.querySelector('.auth-buttons');
    if (userType === 'user') {
        authButtons.innerHTML = `
            <button class="btn btn-secondary">My Bookings</button>
            <button class="btn btn-primary">Profile</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-secondary">My Venues</button>
            <button class="btn btn-primary">Add Venue</button>
            <button class="btn btn-secondary">Dashboard</button>
        `;
    }
}
