const mongoose = require('mongoose');
const MONGO_URI = 'process.env.MONGO_URI';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: [{ type: String }]
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

const initializeRoles = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const roles = [
      { name: 'customer', description: 'Regular customer', permissions: ['read_product', 'write_order'] },
      { name: 'seller', description: 'Product seller', permissions: ['read_product', 'write_product', 'read_order'] },
      { name: 'admin', description: 'System administrator', permissions: ['all'] }
    ];

    for (const roleData of roles) {
      const existing = await Role.findOne({ name: roleData.name });
      if (!existing) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role ${roleData.name} already exists`);
      }
    }

    console.log("Roles initialized successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error initializing roles:", err);
    process.exit(1);
  }
};

initializeRoles();
