
import mongoose from 'mongoose';
import { getDateRange } from '../utils/dateUtils.js';
import Product from '../modules/storeAdmin/Product.js';
import Inventory from '../modules/FulupoStore/Inventory.js';
import Sales from '../modules/FulupoStore/Sales.js';
import Purchase from '../modules/FulupoStore/Purchase.js';
import Wastage from '../modules/FulupoStore/Wastage.js';

export const fetchStoreOverview = async (storeId) => {
  const totalProducts = await Product.countDocuments({ storeId });

  const totalInventoryQty = await Inventory.aggregate([
    { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);

  const lowStock = await Inventory.find({ storeId, percentage: { $lt: 20 } }).limit(10);

  // Enrich low stock with latest vendor info
const enrichedLowStock = await Promise.all(
  lowStock.map(async (item) => {
    const purchases = await Purchase.find({
      storeId,
      'product.product_id': item.product_id
    }).sort({ purchaseDate: -1 }).select('vendorName vendorMobile purchaseDate');


    const uniqueVendors = [];
    const seen = new Set();

    for (const p of purchases) {
      const key = `${p.vendorName}-${p.vendorMobile}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueVendors.push({
          vendorName: p.vendorName,
          vendorMobile: p.vendorMobile,
          purchaseDate: p.purchaseDate
        });
      }
    }

    return {
      ...item.toObject(),
      vendors: uniqueVendors
    };
  })
);

  return {
    totalProducts,
    totalInventoryQty: totalInventoryQty[0]?.total || 0,
    data : enrichedLowStock
  };
};

export const fetchSalesSummary = async ({ storeId, type, from, to }) => {
  const { startDate, endDate } = getDateRange(type, from, to);

  const sales = await Sales.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
        saleDate: { $gte: startDate, $lte: endDate }
      }
    },
    { $unwind: '$products' },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
        totalGst: { $sum: '$totalGst' },
        totalItemsSold: { $sum: '$products.quantity' }
      }
    }
  ]);

  return {
    totalSalesAmount: sales[0]?.totalAmount || 0,
    totalGST: sales[0]?.totalGst || 0,
    totalItemsSold: sales[0]?.totalItemsSold || 0
  };
};

export const fetchPurchaseSummary = async ({ storeId, type, from, to }) => {
  const { startDate, endDate } = getDateRange(type, from, to);

  const purchases = await Purchase.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
        purchaseDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$overallTotal' },
        totalBills: { $sum: 1 }
      }
    }
  ]);

  return {
    totalPurchaseAmount: purchases[0]?.totalAmount || 0,
    totalBills: purchases[0]?.totalBills || 0
  };
};

export const fetchWastageSummary = async ({ storeId, type, from, to }) => {
  const { startDate, endDate } = getDateRange(type, from, to);

  const wastage = await Wastage.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    { $unwind: '$productList' },
    {
      $group: {
        _id: null,
        totalQty: { $sum: '$productList.quantity' }
      }
    }
  ]);

  return {
    totalWastageQty: wastage[0]?.totalQty || 0
  };
};

export const fetchProfitLossSummary = async (body) => {
  // You can reuse getAllProductProfitLoss here and just sum profit/loss
  return {}; // You can wire it with your existing function
};
