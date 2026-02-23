/**
 * Test Dashboard Data Loading
 * Verifies that all dashboards are receiving correct data from database
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function testDashboardData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const Sale = mongoose.model('Sale', new mongoose.Schema({}, { strict: false }));
    const Stock = mongoose.model('Stock', new mongoose.Schema({}, { strict: false }));
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Price = mongoose.model('Price', new mongoose.Schema({}, { strict: false }));

    console.log('=== TESTING DATA AVAILABILITY ===\n');

    // Test Products
    const products = await Product.find();
    console.log(`✓ Products: ${products.length} items`);
    if (products.length > 0) {
      console.log(`  Sample: ${products[0].name}`);
    }

    // Test Stock by Branch
    const maganjoStock = await Stock.find({ branch: 'Maganjo' });
    const mattuggaStock = await Stock.find({ branch: 'Matugga' });
    console.log(`✓ Stock:`);
    console.log(`  - Maganjo: ${maganjoStock.length} items`);
    console.log(`  - Matugga: ${mattuggaStock.length} items`);

    // Test Prices by Branch
    const maganjoPrices = await Price.find({ branch: 'Maganjo' });
    const mattuggaPrices = await Price.find({ branch: 'Matugga' });
    console.log(`✓ Prices:`);
    console.log(`  - Maganjo: ${maganjoPrices.length} items`);
    console.log(`  - Matugga: ${mattuggaPrices.length} items`);

    // Test Sales by Branch
    const maganjoSales = await Sale.find({ branch: 'Maganjo' });
    const mattuggaSales = await Sale.find({ branch: 'Matugga' });
    const totalSalesRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    console.log(`✓ Sales:`);
    console.log(`  - Maganjo: ${maganjoSales.length} transactions`);
    console.log(`  - Matugga: ${mattuggaSales.length} transactions`);
    console.log(`  - Total Revenue: UGX ${(totalSalesRevenue[0]?.total || 0).toLocaleString()}`);

    // Test Users
    const managers = await User.find({ role: 'manager', isActive: true });
    const salesAgents = await User.find({ role: 'sales-agent', isActive: true });
    const directors = await User.find({ role: 'director', isActive: true });
    console.log(`✓ Users:`);
    console.log(`  - Directors: ${directors.length}`);
    console.log(`  - Managers: ${managers.length}`);
    console.log(`  - Sales Agents: ${salesAgents.length}`);

    if (managers.length > 0) {
      console.log(`\n=== MANAGER VIEW (${managers[0].fullName} - ${managers[0].branch} Branch) ===`);
      const managerBranch = managers[0].branch;
      const branchStock = await Stock.find({ branch: managerBranch });
      const branchSales = await Sale.find({ branch: managerBranch });
      const branchRevenue = branchSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      
      console.log(`Stock Items: ${branchStock.length}`);
      console.log(`Total Sales: ${branchSales.length}`);
      console.log(`Branch Revenue: UGX ${branchRevenue.toLocaleString()}`);
    }

    if (salesAgents.length > 0) {
      console.log(`\n=== SALES AGENT VIEW (${salesAgents[0].fullName} - ${salesAgents[0].branch} Branch) ===`);
      const agentId = salesAgents[0]._id;
      const agentSales = await Sale.find({ salesAgent: agentId });
      const agentRevenue = agentSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      
      console.log(`My Sales: ${agentSales.length}`);
      console.log(`My Revenue: UGX ${agentRevenue.toLocaleString()}`);
    }

    console.log(`\n=== DIRECTOR VIEW (All Branches) ===`);
    const allSales = await Sale.countDocuments();
    const allProducts = await Product.countDocuments();
    const allUsers = await User.countDocuments({ isActive: true });
    const systemRevenue = totalSalesRevenue[0]?.total || 0;
    
    console.log(`Total Products: ${allProducts}`);
    console.log(`Total Sales: ${allSales}`);
    console.log(`Active Users: ${allUsers}`);
    console.log(`System Revenue: UGX ${systemRevenue.toLocaleString()}`);

    await mongoose.disconnect();
    console.log('\n✓ Test completed successfully');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDashboardData();
