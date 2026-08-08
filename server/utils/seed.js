import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';

dotenv.config();

const categoriesData = [
  {
    name: 'Snacks & Bakery',
    slug: 'snacks-bakery',
    description:
      'Discover a healthy and delicious selection of traditional laddoos, millet cookies, rice cookies, healthy cakes, and other bakery snacks. Perfect for students, families, and everyday snacking.',
    image:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop',
  },
  {
    name: 'Mobiles',
    slug: 'mobiles',
    description: 'Top brand smartphones and mobile devices.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Bulk clothing, apparel, and textile products.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop'
  },
  {
    name: 'Foods',
    slug: 'foods',
    description: 'Discover a wide variety of fresh and delicious food products, including beverages, snacks, bakery items, fast food, frozen foods, desserts, and ready-to-eat meals. Shop high-quality food products at affordable prices with fast delivery.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop'
  },
];

const couponsData = [
  {
    code: 'BULKDEAL1000',
    discountType: 'flat',
    discountValue: 1000,
    minPurchase: 10000,
    expiryDate: new Date('2030-12-31'),
    active: true
  },
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 5000,
    expiryDate: new Date('2030-12-31'),
    active: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Seed: Connected to Database...');

    // Clear all existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    console.log('Seed: Cleared all existing collections...');

    // Create user accounts
    const admin = await User.create({
      fullName: 'Foodie',
      email: 'arjun.gk10g2021.22@gmail.com',
      mobile: '9095917892',
      password: 'foodie2307!success',
      role: 'admin',
      isVerified: true
    });

    const seller = await User.create({
      fullName: 'G M KRISHNAN',
      email: 'krishnangm06@gmail.com',
      mobile: '9095917892',
      password: 'seller2307!success',
      role: 'seller',
      isVerified: true,
      profileImage: ''
    });

    // const customer = await User.create({
    //   fullName: 'Alice Shopkeeper',
    //   email: 'customer@foodie.com',
    //   mobile: '+919876543212',
    //   password: 'password123',
    //   role: 'customer',
    //   isVerified: true
    // });

    // Create Carts & Wishlists
    await Cart.create({ userId: admin._id, items: [] });
    await Wishlist.create({ userId: admin._id, products: [] });
    await Cart.create({ userId: seller._id, items: [] });
    await Wishlist.create({ userId: seller._id, products: [] });
    // await Cart.create({ userId: customer._id, items: [] });
    // await Wishlist.create({ userId: customer._id, products: [] });

    console.log('Seed: Created Admin, Seller, and Customer accounts...');

    // Create Categories
    const categories = await Category.create(categoriesData);
    console.log('Seed: Created Categories...');

    const getCatId = (slug) => categories.find(c => c.slug === slug)._id;

    // Define 105 unique products (7 per category)
    const rawProducts = [





      // 1. Foods


      {
        productName: 'Madurai Famous Jigarthanda (1 Bottle)',
        brand: 'Famous Jigarthanda',
        categorySlug: 'foods',
        subCategory: 'Drinks',
        price: 43,
        platformFee: 9,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.9,
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJOOIFgp4fzK5JJ-DMVhz9Q20dyeRSPt54rmfqwfTTfw&s=10'
      },
      {
        productName: 'Lay’s Classic Salted Potato Chips (150g)',
        brand: "Lay's",
        categorySlug: 'foods',
        subCategory: 'Snacks',
        price: 5,
        platformFee: 2,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.6,
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP0QGdGFaj8vMJvVI-wkbMGqCUtn7jX39d0OEZutecpQ&s=10'
      },
      {
        productName: 'Britannia Choco Chip Cookies (300g)',
        brand: 'Britannia',
        categorySlug: 'foods',
        subCategory: 'Bakery',
        price: 180,
        platformFee: 10,
        minimumOrderQuantity: 20,
        discount: 19,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600'
      },
      {
        productName: 'Veg Cheese Burger',
        brand: 'Foodie Kitchen',
        categorySlug: 'foods',
        subCategory: 'Fast Food',
        price: 180,
        platformFee: 8,
        minimumOrderQuantity: 15,
        discount: 20,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'
      },
      {
        productName: 'Belgian Chocolate Brownie',
        brand: 'Sweet Treats',
        categorySlug: 'foods',
        subCategory: 'Desserts',
        price: 150,
        platformFee: 12,
        minimumOrderQuantity: 15,
        discount: 20,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600'
      },
      {
        productName: 'Mixed Dry Fruit Energy Mix (500g)',
        brand: 'Happilo',
        categorySlug: 'foods',
        subCategory: 'Healthy Foods',
        price: 550,
        platformFee: 25,
        minimumOrderQuantity: 10,
        discount: 22,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1505253216365-3ad9f7b5f3c8?w=600'
      },
      {
        productName: 'Instant Masala Oats (1kg)',
        brand: 'Saffola',
        categorySlug: 'foods',
        subCategory: 'Breakfast',
        price: 320,
        platformFee: 12,
        minimumOrderQuantity: 15,
        discount: 19,
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600'
      },
      {
        productName: 'Traditional Milk Mysore Pak (500g)',
        brand: 'A2B',
        categorySlug: 'foods',
        subCategory: 'Sweets',
        price: 350,
        platformFee: 15,
        minimumOrderQuantity: 12,
        discount: 17,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600'
      },
      {
        productName: 'Cadbury Dairy Milk Silk Chocolate (150g)',
        brand: 'Cadbury',
        categorySlug: 'foods',
        subCategory: 'Chocolates',
        price: 220,
        platformFee: 11,
        minimumOrderQuantity: 25,
        discount: 18,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600'
      },
      {
        productName: 'Parle-G Glucose Biscuits Family Pack',
        brand: 'Parle',
        categorySlug: 'foods',
        subCategory: 'Biscuits',
        price: 120,
        platformFee: 9,
        minimumOrderQuantity: 30,
        discount: 21,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600'
      },
      {
        productName: 'Amul Belgian Chocolate Ice Cream (1L)',
        brand: 'Amul',
        categorySlug: 'foods',
        subCategory: 'Ice Cream',
        price: 320,
        platformFee: 14,
        minimumOrderQuantity: 12,
        discount: 19,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600'
      },
      {
        productName: 'Steamed Veg Momos (10 Pieces)',
        brand: 'Street Bites',
        categorySlug: 'foods',
        subCategory: 'Street Food',
        price: 140,
        platformFee: 9,
        minimumOrderQuantity: 20,
        discount: 21,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=600'
      },



      // ===================================================
      // LADDU PRODUCTS
      // ===================================================       

      {
        productName: 'Black Sesame Laddoo (15 pcs)',
        brand: 'JG Healthy',
        categorySlug: 'snacks-bakery',
        subCategory: 'Laddu',
        price: 140,
        platformFee: 9,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.8,
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwwc_u2tR3UiFWiZrBdMs3UGk9mbeLPVp0LEN0D-BKjQ&s=10',
      },

      {
        productName: 'Peanut Laddoo (15 pcs)',
        brand: 'JG Healthy',
        categorySlug: 'snacks-bakery',
        subCategory: 'Laddu',
        price: 140,
        platformFee: 9,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.9,
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgOvngC7_WjsVSU_n_ZnP2utwiBFSmrROIAcXhZ0PazA&s=10',
      },

      {
        productName: 'White Sesame Laddoo (15 pcs)',
        brand: 'JG Healthy',
        categorySlug: 'snacks-bakery',
        subCategory: 'Laddu',
        price: 140,
        platformFee: 9,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.8,
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGSxG04_rXKdKPMyvZenMNap_u1PwRdYaiFPaHDs6ewg&s=10',
      },

      {
        productName: 'Finger Millet Ghee Laddoo (15 pcs)',
        brand: 'JG Healthy',
        categorySlug: 'snacks-bakery',
        subCategory: 'Laddu',
        price: 140,
        platformFee: 9,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.8,
        imageUrl:
          'https://www.sprouteezstore.com/cdn/shop/files/12.png?v=1761561207&width=416',
      },

      {
        productName: 'Foxtail Millet Ghee Laddoo (15 pcs)',
        brand: 'JG Healthy',
        categorySlug: 'snacks-bakery',
        subCategory: 'Laddu',
        price: 140,
        platformFee: 9,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.8,
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS4Z-vW4K3_yvedT0ypV_nfjlp73vJJM3mR1oV4itw7A&s',
      },



      {
        productName: 'Black Urad Dal Laddoo (15 pcs)',
        brand: 'JG Healthy',
        categorySlug: 'snacks-bakery',
        subCategory: 'Laddu',
        price: 140,
        platformFee: 9,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.8,
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpu1YIy7uZhQkwpa67QwRjyDHvtRA2c_y8IW2jSHn7qw&s=10',
      },

      // ===================================================
      // COOKIE PRODUCTS
      // ===================================================


      // {
      //   productName: 'Ragi Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Sorghum Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Pearl Millet Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Black Rice Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Honey Foxtail Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 105,
      //   purchasePrice: 100,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Wheat Salt Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.6,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Red Rice Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 95,
      //   purchasePrice: 90,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Wheat Choco Chip Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 95,
      //   purchasePrice: 90,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.9,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Finger Millet Fruit Nuts Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 95,
      //   purchasePrice: 90,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Wheat Fruit Nuts Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 95,
      //   purchasePrice: 90,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Kodo Millet Masala Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Jeera Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Multi Millet Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'All Variety Millet Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Pepper Mint Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.6,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Moringa Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.6,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Indian Pennywort Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 95,
      //   purchasePrice: 90,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.6,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Purple Fruited Pea Eggplant Butter Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 95,
      //   purchasePrice: 90,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.6,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Barnyard Millet Cookies (100g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cookies',
      //   price: 85,
      //   purchasePrice: 80,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 5,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      // },


      // ===================================================
      // CAKE PRODUCTS
      // ===================================================

      // {
      //   productName: 'Black Rice Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Finger Millet Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 190,
      //   purchasePrice: 180,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Wheat Banana Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 190,
      //   purchasePrice: 180,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Pearl Millet Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 190,
      //   purchasePrice: 180,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Red Rice Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Sorghum Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 190,
      //   purchasePrice: 180,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Kodo Millet Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Foxtail Millet Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Barnyard Millet Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Poongar Rice Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Multi Millet Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.8,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Black Kuruvai Rice Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },

      // {
      //   productName: 'Traditional Rice Varieties Cake (250g)',
      //   brand: 'JG Healthy',
      //   categorySlug: 'snacks-bakery',
      //   subCategory: 'Cakes',
      //   price: 210,
      //   purchasePrice: 200,
      //   minimumOrderQuantity: 1,
      //   discount: 0,
      //   rating: 4.7,
      //   myProfit: 10,
      //   imageUrl:
      //     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      // },



    ];

    const finalProducts = rawProducts.map((p, idx) => {
      const catId = getCatId(p.categorySlug);
      const formattedBrand = p.brand.replace(/\s+/g, '').toUpperCase().slice(0, 4);
      const SKU = `${p.categorySlug.toUpperCase().slice(0, 3)}-${formattedBrand}-${100 + idx}`;

      return {
        productName: p.productName,
        productDescription: `Premium commercial grade ${p.productName} by ${p.brand}. Fully certified for distribution with complete warranty. Perfect for corporate clients, retail supply chains, and B2B sourcing platforms.`,
        category: catId,
        subCategory: p.subCategory,
        brand: p.brand,
        SKU,
        price: p.price,
        platformFee: p.platformFee,
        minimumOrderQuantity: p.minimumOrderQuantity,
        stock: 500 + (idx * 15),
        images: [{ url: p.imageUrl, publicId: `mock_${p.categorySlug}_${idx}` }],
        rating: p.rating,
        reviewsCount: 15 + (idx * 3),
        sellerId: seller._id,
        discount: p.discount,
        specifications: [
          { key: 'Brand Partner', value: p.brand },
          { key: 'Logistics Package', value: 'Commercial Safe package' },
          { key: 'Lead Time', value: '2-4 Business Days' },
          { key: 'Warranty', value: '1 Year Manufacturer Warranty' }
        ],
        tags: [p.categorySlug, p.subCategory.toLowerCase(), p.brand.toLowerCase(), 'bulk', 'wholesale'],
        availability: true,
        featuredProduct: idx % 3 === 0
      };
    });

    await Product.create(finalProducts);
    console.log(`Seed: Created ${finalProducts.length} comprehensive Products across 15 Categories...`);

    const testProduct = await Product.findOne({
      productName: 'Madurai Famous Jigarthanda (1 Bottle)'
    }).lean();

    console.log('Seed verification:', {
      productName: testProduct?.productName,
      price: testProduct?.price,
      platformFee: testProduct?.platformFee
    });

    // Create Coupons
    await Coupon.create(couponsData);
    console.log('Seed: Created Coupons...');

    console.log('Seed: Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();