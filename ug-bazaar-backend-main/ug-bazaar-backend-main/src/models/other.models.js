const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true }, product: { type: mongoose.Schema.Types.ObjectId, ref:'Product', required:true }, rating: { type:Number, required:true, min:1, max:5 }, title: { type:String, required:true }, text: { type:String, required:true }, tags:[String], verified:{ type:Boolean, default:false }, helpful:{ type:Number, default:0 } }, { timestamps:true });
reviewSchema.index({ user:1, product:1 }, { unique:true });
const couponSchema = new mongoose.Schema({
  code: { type:String, required:true, unique:true, uppercase:true },
  type: { type:String, enum:['percent','flat','bogo','b2g1'], required:true },
  value: { type:Number, required:true },
  minOrder: { type:Number, default:0 },
  maxUses: { type:Number, default:50 },
  usedCount: { type:Number, default:0 },
  usedBy:[{ type:mongoose.Schema.Types.ObjectId, ref:'User' }],
  expiresAt: { type:Date, required:true },
  isActive: { type:Boolean, default:true },
  targetProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null }
}, { timestamps:true });
couponSchema.methods.isValid = function(total, userId) { if(!this.isActive) return {valid:false,msg:'Coupon inactive'}; if(new Date()>this.expiresAt) return {valid:false,msg:'Coupon expire ho gaya'}; if(this.usedCount>=this.maxUses) return {valid:false,msg:'Limit khatam'}; if(total<this.minOrder) return {valid:false,msg:`Min order ₹${this.minOrder}`}; if(userId&&this.usedBy.some(id => id.toString() === userId.toString())) return {valid:false,msg:'Aap pehle use kar chuke'}; return {valid:true}; };
couponSchema.methods.getDiscount = function(total, cart) {
  if (this.type === 'percent') {
    return Math.round(total * this.value / 100);
  } else if (this.type === 'flat') {
    return Math.min(this.value, total);
  } else if (this.type === 'bogo') {
    let discount = 0;
    if (cart && cart.items) {
      cart.items.forEach(item => {
        const itemId = item.product?._id || item.product;
        if (!this.targetProduct || this.targetProduct.toString() === itemId.toString()) {
          if (item.qty >= 2) {
            discount += item.price * Math.floor(item.qty / 2);
          }
        }
      });
    }
    return discount;
  } else if (this.type === 'b2g1') {
    let discount = 0;
    if (cart && cart.items) {
      cart.items.forEach(item => {
        const itemId = item.product?._id || item.product;
        if (!this.targetProduct || this.targetProduct.toString() === itemId.toString()) {
          if (item.qty >= 3) {
            discount += item.price * Math.floor(item.qty / 3);
          }
        }
      });
    }
    return discount;
  }
  return 0;
};
const cartSchema = new mongoose.Schema({ user: { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true, unique:true }, items:[{ product:{ type:mongoose.Schema.Types.ObjectId, ref:'Product' }, name:String, price:Number, qty:{ type:Number, default:1 }, emoji:String }] }, { timestamps:true });
const notificationSchema = new mongoose.Schema({ user: { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true }, type: { type:String, enum:['order','delivery','offer','payment','system'], default:'system' }, title: { type:String, required:true }, body: { type:String, required:true }, icon: { type:String, default:'🔔' }, read: { type:Boolean, default:false }, link:String }, { timestamps:true });
const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "UG Bazaar" },
  tagline: { type: String, default: "Your Local Superstore" },
  whatsappNumber: { type: String, default: "918390901925" },
  contactPhone: { type: String, default: "9422137293" },
  address: { type: String, default: "Opp. CDCC Bank, Bhangaram, Talodhi, Tq. Gondpipri, Dist. Chandrapur, Maharashtra" },
  timing: { type: String, default: "9:00 AM – 9:00 PM" },
  isStoreOpen: { type: Boolean, default: true },
  minFreeDelivery: { type: Number, default: 500 },
  deliveryCharge: { type: Number, default: 40 },
  isCodEnabled: { type: Boolean, default: true },
  isMaintenanceMode: { type: Boolean, default: false },
  enableSms: { type: Boolean, default: true },
  enableWhatsapp: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = { 
  Review: mongoose.model('Review',reviewSchema), 
  Coupon: mongoose.model('Coupon',couponSchema), 
  Cart: mongoose.model('Cart',cartSchema), 
  Notification: mongoose.model('Notification',notificationSchema),
  Settings: mongoose.model('Settings', settingsSchema)
};
