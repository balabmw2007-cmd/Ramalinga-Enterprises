// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Product = require("../models/Product");
const Post = require("../models/Post");

const products = [
  {
    id: "RE-4500",
    name: "Ramalinga Frost Line Refrigerator",
    category: "Refrigerators",
    rating: 4.6,
    stock: "Available",
    specs: { capacity: "340L", type: "Double Door", energyRating: "5 Star" },
    description: "Double-door refrigerator with inverter compressor and frost-free cooling.",
  },
  {
    id: "RE-4017",
    name: "Ramalinga Smart LED Televisions",
    category: "Televisions",
    rating: 4.5,
    stock: "Available",
    specs: { screen: "43 Inch", resolution: "4K Ultra HD", brands: "LLOYD" },
    description: "Ultra HD smart LED TV with vibrant display and surround sound",
  },
  {
    id: "RE-2200",
    name: "Ramalinga Spin Pro Washing Machine",
    category: "Washing Machines",
    rating: 4.4,
    stock: "Available",
    specs: { capacity: "7kg", type: "Front Load", energyRating: "4 Star" },
    description: "Front-load washing machine with steam wash and 14 wash programs.",
  },
  {
    id: "RE-1800",
    name: "Ramalinga Breeze Tower Fan",
    category: "Fans",
    rating: 4.2,
    stock: "Available",
    specs: { speeds: 5, remote: true, oscillation: "80°" },
    description: "Bladeless tower fan with remote control and sleep mode.",
  },
  {
    id: "RE-3300",
    name: "Ramalinga ThermoChef Microwave",
    category: "Kitchen",
    rating: 4.3,
    stock: "Available",
    specs: { capacity: "28L", type: "Convection" },
    description: "Convection microwave with 200 auto-cook menus.",
  },
  {
    id: "RE-6600",
    name: "Ramalinga AirPure Split AC",
    category: "Air Conditioners",
    rating: 4.5,
    stock: "Available",
    specs: { capacity: "1.5 Ton", type: "Split Inverter", brands: "LLOYD, Carrier, Mitsubishi, daiken, bluestar." },
    description: "Split inverter AC with dust filtration and copper condenser coil.",
  },
  {
    id: "RE-1200",
    name: "Ramalinga BrewMaster Coffee Maker",
    category: "Kitchen",
    rating: 4.1,
    stock: "Available",
    specs: { capacity: "1.25L", type: "Drip" },
    description: "Programmable drip coffee maker with keep-warm plate.",
  },
];


(async () => {
  try {
    await connectDB();

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded/updated ${products.length} products in MongoDB.`);

    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      await Post.create([
        {
          title: "Grand Store Tour & Modern Appliances Demo",
          description: "Welcome to Ramalinga Enterprises in West Car Street, Chidambaram! Check out our showroom overview featuring smart refrigerators, washing machines, and air conditioners.",
          mediaUrl: "assets/home appliences Video.mp4",
          mediaType: "video",
          author: "Ramalinga Enterprises",
          tags: ["ShowroomTour", "Chidambaram", "AppliancesDemo", "SmartHome"],
        },
        {
          title: "Summer Cooling Sale — Up to 30% Off on Split ACs",
          description: "Beat the heat with 5-star energy efficient split inverter air conditioners with copper condenser coils and dust filtration. Available now in store!",
          mediaUrl: "css/Mitsubishi Air Conditioner.jpg",
          mediaType: "image",
          author: "Ramalinga Sales Team",
          tags: ["AirConditioners", "SummerSale", "SpecialOffer"],
        },
      ]);
      console.log("Seeded 2 initial sample posts & videos in MongoDB.");
    }
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
