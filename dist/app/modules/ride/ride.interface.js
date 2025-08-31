"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideStatus = void 0;
var RideStatus;
(function (RideStatus) {
    RideStatus["requested"] = "requested";
    RideStatus["accepted"] = "accepted";
    RideStatus["picked_up"] = "picked_up";
    RideStatus["in_transit"] = "in_transit";
    RideStatus["completed"] = "completed";
    RideStatus["canceled"] = "canceled";
    RideStatus["paid"] = "paid";
})(RideStatus || (exports.RideStatus = RideStatus = {}));
