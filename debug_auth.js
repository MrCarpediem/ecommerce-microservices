const mongoose = require('mongoose');
const MONGO_URI = 'process.env.MONGO_URI';
const User = require('./Backend/authService/src/models/User');
const Role = require('./Backend/authService/src/models/Role'); // assuming this doesn't exist, we defined it locally

const debugRegister = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    
    // Define Role schema since authService might not export it properly or something
    const roleSchema = new mongoose.Schema({ name: String });
    const RoleModel = mongoose.models.Role || mongoose.model('Role', roleSchema);

    const role = await RoleModel.findOne({ name: 'customer' });
    console.log("Found role:", role);
    
    const user = await User.create({ 
      name: "Test", 
      email: "test_local@test.com", 
      password: "Password123", 
      role: role._id 
    });
    
    console.log("Created user successfully:", user);
    process.exit(0);
  } catch (err) {
    console.error("DEBUG ERROR:", err);
    process.exit(1);
  }
};

debugRegister();
