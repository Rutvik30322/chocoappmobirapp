import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Admin from './models/Admin.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const { name, email, mobile, password } = process.argv.slice(2).reduce((acc, arg, index, arr) => {
      if (arg.startsWith('--')) {
        const nextValue = arr[index + 1];
        if (nextValue && !nextValue.startsWith('--')) {
          acc[arg.replace('--', '')] = nextValue;
        }
      }
      return acc;
    }, {});

    if (!name || !email || !password) {
    
      process.exit(1);
    }

    // Validate mobile format if provided
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
    
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [{ email }, ...(mobile ? [{ mobile }] : [])]
    });
    
    if (existingAdmin) {
      console.error(`❌ Admin with email ${email}${mobile ? ` or mobile ${mobile}` : ''} already exists`);
      process.exit(1);
    }

    // Create new admin
    const adminData = {
      name,
      email,
      password,
      role: 'admin', // Default role, can be 'admin' or 'superadmin'
    };

    if (mobile) {
      adminData.mobile = mobile;
    }

    const admin = await Admin.create(adminData);

    
    if (admin.mobile) {
     
    }
  

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();