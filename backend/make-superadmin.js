import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

// Load environment variables
dotenv.config();

const makeSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chocolateapp');
    console.log('✅ Connected to MongoDB');

    const mobile = '1234512346';

    // Find admin by mobile
    const admin = await Admin.findOne({ mobile });

    if (!admin) {
      console.log(`❌ Admin with mobile ${mobile} not found. Creating new superadmin...`);
      
      // Create new superadmin
      const newAdmin = await Admin.create({
        name: 'Super Admin',
        email: `superadmin${mobile}@chocolateapp.com`,
        mobile: mobile,
        password: 'SuperAdmin@123456', // Default password - should be changed
        role: 'superadmin',
        isActive: true,
      });

      console.log(`✅ Superadmin created successfully!`);
      console.log(`   Name: ${newAdmin.name}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Mobile: ${newAdmin.mobile}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log(`   Password: SuperAdmin@123456 (Please change this!)`);
    } else {
      // Update existing admin to superadmin
      admin.role = 'superadmin';
      admin.isActive = true;
      await admin.save();

      console.log(`✅ Admin updated to superadmin successfully!`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Mobile: ${admin.mobile}`);
      console.log(`   Role: ${admin.role} (updated)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

makeSuperAdmin();
