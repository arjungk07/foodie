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
      fullName: 'John Admin',
      email: 'admin@foodie.com',
      mobile: '+919876543210',
      password: 'password123',
      role: 'admin',
      isVerified: true
    });

    const seller = await User.create({
      fullName: 'Wholesale Distributors Inc.',
      email: 'seller@foodie.com',
      mobile: '+919876543211',
      password: 'password123',
      role: 'seller',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop'
    });

    const customer = await User.create({
      fullName: 'Alice Shopkeeper',
      email: 'customer@foodie.com',
      mobile: '+919876543212',
      password: 'password123',
      role: 'customer',
      isVerified: true
    });

    // Create Carts & Wishlists
    await Cart.create({ userId: admin._id, items: [] });
    await Wishlist.create({ userId: admin._id, products: [] });
    await Cart.create({ userId: seller._id, items: [] });
    await Wishlist.create({ userId: seller._id, products: [] });
    await Cart.create({ userId: customer._id, items: [] });
    await Wishlist.create({ userId: customer._id, products: [] });

    console.log('Seed: Created Admin, Seller, and Customer accounts...');

    // Create Categories
    const categories = await Category.create(categoriesData);
    console.log('Seed: Created Categories...');

    const getCatId = (slug) => categories.find(c => c.slug === slug)._id;

    // Define 105 unique products (7 per category)
    const rawProducts = [


      // {
      //   productName: 'iPhone 15 Pro Max (256 GB) - Titanium',
      //   brand: 'Apple',
      //   categorySlug: 'mobiles',
      //   subCategory: 'iOS',
      //   price: 159900,
      //   wholesalePrice: 144900,
      //   minimumOrderQuantity: 2,
      //   discount: 9,
      //   rating: 4.9,
      //   imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'
      // },
      // {
      //   productName: 'Samsung Galaxy S24 Ultra (512 GB) - Black',
      //   brand: 'Samsung',
      //   categorySlug: 'mobiles',
      //   subCategory: 'Android',
      //   price: 139999,
      //   wholesalePrice: 121999,
      //   minimumOrderQuantity: 2,
      //   discount: 12,
      //   rating: 4.8,
      //   imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'
      // },
      // {
      //   productName: 'OnePlus 12 5G (16GB RAM / 256GB)',
      //   brand: 'OnePlus',
      //   categorySlug: 'mobiles',
      //   subCategory: 'Android',
      //   price: 64999,
      //   wholesalePrice: 57999,
      //   minimumOrderQuantity: 3,
      //   discount: 10,
      //   rating: 4.7,
      //   imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'
      // },
      // {
      //   productName: 'Redmi Note 13 Pro+ 5G (8GB / 256GB)',
      //   brand: 'Xiaomi',
      //   categorySlug: 'mobiles',
      //   subCategory: 'Android',
      //   price: 31999,
      //   wholesalePrice: 26999,
      //   minimumOrderQuantity: 5,
      //   discount: 15,
      //   rating: 4.5,
      //   imageUrl: 'https://images.unsplash.com/photo-1565849906461-0ee2ecd030fc?w=600'
      // },
      // {
      //   productName: 'Realme 12 Pro 5G (Navigator Beige)',
      //   brand: 'Realme',
      //   categorySlug: 'mobiles',
      //   subCategory: 'Android',
      //   price: 25999,
      //   wholesalePrice: 21499,
      //   minimumOrderQuantity: 5,
      //   discount: 17,
      //   rating: 4.4,
      //   imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600'
      // },
      // {
      //   productName: 'Nothing Phone (2a) 5G (Milk White)',
      //   brand: 'Nothing',
      //   categorySlug: 'mobiles',
      //   subCategory: 'Android',
      //   price: 23999,
      //   wholesalePrice: 19999,
      //   minimumOrderQuantity: 4,
      //   discount: 16,
      //   rating: 4.6,
      //   imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'
      // },
      // {
      //   productName: 'Motorola Edge 50 Pro (Luxe Lavender)',
      //   brand: 'Motorola',
      //   categorySlug: 'mobiles',
      //   subCategory: 'Android',
      //   price: 35999,
      //   wholesalePrice: 29999,
      //   minimumOrderQuantity: 3,
      //   discount: 16,
      //   rating: 4.5,
      //   imageUrl: 'https://images.unsplash.com/photo-1574756568012-78d1723af6ec?w=600'
      // },


      // {
      //   productName: 'Levis Mens 511 Slim Fit Jeans',
      //   brand: 'Levis',
      //   categorySlug: 'fashion',
      //   subCategory: 'Menswear',
      //   price: 3299,
      //   wholesalePrice: 2199,
      //   minimumOrderQuantity: 12,
      //   discount: 33,
      //   rating: 4.3,
      //   imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'
      // },
      // {
      //   productName: 'Allen Solly Mens Slim Fit Cotton Shirt',
      //   brand: 'Allen Solly',
      //   categorySlug: 'fashion',
      //   subCategory: 'Menswear',
      //   price: 1899,
      //   wholesalePrice: 1199,
      //   minimumOrderQuantity: 15,
      //   discount: 36,
      //   rating: 4.2,
      //   imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'
      // },
      // {
      //   productName: 'US Polo Assn Solid Mens Pique Polo',
      //   brand: 'USPA',
      //   categorySlug: 'fashion',
      //   subCategory: 'Menswear',
      //   price: 1999,
      //   wholesalePrice: 1299,
      //   minimumOrderQuantity: 20,
      //   discount: 35,
      //   rating: 4.4,
      //   imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600'
      // },
      // {
      //   productName: 'Puma Unisex Hooded Cotton Sweatshirt',
      //   brand: 'Puma',
      //   categorySlug: 'fashion',
      //   subCategory: 'Activewear',
      //   price: 3999,
      //   wholesalePrice: 2499,
      //   minimumOrderQuantity: 8,
      //   discount: 37,
      //   rating: 4.5,
      //   imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600'
      // },
      // {
      //   productName: 'Adidas Comfort Athletic Sports Socks (Pack of 6)',
      //   brand: 'Adidas',
      //   categorySlug: 'fashion',
      //   subCategory: 'Activewear',
      //   price: 999,
      //   wholesalePrice: 599,
      //   minimumOrderQuantity: 25,
      //   discount: 40,
      //   rating: 4.6,
      //   imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600'
      // },
      // {
      //   productName: 'W for Woman Floral Print Cotton Kurta',
      //   brand: 'W',
      //   categorySlug: 'fashion',
      //   subCategory: 'Womenswear',
      //   price: 2499,
      //   wholesalePrice: 1599,
      //   minimumOrderQuantity: 10,
      //   discount: 36,
      //   rating: 4.4,
      //   imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600'
      // },
      // {
      //   productName: 'Biba Regular Fit Printed Salwar Suit Set',
      //   brand: 'Biba',
      //   categorySlug: 'fashion',
      //   subCategory: 'Womenswear',
      //   price: 4999,
      //   wholesalePrice: 3299,
      //   minimumOrderQuantity: 6,
      //   discount: 34,
      //   rating: 4.5,
      //   imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
      // },


      // 1. Foods


      {
        productName: 'Madurai Famous Jigarthanda (1 Bottle)',
        brand: 'Famous Jigarthanda',
        categorySlug: 'foods',
        subCategory: 'Drinks',
        price: 43,
        wholesalePrice: 0,
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
        wholesalePrice: 0,
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
        wholesalePrice: 145,
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
        wholesalePrice: 145,
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
        wholesalePrice: 120,
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
        wholesalePrice: 430,
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
        wholesalePrice: 260,
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
        wholesalePrice: 290,
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
        wholesalePrice: 180,
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
        wholesalePrice: 95,
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
        wholesalePrice: 260,
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
        wholesalePrice: 110,
        minimumOrderQuantity: 20,
        discount: 21,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=600'
      },

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
        wholesalePrice: p.wholesalePrice,
        minimumOrderQuantity: p.minimumOrderQuantity,
        stock: 500 + (idx * 15),
        images: [{ url: p.imageUrl, publicId: `mock_${p.categorySlug}_${idx}` }],
        rating: p.rating,
        reviewsCount: 15 + (idx * 3),
        sellerId: seller._id,
        discount: p.discount,
        specifications: [
          { key: 'Brand Partner', value: p.brand },
          { key: 'Logistics Package', value: 'Commercial Safe Box' },
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