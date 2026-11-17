// Emission factors: kg CO2e per unit
// Sources: average estimates; update per region as needed
const EMISSION_FACTORS = {
  transport: {
    car_km: 0.192,        // average petrol car per km
    bus_km: 0.105,        // average diesel bus per km
    train_km: 0.041,      // average train per km
    flight_km: 0.255      // average flight per km (economy)
  },
  electricity: {
    kwh: 0.475            // global average; varies significantly by grid
  },
  food: {
    chicken_meal: 2.0,    // kg CO2e per meal
    vegetarian_meal: 1.0,
    dairy_serving: 0.8
  },
  waste: {
    bag_kg: 0.021         // general mixed waste per kg to landfill
  },
  water: {
    liters: 0.000298      // water treatment + heating avg per litre
  },
  natural_gas: {
    cubic_meter: 2.204    // natural gas combustion per m³
  },
  shopping: {
    clothing_item: 20.0,  // average new clothing item
    electronics_item: 70.0 // default / average consumer electronics item
  }
};

// Device-specific emission factors for electronics (kg CO2e per item)
// Lifecycle assessment representative estimates; configurable for future updates
export const ELECTRONIC_DEVICE_FACTORS = {
  'Smartphone': 55.0,
  'Tablet': 100.0,
  'Laptop': 150.0,
  'Desktop PC': 350.0,
  'Monitor': 100.0,
  'Other': 70.0
};

export function getDeviceEmissionFactor(deviceType) {
  if (!deviceType) return ELECTRONIC_DEVICE_FACTORS['Other'];
  if (ELECTRONIC_DEVICE_FACTORS[deviceType] !== undefined) {
    return ELECTRONIC_DEVICE_FACTORS[deviceType];
  }
  const match = Object.keys(ELECTRONIC_DEVICE_FACTORS).find(
    k => k.toLowerCase() === String(deviceType).trim().toLowerCase()
  );
  return match ? ELECTRONIC_DEVICE_FACTORS[match] : ELECTRONIC_DEVICE_FACTORS['Other'];
}

export function calculateActivityEmission(activity) {
  const { type, subtype, amount, deviceType } = activity;
  if (!EMISSION_FACTORS[type]) return 0;

  let factor;
  if (type === 'shopping' && subtype === 'electronics_item') {
    factor = getDeviceEmissionFactor(deviceType);
  } else {
    factor = EMISSION_FACTORS[type][subtype];
  }

  if (typeof factor !== 'number') return 0;
  return round2(factor * (Number(amount) || 0));
}

export function totalEmissions(activities) {
  return round2(activities.reduce((sum, a) => {
    if (typeof a.kgCO2e === 'number') {
      return sum + a.kgCO2e;
    }
    return sum + calculateActivityEmission(a);
  }, 0));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export const factors = EMISSION_FACTORS;
