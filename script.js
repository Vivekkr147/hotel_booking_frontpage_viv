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
    }
}