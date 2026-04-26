function checkAvailability() {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;

    if(!checkin || !checkout) {
        alert("Please select dates first!");
    } else {
        // Log to console to verify it's working
        console.log("Check-in:", checkin);
        console.log("Check-out:", checkout);
        console.log("Guests:", guests);
        
        alert("Searching for rooms from " + checkin + " to " + checkout + " for " + guests + "...");
        
        // Redirect to booking page with pre-filled data
        window.location.href = `booking.html?checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
    }
}

// Booking Management System
class BookingManager {
    constructor() {
        this.bookingsFile = 'bookings.json';
        this.init();
    }

    async init() {
        // Initialize bookings if not exists
        if (!localStorage.getItem('hotelBookings')) {
            localStorage.setItem('hotelBookings', JSON.stringify({
                bookings: [],
                lastBookingId: 0,
                metadata: {
                    hotelName: "Grand Horizon Hotel",
                    location: "Behind Karmapa Temple, Bodhgaya-824231, Bihar, India",
                    contact: "+91-6206832599",
                    email: "info@grandhorizon.com"
                }
            }));
        }
    }

    generateBookingId() {
        const data = this.getBookings();
        data.lastBookingId++;
        this.saveBookings(data);
        return `GH${String(data.lastBookingId).padStart(4, '0')}`;
    }

    getBookings() {
        return JSON.parse(localStorage.getItem('hotelBookings') || '{}');
    }

    saveBookings(data) {
        localStorage.setItem('hotelBookings', JSON.stringify(data));
        // Also save to JSON file
        this.saveToFile(data);
    }

    saveToFile(data) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookings.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show notification that file has been updated
        this.showFileUpdateNotification();
    }

    showFileUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <strong>✓ Booking Data Saved</strong><br>
            bookings.json file has been updated with latest booking data.
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    loadFromFile(callback) {
        // This would require a file input to load the existing bookings.json
        // For now, we'll work with localStorage and provide download functionality
        if (callback) callback(this.getBookings());
    }

    addBooking(bookingData) {
        const data = this.getBookings();
        const booking = {
            id: this.generateBookingId(),
            ...bookingData,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            totalAmount: this.calculateTotal(bookingData)
        };
        
        data.bookings.push(booking);
        this.saveBookings(data);
        return booking;
    }

    calculateTotal(bookingData) {
        const roomPrices = {
            'Deluxe Suite': 4500,
            'Executive Room': 7200,
            'Presidential Suite': 15000
        };
        
        const pricePerNight = roomPrices[bookingData.roomType] || 4500;
        const nights = this.calculateNights(bookingData.fromDate, bookingData.toDate);
        return pricePerNight * nights;
    }

    calculateNights(checkin, checkout) {
        const start = new Date(checkin);
        const end = new Date(checkout);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getBookingById(bookingId) {
        const data = this.getBookings();
        return data.bookings.find(booking => booking.id === bookingId);
    }

    getAllBookings() {
        const data = this.getBookings();
        return data.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    updateBookingStatus(bookingId, status) {
        const data = this.getBookings();
        const booking = data.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = status;
            this.saveBookings(data);
            return true;
        }
        return false;
    }

    deleteBooking(bookingId) {
        const data = this.getBookings();
        const index = data.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            data.bookings.splice(index, 1);
            this.saveBookings(data);
            return true;
        }
        return false;
    }

    exportToJSON() {
        const data = this.getBookings();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grand_horizon_bookings_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Force update the bookings.json file
    forceUpdateBookingsFile() {
        const data = this.getBookings();
        this.saveToFile(data);
        return true;
    }
}

// Initialize booking manager
const bookingManager = new BookingManager();

// Form submission handler
function handleBookingSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const bookingData = {
        fromDate: formData.get('fromDate') || document.getElementById('fromDate')?.value,
        toDate: formData.get('toDate') || document.getElementById('toDate')?.value,
        roomType: formData.get('roomType') || document.querySelector('select')?.value,
        roomRequirement: formData.get('roomRequirement') || document.querySelectorAll('select')[1]?.value,
        adults: parseInt(formData.get('adults') || document.querySelectorAll('input[type="number"]')[0]?.value),
        children: parseInt(formData.get('children') || document.querySelectorAll('input[type="number"]')[1]?.value),
        fullName: formData.get('fullName') || document.querySelector('input[type="text"]').value,
        email: formData.get('email') || document.querySelector('input[type="email"]').value,
        phone: formData.get('phone') || document.querySelector('input[type="tel"]').value,
        specialRequests: formData.get('specialRequests') || document.querySelector('textarea')?.value
    };
    
    // Validate required fields
    if (!bookingData.fromDate || !bookingData.toDate || !bookingData.fullName || !bookingData.email || !bookingData.phone) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const booking = bookingManager.addBooking(bookingData);
        showBookingConfirmation(booking);
        event.target.reset();
    } catch (error) {
        console.error('Error saving booking:', error);
        alert('There was an error saving your booking. Please try again.');
    }
}

function showBookingConfirmation(booking) {
    const confirmationHtml = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 20px auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <h2 style="color: #d4a373; text-align: center; margin-bottom: 20px;">Booking Confirmed!</h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking.id}</p>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${booking.fullName}</p>
                <p style="margin: 5px 0;"><strong>Room:</strong> ${booking.roomType}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${new Date(booking.fromDate).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${new Date(booking.toDate).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Guests:</strong> ${booking.adults} Adults, ${booking.children} Children</p>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</p>
            </div>
            <p style="text-align: center; color: #666; margin-bottom: 20px;">A confirmation email has been sent to ${booking.email}</p>
            <button onclick="this.parentElement.parentElement.style.display='none'" style="background: #d4a373; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    modal.innerHTML = confirmationHtml;
    document.body.appendChild(modal);
}

// Pre-fill booking form from URL parameters
function prefillBookingForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const checkin = urlParams.get('checkin');
    const checkout = urlParams.get('checkout');
    const guests = urlParams.get('guests');
    
    if (checkin && document.getElementById('fromDate')) {
        document.getElementById('fromDate').value = checkin;
    }
    if (checkout && document.getElementById('toDate')) {
        document.getElementById('toDate').value = checkout;
    }
    if (guests && document.querySelector('input[type="number"]')) {
        document.querySelector('input[type="number"]').value = guests;
    }
}

const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-list');

mobileMenu.addEventListener('click', () => {
    // This 'toggles' the .active class we created in CSS
    navLinks.classList.toggle('active');
});

// Initialize booking form when page loads
document.addEventListener('DOMContentLoaded', function() {
    prefillBookingForm();
    
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
});
