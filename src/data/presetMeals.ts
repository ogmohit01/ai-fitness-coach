import { MealItem } from '../types/fitness';

export const PRESET_MEALS: MealItem[] = [
  {
    id: 'meal-besan-chilla-paneer',
    title: 'High-Protein Paneer Besan Chilla with Mint Chutney',
    subtitle: 'Indian Savory Gram Flour Crepe stuffed with Spiced Paneer',
    mealType: 'Breakfast',
    calories: 410,
    proteinG: 32,
    carbsG: 44,
    fatG: 12,
    prepTimeMinutes: 12,
    servingSize: '2 Chillas (150g Crumbled Low-Fat Paneer)',
    ingredients: [
      '60g Besan (Bengal Gram Flour)',
      '120g Fresh Low-Fat Paneer (crumbled/grated)',
      '1/2 cup finely diced Onions, Tomatoes, Green Chillies',
      'Fresh Coriander, Carom Seeds (Ajwain), Turmeric, Cumin',
      '1 tsp Cold-Pressed Mustard Oil or Desi Ghee'
    ],
    instructions: 'Whisk besan batter with water, carom seeds, and spices. Spread thinly on a pre-heated iron griddle. Layer with spiced crumbled paneer and fold. Serve with fresh mint-yogurt chutney.',
    desiSuperfoodTag: 'Ajwain (Aids Digestion) + Vegetarian High Protein'
  },
  {
    id: 'meal-soya-roti-dahi',
    title: 'Nutri-Soya Chunks Masala with 2 Whole Wheat Rotis & Curd',
    subtitle: 'High Biological Value Plant Protein Feast',
    mealType: 'Lunch',
    calories: 520,
    proteinG: 46,
    carbsG: 58,
    fatG: 10,
    prepTimeMinutes: 20,
    servingSize: '1 Bowl Soya Curry + 2 Rotis + 150g Fresh Curd',
    ingredients: [
      '60g Soya Chunks (boiled & rinsed thoroughly)',
      '2 Whole Wheat Rotis (lightly toasted without excess oil)',
      '150g Fresh Probiotic Curd (Dahi) topped with roasted cumin',
      'Tomato-onion ginger garlic gravy with warm garam masala',
      'Fresh cucumber & tomato salad'
    ],
    instructions: 'Soya chunks offer an exceptional 52g protein per 100g. Simmer boiled chunks in a spiced onion-tomato curry. Pair with 2 rotis and probiotic curd for a complete essential amino acid profile.',
    desiSuperfoodTag: '52% Protein Density (King of Plant Protein)'
  },
  {
    id: 'meal-sattu-anabolic-shake',
    title: 'Roasted Chana Sattu Energy & Protein Elixir',
    subtitle: 'Indigenous Indian Super-Shake for Natural Glycogen & Electrolytes',
    mealType: 'Post-Workout Fuel',
    calories: 290,
    proteinG: 22,
    carbsG: 38,
    fatG: 5,
    prepTimeMinutes: 3,
    servingSize: '1 Tall Glass (350ml)',
    ingredients: [
      '50g Roasted Chana Sattu (Ground Bengal Gram Flour)',
      '300ml Chilled Earthen Pot (Matka) Water',
      '1/2 Fresh Lemon Juice',
      'Roasted Cumin Powder (Bhuna Jeera) & Himalayan Black Salt (Kala Namak)',
      'Optional: 1 tbsp fresh chopped mint leaves'
    ],
    instructions: 'Whisk sattu into chilled water with black salt, lemon, and roasted cumin until smooth. India’s indigenous post-workout superfood for fast hydration, electrolytes, and sustained amino acid delivery.',
    desiSuperfoodTag: 'Natural Indian Electrolytes & Low GI Carbohydrates'
  },
  {
    id: 'meal-dal-paneer-khichdi',
    title: 'Moong Dal Khichdi with Grilled Paneer & Pure Cow Ghee',
    subtitle: 'Nourishing Recovery Dinner with Anti-Inflammatory Tadka',
    mealType: 'Dinner',
    calories: 460,
    proteinG: 30,
    carbsG: 54,
    fatG: 13,
    prepTimeMinutes: 25,
    servingSize: '1 Warm Bowl Khichdi + 100g Pan-Seared Paneer',
    ingredients: [
      '40g Yellow Split Moong Dal + 40g Brown Rice',
      '100g Pan-seared Low-Fat Paneer cubes sprinkled with chaat masala',
      '1 tsp Pure Desi A2 Cow Ghee',
      'Cumin (Jeera) and Asafoetida (Hing) tempering',
      '1 tsp Vitamin-C rich Amla (Indian Gooseberry) chutney'
    ],
    instructions: 'Pressure cook split moong dal and rice with turmeric and sea salt. Temper with cumin and hing in 1 tsp pure desi ghee. Serve hot alongside grilled paneer for overnight tissue recovery.',
    desiSuperfoodTag: 'A2 Cow Ghee (Gut Lining & CLA) + Amla Superfood'
  }
];
