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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_Rs-vnyxCy34HTF8qweNTgZtMHlZBAkE-0BYnQl-t5Q&s=10',
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
      // {
      //   productName: '',
      //   productDescription: '',
      //   brand: '',
      //   category: '',
      //   subCategory: '',
      //   price: 0,
      //   platformFee: 0,
      //   minimumOrderQuantity: 0,
      //   packageQuantity: 0,
      //   sellingPrice: 0,
      //   stock: 0,
      //   unit: 'piece',
      //   tags: '',
      //   specifications: [{ key: 'value' }],
      //   discount: 0,
      //   rating: 0,
      //   imageUrl: ''
      // },

      {
        productName: 'Paruthi Paal',
        productDescription: 'Paruthi Paal is a traditional South Indian drink prepared from cotton seeds. It is known for its rich, creamy texture and traditional taste. Enjoy it as a wholesome traditional beverage, freshly prepared and suitable for family consumption.',
        brand: 'sri sastha',
        categorySlug: 'foods',
        subCategory: 'Drinks',
        price: 180,
        platformFee: 9,
        minimumOrderQuantity: 5,
        discount: 0,
        rating: 0,
        imageUrl: 'https://res.cloudinary.com/dkufcnnvx/image/upload/v1786381978/Foodie/products/lkmqgd6xdgrddlojzywt.png',
        stock: 50,
        unit: 'litre',
        tags: 'Paruthi Paal',
      },

      {
        productName: 'Palm jaggery rice balls (12pcs)',
        productDescription: 'Palm jaggery rice balls is a delicious traditional snack made with palm jaggery and rice flour. It is a healthy and tasty snack that is perfect for all ages.',
        brand: "vicky's snacks",
        categorySlug: 'snacks-bakery',
        subCategory: 'snacks',
        price: 50,
        platformFee: 9,
        minimumOrderQuantity: 5,
        discount: 0,
        rating: 0,
        imageUrl: 'https://res.cloudinary.com/dkufcnnvx/image/upload/v1786539619/Foodie/products/a3v4m3vhonpkttvdvg2c.jpg',
        stock: 50,
        tags: '',
      },
      {
        productName: 'Black puffed rice balls (12pcs)',
        productDescription: 'Black puffed rice balls is a delicious traditional snack made with black puffed rice and palm jaggery. It is a healthy and tasty snack that is perfect for all ages.',
        brand: "vicky's snacks",
        categorySlug: 'snacks-bakery',
        subCategory: 'snacks',
        price: 50,
        platformFee: 9,
        minimumOrderQuantity: 5,
        discount: 0,
        rating: 0,
        imageUrl: 'https://res.cloudinary.com/dkufcnnvx/image/upload/v1786541773/Foodie/products/dohgoqwjc6eo0zjb6z7x.jpg',
        stock: 50,
      },
      {
        productName: 'bride groom puffed rice balls (12pcs)',
        productDescription: 'bride groom puffed rice balls is a delicious traditional snack made with puffed rice and palm jaggery. It is a healthy and tasty snack that is perfect for all ages.',
        brand: "vicky's snacks",
        categorySlug: 'snacks-bakery',
        subCategory: 'snacks',
        price: 50,
        platformFee: 9,
        minimumOrderQuantity: 5,
        discount: 0,
        rating: 0,
        imageUrl: 'https://res.cloudinary.com/dkufcnnvx/image/upload/v1786541773/Foodie/products/dohgoqwjc6eo0zjb6z7x.jpg',
        stock: 50,
      },
      {
        productName: 'Pepper rice balls (12pcs)',
        productDescription: 'Pepper rice balls is a delicious traditional snack made with pepper and rice flour. It is a healthy and tasty snack that is perfect for all ages.',
        brand: 'sri sastha',
        categorySlug: 'snacks-bakery',
        subCategory: 'snacks',
        price: 50,
        platformFee: 9,
        minimumOrderQuantity: 5,
        discount: 0,
        rating: 0,
        imageUrl: 'https://res.cloudinary.com/dkufcnnvx/image/upload/v1786542405/Foodie/products/i8zj62qtjkrmoz1zffpw.jpg',
        stock: 50,
      },
      {
        productName: 'Palm jaggery puffed jower balls (12pcs)',
        productDescription: 'Palm jaggery puffed jower balls is a delicious traditional snack made with palm jaggery and puffed jower. It is a healthy and tasty snack that is perfect for all ages.',
        brand: 'sri sastha',
        categorySlug: 'snacks-bakery',
        subCategory: 'snacks',
        price: 50,
        platformFee: 9,
        minimumOrderQuantity: 5,
        discount: 0,
        rating: 0,
        imageUrl: 'https://res.cloudinary.com/dkufcnnvx/image/upload/v1786542847/Foodie/products/jojjdbbjpym3gfjyon7a.jpg',
        stock: 50,
      },
      {
        productName: 'Madurai Famous Jigarthanda (1 Bottle)',
        brand: 'Famous Jigarthanda',
        categorySlug: 'foods',
        subCategory: 'Drinks',
        price: 55,
        platformFee: 9,
        minimumOrderQuantity: 1,
        discount: 0,
        rating: 4.9,
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJOOIFgp4fzK5JJ-DMVhz9Q20dyeRSPt54rmfqwfTTfw&s=10'
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
        packageQuantity: p.packageQuantity || 1,
        sellingPrice: p.sellingPrice || 0,
        unit: p.unit || 'piece',
        platformFee: p.platformFee,
        minimumOrderQuantity: p.minimumOrderQuantity,
        stock: 500 + (idx * 15),
        images: [{ url: p.imageUrl, publicId: `mock_${p.categorySlug}_${idx}` }],
        rating: p.rating,
        reviewsCount: 15 + (idx * 3),
        sellerId: seller._id,
        discount: p.discount,
        specifications: [
          { key: 'product name', value: String(p.productName || '') },
          { key: 'category', value: String(p.categorySlug || '') },
          { key: 'subCategory', value: String(p.subCategory || '') },
          { key: 'brand', value: String(p.brand || '') },
          { key: 'price', value: String(p.price ?? 0) },
          { key: 'platformFee', value: String(p.platformFee ?? 0) },
          { key: 'discount', value: String(p.discount ?? 0) },
          { key: 'stock', value: String(500 + (idx * 15)) },
          { key: 'minimumOrderQuantity', value: String(p.minimumOrderQuantity ?? 1) }
        ],
        tags: [p.categorySlug, p.subCategory.toLowerCase(), p.brand.toLowerCase()],
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