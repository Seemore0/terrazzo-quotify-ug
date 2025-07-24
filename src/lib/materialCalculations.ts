export interface MaterialItem {
  id: string;
  item: string;
  quantity: string;
  price: number;
  total: number;
}

export const MATERIAL_UNIT_PRICES = {
  casting: {
    'Stones floor white': { unit: 'bag', price: 15000 },
    'Stones floor black': { unit: 'bag', price: 13000 },
    'Stones floor red': { unit: 'bag', price: 13000 },
    'Stones skirting white': { unit: 'bag', price: 15000 },
    'Stones skirting black': { unit: 'bag', price: 13000 },
    'Stones skirting red': { unit: 'bag', price: 13000 },
    'Stips': { unit: 'bundle', price: 60000 },
    'Soft brush': { unit: 'each', price: 12000 },
    'Black oxide': { unit: 'kg', price: 15000 },
    'Concrete nails': { unit: 'box', price: 5000 },
    'Wooden strips': { unit: 'each', price: 1000 },
    'Ordinary cement': { unit: 'bag', price: 33000 },
    'White cement': { unit: 'bag', price: 65000 }
  },
  grinding: {
    'Big machine diamond pads': { unit: 'set', price: 150000 },
    'Grinder diamond pads': { unit: 'piece', price: 60000 },
    'Pads 50 grit': { unit: 'pad', price: 20000 },
    'Pads 100 grit': { unit: 'pad', price: 20000 },
    'Pads 200 grit': { unit: 'pad', price: 20000 },
    'Pads 300 grit': { unit: 'pad', price: 20000 },
    'Pads 400 grit': { unit: 'pad', price: 20000 },
    'Pads 500 grit': { unit: 'pad', price: 20000 },
    'Grinder pad holder': { unit: 'each', price: 15000 },
    'Machine pad holder': { unit: 'each', price: 15000 },
    'Squeezer': { unit: 'each', price: 10000 },
    'Polish': { unit: 'liter', price: 20000 },
    'Maintainer': { unit: 'liter', price: 10000 }
  }
};

export const calculateCastingMaterials = (area: number): MaterialItem[] => {
  // Stones (Floor)
  const totalStones = area / 2;
  const whiteStones = totalStones * (5 / 7);
  const coloredStones = totalStones * (2 / 7);
  const blackStones = coloredStones * (14 / 24);
  const redStones = coloredStones * (10 / 24);

  // Stones (Skirting)
  const totalSkirtingStones = area / 3.33;
  const whiteSkirtingStones = totalSkirtingStones * (5 / 7);
  const coloredSkirtingStones = totalSkirtingStones * (2 / 7);
  const blackSkirtingStones = coloredSkirtingStones * (11 / 24);
  const redSkirtingStones = coloredSkirtingStones * (4 / 24);

  // Cement
  const ordinaryCement = totalStones / 2;
  const whiteCement = area / 8;

  // Other Materials
  const woodenStrips = area / 2.67;
  const stips = area / 26.67;
  const softBrush = area / 16;
  const blackOxide = area * 0.25;
  const concreteNails = area / 26.67;

  return [
    { 
      id: 'casting-stones-floor-white', 
      item: 'Stones floor white', 
      quantity: `${Math.ceil(whiteStones)} bag's`, 
      price: MATERIAL_UNIT_PRICES.casting['Stones floor white'].price, 
      total: Math.ceil(whiteStones) * MATERIAL_UNIT_PRICES.casting['Stones floor white'].price 
    },
    { 
      id: 'casting-stones-floor-black', 
      item: 'Stones floor black', 
      quantity: `${Math.ceil(blackStones)} bag's`, 
      price: MATERIAL_UNIT_PRICES.casting['Stones floor black'].price, 
      total: Math.ceil(blackStones) * MATERIAL_UNIT_PRICES.casting['Stones floor black'].price 
    },
    { 
      id: 'casting-stones-floor-red', 
      item: 'Stones floor red', 
      quantity: `${Math.ceil(redStones)} bag's`, 
      price: MATERIAL_UNIT_PRICES.casting['Stones floor red'].price, 
      total: Math.ceil(redStones) * MATERIAL_UNIT_PRICES.casting['Stones floor red'].price 
    },
    { 
      id: 'casting-stones-skirting-white', 
      item: 'Stones skirting white', 
      quantity: `${Math.ceil(whiteSkirtingStones)} bag's`, 
      price: MATERIAL_UNIT_PRICES.casting['Stones skirting white'].price, 
      total: Math.ceil(whiteSkirtingStones) * MATERIAL_UNIT_PRICES.casting['Stones skirting white'].price 
    },
    { 
      id: 'casting-stones-skirting-black', 
      item: 'Stones skirting black', 
      quantity: `${Math.ceil(blackSkirtingStones)} bag's`, 
      price: MATERIAL_UNIT_PRICES.casting['Stones skirting black'].price, 
      total: Math.ceil(blackSkirtingStones) * MATERIAL_UNIT_PRICES.casting['Stones skirting black'].price 
    },
    { 
      id: 'casting-stones-skirting-red', 
      item: 'Stones skirting red', 
      quantity: `${Math.ceil(redSkirtingStones)} bag's`, 
      price: MATERIAL_UNIT_PRICES.casting['Stones skirting red'].price, 
      total: Math.ceil(redSkirtingStones) * MATERIAL_UNIT_PRICES.casting['Stones skirting red'].price 
    },
    { 
      id: 'casting-stips', 
      item: 'Stips', 
      quantity: `${Math.ceil(stips)} bundles`, 
      price: MATERIAL_UNIT_PRICES.casting['Stips'].price, 
      total: Math.ceil(stips) * MATERIAL_UNIT_PRICES.casting['Stips'].price 
    },
    { 
      id: 'casting-soft-brush', 
      item: 'Soft brush', 
      quantity: `${Math.ceil(softBrush)}`, 
      price: MATERIAL_UNIT_PRICES.casting['Soft brush'].price, 
      total: Math.ceil(softBrush) * MATERIAL_UNIT_PRICES.casting['Soft brush'].price 
    },
    { 
      id: 'casting-black-oxide', 
      item: 'Black oxide', 
      quantity: `${Math.ceil(blackOxide)}kg`, 
      price: MATERIAL_UNIT_PRICES.casting['Black oxide'].price, 
      total: Math.ceil(blackOxide) * MATERIAL_UNIT_PRICES.casting['Black oxide'].price 
    },
    { 
      id: 'casting-concrete-nails', 
      item: 'concrete nails', 
      quantity: `${Math.ceil(concreteNails)} boxs`, 
      price: MATERIAL_UNIT_PRICES.casting['Concrete nails'].price, 
      total: Math.ceil(concreteNails) * MATERIAL_UNIT_PRICES.casting['Concrete nails'].price 
    },
    { 
      id: 'casting-wooden-strips', 
      item: 'Wooden stips', 
      quantity: `${Math.ceil(woodenStrips)}`, 
      price: MATERIAL_UNIT_PRICES.casting['Wooden strips'].price, 
      total: Math.ceil(woodenStrips) * MATERIAL_UNIT_PRICES.casting['Wooden strips'].price 
    },
    { 
      id: 'casting-ordinary-cement', 
      item: 'Ordinary cement', 
      quantity: `${Math.ceil(ordinaryCement)} bag's`, 
      price: MATERIAL_UNIT_PRICES.casting['Ordinary cement'].price, 
      total: Math.ceil(ordinaryCement) * MATERIAL_UNIT_PRICES.casting['Ordinary cement'].price 
    },
    { 
      id: 'casting-white-cement', 
      item: 'White cement', 
      quantity: `${Math.ceil(whiteCement)} bag's`, 
      price: MATERIAL_UNIT_PRICES.casting['White cement'].price, 
      total: Math.ceil(whiteCement) * MATERIAL_UNIT_PRICES.casting['White cement'].price 
    }
  ];
};

export const calculateGrindingMaterials = (area: number): MaterialItem[] => {
  const bigMachineDiamondPads = area / 115;
  const grinderDiamondPads = area / 115;
  const pads50Grit = area / 77;
  const pads100to400Grit = area / 115;
  const pads500Grit = area / 230;
  const grinderPadHolders = area / 57.5;
  const machinePadHolders = area / 57.5;
  const squeezer = area / 76.7;
  const polish = area * 0.087;
  const maintainer = area * 0.174;

  return [
    { 
      id: 'grinding-big-machine-diamond', 
      item: 'Big machine Diamond', 
      quantity: `${Math.ceil(bigMachineDiamondPads)} sets`, 
      price: MATERIAL_UNIT_PRICES.grinding['Big machine diamond pads'].price, 
      total: Math.ceil(bigMachineDiamondPads) * MATERIAL_UNIT_PRICES.grinding['Big machine diamond pads'].price 
    },
    { 
      id: 'grinding-grinder-diamond', 
      item: 'Grinder Diamond', 
      quantity: `${Math.ceil(grinderDiamondPads)} pisces`, 
      price: MATERIAL_UNIT_PRICES.grinding['Grinder diamond pads'].price, 
      total: Math.ceil(grinderDiamondPads) * MATERIAL_UNIT_PRICES.grinding['Grinder diamond pads'].price 
    },
    { 
      id: 'grinding-pads-50', 
      item: 'Pads 50(2*)', 
      quantity: `${Math.ceil(pads50Grit)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Pads 50 grit'].price, 
      total: Math.ceil(pads50Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 50 grit'].price 
    },
    { 
      id: 'grinding-pads-100', 
      item: 'Pads 100(2*)', 
      quantity: `${Math.ceil(pads100to400Grit)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Pads 100 grit'].price, 
      total: Math.ceil(pads100to400Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 100 grit'].price 
    },
    { 
      id: 'grinding-pads-200', 
      item: 'Pads 200(2*)', 
      quantity: `${Math.ceil(pads100to400Grit)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Pads 200 grit'].price, 
      total: Math.ceil(pads100to400Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 200 grit'].price 
    },
    { 
      id: 'grinding-pads-300', 
      item: 'Pads 300(2*)', 
      quantity: `${Math.ceil(pads100to400Grit)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Pads 300 grit'].price, 
      total: Math.ceil(pads100to400Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 300 grit'].price 
    },
    { 
      id: 'grinding-pads-400', 
      item: 'Pads 400(2*)', 
      quantity: `${Math.ceil(pads100to400Grit)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Pads 400 grit'].price, 
      total: Math.ceil(pads100to400Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 400 grit'].price 
    },
    { 
      id: 'grinding-pads-500', 
      item: 'Pads 500(2*)', 
      quantity: `${Math.ceil(pads500Grit)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Pads 500 grit'].price, 
      total: Math.ceil(pads500Grit) * MATERIAL_UNIT_PRICES.grinding['Pads 500 grit'].price 
    },
    { 
      id: 'grinding-grinder-pad-holder', 
      item: 'Grinder Pad holder', 
      quantity: `${Math.ceil(grinderPadHolders)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Grinder pad holder'].price, 
      total: Math.ceil(grinderPadHolders) * MATERIAL_UNIT_PRICES.grinding['Grinder pad holder'].price 
    },
    { 
      id: 'grinding-machine-pad-holder', 
      item: 'Machine Pad holder', 
      quantity: `${Math.ceil(machinePadHolders)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Machine pad holder'].price, 
      total: Math.ceil(machinePadHolders) * MATERIAL_UNIT_PRICES.grinding['Machine pad holder'].price 
    },
    { 
      id: 'grinding-squeezer', 
      item: 'Squeezer', 
      quantity: `${Math.ceil(squeezer)}`, 
      price: MATERIAL_UNIT_PRICES.grinding['Squeezer'].price, 
      total: Math.ceil(squeezer) * MATERIAL_UNIT_PRICES.grinding['Squeezer'].price 
    },
    { 
      id: 'grinding-polish', 
      item: 'Polish', 
      quantity: `${Math.ceil(polish)} L`, 
      price: MATERIAL_UNIT_PRICES.grinding['Polish'].price, 
      total: Math.ceil(polish) * MATERIAL_UNIT_PRICES.grinding['Polish'].price 
    },
    { 
      id: 'grinding-maintainer', 
      item: 'Maintainer', 
      quantity: `${Math.ceil(maintainer)} L`, 
      price: MATERIAL_UNIT_PRICES.grinding['Maintainer'].price, 
      total: Math.ceil(maintainer) * MATERIAL_UNIT_PRICES.grinding['Maintainer'].price 
    }
  ];
};
