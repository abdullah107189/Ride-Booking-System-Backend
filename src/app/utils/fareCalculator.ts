export const toRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // km
};

export const calculateFare = (pickupCoords: number[], destinationCoords: number[]) => {
  const baseFare = 50;
  const ratePerKm = 25;

  const [lon1, lat1] = pickupCoords as number[];
  const [lon2, lat2] = destinationCoords as number[];

  const distance = calculateDistance(lat1, lon1, lat2, lon2);

  const totalFare = baseFare + distance * ratePerKm;

  return Math.round(totalFare);
};
