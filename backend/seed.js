import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Admin from './models/Admin.js';
import Product from './models/Product.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding data...');

    // Create admin user if not exists
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@chocolateapp.com' });

    if (!adminExists) {
      await Admin.create({
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@chocolateapp.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'superadmin',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Seed products if database is empty
    const productCount = await Product.countDocuments();

    if (productCount === 0) {
      const products = [
        {
          name: 'Dark Chocolate Bar',
          description: '70% cacao dark chocolate with rich, intense flavor',
          price: 415,
          image: '🍫',
          category: 'Bars',
          rating: 4.5,
          inStock: true,
          stock: 100,
          weight: '100g',
          ingredients: ['Cocoa beans', 'Sugar', 'Cocoa butter'],
        },
        {
          name: 'Milk Chocolate Truffles',
          description: 'Creamy milk chocolate truffles with smooth filling',
          price: 829,
          image: '🍬',
          category: 'Truffles',
          rating: 4.8,
          inStock: true,
          stock: 80,
          weight: '200g',
          ingredients: ['Milk chocolate', 'Cream', 'Butter'],
        },
        {
          name: 'White Chocolate Fudge',
          description: 'Sweet white chocolate fudge with vanilla notes',
          price: 539,
          image: '🍫',
          category: 'Fudge',
          rating: 4.2,
          inStock: true,
          stock: 60,
          weight: '150g',
          ingredients: ['White chocolate', 'Condensed milk', 'Vanilla'],
        },
        {
          name: 'Hazelnut Pralines',
          description: 'Whole hazelnuts in sweet chocolate coating',
          price: 746,
          image: '🌰',
          category: 'Pralines',
          rating: 4.7,
          inStock: true,
          stock: 90,
          weight: '180g',
          ingredients: ['Hazelnuts', 'Milk chocolate', 'Sugar'],
        },
        {
          name: 'Strawberry Chocolate',
          description: 'Fresh strawberries dipped in premium chocolate',
          price: 1078,
          image: '🍓',
          category: 'Fruits',
          rating: 4.9,
          inStock: true,
          stock: 40,
          weight: '250g',
          ingredients: ['Strawberries', 'Dark chocolate'],
        },
        {
          name: 'Salted Caramel Chocolates',
          description: 'Smooth caramel with sea salt in milk chocolate',
          price: 663,
          image: '🍯',
          category: 'Caramels',
          rating: 4.6,
          inStock: true,
          stock: 70,
          weight: '120g',
          ingredients: ['Caramel', 'Sea salt', 'Milk chocolate'],
        },
        {
          name: 'Orange Dark Chocolates',
          description: 'Dark chocolate with zesty orange flavor',
          price: 497,
          image: '🍊',
          category: 'Flavored',
          rating: 4.4,
          inStock: true,
          stock: 85,
          weight: '100g',
          ingredients: ['Dark chocolate', 'Orange essence'],
        },
        {
          name: 'Almond Chocolate Bar',
          description: 'Dark chocolate with roasted almonds',
          price: 456,
          image: '🥜',
          category: 'Bars',
          rating: 4.3,
          inStock: true,
          stock: 95,
          weight: '100g',
          ingredients: ['Dark chocolate', 'Roasted almonds'],
        },
      ];

      await Product.insertMany(products);
      console.log('✅ Products seeded successfully');
    } else {
      console.log('ℹ️  Products already exist');
    }

    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
