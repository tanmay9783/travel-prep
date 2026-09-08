

export const TEMPLATES = [
  {
    id: "blank",
    name: "Blank Trip",
    description: "Start from scratch.",
    items: [],
  },
  {
    id: "beach",
    name: "Beach Vacation",
    description: "Essentials for a beach holiday, including swimwear, sun protection, and electronics.",
    items: [
      { description: "T-Shirts", quantity: 4, category: "CLOTHING" },
      { description: "Shorts", quantity: 3, category: "CLOTHING" },
      { description: "Swimwear", quantity: 2, category: "CLOTHING" },
      { description: "Sunscreen", quantity: 1, category: "HEALTH" },
      { description: "Sunglasses", quantity: 1, category: "ACCESSORIES" },
      { description: "Beach Towel", quantity: 1, category: "MISC" },
      { description: "Flip Flops", quantity: 1, category: "CLOTHING" },
    ],
  },
  {
    id: "mountain",
    name: "Mountain Trip",
    description: "Gear for a cold or hiking trip.",
    items: [
      { description: "Warm Jacket", quantity: 1, category: "CLOTHING" },
      { description: "Hiking Boots", quantity: 1, category: "CLOTHING" },
      { description: "Thermal Underwear", quantity: 2, category: "CLOTHING" },
      { description: "Water Bottle", quantity: 1, category: "MISC" },
      { description: "First Aid Kit", quantity: 1, category: "HEALTH" },
    ],
  },
  {
    id: "business",
    name: "Business Trip",
    description: "Professional attire and work electronics.",
    items: [
      { description: "Suit / Formal Wear", quantity: 1, category: "CLOTHING" },
      { description: "Dress Shoes", quantity: 1, category: "CLOTHING" },
      { description: "Laptop", quantity: 1, category: "ELECTRONICS" },
      { description: "Chargers", quantity: 1, category: "ELECTRONICS" },
      { description: "Business Cards", quantity: 50, category: "DOCUMENTS" },
      { description: "Notebook & Pen", quantity: 1, category: "MISC" },
    ],
  },
  {
    id: "international",
    name: "International Trip",
    description: "Crucial documents and adapters for traveling abroad.",
    items: [
      { description: "Passport", quantity: 1, category: "DOCUMENTS" },
      { description: "Universal Power Adapter", quantity: 1, category: "ELECTRONICS" },
      { description: "Travel Insurance", quantity: 1, category: "DOCUMENTS" },
      { description: "Local Currency", quantity: 1, category: "MISC" },
      { description: "Medications", quantity: 1, category: "HEALTH" },
    ],
  },
  {
    id: "college",
    name: "College Trip",
    description: "Essentials for heading back to campus.",
    items: [
      { description: "Laptop", quantity: 1, category: "ELECTRONICS" },
      { description: "Notebooks", quantity: 3, category: "MISC" },
      { description: "Backpack", quantity: 1, category: "ACCESSORIES" },
      { description: "Comfortable Shoes", quantity: 2, category: "CLOTHING" },
      { description: "Snacks", quantity: 5, category: "FOOD" },
      { description: "Toiletries Bag", quantity: 1, category: "TOILETRIES" },
    ],
  },
  {
    id: "camping",
    name: "Camping Trip",
    description: "Gear and supplies for an outdoor adventure.",
    items: [
      { description: "Tent", quantity: 1, category: "MISC" },
      { description: "Sleeping Bag", quantity: 1, category: "MISC" },
      { description: "Flashlight", quantity: 1, category: "ELECTRONICS" },
      { description: "Bug Spray", quantity: 1, category: "HEALTH" },
      { description: "Warm Layers", quantity: 3, category: "CLOTHING" },
      { description: "Trail Mix", quantity: 2, category: "FOOD" },
    ],
  }
];
