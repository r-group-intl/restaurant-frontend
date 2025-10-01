// Unit conversion utility for recipe management
// Base units: kg, l, pcs

const UNIT_CONVERSIONS = {
  // Weight conversions (base unit: kg)
  weight: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.453592,
    oz: 0.0283495
  },
  
  // Volume conversions (base unit: l)
  volume: {
    l: 1,
    ml: 0.001,
    cl: 0.01,
    dl: 0.1,
    cup: 0.236588,
    tbsp: 0.0147868,
    tsp: 0.00492892,
    gallon: 3.78541,
    quart: 0.946353,
    pint: 0.473176,
    'fl oz': 0.0295735
  },
  
  // Count/piece units (base unit: pcs)
  count: {
    pcs: 1,
    pc: 1,
    piece: 1,
    pieces: 1,
    item: 1,
    items: 1,
    unit: 1,
    units: 1,
    each: 1,
    dozen: 12,
    pack: 1,
    packs: 1,
    box: 1,
    boxes: 1
  }
};

// Determine the category of a unit
export const getUnitCategory = (unit) => {
  const normalizedUnit = unit.toLowerCase();
  
  if (UNIT_CONVERSIONS.weight[normalizedUnit]) {
    return 'weight';
  } else if (UNIT_CONVERSIONS.volume[normalizedUnit]) {
    return 'volume';
  } else if (UNIT_CONVERSIONS.count[normalizedUnit]) {
    return 'count';
  }
  
  return null;
};

// Convert quantity from one unit to another
export const convertUnit = (quantity, fromUnit, toUnit) => {
  const fromUnitLower = fromUnit.toLowerCase();
  const toUnitLower = toUnit.toLowerCase();
  
  // If units are the same, no conversion needed
  if (fromUnitLower === toUnitLower) {
    return quantity;
  }
  
  const fromCategory = getUnitCategory(fromUnitLower);
  const toCategory = getUnitCategory(toUnitLower);
  
  // Units must be from the same category
  if (!fromCategory || !toCategory || fromCategory !== toCategory) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit} - incompatible unit types`);
  }
  
  const conversions = UNIT_CONVERSIONS[fromCategory];
  
  // Convert to base unit first, then to target unit
  const baseQuantity = quantity * conversions[fromUnitLower];
  const convertedQuantity = baseQuantity / conversions[toUnitLower];
  
  return convertedQuantity;
};

// Calculate cost based on unit conversion
export const calculateConvertedCost = (recipeQuantity, recipeUnit, stockQuantity, stockUnit, stockPrice) => {
  try {
    // Convert recipe quantity to stock unit for cost calculation
    const convertedQuantity = convertUnit(recipeQuantity, recipeUnit, stockUnit);
    const totalCost = convertedQuantity * stockPrice;
    
    return {
      success: true,
      convertedQuantity,
      totalCost,
      conversionRatio: convertedQuantity / recipeQuantity,
      unitCost: totalCost / recipeQuantity // Cost per recipe unit
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      convertedQuantity: 0,
      totalCost: 0,
      conversionRatio: 0,
      unitCost: 0
    };
  }
};

// Get compatible units for a given unit
export const getCompatibleUnits = (baseUnit) => {
  const category = getUnitCategory(baseUnit.toLowerCase());
  if (!category) return [];
  
  return Object.keys(UNIT_CONVERSIONS[category]);
};

// Format unit display with proper capitalization
export const formatUnit = (unit) => {
  const unitMap = {
    'kg': 'kg',
    'g': 'g',
    'mg': 'mg',
    'lb': 'lb',
    'oz': 'oz',
    'l': 'L',
    'ml': 'mL',
    'cl': 'cL',
    'dl': 'dL',
    'cup': 'cup',
    'tbsp': 'tbsp',
    'tsp': 'tsp',
    'gallon': 'gallon',
    'quart': 'quart',
    'pint': 'pint',
    'fl oz': 'fl oz',
    'pcs': 'pcs',
    'pc': 'pc',
    'piece': 'piece',
    'pieces': 'pieces',
    'item': 'item',
    'items': 'items',
    'unit': 'unit',
    'units': 'units',
    'each': 'each',
    'dozen': 'dozen',
    'pack': 'pack',
    'packs': 'packs',
    'box': 'box',
    'boxes': 'boxes'
  };
  
  return unitMap[unit.toLowerCase()] || unit;
};

// Helper function to suggest appropriate units for common ingredients
export const suggestUnitsForIngredient = (ingredientName) => {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('flour') || name.includes('sugar') || name.includes('salt') || 
      name.includes('spice') || name.includes('powder') || name.includes('paprika')) {
    return ['g', 'kg', 'tsp', 'tbsp', 'cup'];
  } else if (name.includes('oil') || name.includes('milk') || name.includes('water') || 
             name.includes('juice') || name.includes('sauce')) {
    return ['ml', 'l', 'cup', 'tbsp', 'tsp'];
  } else if (name.includes('egg') || name.includes('onion') || name.includes('tomato')) {
    return ['pcs', 'each', 'unit'];
  }
  
  return ['g', 'kg', 'ml', 'l', 'pcs', 'cup', 'tbsp', 'tsp'];
};