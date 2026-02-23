/**
 * Seed Prices for Matugga Branch
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Price = require('./model/Price');
const Product = require('./model/Product');
const User = require('./model/User');

async function seedMatuggaPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get Matugga manager
    const manager = await User.findOne({ role: 'manager', branch: 'Matugga' });
    if (!manager) {
      console.log('No Matugga manager found. Please create a manager for Matugga branch first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Using manager: ${manager.fullName} (${manager.branch})\n`);

    // Get all products
    const products = await Product.find({ isActive: true });
    
    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${products.length} products\n`);

    // Check if Matugga prices already exist
    const existingPrices = await Price.find({ branch: 'Matugga' });
    if (existingPrices.length > 0) {
      console.log(`Matugga already has ${existingPrices.length} prices.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Delete and recreate all Matugga prices? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() === 'yes') {
        await Price.deleteMany({ branch: 'Matugga' });
        console.log('✓ Deleted existing Matugga prices\n');
      } else {
        console.log('Keeping existing prices');
        await mongoose.disconnect();
        return;
      }
    }

    // Create prices for Matugga branch
    const priceData = products.map(product => ({
      product: product._id,
      branch: 'Matugga',
      costPrice: Math.round(1500 + Math.random() * 2000), // Random cost between 1500-3500
      sellingPrice: Math.round(2000 + Math.random() * 3000), // Random selling price 2000-5000
      updatedBy: manager._id,
      isActive: true
    }));

    const createdPrices = await Price.insertMany(priceData);
    
    console.log(`✓ Created ${createdPrices.length} prices for Matugga branch\n`);
    
    // Display created prices
    for (const price of createdPrices) {
      const product = products.find(p => p._id.equals(price.product));
      console.log(`  ${product.name}: Cost UGX ${price.costPrice.toLocaleString()}, Sell UGX ${price.sellingPrice.toLocaleString()}`);
    }

    await mongoose.disconnect();
    console.log('\n✓ Matugga prices seeded successfully');

  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedMatuggaPrices();
