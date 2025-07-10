// Initialize map
const map = L.map("map").setView([41.2995, 69.2401], 13);
let userLocation = null;
let watchId = null;

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(map);

// Create layer groups
const layers = {
  restaurants: L.layerGroup().addTo(map),
  entertainment: L.layerGroup().addTo(map),
  landmarks: L.layerGroup().addTo(map),
  user: L.layerGroup().addTo(map),
};

// Custom icons
const icons = {
  restaurant: L.divIcon({
    className: "bg-orange-500 rounded-full p-2 shadow-md border-2 border-white",
    html: '<i class="fas fa-utensils text-white"></i>',
    iconSize: [32, 32],
  }),
  entertainment: L.divIcon({
    className: "bg-purple-500 rounded-full p-2 shadow-md border-2 border-white",
    html: '<i class="fas fa-music text-white"></i>',
    iconSize: [32, 32],
  }),
  landmark: L.divIcon({
    className: "bg-green-500 rounded-full p-2 shadow-md border-2 border-white",
    html: '<i class="fas fa-landmark text-white"></i>',
    iconSize: [32, 32],
  }),
  user: L.divIcon({
    className: "bg-blue-500 rounded-full p-2 shadow-md border-2 border-white",
    html: '<i class="fas fa-user text-white"></i>',
    iconSize: [32, 32],
  }),
};

// Tashkent landmarks data
const tashkentLandmarks = [
  {
    id: 1,
    name: "Amir Timur Square",
    nameUz: "Amir Temur maydoni",
    coords: [41.3123, 69.2787],
    type: "landmark",
    description: "Central square with statue of the Turco-Mongol conqueror",
  },
  {
    id: 2,
    name: "Chorsu Bazaar",
    nameUz: "Chorsu bozori",
    coords: [41.3246, 69.2387],
    type: "market",
    description: "Historic dome-covered market with traditional goods",
  },
  {
    id: 3,
    name: "Navoi Opera Theater",
    nameUz: "Navoiy opera teatri",
    coords: [41.3158, 69.2818],
    type: "entertainment",
    description: "Beautiful theater hosting opera and ballet performances",
  },
];

// Uzbek cuisine translations
const cuisineTypes = {
  plov: { name: "Osh (Plov)", icon: "fa-bowl-food" },
  lagman: { name: "Lagʻmon", icon: "fa-noodles" },
  somsa: { name: "Somsa", icon: "fa-pie" },
  shashlik: { name: "Shashlik", icon: "fa-drumstick-bite" },
  international: { name: "International", icon: "fa-earth-asia" },
};

// Update UI based on location state
function updateUI() {
  const locateBtn = document.getElementById("locate-me");
  if (userLocation) {
    locateBtn.innerHTML = '<i class="fas fa-location-dot"></i> Tracking Active';
    locateBtn.classList.add("bg-blue-600", "text-white");
    locateBtn.classList.remove("text-blue-600");
  } else {
    locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i> My Location';
    locateBtn.classList.remove("bg-blue-600", "text-white");
    locateBtn.classList.add("text-blue-600");
  }
}

// Show user location on map
function showUserLocation(position) {
  userLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };

  layers.user.clearLayers();
  L.marker([userLocation.lat, userLocation.lng], {
    icon: icons.user,
    zIndexOffset: 1000,
  }).addTo(layers.user);

  map.setView([userLocation.lat, userLocation.lng], 15);
  updateUI();
}

// Start tracking user location
function startLocationTracking() {
  if (navigator.geolocation) {
    if (watchId) {
      // Stop existing tracking
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      userLocation = null;
      layers.user.clearLayers();
      updateUI();
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        showUserLocation(position);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Add landmarks to map and sidebar
function showLandmarks() {
  clearLayers();
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.innerHTML = "";

  tashkentLandmarks.forEach((landmark) => {
    // Add to map
    const marker = L.marker(landmark.coords, {
      icon: icons.landmark,
    }).addTo(layers.landmarks).bindPopup(`
            <div>
                <h3 class="font-bold text-lg">${landmark.name}</h3>
                <p class="text-gray-600 italic">${landmark.nameUz}</p>
                <p class="mt-2 text-gray-700">${landmark.description}</p>
                ${
                  userLocation
                    ? `
                    <div class="mt-2">
                        <button class="text-xs bg-blue-100 text-blue-800 p-1 rounded get-directions" 
                            data-lat="${landmark.coords[0]}" data-lng="${landmark.coords[1]}">
                            <i class="fas fa-route"></i> Get Directions
                        </button>
                    </div>
                `
                    : ""
                }
            </div>
        `);

    // Add to sidebar
    const landmarkElement = document.createElement("div");
    landmarkElement.className = "p-4 hover:bg-gray-50 cursor-pointer";
    landmarkElement.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="bg-green-100 p-2 rounded-full text-green-600">
                    <i class="fas fa-landmark"></i>
                </div>
                <div>
                    <h3 class="font-medium">${landmark.name}</h3>
                    <p class="text-sm text-gray-500">${landmark.type}</p>
                    <button class="mt-2 text-xs text-blue-600 hover:underline focus-visible view-on-map"
                        data-lat="${landmark.coords[0]}" data-lng="${
      landmark.coords[1]
    }">
                        Show on map
                    </button>
                    ${
                      userLocation
                        ? `
                        <button class="mt-1 text-xs text-green-600 hover:underline focus-visible get-directions"
                            data-lat="${landmark.coords[0]}" data-lng="${landmark.coords[1]}">
                            <i class="fas fa-route"></i> Directions
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
    resultsContainer.appendChild(landmarkElement);
  });
}

// Find places near user
async function findNearbyPlaces(amenity) {
  if (!userLocation) {
    alert("Please activate location tracking first");
    return;
  }

  clearLayers();
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.innerHTML =
    '<div class="p-4 text-center text-gray-500">Loading nearby places...</div>';

  const cuisineFilter = document.getElementById("cuisine-filter").value;
  const halalOnly = document.getElementById("halal-filter").checked;
  const radius = 1000; // 1km radius

  let query = `[out:json];
        (
            node["amenity"="${amenity}"](around:${radius},${userLocation.lat},${userLocation.lng});
        );
        out body;>;out skel qt;`;

  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();
    resultsContainer.innerHTML = "";

    if (data.elements.length === 0) {
      resultsContainer.innerHTML =
        '<div class="p-4 text-center text-gray-500">No places found nearby</div>';
      return;
    }

    data.elements.forEach((place) => {
      if (place.tags?.name) {
        // Apply filters for restaurants
        if (amenity === "restaurant") {
          if (
            cuisineFilter !== "all" &&
            (!place.tags.cuisine || place.tags.cuisine !== cuisineFilter)
          )
            return;
          if (halalOnly && place.tags.diet !== "halal") return;
        }

        const icon =
          amenity === "restaurant" ? icons.restaurant : icons.entertainment;
        const typeIcon =
          amenity === "restaurant"
            ? place.tags.cuisine
              ? cuisineTypes[place.tags.cuisine]?.icon || "fa-utensils"
              : "fa-utensils"
            : "fa-music";

        // Calculate distance
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          place.lat,
          place.lon
        );

        // Add to map
        const marker = L.marker([place.lat, place.lon], {
          icon: icon,
        }).addTo(
          layers[amenity === "restaurant" ? "restaurants" : "entertainment"]
        ).bindPopup(`
                    <div>
                        <h3 class="font-bold text-lg">${place.tags.name}</h3>
                        <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <i class="fas ${typeIcon} ${
          amenity === "restaurant" ? "text-orange-500" : "text-purple-500"
        }"></i>
                            <span>${
                              amenity === "restaurant"
                                ? place.tags.cuisine
                                  ? cuisineTypes[place.tags.cuisine]?.name ||
                                    place.tags.cuisine
                                  : "Restaurant"
                                : place.tags.amenity || "Venue"
                            }
                            </span>
                        </div>
                        <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <i class="fas fa-walking text-blue-500"></i>
                            <span>${distance.toFixed(0)} meters away</span>
                        </div>
                        ${
                          place.tags["addr:street"]
                            ? `
                            <div class="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <i class="fas fa-location-dot text-blue-500"></i>
                                <span>${place.tags["addr:street"]}</span>
                            </div>
                        `
                            : ""
                        }
                        <div class="mt-2">
                            <button class="text-xs bg-blue-100 text-blue-800 p-1 rounded get-directions" 
                                data-lat="${place.lat}" data-lng="${place.lon}">
                                <i class="fas fa-route"></i> Get Directions
                            </button>
                        </div>
                    </div>
                `);

        // Add to sidebar
        const placeElement = document.createElement("div");
        placeElement.className = "p-4 hover:bg-gray-50 cursor-pointer border-b";
        placeElement.innerHTML = `
                    <div class="flex items-start gap-3">
                        <div class="${
                          amenity === "restaurant"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-purple-100 text-purple-600"
                        } p-2 rounded-full">
                            <i class="fas ${typeIcon}"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between">
                                <h3 class="font-medium">${place.tags.name}</h3>
                                <span class="text-xs text-gray-500">${distance.toFixed(
                                  0
                                )}m</span>
                            </div>
                            <p class="text-sm text-gray-500">
                                ${
                                  amenity === "restaurant"
                                    ? place.tags.cuisine
                                      ? cuisineTypes[place.tags.cuisine]
                                          ?.name || place.tags.cuisine
                                      : "Restaurant"
                                    : place.tags.amenity || "Venue"
                                }
                            </p>
                            ${
                              place.tags["addr:street"]
                                ? `
                                <p class="text-xs text-gray-400 mt-1">
                                    <i class="fas fa-location-dot"></i> ${place.tags["addr:street"]}
                                </p>
                            `
                                : ""
                            }
                            <div class="flex gap-2 mt-2">
                                <button class="text-xs text-blue-600 hover:underline focus-visible view-on-map"
                                    data-lat="${place.lat}" data-lng="${
          place.lon
        }">
                                    Show on map
                                </button>
                                <button class="text-xs text-green-600 hover:underline focus-visible get-directions"
                                    data-lat="${place.lat}" data-lng="${
          place.lon
        }">
                                    <i class="fas fa-route"></i> Directions
                                </button>
                            </div>
                        </div>
                    </div>
                `;
        resultsContainer.appendChild(placeElement);
      }
    });
  } catch (error) {
    console.error(`Error fetching ${amenity}:`, error);
    resultsContainer.innerHTML = `<div class="p-4 text-center text-red-500">Failed to load ${amenity} places. Please try again later.</div>`;
  }
}

// Calculate distance between two coordinates in meters (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Show route to destination
function showRoute(destLat, destLng) {
  if (!userLocation) {
    alert("Please activate location tracking first");
    return;
  }

  // In a real app, you would use a routing API like OSRM or Mapbox here
  // This is a simplified straight-line visualization

  layers.user.clearLayers();

  // Add user marker
  L.marker([userLocation.lat, userLocation.lng], {
    icon: icons.user,
    zIndexOffset: 1000,
  }).addTo(layers.user);

  // Add destination marker
  L.marker([destLat, destLng], {
    icon: L.divIcon({
      className: "bg-red-500 rounded-full p-2 shadow-md border-2 border-white",
      html: '<i class="fas fa-flag text-white"></i>',
      iconSize: [32, 32],
    }),
  }).addTo(layers.user);

  // Add line
  L.polyline(
    [
      [userLocation.lat, userLocation.lng],
      [destLat, destLng],
    ],
    {
      color: "#3b82f6",
      weight: 4,
      dashArray: "5, 5",
    }
  ).addTo(layers.user);

  // Center map on the route
  map.fitBounds([
    [userLocation.lat, userLocation.lng],
    [destLat, destLng],
  ]);
}

// Clear all layers
function clearLayers() {
  Object.values(layers).forEach((layer) => {
    if (layer !== layers.user) layer.clearLayers();
  });
  document.getElementById("results-container").innerHTML = "";
}

// Event listeners
document
  .getElementById("find-restaurants")
  .addEventListener("click", () => findNearbyPlaces("restaurant"));
document
  .getElementById("find-entertainment")
  .addEventListener("click", () => findNearbyPlaces("cinema")); // Using cinema as example
document
  .getElementById("show-landmarks")
  .addEventListener("click", showLandmarks);
document.getElementById("clear-all").addEventListener("click", clearLayers);
document
  .getElementById("locate-me")
  .addEventListener("click", startLocationTracking);

// Handle Enter key in search
document.getElementById("search-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchLocation();
  }
});

// Handle clicks in results container
document.getElementById("results-container").addEventListener("click", (e) => {
  const target = e.target.closest("button");
  if (!target) return;

  if (target.classList.contains("view-on-map")) {
    const lat = target.dataset.lat;
    const lng = target.dataset.lng;
    map.setView([lat, lng], 16);
  }

  if (target.classList.contains("get-directions")) {
    const lat = target.dataset.lat;
    const lng = target.dataset.lng;
    showRoute(lat, lng);
  }
});

// Initialize with landmarks
showLandmarks();
updateUI();
