// Dummy chocolate products data
export const chocolateProducts = [
  {
    id: '1',
    name: 'Dark Chocolate Bar',
    description: '70% cacao dark chocolate with rich, intense flavor',
    price: 415, // ~$4.99 * 83
    image: '🍫',
    category: 'Bars',
    rating: 4.5,
    inStock: true,
  },
  {
    id: '2',
    name: 'Milk Chocolate Truffles',
    description: 'Creamy milk chocolate truffles with smooth filling',
    price: 829, // ~$9.99 * 83
    image: '🍬',
    category: 'Truffles',
    rating: 4.8,
    inStock: true,
  },
  {
    id: '3',
    name: 'White Chocolate Fudge',
    description: 'Sweet white chocolate fudge with vanilla notes',
    price: 539, // ~$6.49 * 83
    image: '🍫',
    category: 'Fudge',
    rating: 4.2,
    inStock: true,
  },
  {
    id: '4',
    name: 'Hazelnut Pralines',
    description: 'Whole hazelnuts in sweet chocolate coating',
    price: 746, // ~$8.99 * 83
    image: '🌰',
    category: 'Pralines',
    rating: 4.7,
    inStock: true,
  },
  {
    id: '5',
    name: 'Strawberry Chocolate',
    description: 'Fresh strawberries dipped in premium chocolate',
    price: 1078, // ~$12.99 * 83
    image: '🍓',
    category: 'Fruits',
    rating: 4.9,
    inStock: false,
  },
  {
    id: '6',
    name: 'Salted Caramel Chocolates',
    description: 'Smooth caramel with sea salt in milk chocolate',
    price: 663, // ~$7.99 * 83
    image: '🍯',
    category: 'Caramels',
    rating: 4.6,
    inStock: true,
  },
  {
    id: '7',
    name: 'Orange Dark Chocolates',
    description: 'Dark chocolate with zesty orange flavor',
    price: 497, // ~$5.99 * 83
    image: '🍊',
    category: 'Flavored',
    rating: 4.4,
    inStock: true,
  },
  {
    id: '8',
    name: 'Almond Chocolate Bar',
    description: 'Dark chocolate with roasted almonds',
    price: 456, // ~$5.49 * 83
    image: '🥜',
    category: 'Bars',
    rating: 4.3,
    inStock: true,
  },
];

// Dummy user data
export const dummyUsers = [
  {
    id: '1',
    name: 'John Doe',
    mobile: '1234567890',
    email: 'john@example.com',
    address: '123 Main St, New York, NY',
    orders: ['101', '102', '103'],
  },
  {
    id: '2',
    name: 'Jane Smith',
    mobile: '9876543210',
    email: 'jane@example.com',
    address: '456 Oak Ave, Los Angeles, CA',
    orders: ['104', '105'],
  },
  {
    id: '3',
    name: 'Bob Johnson',
    mobile: '5551234567',
    email: 'bob@example.com',
    address: '789 Pine Rd, Chicago, IL',
    orders: ['106'],
  },
];

// Dummy order data
export const dummyOrders = [
  {
    id: '101',
    userId: '1',
    products: ['1', '2'],
    total: 1244, // ~$14.98 * 83
    date: '2023-05-15',
    status: 'Delivered',
  },
  {
    id: '102',
    userId: '1',
    products: ['4'],
    total: 746, // ~$8.99 * 83
    date: '2023-06-20',
    status: 'Delivered',
  },
  {
    id: '103',
    userId: '1',
    products: ['6', '7'],
    total: 1160, // ~$13.98 * 83
    date: '2023-07-10',
    status: 'Processing',
  },
  {
    id: '104',
    userId: '2',
    products: ['3', '5'],
    total: 1617, // ~$19.48 * 83
    date: '2023-08-05',
    status: 'Shipped',
  },
  {
    id: '105',
    userId: '2',
    products: ['8'],
    total: 456, // ~$5.49 * 83
    date: '2023-09-12',
    status: 'Delivered',
  },
  {
    id: '106',
    userId: '3',
    products: ['1', '6', '8'],
    total: 1568, // ~$18.47 * 83
    date: '2023-10-18',
    status: 'Delivered',
  },
];

// Categories
export const categories = [
  { id: '1', name: 'Bars', icon: '🍫' },
  { id: '2', name: 'Truffles', icon: '🍬' },
  { id: '3', name: 'Fudge', icon: '🍮' },
  { id: '4', name: 'Pralines', icon: '🌰' },
  { id: '5', name: 'Fruits', icon: '🍓' },
  { id: '6', name: 'Caramels', icon: '🍯' },
  { id: '7', name: 'Flavored', icon: '🍊' },
];