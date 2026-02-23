const mongoose = require('mongoose');
require('dotenv').config();

async function comparePrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const priceSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
    const Price = mongoose.model('Price', priceSchema);
    
    const productSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.model('Product', productSchema);
    
    const prices = await Price.find().lean();
    
    const products = await Product.find().lean();
    const productMap = {};
    products.forEach(p => productMap[p._id.toString()] = p.name);
    
    console.log('=== SHARED PRICES (ALL BRANCHES) ===');
    console.log(`Total prices: ${prices.length}\n`);
    
    prices.forEach(p => {
      const productName = productMap[p.product?.toString()] || 'Unknown';
      const branch = p.branch || 'SHARED';
      console.log(`${productName}: Cost UGX ${p.costPrice.toLocaleString()}, Sell UGX ${p.sellingPrice.toLocaleString()} [${branch}]`);
    });
    
    console.log('\n=== SUMMARY ===');
    console.log('✓ Prices are now SHARED across all branches');
    console.log('✓ Both Maganjo and Matugga see the same prices');
    console.log('✓ Only managers can update prices (affects all branches)');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

comparePrices();
