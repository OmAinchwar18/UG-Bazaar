const urls = {
  "Dettol Soap": "https://www.bbassets.com/media/uploads/p/l/40325774_5-dettol-skincare-soap.jpg",
  "Lifebuoy Soap": "https://www.bbassets.com/media/uploads/p/l/307118_10-lifebuoy-soap-bar-care-germ-protection.jpg",
  "Lux Soap": "https://www.bbassets.com/media/uploads/p/l/100006721_4-lux-soap-soft-glow-rose-vitamin-e.jpg",
  "Surf Excel Detergent": "https://www.bbassets.com/media/uploads/p/l/1225251_0-surf-excel-matic-detergent-powder-front-load.jpg",
  "Ariel Detergent": "https://www.bbassets.com/media/uploads/p/l/1216784_2-ariel-matic-top-load-detergent-washing-powder.jpg",
  "Vim Dishwash Bar": "https://www.bbassets.com/media/uploads/p/l/1225693_4-vim-dishwash-bar-lemon.jpg",
  "Harpic Toilet Cleaner": "https://www.bbassets.com/media/uploads/p/l/263737_12-harpic-power-plus-disinfectant-toilet-cleaner-liquid-original.jpg",
  "Lizol Floor Cleaner": "https://www.bbassets.com/media/uploads/p/l/1211469_3-lizol-disinfectant-surface-cleaner-citrus.jpg",
  "Odonil Air Freshener": "https://www.bbassets.com/media/uploads/p/l/40251025_2-odonil-air-freshener-mystic-rose-removes-odour-for-bathroom.jpg",
  "Good Knight Refill": "https://www.bbassets.com/media/uploads/p/l/199522_3-good-knight-power-activ-mosquito-repellent-refill.jpg",
  "Colgate Toothpaste": "https://www.bbassets.com/media/uploads/p/l/144395_17-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti-formula-provides-fresher-breath.jpg",
  "Closeup Toothpaste": "https://www.bbassets.com/media/uploads/p/l/266655_22-close-up-everfresh-anti-germ-gel-toothpaste-red-hot.jpg",
  "Toothbrush": "https://www.bbassets.com/media/uploads/p/l/1226790_0-colgate-toothbrush-super-shine-soft-bristles.jpg",
  "Coconut Oil": "https://www.bbassets.com/media/uploads/p/l/248215_4-parachute-pure-coconut-oil.jpg",
  "Clinic Plus Shampoo": "https://www.bbassets.com/media/uploads/p/l/100081530_10-clinic-plus-strong-long-health-shampoo.jpg",
  "Match Box": "https://www.bbassets.com/media/uploads/p/l/1228122_0-home-lite-matchbox-big.jpg",
  "Mosquito Coil": "https://www.bbassets.com/media/uploads/p/l/40073754_3-mortein-mosquito-repellent-pleasant-fragrance-100-protection-from-dengue.jpg",
  "Garbage Bags": "https://www.bbassets.com/media/uploads/p/l/40170026_12-bb-home-oxo-biodegradable-garbage-bag-small-green.jpg",
  "Tissue Paper": "https://www.bbassets.com/media/uploads/p/l/100006283_3-premier-special-face-tissue.jpg",
  "Phenyl Cleaner": "https://www.bbassets.com/media/uploads/p/l/40074799_1-gainda-floor-cleaner-white-disinfectant.jpg"
};

const verify = async () => {
  const unique = new Set(Object.values(urls));
  console.log(`Unique URLs: ${unique.size} / ${Object.keys(urls).length}`);
  if (unique.size !== Object.keys(urls).length) {
    console.error("❌ Warning: There are duplicate URLs in the list!");
  }

  for (const [name, url] of Object.entries(urls)) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 200) {
        console.log(`✅ [200] "${name}": ${url}`);
      } else {
        console.error(`❌ [${res.status}] "${name}": ${url}`);
      }
    } catch (e) {
      console.error(`❌ [Error] "${name}": ${url} - ${e.message}`);
    }
  }
};
verify();
