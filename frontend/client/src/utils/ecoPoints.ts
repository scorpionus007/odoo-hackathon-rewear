// Eco Points Calculation System
// Based on material weightage and condition multipliers

export const MATERIAL_WEIGHTAGE = {
  'cotton': 1.00,
  'organic-cotton': 1.10,
  'wool': 1.20,
  'silk': 1.25,
  'linen': 0.90,
  'polyester': 1.30,
  'nylon': 1.25,
  'rayon': 1.10,
  'hemp': 0.80,
  'bamboo': 0.85,
  'leather': 1.40,
  'denim': 1.15,
  'acrylic': 1.20,
  'other': 1.00,
} as const;

export const CONDITION_MULTIPLIERS = {
  'new': 1.0,
  'like-new': 0.9,
  'good': 0.7,
  'fair': 0.5,
  'worn': 0.3,
} as const;

export const CATEGORY_ENVIRONMENTAL_IMPACT = {
  'tops': { carbon: 3.0, water: 2700 },
  'bottoms': { carbon: 4.5, water: 3200 },
  'dresses': { carbon: 5.2, water: 3800 },
  'outerwear': { carbon: 8.5, water: 4500 },
  'shoes': { carbon: 6.3, water: 2100 },
  'accessories': { carbon: 1.8, water: 1200 },
} as const;

export function calculateEcoPoints(
  material: keyof typeof MATERIAL_WEIGHTAGE,
  condition: keyof typeof CONDITION_MULTIPLIERS
): number {
  const basePoints = 100;
  const materialWeight = MATERIAL_WEIGHTAGE[material];
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition];
  
  return Math.round(basePoints * materialWeight * conditionMultiplier);
}

export function calculateEnvironmentalImpact(
  category: keyof typeof CATEGORY_ENVIRONMENTAL_IMPACT,
  material: keyof typeof MATERIAL_WEIGHTAGE,
  condition: keyof typeof CONDITION_MULTIPLIERS
) {
  const baseImpact = CATEGORY_ENVIRONMENTAL_IMPACT[category];
  const materialWeight = MATERIAL_WEIGHTAGE[material];
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition];
  
  return {
    carbonSaved: Math.round(baseImpact.carbon * materialWeight * conditionMultiplier * 10) / 10,
    waterSaved: Math.round(baseImpact.water * materialWeight * conditionMultiplier),
    wasteReduced: Math.round(2.5 * materialWeight * conditionMultiplier * 10) / 10,
  };
}

export function getMaterialLabel(material: keyof typeof MATERIAL_WEIGHTAGE): string {
  const labels = {
    'cotton': 'Cotton',
    'organic-cotton': 'Organic Cotton',
    'wool': 'Wool',
    'silk': 'Silk',
    'linen': 'Linen',
    'polyester': 'Polyester',
    'nylon': 'Nylon',
    'rayon': 'Rayon/Viscose',
    'hemp': 'Hemp',
    'bamboo': 'Bamboo',
    'leather': 'Leather',
    'denim': 'Denim',
    'acrylic': 'Acrylic',
    'other': 'Other',
  };
  return labels[material];
}

export function getConditionLabel(condition: keyof typeof CONDITION_MULTIPLIERS): string {
  const labels = {
    'new': 'New',
    'like-new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'worn': 'Worn',
  };
  return labels[condition];
}