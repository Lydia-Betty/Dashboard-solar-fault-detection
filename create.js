// Use CommonJS syntax for a standalone script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User schema directly
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create admin user
    const username = 'admin';
    const password = 'admin123';
    const email = 'admin@example.com';
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: true
    });

    console.log('\nAdmin user created successfully!');
    console.log('------------------------------');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('------------------------------');
  } catch (error) {
    console.error('Error creating user:', error.message);
    if (error.code === 11000) {
      console.log('User already exists in database');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createUser();