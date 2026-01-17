import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Admin from './models/Admin.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const { name, email, password } = process.argv.slice(2).reduce((acc, arg, index, arr) => {
      if (arg.startsWith('--')) {
        const nextValue = arr[index + 1];
        if (nextValue && !nextValue.startsWith('--')) {
          acc[arg.replace('--', '')] = nextValue;
        }
      }
      return acc;
    }, {});

    if (!name || !email || !password) {
      console.log('Usage: node create-admin.js --name "Admin Name" --email "admin@example.com" --password "SecurePassword123"');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      console.log(`❌ Admin with email ${email} already exists`);
      process.exit(1);
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: 'admin', // Default role, can be 'admin' or 'superadmin'
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();