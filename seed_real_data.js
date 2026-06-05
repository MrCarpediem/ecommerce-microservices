const mongoose = require('mongoose');
const MONGO_URI = 'process.env.MONGO_URI';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const sampleProducts = [
  {
    name: "Apple MacBook Pro M3 Max",
    description: "The most advanced Mac ever built for professionals. Features the M3 Max chip for ultimate performance.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    stock: 50,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Sony Alpha a7 IV Mirrorless Camera",
    description: "Full-frame hybrid camera featuring breathtaking photography and videography performance.",
    price: 2498,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    stock: 25,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Nike Air Max 270",
    description: "Men's everyday shoes featuring Nike's biggest heel Air bag yet for a super soft ride.",
    price: 150,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    stock: 100,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Samsung 49-Inch Odyssey G9 Gaming Monitor",
    description: "Curved gaming monitor matching the curve of the human eye for maximum immersion.",
    price: 1299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    stock: 15,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Premium Leather Weekend Duffel Bag",
    description: "Handcrafted full-grain leather duffel bag perfect for short trips and weekend getaways.",
    price: 285,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    stock: 40,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Bose QuietComfort Ultra Headphones",
    description: "Premium spatial audio and world-class noise cancellation headphones.",
    price: 429,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    stock: 75,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Minimalist Ceramic Coffee Mug Set",
    description: "Set of 4 handcrafted matte ceramic coffee mugs in neutral earth tones.",
    price: 45,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    stock: 120,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Mechanical Keyboard - Keychron K2",
    description: "Wireless custom mechanical keyboard with hot-swappable switches and RGB backlight.",
    price: 99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    stock: 60,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  }
];

const seedData = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    console.log("Clearing existing products...");
    await Product.deleteMany({});
    
    console.log("Inserting real product data...");
    await Product.insertMany(sampleProducts);
    
    console.log(`Successfully inserted ${sampleProducts.length} products!`);
    
    console.log("Done! You can now view the amazing products on your website.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
