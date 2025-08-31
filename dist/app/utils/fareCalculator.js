"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFare = exports.calculateDistance = exports.toRadians = void 0;
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};
exports.toRadians = toRadians;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (0, exports.toRadians)(lat2 - lat1);
    const dLon = (0, exports.toRadians)(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((0, exports.toRadians)(lat1)) *
            Math.cos((0, exports.toRadians)(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // km
};
exports.calculateDistance = calculateDistance;
const calculateFare = (pickupCoords, destinationCoords) => {
    const baseFare = 50;
    const ratePerKm = 25;
    const [lon1, lat1] = pickupCoords;
    const [lon2, lat2] = destinationCoords;
    const distance = (0, exports.calculateDistance)(lat1, lon1, lat2, lon2);
    const totalFare = baseFare + distance * ratePerKm;
    return Math.round(totalFare);
};
exports.calculateFare = calculateFare;
