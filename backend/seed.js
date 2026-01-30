import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Admin from './models/Admin.js';
import Product from './models/Product.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    

    // Create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@chocolateapp.com';
    const adminMobile = process.env.ADMIN_MOBILE || null;
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (!adminExists) {
      const adminData = {
        name: 'Admin User',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'superadmin',
      };

      // Add mobile if provided
      if (adminMobile && /^[0-9]{10}$/.test(adminMobile)) {
        adminData.mobile = adminMobile;
      }

      await Admin.create(adminData);
    
      if (adminMobile) {
        
      }
    } else {
     
      // Update mobile if provided and not already set
      if (adminMobile && /^[0-9]{10}$/.test(adminMobile) && !adminExists.mobile) {
        adminExists.mobile = adminMobile;
        await adminExists.save();
      
      }
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
     
    } else {
     
    }

    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
