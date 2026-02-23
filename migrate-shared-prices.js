/**
 * Migrate Prices to Shared Model
 * Consolidates branch-specific prices into shared prices
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Price = require('./model/Price');
const Product = require('./model/Product');

async function migratePrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get all products
    const products = await Product.find({ isActive: true });
    console.log(`Found ${products.length} products\n`);

    // Get existing prices
    const existingPrices = await Price.find();
    console.log(`Found ${existingPrices.length} existing price records\n`);

    // Group prices by product
    const pricesByProduct = {};
    existingPrices.forEach(price => {
      const productId = price.product.toString();
      if (!pricesByProduct[productId]) {
        pricesByProduct[productId] = [];
      }
      pricesByProduct[productId].push(price);
    });

    console.log('=== MIGRATION PLAN ===');
    console.log('For each product:');
    console.log('1. Keep the Maganjo price as the shared price');
    console.log('2. Delete the Matugga duplicate');
    console.log('3. Set branch field to null (shared)');
    console.log('');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('Proceed with migration? (yes/no): ', resolve);
    });
    readline.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('Migration cancelled');
      await mongoose.disconnect();
      return;
    }

    console.log('\n=== MIGRATING PRICES ===\n');

    let consolidated = 0;
    let kept = 0;
    let deleted = 0;

    for (const product of products) {
      const productPrices = pricesByProduct[product._id.toString()] || [];
      
      if (productPrices.length === 0) {
        console.log(`⚠️  ${product.name}: No prices found`);
        continue;
      }

      if (productPrices.length === 1) {
        // Only one price exists, just remove branch field
        const price = productPrices[0];
        await Price.updateOne(
          { _id: price._id },
          { $unset: { branch: "" } }
        );
        console.log(`✓ ${product.name}: Converted to shared price (UGX ${price.sellingPrice.toLocaleString()})`);
        kept++;
      } else {
        // Multiple prices exist (one per branch)
        // Keep Maganjo price, delete others
        const maganjoPrice = productPrices.find(p => p.branch === 'Maganjo');
        const otherPrices = productPrices.filter(p => p.branch !== 'Maganjo');

        if (maganjoPrice) {
          // Update Maganjo price to shared (remove branch)
          await Price.updateOne(
            { _id: maganjoPrice._id },
            { $unset: { branch: "" } }
          );
          
          // Delete other branch prices
          for (const price of otherPrices) {
            await Price.deleteOne({ _id: price._id });
            deleted++;
          }
          
          console.log(`✓ ${product.name}: Consolidated to shared price (UGX ${maganjoPrice.sellingPrice.toLocaleString()}), deleted ${otherPrices.length} duplicate(s)`);
          consolidated++;
        } else {
          // No Maganjo price, keep first one and delete rest
          const keepPrice = productPrices[0];
          await Price.updateOne(
            { _id: keepPrice._id },
            { $unset: { branch: "" } }
          );
          
          for (let i = 1; i < productPrices.length; i++) {
            await Price.deleteOne({ _id: productPrices[i]._id });
            deleted++;
          }
          
          console.log(`✓ ${product.name}: Kept ${keepPrice.branch} price as shared (UGX ${keepPrice.sellingPrice.toLocaleString()}), deleted ${productPrices.length - 1} duplicate(s)`);
          consolidated++;
        }
      }
    }

    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`Consolidated: ${consolidated} products`);
    console.log(`Already unique: ${kept} products`);
    console.log(`Deleted: ${deleted} duplicate prices`);
    console.log(`\nAll branches now share the same ${consolidated + kept} prices`);

    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migratePrices();
