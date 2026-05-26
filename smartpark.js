// ─── SmartPark Core ───────────────────────────────────────────────────────────
// Data Structure: Fixed-size Array (max 50 slots)
// Time Complexity:
//   enterCar   → O(n)  – scan for first empty slot
//   removeCar  → O(n)  – scan for matching plate
//   isFull     → O(1)  – compare counter
//   traverse   → O(n)  – render all slots
// Space Complexity: O(n) where n = MAX_SLOTS (50)

const MAX_SLOTS = 50;
const RATE_NORMAL = 300;   // RWF per hour
const RATE_EXTRA  = 500;   // RWF per extra hour beyond booked hours

// Sparse array: index = slot number (0-based), value = car object or null
const carPark = new Array(MAX_SLOTS).fill(null);
let occupiedCount = 0;

// ─── a) Create car park ───────────────────────────────────────────────────────
function createCarPark() {
  carPark.fill(null);
  occupiedCount = 0;
}

// ─── b) Check if full ─────────────────────────────────────────────────────────
function isFull() {
  return occupiedCount >= MAX_SLOTS;
}

// ─── c) Enter car ─────────────────────────────────────────────────────────────
function enterCar(plate) {
  if (!plate || plate.trim() === "") return { ok: false, msg: "Plate number is required." };
  if (isFull())                        return { ok: false, msg: "Car park is full (50/50)." };

  const normalised = plate.trim().toUpperCase();

  // Duplicate check
  for (let i = 0; i < MAX_SLOTS; i++) {
    if (carPark[i] && carPark[i].plate === normalised)
      return { ok: false, msg: `${normalised} is already parked in slot ${i + 1}.` };
  }

  // Find first empty slot — O(n)
  for (let i = 0; i < MAX_SLOTS; i++) {
    if (carPark[i] === null) {
      carPark[i] = { plate: normalised, slot: i + 1, timeIn: new Date() };
      occupiedCount++;
      return { ok: true, msg: `${normalised} parked in slot ${i + 1}.`, slot: i + 1 };
    }
  }
}

// ─── d) Remove car & calculate bill ──────────────────────────────────────────
function removeCar(plate) {
  const normalised = plate.trim().toUpperCase();

  for (let i = 0; i < MAX_SLOTS; i++) {
    if (carPark[i] && carPark[i].plate === normalised) {
      const car    = carPark[i];
      const timeOut = new Date();
      const bill   = calculateBill(car.timeIn, timeOut);

      carPark[i] = null;
      occupiedCount--;

      return { ok: true, car, timeOut, ...bill };
    }
  }
  return { ok: false, msg: `${normalised} not found in the car park.` };
}

// ─── Billing logic ────────────────────────────────────────────────────────────
function calculateBill(timeIn, timeOut) {
  const msElapsed  = timeOut - timeIn;
  const totalMins  = Math.floor(msElapsed / 60000);
  const totalHours = Math.ceil(totalMins / 60);          // round up to next hour

  let amount;
  if (totalHours <= 1) {
    amount = RATE_NORMAL;                                 // minimum 1 hour
  } else {
    amount = RATE_NORMAL + (totalHours - 1) * RATE_EXTRA; // first hour normal, rest extra
  }

  return { totalMins, totalHours, amount };
}

// ─── e) Traverse all cars ─────────────────────────────────────────────────────
function getAllCars() {
  return carPark
    .map((car, i) => car ? { ...car, index: i } : null)
    .filter(Boolean);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(date) {
  return date.toLocaleDateString("en-RW");
}

function elapsed(timeIn) {
  const mins = Math.floor((new Date() - timeIn) / 60000);
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${m}m`;
}
