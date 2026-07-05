const fs = require('fs');
const path = require('path');

const products = [];

const deptTranslations = {
  'Grocery': { hi: 'किराना और राशन', mr: 'किराणा आणि किराणा सामान' },
  'Agriculture': { hi: 'कृषि इनपुट', mr: 'कृषी निविष्ठा' },
  'Building Materials': { hi: 'भवन निर्माण सामग्री', mr: 'बांधकाम साहित्य' },
  'Hardware Tools': { hi: 'हार्डवेयर और उपकरण', mr: 'हार्डवेअर आणि साधने' },
  'Plumbing': { hi: 'प्लंबिंग फिटिंग', mr: 'प्लंबिंग फिटिंग्ज' },
  'Electrical': { hi: 'इलेक्ट्रिकल और तार', mr: 'इलेक्ट्रिकल आणि वायर्स' },
  'Furniture': { hi: 'फर्नीचर और लकड़ी', mr: 'फर्निचर आणि लाकूड' },
  'Home Appliances': { hi: 'घरेलू उपकरण', mr: 'घरगुती उपकरणे' },
  'Electronics': { hi: 'इलेक्ट्रॉनिक्स', mr: 'इलेक्ट्रॉनिक्स' },
  'General Store': { hi: 'दैनिक जरुरत', mr: 'दैनिक जनरल' }
};

const translateMock = (text, targetLang) => {
  const dictMap = {
    hi: {
      'Atta': 'आटा',
      'Salt': 'नमक',
      'Mustard Oil': 'सरसों का तेल',
      'Cow Ghee': 'गाय का घी',
      'Noodles': 'नूडल्स',
      'Tea': 'चाय',
      'Biscuits': 'बिस्कुट',
      'Chocolate': 'चॉकलेट',
      'Bhujia': 'भुजिया',
      'Turmeric': 'हल्दी',
      'Coriander': 'धनिया',
      'Dal': 'दाल',
      'Almonds': 'बादाम',
      'Butter': 'मक्खन',
      'Detergent': 'डिटर्जेंट',
      'Dishwash': 'डिशवॉश',
      'Organic': 'जैविक',
      'Manure': 'खाद',
      'Watering Can': 'पानी देने का डिब्बा',
      'Seeds': 'बीज',
      'Cement': 'सीमेंट',
      'Waterproofing': 'वॉटरप्रूफिंग',
      'Hammer': 'हथौड़ा',
      'Screwdriver': 'पेचकश',
      'Pliers': 'प्लास',
      'Pipe': 'पाइप',
      'Tape': 'टेप',
      'LED Bulb': 'एलईडी बल्ब',
      'Wire': 'तार',
      'Switch': 'स्विच',
      'Chair': 'कुर्सी',
      'Table': 'मेज',
      'Sofa': 'सोफा',
      'Cooker': 'कुकर',
      'Mixer': 'मिक्सर',
      'Kettle': 'केतली',
      'Mobile': 'मोबाइल',
      'T-Shirt': 'टी-शर्ट',
      'Jeans': 'जींस',
      'Soap': 'साबुन',
      'Shampoo': 'शैम्पू',
      'Broom': 'झाडू',
      'Pipes': 'पाइप',
      'Pipes Fittings': 'पाइप फिटिंग'
    },
    mr: {
      'Atta': 'पीठ',
      'Salt': 'मीठ',
      'Mustard Oil': 'मोहरीचे तेल',
      'Cow Ghee': 'गायीचे तूप',
      'Noodles': 'नुडल्स',
      'Tea': 'चहा',
      'Biscuits': 'बिस्किटे',
      'Chocolate': 'चॉकलेट',
      'Bhujia': 'भुजिया',
      'Turmeric': 'हळद',
      'Coriander': 'धणे',
      'Dal': 'डाळ',
      'Almonds': 'बदाम',
      'Butter': 'लोणी',
      'Detergent': 'डिटर्जंट',
      'Dishwash': 'डिशवॉश',
      'Organic': 'सेंद्रिय',
      'Manure': 'खत',
      'Watering Can': 'पाणी देण्याचा डबा',
      'Seeds': 'बियाणे',
      'Cement': 'सिमेंट',
      'Waterproofing': 'वॉटरप्रूफिंग',
      'Hammer': 'हातोडा',
      'Screwdriver': 'स्क्रू ड्रायव्हर',
      'Pliers': 'पक्कड',
      'Pipe': 'पाइप',
      'Tape': 'टेप',
      'LED Bulb': 'एलईडी बल्ब',
      'Wire': 'वायर',
      'Switch': 'स्विच',
      'Chair': 'खुर्ची',
      'Table': 'टेबल',
      'Sofa': 'सोफा',
      'Cooker': 'कुकर',
      'Mixer': 'मिक्सर',
      'Kettle': 'केतली',
      'Mobile': 'मोबाईल',
      'T-Shirt': 'टी-शर्ट',
      'Jeans': 'जीन्स',
      'Soap': 'साबण',
      'Shampoo': 'शॅम्पू',
      'Broom': 'झाडू',
      'Pipes': 'पाइप',
      'Pipes Fittings': 'पाइप फिटिंग्ज'
    }
  };

  let result = text;
  const words = dictMap[targetLang] || {};
  Object.entries(words).forEach(([enWord, translated]) => {
    const regex = new RegExp(`\\b${enWord}\\b`, 'gi');
    result = result.replace(regex, translated);
  });
  return result;
};

// Helper to push products to array
const addProduct = (dept, brand, name, price, discountPercent, image, description, emoji) => {
  const mrp = Math.round(price / (1 - discountPercent / 100));
  
  // Reviews generation
  const ratingSum = 4.0 + Math.random() * 1.0;
  const count = 10 + Math.floor(Math.random() * 80);
  const reviews = [];
  const rating = parseFloat(ratingSum.toFixed(1));
  
  // Basic mock reviews
  reviews.push({
    rating: Math.floor(rating),
    title: 'Very Good Quality',
    text: 'Highly satisfied with the product performance and delivery.',
    userName: `Buyer-${Math.floor(100 + Math.random() * 900)}`
  });

  const catTr = deptTranslations[dept] || { hi: dept, mr: dept };

  products.push({
    name: {
      en: name,
      hi: translateMock(name, 'hi'),
      mr: translateMock(name, 'mr')
    },
    brand,
    dept,
    price,
    mrp,
    stock: Math.floor(20 + Math.random() * 150),
    emoji,
    badge: Math.random() > 0.8 ? 'Popular' : '',
    tags: [dept.toLowerCase(), brand.toLowerCase(), name.split(' ')[0].toLowerCase()],
    ratings: {
      average: rating,
      count
    },
    images: [image.includes('unsplash.com') ? `${image}?auto=format&fit=crop&w=600&q=80` : image],
    description: {
      en: description,
      hi: translateMock(description, 'hi'),
      mr: translateMock(description, 'mr')
    },
    category: {
      en: dept,
      hi: catTr.hi,
      mr: catTr.mr
    },
    specifications: [
      {
        key: { en: 'Brand', hi: 'ब्रांड', mr: 'ब्रँड' },
        value: { en: brand, hi: brand, mr: brand }
      },
      {
        key: { en: 'Sourced From', hi: 'स्रोत', mr: 'स्त्रोत' },
        value: { en: 'Local Supplier', hi: 'स्थानीय आपूर्तिकर्ता', mr: 'स्थानिक पुरवठादार' }
      }
    ],
    features: [
      {
        en: '100% original product directly from certified dealers.',
        hi: 'प्रमाणित डीलरों से सीधे 100% मूल उत्पाद।',
        mr: 'प्रमाणित डीलर्सकडून थेट 100% मूळ उत्पादन.'
      },
      {
        en: 'High performance and long-lasting durability.',
        hi: 'उच्च प्रदर्शन और लंबे समय तक चलने वाला स्थायित्व।',
        mr: 'उच्च कार्यक्षमता आणि दीर्घकाळ टिकणारी टिकाऊपणा.'
      }
    ],
    isActive: true,
    isFeatured: Math.random() > 0.85,
    reviews
  });
};

// 1. GROCERY (20 products)
const groceryEmoji = '🍎';
addProduct('Grocery', 'Aashirvaad', 'Aashirvaad Chakki Atta 5kg', 260, 15, 'https://www.bigbasket.com/media/uploads/p/l/126906_8-aashirvaad-atta-whole-wheat.jpg', '100% stone-ground whole wheat flour. Soft rotis and rich in dietary fibers.', groceryEmoji);
addProduct('Grocery', 'Tata', 'Tata Salt Iodised 1kg', 28, 10, 'https://www.bigbasket.com/media/uploads/p/l/40155574_9-tata-salt-iodized.jpg', 'Iodised vacuum evaporated salt. Essential dietary mineral for daily health.', groceryEmoji);
addProduct('Grocery', 'Fortune', 'Fortune Refined Mustard Oil 1L', 175, 12, 'https://www.bigbasket.com/media/uploads/p/l/413495_13-fortune-mustard-oil.jpg', 'Cold-pressed pure mustard oil. High pungency, rich aroma, and natural antioxidants.', groceryEmoji);
addProduct('Grocery', 'Amul', 'Amul Pure Cow Ghee 1L Tin', 680, 8, 'https://www.bigbasket.com/media/uploads/p/l/40212356_3-amul-cow-ghee.jpg', 'Pure cow ghee prepared from fresh milk. Granular texture and authentic rich aroma.', groceryEmoji);
addProduct('Grocery', 'Nestle', 'Nestle Maggi Masala Noodles 280g', 95, 5, 'https://www.bigbasket.com/media/uploads/p/l/1200180_4-maggi-2-minute-instant-noodles-masala.jpg', 'Instant wheat noodles with 12 secret spices tastemaker pouch. Classic childhood snack.', groceryEmoji);
addProduct('Grocery', 'Tata', 'Tata Tea Gold Premium 500g', 320, 15, 'https://www.bigbasket.com/media/uploads/p/l/40118314_3-tata-tea-gold.jpg', 'Assam tea blend with 15% long leaves. Rich taste and irresistible aroma.', groceryEmoji);
addProduct('Grocery', 'Parle-G', 'Parle-G Gold Biscuits 1kg', 120, 10, 'https://www.bigbasket.com/media/uploads/p/l/102102_4-parle-g-biscuits.jpg', 'Parle-G Gold biscuit containing goodness of milk and wheat. Perfect tea partner.', groceryEmoji);
addProduct('Grocery', 'Sunfeast', 'Sunfeast Dark Fantasy Choco Fills 75g', 40, 10, 'https://www.bigbasket.com/media/uploads/p/l/40018532_6-sunfeast-dark-fantasy-choco-fills.jpg', 'Dark baked cookies with luxurious molten choco creme filling inside.', groceryEmoji);
addProduct('Grocery', 'Cadbury', 'Cadbury Dairy Milk Chocolate 150g', 150, 12, 'https://www.bigbasket.com/media/uploads/p/l/20002773_2-cadbury-dairy-milk.jpg', 'Smooth and creamy milk chocolate. Delicious treat for celebrations.', groceryEmoji);
addProduct('Grocery', 'Haldiram\'s', 'Haldiram\'s Bhujia Sev 350g', 110, 12, 'https://www.bigbasket.com/media/uploads/p/l/40018596_1-haldirams-bhujia-sev.jpg', 'Crispy and spicy gram flour noodle snack. Classic Indian savory treat.', groceryEmoji);
addProduct('Grocery', 'Catch', 'Catch Turmeric Powder 200g', 48, 15, 'https://www.bigbasket.com/media/uploads/p/l/10000097_19-catch-turmeric-powder.jpg', 'Pure ground turmeric powder. Adds vibrant yellow color and antiseptic value to dishes.', groceryEmoji);
addProduct('Grocery', 'Catch', 'Catch Coriander Powder 200g', 52, 10, 'https://www.bigbasket.com/media/uploads/p/l/10000093_17-catch-coriander-powder.jpg', 'Aromatic ground coriander powder. Freshly milled from selected dried seeds.', groceryEmoji);
addProduct('Grocery', 'Fortune', 'Fortune Toor Dal 1kg', 185, 10, 'https://www.bigbasket.com/media/uploads/p/l/40000291_9-fortune-arhar-toor-dal.jpg', 'Split pigeon peas dal. High protein content, unpolished natural grains.', groceryEmoji);
addProduct('Grocery', 'Fortune', 'Fortune Chana Dal 1kg', 95, 12, 'https://www.bigbasket.com/media/uploads/p/l/40000292_5-fortune-chana-dal.jpg', 'Split desi bengal gram dal. Milled using hygienic procedures, rich in fiber.', groceryEmoji);
addProduct('Grocery', 'Fortune', 'Fortune Moong Dal 1kg', 145, 15, 'https://www.bigbasket.com/media/uploads/p/l/10000431_18-fortune-moong-dal.jpg', 'Split skinless yellow mung beans. Fast cooking, light on stomach, high nutrition.', groceryEmoji);
addProduct('Grocery', 'Tata Sampann', 'Tata Sampann Premium Almonds 200g', 240, 18, 'https://www.bigbasket.com/media/uploads/p/l/40118803_1-tata-sampann-almonds.jpg', 'Premium whole almonds. High in vitamin E, dietary fibers, and healthy fats.', groceryEmoji);
addProduct('Grocery', 'Tata Sampann', 'Tata Sampann Kabuli Chana 500g', 95, 15, 'https://www.bigbasket.com/media/uploads/p/l/40101565_1-tata-sampann-unpolished-kabuli-chana.jpg', 'Large size Kabuli chickpeas. Ideal for chole masala recipes, rich in protein.', groceryEmoji);
addProduct('Grocery', 'Amul', 'Amul Pasteurised Butter 500g', 275, 5, 'https://www.bigbasket.com/media/uploads/p/l/104864_8-amul-butter-pasteurised.jpg', 'Classic salted cream butter. Creamy texture, perfect spread for breads and parathas.', groceryEmoji);
addProduct('Grocery', 'Surf Excel', 'Surf Excel Easy Wash 1kg', 140, 10, 'https://www.bigbasket.com/media/uploads/p/l/40075537_5-surf-excel-easy-wash-detergent-powder.jpg', 'High-quality detergent powder. Fast stain removal in bucket wash.', groceryEmoji);
addProduct('Grocery', 'Vim', 'Vim Dishwash Bar 300g', 30, 10, 'https://www.bigbasket.com/media/uploads/p/l/306168_2-vim-dishwash-bar.jpg', 'Lemon power dishwash bar. Cuts tough grease stains quickly and leaves clean shine.', groceryEmoji);


// 2. AGRICULTURE (20 products)
const agriEmoji = '🌱';
addProduct('Agriculture', 'TrustBasket', 'TrustBasket Organic Vermicompost 5kg', 350, 15, 'https://www.bigbasket.com/media/uploads/p/l/40311748_1-trustbasket-organic-vermicompost-fertilisermanure-for-plants-5-kg.jpg', 'Premium organic vermicompost manure. Rich in nitrogen, phosphorus, and potassium to promote active growth.', agriEmoji);
addProduct('Agriculture', 'TrustBasket', 'TrustBasket Cow Manure 5kg', 290, 10, 'https://www.bigbasket.com/media/uploads/p/l/40311750_1-trustbasket-cow-manure-for-plants-5-kg.jpg', 'Decomposed organic cow manure for home gardening. Restores soil quality and microbial activity.', agriEmoji);
addProduct('Agriculture', 'TrustBasket', 'TrustBasket Bone Meal 450g', 120, 15, 'https://www.bigbasket.com/media/uploads/p/l/40311767_1-trustbasket-bone-meal-fertiliser-for-plants-450-g.jpg', 'Phosphorus-rich organic bone meal powder. Excellent root developer for flowering and fruiting plants.', agriEmoji);
addProduct('Agriculture', 'IFFCO', 'IFFCO Urban Gardens Green Diet 500ml', 210, 10, 'https://www.bigbasket.com/media/uploads/p/l/40198958_1-iffco-urban-gardens-green-diet-instant-plant-food-500-ml.jpg', 'Instant liquid plant food. Multi-nutrient formula for healthy foliage and green shine.', agriEmoji);
addProduct('Agriculture', 'IFFCO', 'IFFCO Urban Gardens Green Diet Spray 200ml', 125, 12, 'https://www.bigbasket.com/media/uploads/p/l/40269203_1-iffco-urban-gardens-green-diet-all-purpose-organic-plant-food-spray-provides-nourishment-200-ml.jpg', 'Ready-to-use plant nutrient spray. Feeds foliage directly for rapid growth and vibrant blooms.', agriEmoji);
addProduct('Agriculture', 'IFFCO', 'IFFCO Urban Gardens Sea Secret Granules 500g', 180, 15, 'https://www.bigbasket.com/media/uploads/p/l/40198957_1.jpg', 'Seaweed extract bio-stimulant granules. Boosts nutrient uptake, flower counts, and stress tolerance.', agriEmoji);
addProduct('Agriculture', 'IFFCO', 'IFFCO Urban Gardens Magic Potting Soil 2kg', 195, 12, 'https://www.bigbasket.com/media/uploads/p/l/40206000_1.jpg', 'Ready-to-use premium potting soil mix. Enriched with organic nutrients and aerated minerals.', agriEmoji);
addProduct('Agriculture', 'IFFCO', 'IFFCO Urban Gardens Horti-Perlite 400g', 145, 10, 'https://www.bigbasket.com/media/uploads/p/l/40206002_1-iffco-urban-gardens-horti-perlite-400-g.jpg', 'Volcanic mineral horti-perlite. Essential soil conditioner for high porosity and root zone drainage.', agriEmoji);
addProduct('Agriculture', 'IFFCO', 'IFFCO Urban Gardens Dr Neem Repellant 50ml', 99, 15, 'https://www.bigbasket.com/media/uploads/p/l/40243584_1-iffco-urban-gardens-dr-neem-organic-pest-repellant-protects-plants-from-fungus-bacteria-50-ml.jpg', 'Organic pest repellent concentrate. Keeps plants safe from fungus, mold, and insect attacks.', agriEmoji);
addProduct('Agriculture', 'TrustBasket', 'TrustBasket Neem Cake Powder 450g', 110, 12, 'https://www.bigbasket.com/media/uploads/p/l/40311758_1-trustbasket-neem-cake-powder-organic-fertiliser-pest-repellent-for-plants-450-g.jpg', 'Cold-pressed neem cake powder. Dual action organic fertilizer and natural soil insecticide.', agriEmoji);
addProduct('Agriculture', 'TrustBasket', 'TrustBasket Cocopeat Block 5kg', 320, 15, 'https://www.bigbasket.com/media/uploads/p/l/40311751_1-trustbasket-cocopeat-block-expands-to-75-litres-of-cocopeat-powder-5-kg.jpg', 'Organic coconut coir peat block. Expands to 75L of moisture-retaining potting medium.', agriEmoji);
addProduct('Agriculture', 'TrustBasket', 'TrustBasket Garden Watering Can Sprayer 5L', 380, 10, 'https://www.bigbasket.com/media/uploads/p/l/40311760_2-trustbasket-garden-watering-can-sprayer-for-indoor-outdoor-plants-green-5-l.jpg', 'Heavy-duty 5L watering can with dual mode sprayer rose. Ideal for uniform crop watering.', agriEmoji);
addProduct('Agriculture', 'Kraft Seeds', 'Kraft Seeds Hanging Planter Balcony Blue 1pc', 190, 15, 'https://www.bigbasket.com/media/uploads/p/l/40281802_1-kraft-seeds-plastic-single-hook-hanging-planter-for-balcony-blue-bpa-free-1-pc.jpg', 'BPA-free plastic hanging pot with single hook. Perfect space-saving gardening planter.', agriEmoji);
addProduct('Agriculture', 'Kraft', 'Kraft Seeds Tomato Seeds Packet', 50, 10, 'https://www.bigbasket.com/media/uploads/p/l/40209707_1-natures-plus-kraft-seeds-tomato-set-of-1.jpg', 'High-germination tomato seeds for home kitchen garden. Yields juicy, firm red tomatoes.', agriEmoji);
addProduct('Agriculture', 'Kraft', 'Kraft Seeds Carrot Seeds Packet', 55, 10, 'https://www.bigbasket.com/media/uploads/p/l/40209709_1-natures-plus-kraft-seeds-carrot-set-of-1.jpg', 'Premium carrot seeds. Fast growing, high yield, produces sweet and crunchy orange carrots.', agriEmoji);
addProduct('Agriculture', 'Kraft', 'Kraft Seeds Chilli Seeds Packet', 50, 10, 'https://www.bigbasket.com/media/uploads/p/l/40192804_2-natures-plus-chilli-plant-seeds-for-home-garden-set-of-1.jpg', 'Hot green chilli plant seeds. High heat variety, excellent disease tolerance.', agriEmoji);
addProduct('Agriculture', 'Kraft', 'Kraft Seeds Coriander Seeds Packet', 45, 10, 'https://www.bigbasket.com/media/uploads/p/l/40209705_1-natures-plus-kraft-seeds-coriander-set-of-1.jpg', 'Broad-leaf coriander seeds. Matures into aromatic, fresh cilantro herbs.', agriEmoji);
addProduct('Agriculture', 'Kraft', 'Kraft Seeds Spinach Seeds Packet', 60, 12, 'https://www.bigbasket.com/media/uploads/p/l/40209703_1-natures-plus-kraft-seeds-sipnach-set-of-1.jpg', 'Spinach (Palak) hybrid seeds. Rich in iron, fast growing leafy green crop.', agriEmoji);
addProduct('Agriculture', 'Kraft', 'Kraft Seeds Okra Seeds Packet', 50, 10, 'https://www.bigbasket.com/media/uploads/p/l/40250625_1-natures-plus-lady-finger-plant-seeds-for-home-garden-set-of-1.jpg', 'Bhindi/Lady Finger seeds. Yields tender, dark-green nutritious pods.', agriEmoji);
addProduct('Agriculture', 'Kraft', 'Kraft Seeds Cucumber Seeds Packet', 55, 10, 'https://www.bigbasket.com/media/uploads/p/l/40209718_1-natures-plus-kraft-seeds-cucumber-green-set-of-1.jpg', 'Hybrid green cucumber seeds. High yielding crop, crisp and cooling cucumber pods.', agriEmoji);

// 3. BUILDING MATERIALS (20 products)
const buildEmoji = '🧱';
addProduct('Building Materials', 'UltraTech', 'UltraTech Premium Portland Cement 50kg Bag', 420, 10, 'https://5.imimg.com/data5/ZV/IV/SM/SELLER-79364225/50kg-ultratech-cement-1000x1000.jpg', 'OPC 53 grade concrete construction cement. Ultra-high compressive strength and durability.', buildEmoji);
addProduct('Building Materials', 'Ambuja', 'Ambuja Kawach Waterproof Cement 50kg Bag', 450, 10, 'https://5.imimg.com/data5/GLADMIN/Default/2022/7/VR/VA/XS/86648/ambuja-cement-500x500.jpg', 'Specially formulated waterproof cement. Restricts moisture path and delays corrosion.', buildEmoji);
addProduct('Building Materials', 'Dr. Fixit', 'Dr. Fixit New Coat 603 Waterproofing 20L', 4200, 12, 'https://cdn.moglix.com/p/JcQ8HFa02pgo7-xxlarge.jpg', 'Micro-fiber reinforced elastomeric liquid waterproofing membrane for roof coatings.', buildEmoji);
addProduct('Building Materials', 'Dr. Fixit', 'Dr. Fixit Pidiproof LW+ Liquid 1L', 165, 10, 'https://cdn.moglix.com/p/adq7DA4U70nIO-xxlarge.jpg', 'Specially formulated liquid waterproofing compound for concrete and mortar plastering.', buildEmoji);
addProduct('Building Materials', 'Dr. Fixit', 'Dr. Fixit Super Latex 302 SBR Polymer 20kg', 3100, 15, 'https://cdn.moglix.com/p/iNg976yPd1nIE-xxlarge.jpg', 'Styrene butadiene copolymer latex for waterproofing, bonding, and structural repair.', buildEmoji);
addProduct('Building Materials', 'Dr. Fixit', 'Dr. Fixit Super Latex 302 SBR Polymer 1kg', 220, 10, 'https://cdn.moglix.com/p/IvmAZZIvvlTGR-xxlarge.jpg', 'High performance bonding agent for repair of concrete columns, beams, and slabs.', buildEmoji);
addProduct('Building Materials', 'Dr. Fixit', 'Dr. Fixit New Coat Ezee Waterproofing 20L', 4350, 12, 'https://cdn.moglix.com/p/DINDz2jyi5edb-xxlarge.jpg', 'High build elastomeric waterproofing coating for exterior terrace roofs and walls.', buildEmoji);
addProduct('Building Materials', 'Birla White', 'Birla White Wall Care Putty 40kg Bag', 950, 10, 'https://cdn.moglix.com/p/YPjvV3ROdMLa3-xxlarge.jpg', 'White cement-based wall putty. Smooth velvety finish and moisture-proof primer coat.', buildEmoji);
addProduct('Building Materials', 'Fevicol', 'Fevicol SH Synthetic Resin Adhesive 5kg', 1150, 10, 'https://cdn.moglix.com/p/LpPQxDzqfdkxQ-xxlarge.jpg', 'Synthetic wood resin adhesive. Strong wood bonding, standard carpenter choice.', buildEmoji);
addProduct('Building Materials', 'Asian Paints', 'Asian Paints TruCare Interior Wall Primer 20L', 2450, 15, 'https://cdn.moglix.com/p/z69RqEFxqB4FI-xxlarge.jpg', 'Acrylic interior water-based primer paint. Solid base coat adhesion for wall paint colors.', buildEmoji);
addProduct('Building Materials', 'Asian Paints', 'Asian Paints TruCare Exterior Wall Primer 20L', 2650, 15, 'https://cdn.moglix.com/p/j7Ed8XYBhdfAE-xxlarge.jpg', 'High performance exterior wall primer. Excellent alkali resistance and adhesion.', buildEmoji);
addProduct('Building Materials', 'Saint-Gobain', 'Saint-Gobain Gyproc Gypsum Plaster 25kg Bag', 380, 12, 'https://5.imimg.com/data5/GLADMIN/Default/2022/6/EI/PE/VE/92368/gypsum-plaster-500x500.jpg', 'Superior quality gypsum plaster. Gives a smooth matte finish directly on brick walls.', buildEmoji);
addProduct('Building Materials', 'Local', 'Red Clay Bricks (Stack of 500 Bricks)', 3500, 10, 'https://5.imimg.com/data5/MC/VP/FI/ANDROID-49034449/1577500480900-jpg-500x500.jpg', 'Kiln-burnt standard structural red clay bricks. Durable strength, perfect for load-bearing walls.', buildEmoji);
addProduct('Building Materials', 'Local', '8x8 Interlocking Concrete Paver Blocks (Set of 100)', 1800, 10, 'https://5.imimg.com/data5/SELLER/Default/2024/6/429111129/HB/QW/GD/6094428/8x8-paver-block-500x500.jpg', 'High strength concrete interlocking paver blocks for driveways and walkways.', buildEmoji);
addProduct('Building Materials', 'Tata Tiscon', 'Tata Tiscon Fe 550D TMT Steel Rebar Rods', 64000, 12, 'https://5.imimg.com/data5/SELLER/Default/2023/3/294818906/KJ/CE/JE/14294560/tata-tiscon-tata-tmt-rod-for-construction-500x500.jpg', 'Fe 550D grade steel TMT reinforcing bars. High ductility and earthquake resistant. Price per Ton.', buildEmoji);
addProduct('Building Materials', 'UltraTech', 'Ultratech AAC Blocks (Size 4x8x24, Set of 50)', 2800, 15, 'https://5.imimg.com/data5/GLADMIN/Default/2022/6/WU/EP/AW/91623/aac-block-500x500.jpg', 'Autoclaved Aerated Concrete blocks. Lightweight, high heat insulation, fast construction.', buildEmoji);
addProduct('Building Materials', 'Asian Paints', 'Asian Paints Tractor Emulsion White Paint 10L', 850, 10, 'https://cdn.moglix.com/p/J/8/H/d/MINJ8H2H5DME1-xxlarge.jpg', 'Beautiful matte finish interior wall paint. Smooth finish, long durability, high coverage.', buildEmoji);
addProduct('Building Materials', 'Asian Paints', 'Asian Paints Tractor Emulsion White Paint 15L', 1250, 10, 'https://cdn.moglix.com/p/I/W/2/d/MINIW2L95DME1-xxlarge.jpg', 'Acrylic emulsion paint for interior walls. Water-based paint, washable formulation.', buildEmoji);
addProduct('Building Materials', 'UltraTech', 'UltraTech Ready Mix Concrete M20 Grade (1 Cubic Meter)', 4500, 10, 'https://5.imimg.com/data5/GLADMIN/Default/2022/6/KZ/CQ/QE/92368/ready-mixed-concrete-500x500.jpg', 'Centralized batching plant concrete mix. High uniformity, durability, and standard setting.', buildEmoji);
addProduct('Building Materials', 'Local', 'Natural River Sand for Construction (1 Brass)', 5500, 5, 'https://5.imimg.com/data5/GLADMIN/Default/2022/6/RH/YP/UN/91623/river-sand-500x500.jpg', 'Coarse river sand. Screened and washed, perfect for cement concrete mixing and plastering.', buildEmoji);

// 4. HARDWARE TOOLS (20 products)
const toolEmoji = '🔧';
addProduct('Hardware Tools', 'Stanley', 'Stanley Steel Claw Hammer 16oz', 450, 15, 'https://cdn.moglix.com/p/I/E/I/d/MINIEINY5DME1-xxlarge.jpg', 'High-carbon polished steel claw hammer. Tough fiberglass handle, vibration absorption grip.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia Ball Pein Hammer with Wooden Handle', 280, 10, 'https://cdn.moglix.com/p/bg0wA1VTxsGTq-xxlarge.jpg', 'Drop forged steel ball pein hammer. Seasoned wooden handle, classic blacksmith tool.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia Pipe Wrench Heavy Duty 14 Inch', 790, 10, 'https://cdn.moglix.com/p/4qJNILLnhPp1F-xxlarge.jpg', 'Drop forged steel jaws, heavy duty handle pipe wrench. Perfect grip tool for steel pipes.', toolEmoji);
addProduct('Hardware Tools', 'Stanley', 'Stanley Adjustable Spanner Wrench 10 Inch', 650, 15, 'https://cdn.moglix.com/p/I/3/4/d/MINI34YH5DRWO-xxlarge.jpg', 'Chrome finish steel adjustable jaw spanner wrench. Precision worm wheel adjustment scale.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia Combination Spanner Set (Set of 12)', 720, 12, 'https://cdn.moglix.com/p/FzDIMBYgkCHcY-xxlarge.jpg', 'Set of 12 double-ended chrome vanadium ring and open spanners. Sizes 6mm to 32mm.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia 7 Pcs 1/2 inch Square Drive Socket Set', 950, 15, 'https://cdn.moglix.com/p/8ESP8AwiORsMq-xxlarge.jpg', 'Bi-hexagonal square drive sockets set. Made of high grade steel for heavy duty fastener works.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia Screwdriver Toolkit Set (8 Pieces)', 380, 10, 'https://cdn.moglix.com/p/I/E/I/d/MINIEI645DF23-xxlarge.jpg', 'Screwdriver tool set with neon bulb tester. Hardened alloy steel blades, plastic case.', toolEmoji);
addProduct('Hardware Tools', 'Bosch', 'Bosch GBM 350 Professional 350W Rotary Drill Machine', 2999, 20, 'https://cdn.moglix.com/p/0OpqJC038wi89-xxlarge.jpg', 'Professional 350W rotary drill machine. Compact and slim design for easy handling.', toolEmoji);
addProduct('Hardware Tools', 'Bosch', 'Bosch GWS 600 Professional Angle Grinder', 2450, 15, 'https://cdn.moglix.com/p/ILO979GuJQ5DG-xxlarge.jpg', '670W robust corded angle grinder. Handheld tool for grinding and cutting stone or steel.', toolEmoji);
addProduct('Hardware Tools', 'Stanley', 'Stanley Tylon Short Measurement Tape 5m', 290, 15, 'https://cdn.moglix.com/p/lbJTdFBZGe0gd-xxlarge.jpg', 'Impact-resistant case, steel measuring scale with Mylar polymer coating for long print life.', toolEmoji);
addProduct('Hardware Tools', 'Stanley', 'Stanley BI Heavy Duty Hand Saw 15 Inch', 520, 12, 'https://cdn.moglix.com/p/SFUcJi8bG1M3G-xxlarge.jpg', 'Bi-material handle hand saw with induction-hardened teeth. Smooth and fast cutting performance.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia Combination Cutting Pliers 8 Inch', 320, 10, 'https://cdn.moglix.com/p/I/3/4/d/MINI34YH5DME1-xxlarge.jpg', 'Drop forged chrome-vanadium steel combination wire cutting pliers. Thick insulated rubber handle.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia Long Nose Pliers 8 Inch', 290, 10, 'https://cdn.moglix.com/p/I/T/A/d/MINITABK5DF81-xxlarge.jpg', 'Long nose pliers designed for gripping, holding, bending, and cutting wires in tight spots.', toolEmoji);
addProduct('Hardware Tools', 'Swati', 'Swati Cast Iron Bench Vice Swivel Base 4 Inch', 1450, 15, 'https://cdn.moglix.com/p/I/Q/T/d/MINIQTHBIGGC1-xxlarge.jpg', 'Swivel base heavy duty bench vice. Made of high grade cast iron for solid gripping and clamping.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia Allen Key Wrench Set (9 Pieces)', 260, 10, 'https://cdn.moglix.com/p/Jn56BYddoNgVC-xxlarge.jpg', 'Hexagonal Allen keys L-wrench set. Durable steel construction, pocket compact organizer.', toolEmoji);
addProduct('Hardware Tools', 'Taparia', 'Taparia Ratchet Type Torque Wrench 1/2 Inch', 3200, 10, 'https://cdn.moglix.com/p/0aAeYZPfAAt2Y-xxlarge.JPG', 'Ratchet type square drive adjustable torque wrench. Precision fastening for automotive repair.', toolEmoji);
addProduct('Hardware Tools', 'Stanley', 'Stanley hacksaw Frame with Blade 12 Inch', 480, 14, 'https://cdn.moglix.com/p/pRvdWebzhU3pv-xxlarge.jpg', 'Adjustable heavy-duty tubular steel hacksaw frame. Includes high speed steel blade.', toolEmoji);
addProduct('Hardware Tools', 'Jon Bhandari', 'Jon Bhandari Wood Chisel Set (3 Pieces)', 420, 12, 'https://cdn.moglix.com/p/xamtAveuJL2VO-xxlarge.jpg', 'Chrome vanadium steel woodworking chisels. Features PVC impact resistant grip handles.', toolEmoji);
addProduct('Hardware Tools', 'Stanley', 'Stanley Metal Latched Tool Box Organiser 16 Inch', 850, 15, 'https://cdn.moglix.com/p/7pyz8f6sUfrxD-xxlarge.jpg', 'Portable plastic tool storage organizer box. Heavy-duty metal latches for secure latching.', toolEmoji);
addProduct('Hardware Tools', 'Swati', 'Swati Alloy Steel Welding Chipping Hammer', 380, 10, 'https://cdn.moglix.com/p/bcllIChFpwN7H-xxlarge.jpg', 'Alloy steel welding slag chipping hammer with spring wire spiral handle. Shock absorption design.', toolEmoji);

// 5. PLUMBING (20 products)
const plumbEmoji = '🚰';
addProduct('Plumbing', 'Astral', 'Astral PVC SWR Pipe 10ft Length 110mm', 650, 10, 'https://5.imimg.com/data5/SELLER/Default/2020/9/KD/CO/FW/3744426/110mm-astral-pvc-pipe-1000x1000.jpg', '110mm outer diameter PVC pipe. Durable SWR drainage plumbing system application.', plumbEmoji);
addProduct('Plumbing', 'Supreme', 'Supreme CPVC Pipes 10ft Length 1 Inch', 780, 12, 'https://cdn.moglix.com/p/s4kNfDyxjo0vk-xxlarge.jpg', '1 inch CPVC pipe. Suitable for hot and cold water transmission, high pressure grade.', plumbEmoji);
addProduct('Plumbing', 'Astral', 'Astral Aquarius UPVC Pipe Sch 40 3m', 420, 10, 'https://5.imimg.com/data5/JR/KH/XB/SELLER-25008036/astral-aquarius-sch-40-3-meter-upvc-pipe-1000x1000.jpg', 'High quality Sch 40 UPVC pipe, corrosion-resistant, ideal for cold water distribution systems.', plumbEmoji);
addProduct('Plumbing', 'Supreme', 'Supreme PVC Elbow Connector 90 Degree 110mm', 140, 12, 'https://cdn.moglix.com/p/6vvdknFij2vBq-xxlarge.jpg', 'SWR grade PVC elbow pipe joint connector. Standard 90-degree angle sleeve reducer.', plumbEmoji);
addProduct('Plumbing', 'Supreme', 'Supreme PVC Tee Connector 110mm', 165, 10, 'https://cdn.moglix.com/p/9pOiEaMEBiR7y-xxlarge.jpg', 'SWR PVC T-joint pipe connector. Strong structure, easy solvent socket welding.', plumbEmoji);
addProduct('Plumbing', 'Supreme', 'Supreme PVC Socket Connector 110mm', 95, 12, 'https://cdn.moglix.com/p/9GxhsoqQ0QVJ1-xxlarge.jpg', 'PVC socket connector. Durable plumbing adapter joint for SWR piping systems.', plumbEmoji);
addProduct('Plumbing', 'Supreme', 'Supreme PVC Coupler Pipe Connector 110mm', 110, 10, 'https://cdn.moglix.com/p/Hy0vNCPXxoscS-xxlarge.jpg', 'PVC coupler joint. Straight pipe connection sleeve adaptor for SWR plumbing setup.', plumbEmoji);
addProduct('Plumbing', 'Zoloto', 'Zoloto Bronze Ball Valve with Strainer 25mm', 1250, 15, 'https://cdn.moglix.com/p/FRaxcOnfuQszf-xxlarge.jpg', '25mm bronze ball valve with integral screwed strainer. Designed for flow control and debris filtration.', plumbEmoji);
addProduct('Plumbing', 'Zoloto', 'Zoloto Bronze Gate Valve Peg Type 1 Inch', 1150, 15, 'https://cdn.moglix.com/p/I/O/H/d/MINIOHOG5DF81-xxlarge.jpg', 'Forged bronze gate valve. Threaded inlet/outlet plumbing flow controller valve.', plumbEmoji);
addProduct('Plumbing', 'Cera', 'Cera Topaz Quarter Turn Pillar Faucet Water Tap', 850, 12, 'https://cdn.moglix.com/p/J/H/5/d/MINJH5IOI4XCF-xxlarge.jpg', 'Quarter turn pillar faucet water tap. Anti-rust brass core, smooth water flow.', plumbEmoji);
addProduct('Plumbing', 'ZAP', 'ZAP Brass Chrome Plated Bib Cock', 420, 10, 'https://cdn.moglix.com/p/DDcevQnN0sNbJ-xxlarge.jpg', 'Chrome plated brass body bib cock tap. Heavy duty design for bathroom and kitchen use.', plumbEmoji);
addProduct('Plumbing', 'Jaquar', 'Jaquar Florentine Brass Angle Valve', 650, 15, 'https://cdn.moglix.com/p/6kxubbZhyp9mj-xxlarge.jpeg', 'Brass chrome finish angle valve with wall flange. Durable flow regulation valve.', plumbEmoji);
addProduct('Plumbing', 'Jaquar', 'Jaquar Solo Pillar Faucet Wash Basin Tap', 1850, 15, 'https://cdn.moglix.com/p/I/9/V/d/MINI9VN7IZP77-xxlarge.jpg', 'Solo pillar faucet long neck tap. Elegant deck-mounted chrome wash basin tap.', plumbEmoji);
addProduct('Plumbing', 'IRIS', 'IRIS Stainless Steel Golden Kitchen Sink Tap', 3400, 15, 'https://cdn.moglix.com/p/Bmk5IW0V1y9a9-xxlarge.jpg', 'Premium stainless steel golden kitchen sink tap with pull-down dual-flow sprayer.', plumbEmoji);
addProduct('Plumbing', 'Jaquar', 'Jaquar Rain Overhead Shower Chrome Finish', 2450, 15, 'https://cdn.moglix.com/p/S3mmUlrJ41LSp-xxlarge.jpg', 'Overhead shower set with chrome finish. Multi-flow rain spray nozzles.', plumbEmoji);
addProduct('Plumbing', 'Jaquar', 'Jaquar Allied Braided Flexible Hose Pipe', 290, 10, 'https://cdn.moglix.com/p/I/E/H/d/MINIEHNHI0LEF-xxlarge.jpg', '450mm chrome-braided flexible connection hose pipe for geysers and basin mixers.', plumbEmoji);
addProduct('Plumbing', 'Supreme', 'Supreme CPVC Water Tank Connector 1.5 Inch', 195, 10, 'https://cdn.moglix.com/p/3ZB1HWXQCQZgJ-xxlarge.jpg', '1.5 inch CPVC tank connector nipple. Leakproof outlet joint connection for water tanks.', plumbEmoji);
addProduct('Plumbing', 'Astral', 'Astral Weld-on 705 PVC Solvent Cement 500ml', 320, 10, 'https://cdn.moglix.com/p/n7Rj8ZqaNvPw3-xxlarge.jpg', 'Medium-bodied industrial-grade PVC pipe solvent cement. Rapid setting, strong leakproof bond.', plumbEmoji);
addProduct('Plumbing', 'Lovely', 'Lovely Mild Steel Rubber Lined Pipe Clamp 150mm', 180, 10, 'https://cdn.moglix.com/p/KcZF9O6COdG7t-xxlarge.jpg', '150mm mild steel split support pipe clamp with PVC/EPDM rubber lining for vibration damping.', plumbEmoji);
addProduct('Plumbing', 'Sintex', 'Sintex Loft 1000L Water Tank', 6800, 12, 'https://cdn.moglix.com/p/GKNYAuGHEUAuM-xxlarge.jpg', '1000 Liters indoor/loft water storage tank. Food-grade plastic, hygienic structure.', plumbEmoji);


// 6. ELECTRICAL (20 products)
const elecEmoji = '💡';
addProduct('Electrical', 'Syska', 'Syska 9W Bright LED Light Bulb B22', 99, 20, 'https://cdn.moglix.com/p/oshKDo8Gv2fuC-xxlarge.jpg', 'Energy saving cool day light B22 LED bulb. Safe surge protection, long life.', elecEmoji);
addProduct('Electrical', 'Syska', 'Syska 20W LED Slim Tube Light 4ft', 249, 15, 'https://cdn.moglix.com/p/htJW9Vv0j2UuM-xxlarge.jpg', '4 feet slim wall mounted LED tube light panel. Bright white light output.', elecEmoji);
addProduct('Electrical', 'Havells', 'Havells 1200mm High Speed Ceiling Fan', 2250, 18, 'https://cdn.moglix.com/p/akg9iUttPestM-xxlarge.jpg', 'Double ball bearing high speed 1200mm ceiling fan. Broad blades for high air delivery.', elecEmoji);
addProduct('Electrical', 'Havells', 'Havells Ventil Air DX 200mm Exhaust Fan', 1150, 12, 'https://cdn.moglix.com/p/ogMeDP3CPlNTS-medium.jpg', 'High performance exhaust fan. Ideal for kitchen and bathroom ventilation.', elecEmoji);
addProduct('Electrical', 'Anchor', 'Anchor Roma 6A 1-Way Switch White', 32, 10, 'https://cdn.moglix.com/p/I/W/2/d/MINIW21PIZ600-xxlarge.jpg', 'Standard 1-way wall switch. Smooth toggle clicking, fire-retardant poly-carbonate.', elecEmoji);
addProduct('Electrical', 'Anchor', 'Anchor Roma 5-Pin Electrical Socket 6A', 65, 10, 'https://cdn.moglix.com/p/wAcQ6D0eeOmsv-xxlarge.jpg', 'Roma modular 5-pin wall outlet plug socket. White color, child safety shutters.', elecEmoji);
addProduct('Electrical', 'Havells', 'Havells MCB Single Pole C-Curve 16A', 199, 12, 'https://cdn.moglix.com/p/xdRpQNYzrgmDJ-xxlarge.jpg', 'Miniature circuit breaker single pole C-curve. Protects house wiring from overloads.', elecEmoji);
addProduct('Electrical', 'Havells', 'Havells 8-Way QVE Series Distribution Board', 850, 15, 'https://cdn.moglix.com/p/OPRmbMLdYYpGM-xxlarge.jpg', 'Flush mount sheet metal distribution board box. Elegant double door, holds up to 8 MCB switches.', elecEmoji);
addProduct('Electrical', 'Finolex', 'Finolex 1.5 Sqmm FR Copper Electrical Wire Coil 90m', 1450, 15, 'https://cdn.moglix.com/p/SFFNWHFXWCu69-xxlarge.jpg', 'Flame retardant copper electrical wire roll. 90m length, green insulation casing.', elecEmoji);
addProduct('Electrical', 'Goldmedal', 'Goldmedal Curve Plus Logica 4x1 2m Spike Guard Extension Board', 538, 15, 'https://cdn.moglix.com/p/J/H/H/d/MINJHHHXIZ600-xxlarge.jpg', 'Multi-socket spike extension strip board. Built-in master switch, indicator and surge protector.', elecEmoji);
addProduct('Electrical', 'Schneider', 'Schneider Electric Harmony LED Pilot Indicator Light', 180, 10, 'https://cdn.moglix.com/p/pJiwcNkyQjmW8-xxlarge.jpg', '220V integrated LED pilot indicator signal light for control panels.', elecEmoji);
addProduct('Electrical', 'Fybros', 'Fybros Bella Ding Dong Door Bell', 240, 10, 'https://cdn.moglix.com/p/2ym3yhHK1Z0Kj-xxlarge.jpg', 'Electronic Ding Dong door bell. High quality digital sound output.', elecEmoji);
addProduct('Electrical', 'Polycab', 'Polycab PVC Electrical Conduit Pipe 25mm 10ft', 110, 15, 'https://5.imimg.com/data5/AR/YF/MY-47933282/white-pvc-electrical-conduit-pipe-1000x1000.jpg', 'Rigid PVC electrical wire conduit casing pipe. Heavy duty, fire retardant.', elecEmoji);
addProduct('Electrical', 'Cona', 'Cona PVC 4-Way Conduit Junction Box', 75, 10, 'https://cdn.moglix.com/p/n9qdwHe946qyv-xxlarge.jpg', 'PVC electrical conduit junction box. Safe wire routing and distribution enclosure.', elecEmoji);
addProduct('Electrical', 'Steelgrip', 'Steelgrip PVC Electrical Insulating Tape Roll 6m', 15, 10, 'https://cdn.moglix.com/p/Y1L2GujXold33-xxlarge.jpg', 'Self-adhesive PVC insulating tape roll. Heat resistant, safe wire splicing.', elecEmoji);
addProduct('Electrical', 'Anchor', 'Anchor Roma 6-Module Switch board Cover Plate', 120, 12, 'https://cdn.moglix.com/p/w75P0EMOHLq5a-xxlarge.jpg', 'Modular switchboard base plate. White color, fits up to 6 switch modules.', elecEmoji);
addProduct('Electrical', 'Philips', 'Philips LED Downlight Panel Ceiling Light 15W', 699, 15, 'https://cdn.moglix.com/p/I/O/H/d/MINIOHGGIU71O-xxlarge.jpg', 'Round flush ceiling panel downlight LED lamp. Energy efficient, bright warm light.', elecEmoji);
addProduct('Electrical', 'Havells', 'Havells Jeta Valour LED Outdoor Flood Light 50W', 2900, 12, 'https://cdn.moglix.com/p/QnblQEzet8Sd7-xxlarge.jpg', '50W outdoor LED flood light. IP66 waterproof rating, robust aluminium body.', elecEmoji);
addProduct('Electrical', 'Havells', 'Havells Double Pole RCCB 63A 30mA Circuit Breaker', 2250, 15, 'https://cdn.moglix.com/p/pEmLhBPNlNM5d-xxlarge.jpg', 'Residual current circuit breaker. High sensitivity shock protection.', elecEmoji);
addProduct('Electrical', 'Anchor', 'Anchor 6A 3-Pin White Plug Top', 45, 10, 'https://cdn.moglix.com/p/cMaNfpE3HOXX2-xxlarge.jpg', 'Standard 3-pin plug top. Heavy duty brass terminals, white poly-carbonate casing.', elecEmoji);

// 7. FURNITURE (20 products)
const furnEmoji = '🛋️';
addProduct('Furniture', 'Supreme', 'Supreme Plastic Chair Web-Mesh Heavy Duty', 750, 15, 'https://cdn.moglix.com/p/Jy47u2je2xazT-xxlarge.jpg', 'Web-mesh design stackable heavy duty plastic chair. Durable brown plastic armchair.', furnEmoji);
addProduct('Furniture', 'Nilkamal', 'Nilkamal Engineered Wood Wardrobe 2-Door', 8499, 20, 'https://5.imimg.com/data5/SELLER/Default/2026/1/572781292/FX/CP/ZC/183380190/engineered-wood-wardrobe-1000x1000.jpeg', 'Engineered wood double door wardrobe cabinet. Hanging rods and deep drawers storage.', furnEmoji);
addProduct('Furniture', 'Wakefit', 'Wakefit 3-Seater Velvet Fabric Sofa Set', 12499, 15, 'https://cdn.moglix.com/p/w9fw007Lsx1j3-xxlarge.jpg', 'Premium upholstered fabric sofa couch. Soft density foam seat cushions.', furnEmoji);
addProduct('Furniture', 'Nilkamal', 'Nilkamal Solid Wood 4-Seater Dining Table', 9999, 15, 'https://cdn.moglix.com/p/AhGkmJlxaB3kc-xxlarge.jpg', 'Polished wood 4-seater dining table. Classic square family dining table.', furnEmoji);
addProduct('Furniture', 'Sleepwell', 'Sleepwell Dual Comfort Queen Size Mattress', 7200, 18, 'https://5.imimg.com/data5/MW/GN/GLADMIN-66285049/sleepwell-elegance-mattress-1000x1000.jpg', 'Dual feel medium-soft and firm foam mattress. Breathable quilted fabric cover.', furnEmoji);
addProduct('Furniture', 'Wakefit', 'Wakefit Wooden Bedside Nightstand Table', 1450, 10, 'https://5.imimg.com/data5/PC/MC/HT/SELLER-105073984/img-0958-jpg-1000x1000.jpg', 'Sheesham wood bedside nightstand table drawer unit. Compact bedroom organizer drawer.', furnEmoji);
addProduct('Furniture', 'Nilkamal', 'Nilkamal Plastic Dining Table 4-Seater', 2800, 10, 'https://5.imimg.com/data5/TK/NQ/GLADMIN-2/nilkamal-dining-table-500x500.jpg', 'Rectangular brown blow molded plastic dining table. Tough legs, easy wipe cleaning.', furnEmoji);
addProduct('Furniture', 'Supreme', 'Supreme Plastic Stool Medium Comfort', 250, 10, 'https://cdn.moglix.com/p/d1ooaLHCHMH89-xxlarge.jpg', 'Round plastic stackable utility stepper stool. Anti slip rubber base shoes.', furnEmoji);
addProduct('Furniture', 'Wakefit', 'Wakefit King Size Storage Wood Bed Frame', 16500, 15, 'https://5.imimg.com/data5/SELLER/Default/2023/9/341682378/RY/CD/JT/197130466/wakefit-bed-double-bed-queen-size-bed-1000x1000.jpg', 'Solid wood king bed frame with under bed box storage compartments.', furnEmoji);
addProduct('Furniture', 'Sleepwell', 'Sleepwell Orthopaedic Memory Foam Pillow', 799, 12, 'https://4.imimg.com/data4/TH/AC/GLADMIN-184151/sleepwell-pillows-500x500.jpg', 'Ergonomic support memory foam pillow. Relieves neck stiffness and supports sleep.', furnEmoji);
addProduct('Furniture', 'Nilkamal', 'Nilkamal Metal Foldable Clothes Drying Stand', 1450, 15, 'https://5.imimg.com/data5/SELLER/Default/2024/2/393314535/BU/UZ/NW/9406499/nilkamal-zeal-cloth-dryer-silver-1000x1000.png', 'Stainless steel folding clothes dry rack stand. Multi rails for laundry drying.', furnEmoji);
addProduct('Furniture', 'Wakefit', 'Wakefit Ergonomic Office High Back Chair', 5400, 15, 'https://cdn.moglix.com/p/aKUgl1mDAhAFg-xxlarge.jpg', 'Mesh office chair. High back headrest, adjustable armrests, rolling wheels base.', furnEmoji);
addProduct('Furniture', 'Nilkamal', 'Nilkamal Plastic Shoe Storage Rack 4-Tier', 890, 12, 'https://cdn.moglix.com/p/UktAuWLfAL8nR-xxlarge.jpg', '4-tier plastic shoe rack organizer shelf cabinet. Sandy brown color.', furnEmoji);
addProduct('Furniture', 'Supreme', 'Supreme Plastic Foldable Utility Center Table', 1850, 10, 'https://cdn.moglix.com/p/QMOdj4LGMiENW-xxlarge.jpg', 'Lightweight portable utility folding table. Perfect for study, picnic, or garden.', furnEmoji);
addProduct('Furniture', 'Wakefit', 'Wakefit Fabric Pouffe Ottoman footrest Stool', 1250, 10, 'https://5.imimg.com/data5/SELLER/Default/2021/5/YV/JR/YM/57491891/wakefit-napper-ottoman-1000x1000.jpg', 'Upholstered fabric pouffe ottoman footrest stool. Stylish round footrest seat.', furnEmoji);
addProduct('Furniture', 'Sleepwell', 'Sleepwell Premium Comforter Blanket Double Bed', 1890, 15, 'https://5.imimg.com/data5/SELLER/Default/2023/12/366609986/AG/IB/OD/133920743/sleepwell-double-bed-comforter-1000x1000.jpg', 'Quilted microfibre double bed blanket comforter. Warm, soft, and hypoallergenic.', furnEmoji);
addProduct('Furniture', 'Nilkamal', 'Nilkamal Steel Almirah Wardrobe Locker Safe', 11500, 15, 'https://5.imimg.com/data5/GLADMIN/Default/2021/7/NY/FS/TV/86068/nilkamal-almirahs-500x500.jpg', 'Heavy-duty steel wardrobe cabinet storage closet. Integrated locker and keys.', furnEmoji);
addProduct('Furniture', 'Wakefit', 'Wakefit Metal Laptop Desk Bed Tray Stand', 680, 12, 'https://cdn.moglix.com/p/WFy0s0GBCsAKj-xxlarge.jpg', 'Wooden bed tray table. Folding steel legs, mobile slot, laptop lap desk.', furnEmoji);
addProduct('Furniture', 'Supreme', 'Supreme Plastic Armless Stackable Cafe Chair', 550, 10, 'https://cdn.moglix.com/p/iLp5SW9ZmVtn6-xxlarge.jpg', 'Armless stackable molded plastic cafe chair. Lightweight seating cafeteria chair.', furnEmoji);
addProduct('Furniture', 'Sleepwell', 'Sleepwell Coir Fiber Mattress Single Bed', 4200, 10, 'https://4.imimg.com/data4/DM/KC/MY-3181745/sleepwell-mattress-1000x1000.png', 'Single bed firm coir fiber mattress. Natural rubberized coir for back support.', furnEmoji);


// 8. HOME APPLIANCES (20 products)
const appEmoji = '🍳';
addProduct('Home Appliances', 'Panasonic', 'Panasonic 193L Single Door Refrigerator', 14990, 15, 'https://cdn.moglix.com/p/8U3qdpmb2PmfL-xxlarge.jpg', 'Direct Cool single door refrigerator with intelligent inverter compressor and quick ice making.', appEmoji);
addProduct('Home Appliances', 'Toshiba', 'Toshiba 7kg Fully Automatic Front Load Washing Machine', 26990, 20, 'https://cdn.moglix.com/p/nrrbIa6U7d5tF-xxlarge.jpg', 'Fully automatic front loading washing machine with GreatWaves technology and durable inverter motor.', appEmoji);
addProduct('Home Appliances', 'Bajaj', 'Bajaj 20L Solo Microwave Oven', 5499, 10, 'https://cdn.moglix.com/p/wuRUV4DoiE7wF-xxlarge.jpg', 'Solo microwave oven with mechanical control knobs and multi-stage defrosting options.', appEmoji);
addProduct('Home Appliances', 'Kent', 'Kent Ultra Storage RO Water Purifier', 12500, 15, 'https://cdn.moglix.com/p/I/T/8/d/MINIT8G7IID7S-xxlarge.jpg', 'Wall-mountable RO water purifier with multi-stage filtration and large storage tank.', appEmoji);
addProduct('Home Appliances', 'Sujata', 'Sujata Dynamix 900W Mixer Grinder', 5499, 12, 'https://cdn.moglix.com/p/lz0uGa92foWQx-xxlarge.jpg', 'Heavy duty 900W motor mixer grinder with 3 stainless steel jars for dry and wet grinding.', appEmoji);
addProduct('Home Appliances', 'Preethi', 'Preethi Blue Leaf 600W Juicer Mixer Grinder', 3899, 15, 'https://cdn.moglix.com/p/kauWepIKo4kZD-medium.jpg', '600W high performance motor juicer mixer grinder with leakproof stainless steel jars.', appEmoji);
addProduct('Home Appliances', 'Bajaj', 'Bajaj 1.5L Stainless Steel Electric Kettle', 999, 15, 'https://cdn.moglix.com/p/FWfRHDEgQyQWJ-medium.jpg', '1500W rapid boil electric water kettle. Cordless steel base, auto shut-off safety protection.', appEmoji);
addProduct('Home Appliances', 'Prestige', 'Prestige Induction Cooktop G3 Glass Top', 1850, 15, 'https://cdn.moglix.com/p/yK3ZHY5XuO91d-xxlarge.jpg', 'Glass induction cooktop panel. Anti magnetic wall cooktop, auto power saver.', appEmoji);
addProduct('Home Appliances', 'Prestige', 'Prestige Electric Rice Cooker 1.8L Double Pot', 2100, 10, 'https://cdn.moglix.com/p/qX9VfP3ZZoUI7-xxlarge.jpg', '1.8L kitchen electric rice cooker. Double pot, keep warm automatic control.', appEmoji);
addProduct('Home Appliances', 'Prestige', 'Prestige Sandwich Maker Toast Grill 800W', 1150, 10, 'https://cdn.moglix.com/p/NNeIJ3nZs6hNM-medium.jpg', 'Non-stick coating toast sandwich maker press. Floating hinge grill plate.', appEmoji);
addProduct('Home Appliances', 'Havells', 'Havells 2-Slice Pop-Up Toaster 800W', 1450, 12, 'https://cdn.moglix.com/p/I/N/E/d/MININE4VIGL3O-xxlarge.jpg', '2-slice pop-up toaster with electronic browning control and integrated bun warmer.', appEmoji);
addProduct('Home Appliances', 'Eureka Forbes', 'Eureka Forbes Wet & Dry Vacuum Cleaner 1200W', 6800, 18, 'https://cdn.moglix.com/p/zVavg5dbkco3B-xxlarge.jpg', 'High suction power wet and dry vacuum cleaner with blower function and accessories.', appEmoji);
addProduct('Home Appliances', 'Symphony', 'Symphony Personal Tower Air Cooler 30L', 6499, 15, 'https://cdn.moglix.com/p/CLxXg1TevbwMb-xxlarge.png', 'Sleek personal tower air cooler with honeycomb pads and multi-stage air purification.', appEmoji);
addProduct('Home Appliances', 'Bajaj', 'Bajaj Majesty Fan Heater Room Warmer 2000W', 2200, 10, 'https://cdn.moglix.com/p/1XUPcNOcjqQV5-medium.jpg', 'Dual heat setting fan heater room warmer with built-in safety thermal cut-off.', appEmoji);
addProduct('Home Appliances', 'Bajaj', 'Bajaj Splendora 3L Instant Water Geyser', 2900, 12, 'https://cdn.moglix.com/p/lxEUQr1mpwkds-xxlarge.jpeg', '3L instant water geyser heater. ABS shockproof body, copper heating element.', appEmoji);
addProduct('Home Appliances', 'Glen', 'Glen Curved Glass Kitchen Chimney 60cm', 9500, 20, 'https://cdn.moglix.com/p/K1Y6wfKJvwXVe-xxlarge.jpeg', 'Auto clean curved glass kitchen chimney with powerful suction motor and baffle filters.', appEmoji);
addProduct('Home Appliances', 'Orient', 'Orient Summer Cool 1400mm Ceiling Fan', 2150, 10, 'https://cdn.moglix.com/p/J/H/Z/d/MINJHZVFIJHTW-xxlarge.jpg', 'Orient sweep 1400mm high speed ceiling fan. Durable body and high air delivery.', appEmoji);
addProduct('Home Appliances', 'Bajaj', 'Bajaj Table Fan 400mm Sweep High Speed', 1850, 12, 'https://cdn.moglix.com/p/JOrZl8G72NnOo-xxlarge.jpg', 'High speed oscillating table fan with silent motor operation and thermal protection.', appEmoji);
addProduct('Home Appliances', 'McCoy', 'McCoy Venus 750W Dry Iron', 690, 10, 'https://cdn.moglix.com/p/zPUszvVcNC1A7-xxlarge.jpg', 'Lightweight dry clothing iron. Teflon non-stick soleplate, adjustable temperature control.', appEmoji);
addProduct('Home Appliances', 'Havells', 'Havells Compact Hair Dryer 1200W', 950, 15, 'https://cdn.moglix.com/p/9lKeIwKBp30cv-xxlarge.jpg', '1200W compact hair blow dryer. 2 heat settings, silent performance, foldable handle.', appEmoji);


// 9. ELECTRONICS (20 products)
const elecProdEmoji = '💻';
addProduct('Electronics', 'Logitech', 'Logitech K230 Wireless Keyboard', 999, 15, 'https://cdn.moglix.com/p/I/Q/L/d/MINIQLSOIU8QO-xxlarge.jpg', 'Compact wireless keyboard with 2-year battery life, auto-sleep feature, and whisper-quiet keys.', elecProdEmoji);
addProduct('Electronics', 'Logitech', 'Logitech M170 Black Wireless Optical Mouse', 699, 10, 'https://cdn.moglix.com/p/I/9/1/d/MINI91D2IBAH3-xxlarge.jpg', 'Reliable 2.4GHz wireless connection, 12-month battery life, ambidextrous design optical mouse.', elecProdEmoji);
addProduct('Electronics', 'Cosmic Byte', 'Cosmic Byte Hydra RGB Black Wired Optical Gaming Mouse', 890, 12, 'https://cdn.moglix.com/p/BCI3n1tx1qzS4-xxlarge.jpg', 'Ergonomic gaming mouse with customizable RGB lighting profiles, high-precision optical sensor up to 7200 DPI.', elecProdEmoji);
addProduct('Electronics', 'Zebronics', 'Zebronics Zeb-Thunder Sea Green Wireless Headphones', 1199, 15, 'https://cdn.moglix.com/p/zs0HLegjpNbQP-xxlarge.jpg', 'Over-ear wireless bluetooth headphones with comfortable earcups, micro SD card slot, and FM radio support.', elecProdEmoji);
addProduct('Electronics', 'Poly', 'Poly Plantronics C3220 Black USB Wired Headset', 2850, 10, 'https://cdn.moglix.com/p/wxZrPyLYNZqWp-xxlarge.jpg', 'Comfortable USB wired stereo headset with noise-canceling microphone, dynamic EQ, and inline call control.', elecProdEmoji);
addProduct('Electronics', 'JBL', 'JBL Flip 5 20W Stereo Waterproof Bluetooth Speaker', 5999, 20, 'https://cdn.moglix.com/p/Q8nyCcANfIRmc-xxlarge.jpeg', 'Portable IPX7 waterproof Bluetooth speaker with 12 hours of playtime, premium bass radiator design.', elecProdEmoji);
addProduct('Electronics', 'Krisons', 'Krisons Avarin 100W 2.1 Channel Black Bluetooth Soundbar Speaker', 4299, 15, 'https://cdn.moglix.com/p/3OCmoMs0gcO0m-xxlarge.jpg', '100W 2.1 channel soundbar system with external subwoofer, multi-connectivity support (USB, AUX, Coaxial, BT).', elecProdEmoji);
addProduct('Electronics', 'Logitech', 'Logitech C270 HD Webcam', 1850, 10, 'https://cdn.moglix.com/p/5Nb7q7zP7bc8S-xxlarge.jpg', 'Widescreen HD 720p video calling webcam with automatic light correction and built-in noise-reducing mic.', elecProdEmoji);
addProduct('Electronics', 'Acer', 'Acer QG241Y 23.8 Inch FHD Black Gaming Monitor', 7999, 18, 'https://cdn.moglix.com/p/N0mcN1bwmS1JI-xxlarge.jpg', '23.8-inch Full HD (1920x1080) gaming monitor with VA panel, 75Hz refresh rate, AMD FreeSync technology.', elecProdEmoji);
addProduct('Electronics', 'SanDisk', 'Sandisk 1TB Type-C External SSD Drive', 6499, 15, 'https://cdn.moglix.com/p/UevEzKQyETRpZ-xxlarge.jpg', 'High-speed portable solid state drive with up to 520MB/s read speeds, USB 3.2 Gen 2 Type-C interface.', elecProdEmoji);
addProduct('Electronics', 'SanDisk', 'SanDisk Ultra Flair 512GB Silver USB 3.0 Flash Drive', 3499, 15, 'https://cdn.moglix.com/p/RTQOTggD7IsCD-xxlarge.jpg', 'High-speed USB 3.0 flash drive with sleek, durable metal casing, transfers files up to 15 times faster than USB 2.0.', elecProdEmoji);
addProduct('Electronics', 'Ambrane', 'Ambrane PP-125 10000mAh Black Li-Polymer Power Bank', 999, 10, 'https://cdn.moglix.com/p/94JGrshEEfeAU-xxlarge.jpg', '10000mAh lithium-polymer power bank with dual USB output ports, 9 layers of chipset protection.', elecProdEmoji);
addProduct('Electronics', 'Lenovo', 'Lenovo M8 (4th Gen, 2024) Arctic Grey 4G LTE/Wi-Fi Tablet', 8999, 15, 'https://cdn.moglix.com/p/Y2PCr18V1myPB-xxlarge.jpg', '8-inch HD tablet with MediaTek processor, 4GB RAM, 64GB storage, 4G LTE calling, and Android 13.', elecProdEmoji);
addProduct('Electronics', 'HP', 'HP M126nw All-in-One Wireless Laser Printer', 14200, 15, 'https://cdn.moglix.com/p/FqAblkcj5mMtS-xxlarge.jpg', 'Multifunction monochrome laser printer with wireless network printing, scanning, and copying capabilities.', elecProdEmoji);
addProduct('Electronics', 'TP-Link', 'TP-Link TL-WR820N 300Mbps Wireless N Speed Router', 999, 12, 'https://cdn.moglix.com/p/NYF6szufp5Y1L-xxlarge.jpg', '300Mbps wireless transmission rate ideal for basic internet tasks, guest network protection, IPv6 supported.', elecProdEmoji);
addProduct('Electronics', 'CP Plus', 'CP Plus Guard+ 2.4MP Day & Night Color Indoor Dome CCTV Camera', 1350, 15, 'https://cdn.moglix.com/p/WTdtB70WHpTRB-xxlarge.jpg', '2.4MP indoor dome CCTV camera with full-color night vision, built-in high sensitivity microphone.', elecProdEmoji);
addProduct('Electronics', 'boAt', 'boAt Flash RTL 1.35 Inch Lightning Black Smart Watch', 2499, 10, 'https://cdn.moglix.com/p/OyYl64DwjfqNd-xxlarge.jpg', 'Smartwatch with 1.3" circular display, blood oxygen monitoring, heart rate tracker, and 10 sports modes.', elecProdEmoji);
addProduct('Electronics', 'Quantum', 'Quantum QHM9800 Black Mechanical Keyboard', 1699, 15, 'https://cdn.moglix.com/p/adc3jzGuEMlBf-xxlarge.jpg', 'Full-sized mechanical gaming keyboard with tactile blue switches, customizable RGB backlit modes.', elecProdEmoji);
addProduct('Electronics', 'Zebronics', 'Zebronics Wonder Bar 2.0 10W Black Detachable Speaker with RGB Lights', 999, 12, 'https://cdn.moglix.com/p/LvCY9kd0rqXqP-xxlarge.jpg', 'Detachable 2.0 channel soundbar speaker with 10W output, RGB LED lighting, and 3.5mm AUX input.', elecProdEmoji);
addProduct('Electronics', 'My Fav', 'My Fav 25L Polyester Grey Laptop Backpack', 890, 15, 'https://cdn.moglix.com/p/KGPWm8afst8mf-xxlarge.jpg', 'Durable 25L water-resistant polyester laptop backpack with padded compartment fits up to 15.6" laptops.', elecProdEmoji);

// 10. GENERAL STORE (20 products)
const genEmoji = '🛍️';
addProduct('General Store', 'Dettol', 'Dettol Soap', 45, 10, 'https://www.bbassets.com/media/uploads/p/l/40325774_5-dettol-skincare-soap.jpg', 'Antiseptic skincare soap bar. Deeply cleanses and protects from germs.', genEmoji);
addProduct('General Store', 'Lifebuoy', 'Lifebuoy Soap', 35, 10, 'https://www.bbassets.com/media/uploads/p/l/307118_10-lifebuoy-soap-bar-care-germ-protection.jpg', 'Daily germ protection bath soap bar for advanced skin health and care.', genEmoji);
addProduct('General Store', 'Lux', 'Lux Soap', 40, 10, 'https://www.bbassets.com/media/uploads/p/l/100006721_4-lux-soap-soft-glow-rose-vitamin-e.jpg', 'Soft glow rose water and Vitamin E infused nourishing bath soap bar.', genEmoji);
addProduct('General Store', 'Surf Excel', 'Surf Excel Detergent', 140, 10, 'https://www.bigbasket.com/media/uploads/p/l/40075537_6-surf-excel-easy-wash-detergent-powder.jpg', 'Washing machine and hand wash laundry detergent powder for superior stain removal.', genEmoji);
addProduct('General Store', 'Ariel', 'Ariel Detergent', 160, 10, 'https://www.bbassets.com/media/uploads/p/l/1216784_2-ariel-matic-top-load-detergent-washing-powder.jpg', 'Matic top load washing machine detergent powder. Tough stain removal in 1 wash.', genEmoji);
addProduct('General Store', 'Vim', 'Vim Dishwash Bar', 30, 10, 'https://www.bbassets.com/media/uploads/p/l/1225693_4-vim-dishwash-bar-lemon.jpg', 'Lemon dishwashing bar. Removes grease easily and leaves utensils sparkling clean.', genEmoji);
addProduct('General Store', 'Harpic', 'Harpic Toilet Cleaner', 95, 10, 'https://www.bbassets.com/media/uploads/p/l/263737_12-harpic-power-plus-disinfectant-toilet-cleaner-liquid-original.jpg', 'Power Plus disinfectant liquid toilet cleaner. Kills 99.9% of germs.', genEmoji);
addProduct('General Store', 'Lizol', 'Lizol Floor Cleaner', 110, 10, 'https://www.bbassets.com/media/uploads/p/l/1211469_3-lizol-disinfectant-surface-cleaner-citrus.jpg', 'Disinfectant surface and floor cleaner liquid with fresh citrus fragrance.', genEmoji);
addProduct('General Store', 'Odonil', 'Odonil Air Freshener', 65, 10, 'https://www.bbassets.com/media/uploads/p/l/40251025_2-odonil-air-freshener-mystic-rose-removes-odour-for-bathroom.jpg', 'Mystic Rose pocket air freshener. Removes odours and keeps spaces fresh.', genEmoji);
addProduct('General Store', 'Good Knight', 'Good Knight Refill', 85, 10, 'https://www.bbassets.com/media/uploads/p/l/199522_3-good-knight-power-activ-mosquito-repellent-refill.jpg', 'Power Activ liquid mosquito repellent vaporiser refill pack.', genEmoji);
addProduct('General Store', 'Colgate', 'Colgate Toothpaste', 75, 10, 'https://www.bbassets.com/media/uploads/p/l/144395_17-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti-formula-provides-fresher-breath.jpg', 'Strong Teeth anticavity toothpaste with Amino Shakti formula for fresh breath.', genEmoji);
addProduct('General Store', 'Closeup', 'Closeup Toothpaste', 80, 10, 'https://www.bbassets.com/media/uploads/p/l/266655_22-close-up-everfresh-anti-germ-gel-toothpaste-red-hot.jpg', 'Everfresh anti-germ gel toothpaste in Red Hot flavour for up to 12 hours of fresh breath.', genEmoji);
addProduct('General Store', 'Colgate', 'Toothbrush', 30, 10, 'https://www.bbassets.com/media/uploads/p/l/40000369_11-colgate-zigzag-medium-bristle-toothbrush.jpg', 'ZigZag medium bristle manual toothbrush for deep interdental cleaning.', genEmoji);
addProduct('General Store', 'Parachute', 'Coconut Oil', 120, 10, 'https://www.bbassets.com/media/uploads/p/l/248215_4-parachute-pure-coconut-oil.jpg', '100% pure coconut oil made from naturally sun-dried coconuts.', genEmoji);
addProduct('General Store', 'Clinic Plus', 'Clinic Plus Shampoo', 99, 10, 'https://www.bbassets.com/media/uploads/p/l/100081530_10-clinic-plus-strong-long-health-shampoo.jpg', 'Strong and Long health shampoo with milk protein formula.', genEmoji);
addProduct('General Store', 'Home Lite', 'Match Box', 10, 10, 'https://www.bbassets.com/media/uploads/p/l/40027412_1-home-lite-matchbox-big.jpg', 'Safety matchbox with long sticks for easy and safe lighting.', genEmoji);
addProduct('General Store', 'Mortein', 'Mosquito Coil', 45, 10, 'https://www.bbassets.com/media/uploads/p/l/40073754_3-mortein-mosquito-repellent-pleasant-fragrance-100-protection-from-dengue.jpg', 'Mosquito repellent coils with pleasant fragrance. 100% protection from mosquitoes.', genEmoji);
addProduct('General Store', 'BB Home', 'Garbage Bags', 95, 10, 'https://www.bbassets.com/media/uploads/p/l/40170026_12-bb-home-oxo-biodegradable-garbage-bag-small-green.jpg', 'Oxo-biodegradable green garbage bags, small size, pack of 30.', genEmoji);
addProduct('General Store', 'Premier', 'Tissue Paper', 60, 10, 'https://www.bbassets.com/media/uploads/p/l/100006283_3-premier-special-face-tissue.jpg', 'Premium soft facial tissues pack. Highly absorbent and gentle on skin.', genEmoji);
addProduct('General Store', 'Gainda', 'Phenyl Cleaner', 80, 10, 'https://www.bbassets.com/media/uploads/p/l/40074799_1-gainda-floor-cleaner-white-disinfectant.jpg', 'Gainda white disinfectant phenyl cleaner. Deep cleans and leaves long-lasting freshness.', genEmoji);

// Save to products.json
const jsonPath = path.join(__dirname, 'products.json');
fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Successfully generated ${products.length} exact-match products in ${jsonPath}`);
