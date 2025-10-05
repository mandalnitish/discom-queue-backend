// create-users.js
// Run this file to create initial users in MongoDB
// Place this file in the backend folder and run: node create-users.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/discom_queue';

// Staff Schema
const staffSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['staff', 'admin'], default: 'staff' },
  assignedCounter: Number,
  createdAt: { type: Date, default: Date.now }
});

const Staff = mongoose.model('Staff', staffSchema);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Create Users
async function createUsers() {
  try {
    console.log('\n🔄 Creating users...\n');

    // Check if users already exist
    const existingAdmin = await Staff.findOne({ employeeId: 'ADMIN001' });
    const existingStaff = await Staff.findOne({ employeeId: 'EMP001' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Deleting...');
      await Staff.deleteOne({ employeeId: 'ADMIN001' });
    }

    if (existingStaff) {
      console.log('⚠️  Staff user already exists. Deleting...');
      await Staff.deleteOne({ employeeId: 'EMP001' });
    }

    // Hash passwords
    console.log('🔐 Hashing passwords...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('password123', 10);

    // Create Admin User
    const admin = new Staff({
      employeeId: 'ADMIN001',
      name: 'Admin User',
      email: 'admin@discom.gov.in',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date()
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Employee ID: ADMIN001');
    console.log('   Password: admin123');
    console.log('   Role: admin\n');

    // Create Staff User
    const staff = new Staff({
      employeeId: 'EMP001',
      name: 'Demo Staff',
      email: 'staff@discom.gov.in',
      password: staffPassword,
      role: 'staff',
      assignedCounter: 2,
      createdAt: new Date()
    });

    await staff.save();
    console.log('✅ Staff user created successfully!');
    console.log('   Employee ID: EMP001');
    console.log('   Password: password123');
    console.log('   Role: staff');
    console.log('   Assigned Counter: 2\n');

    // Create additional staff members
    const additionalStaff = [
      {
        employeeId: 'EMP002',
        name: 'Priya Patel',
        email: 'priya@discom.gov.in',
        password: await bcrypt.hash('password123', 10),
        role: 'staff',
        assignedCounter: 1
      },
      {
        employeeId: 'EMP003',
        name: 'Amit Shah',
        email: 'amit@discom.gov.in',
        password: await bcrypt.hash('password123', 10),
        role: 'staff',
        assignedCounter: 3
      },
      {
        employeeId: 'EMP004',
        name: 'Meera Joshi',
        email: 'meera@discom.gov.in',
        password: await bcrypt.hash('password123', 10),
        role: 'staff',
        assignedCounter: 4
      }
    ];

    await Staff.insertMany(additionalStaff);
    console.log('✅ Additional staff members created!\n');

    // Display all users
    const allUsers = await Staff.find({}).select('-password');
    console.log('📋 All Users in Database:');
    console.table(allUsers.map(u => ({
      EmployeeID: u.employeeId,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Counter: u.assignedCounter || 'N/A'
    })));

    console.log('\n✅ SUCCESS! All users created successfully!');
    console.log('\n📝 You can now login with:');
    console.log('   Admin: ADMIN001 / admin123');
    console.log('   Staff: EMP001 / password123');
    console.log('   Staff: EMP002 / password123');
    console.log('   Staff: EMP003 / password123');
    console.log('   Staff: EMP004 / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
}

// Run the function
createUsers();