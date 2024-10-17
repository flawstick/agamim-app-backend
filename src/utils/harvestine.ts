export function haversineDistance(
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number },
) {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const lat1 = coords1.lat;
  const lon1 = coords1.lng;
  const lat2 = coords2.lat;
  const lon2 = coords2.lng;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

export function calculateDeliveryTime(distance: number) {
  const baseTime = 20;
  const timePerKm = 5; // Additional minutes per kilometer
  return Math.round(baseTime + distance * timePerKm);
}
