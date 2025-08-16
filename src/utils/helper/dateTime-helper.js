function validateTime(arrivalTime, departureTime) {
    if (!arrivalTime || !departureTime) {
        return false; // If any of the times are missing, return false
    }

    return new Date(arrivalTime) > new Date(departureTime);
}

module.exports = validateTime;