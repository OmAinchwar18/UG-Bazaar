const redirects = {
  "Dettol Soap": "https://www.bbassets.com/media/uploads/p/l/40325774_5-dettol-skincare-soap.jpg",
  "Lifebuoy Soap": "https://www.bbassets.com/media/uploads/p/l/307118_10-lifebuoy-soap-bar-care-germ-protection.jpg",
  "Lux Soap": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE46HYblYNLFipbAe00Pt8UMDl0ebwaGZzuPn06COwYQR4BpMmxrQalGo05flkQ8Xdz9xwrTUMNUKPE7MllZ5zh0g2lAJ-uWb6dy-DmYfTp9vdI6SzdieXqWTEnpeSZe4aDOSWVKexcRto0BkLDlBea-X_5x9lu6AEL-xjyPGUqPHM4swJQZp0T8BM=",
  "Surf Excel Detergent": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGZB7QZlx2Vdabk2MSSQHC-6OIyX3tPoY6cdvBxO8vkk9UOkhfid0xMNGcJi7UT7HXnXEoPrlK2iEkTqdZRRJzNFgYBWzL5Y54O8-IzFR33OquSx3FVrLRcN1BoT2Qr3Y1Vqhz5HipZdUCxNlDHb8R2e7bHVkBIFtM0YijOVy0Dt84lMl0INshT2dz0OUkP6g==",
  "Ariel Detergent": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFlpbGkpKl3iU-DKt9tfNDozjGd80WlP9M67DaZ7ecZsGNZWJGS9iONF8-VUMPNUX1y0UCV-mb281V3QXx0nHSBal-8JQBnZvp3cA5525WYnc2HiZuu_Bm8DZnPuJD1cCK_Sn2dWKXt6D2LshSvwJZI3ubd3P0TtdkCNlKJOXXTM4gAAi2Pfw6muaSrEQ06xpp3",
  "Vim Dishwash Bar": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHtnqJC7cIWnztzWiNZTjTDWXKa0qFcf5Vowol8ga-uNHxYi1ElEc4PN8N9qRiOYDe73DRwL-oqQN1eIBINfc2IbVbWY7p-D5kUIe5Q6dx_0MWjzq6yhZ-MfFuupOHhvqph_6t29Zxnkbv-a3UqVF345JOW83uU0a_Dzw==",
  "Harpic Toilet Cleaner": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHReMkUDXNngTbCreiJEnRUMuvBGFZ5HWcKXwF0qkAku1TnQqlTcnXPsx9dF5wW8AWGlhw4OnlfyOGzFHr8GCITWCDjxjaREEZRXddqzuCOsoQ13UAGg9J6bJAXreZIR5yunMT-uxT4HwCv7mWhPfIupYjyoR1c1knXgfA65TTYIBYeQNdvkuxmsYXAtzPMJPyDN-L-GoMgnqEAT4dE_Y68Nc5pcT942g==",
  "Lizol Floor Cleaner": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFs_liBjfGlsBVaGYOn-4pnX6B9xojfY4Umyzodw_wazdy7ik0UieuDl09xYZH7ss6hV_1mEhAGFQrH8Mcn0DphNpaGJYiEwvGS3pLsGJa60mYkGEaf8jPMKJc6Y7M0lO-UrIzPFRrfrslLh7zr8AVJ4vsXSdkmfGsZ_qOdZ7c1uyDbMIOQe1T8ESys6p6E",
  "Odonil Air Freshener": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEkalRBUjqjeXR9A8C2xBCf07Jyt4aFGzrQqSOYEr-xyplVcbxZoYQjQsxHG4VLUYxfivO4iu6zZBt8wNMe82fpEvSlTWJi6VuXYOGmDuix3JZtkU0QxiGjlFYiShCYUhCjqcz2xs72_l2cViVE4Nz_qZhWCPZEmpUpEQLCrzL17dRZYWkrPPnRSZL4ocKbgnWSYm6HPxgn4mGx8rL_PxI0V_HtqPkrfij_O9dQOJTJzGYD",
  "Good Knight Refill": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH15raVMprLXntV7-fGfaayYviEB9-iNYhRBY_3t5b0FOSvCKBpiLzqCCvLAHnzxprP-UphC58YfzIoV1BKYIvABjGSn1nuAarYM3X8jefDOho1BPY1JEjOWenSM2FKAuhMZl6IJoWFMw-I5W4b94gkeH3BqcHesdx4KUwSzGdpM1zNnQwDoNj9VFcjB-kOeIy7-Q==",
  "Colgate Toothpaste": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH3R7PB84Kq1HhbdkWH_WPx1s1yqPZQ3fmE5Hhi3SehqOrYXJRi278D2YEXahy5lkskRDiB4kqeK6Xs1Jk7NauVOuWBvFB5jfDzaVq_ruwFhbXMwhuk1vjIiD_KqGTd8_Bcc2Tdb2VeFsurOWycx3VE25X-FYharP7kQ-sIb7NcUWsnUVJ4ryAAaTYU9irYLcEyhcVLdE0dMsVA06Xde_XZaUunSs1_dqVajR5PfS5jLdnE6EtaEE7tKFreSw==",
  "Closeup Toothpaste": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYGfU0KlQHT-vx1Z4sKpbGhTsWBqurudIMjeDv0wLVr0-sKZrmXQ4V8wgFFiSo8f5lYqb-swUnGVbks-DH2WyA9vtahojn_Apyen_tmAtQ-Ewgw5UimUFPnK8DzkcR1fZMXR1LB67OoUUFh1JXcUeMCQ3c0B67BUGQLkxgRZ3Z9UpvV-QCsHE_pnUtue_pu3eZyjXnEx-A0Y7h9WM9KIt3WWX44bRKw6IA0=",
  "Toothbrush": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG-eSMxDigRD8i8uuMvqKejRgpLQvxg_R7nqR0xjz-gRjuloLUOkuiYHzM-iw_rdj_joHfTE6DVO6TTR7o3XhanuQb1PA2PtlY91u7W5KROyFgWwRrqHuYJRLaILeX0OSScjHZZ_pyFxYQhDpTdbIbiLqySbTvXp1PBiQOoyIKy8U9H4opzkpwl_s10usUlXl4=",
  "Coconut Oil": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGGsM3G4l8Y3lUDCl25hTXoHJUcMUKDRoQCPJ957cPrAKBN-IslFHcMj9UqWRkMGwWUP5Yl4b_4GEZ11jUVQNlEEiL86-TRpNIISWpN8nQ5CZNEw2d3MsnrfXR9loG3Vbb02AJfMKGlnOwCyFkNg_dCA4N7VVazrFCbevYtgvcQquATzlSSFdKSvXP06-XVPl2TFY5R",
  "Clinic Plus Shampoo": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEG0l0DxqQR9K06ub4345CePrLBOl-SrCVmDoLRXH709syDwF1jDM4ebBCm3yMvZDapqe2pSupQCmmSsjokim1M0-axjS1d2jr7G48ckiWul5gT6VAjJCgO4lRobAJNASLc49JOvxN0-b2vT3fqz_QmAtxUON4Xruasr4pBU5EMYGE96thtMgJSw9Y=",
  "Match Box": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGd01WHaBENsxu5ZyuvB-U597DHY56jJhBQMi8_W7O2NqPpb1whCQoqDT_kdP9VadqBbDHmMiYHcUFT_7jgCipclpsEnc1Cx9Zk_flrQl1eEMkOfefi3otBC4dYPYFsvgeDBjJRH9sCYs-6w2B3y6--QsSDV8fb",
  "Mosquito Coil": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFiiQsxczQOB2c3EtctQH_i1wQp1edxI108WWLnEo29Bp_vnq0G0VjLaRxzltfNOsTa87PapjLjN7ufdzgOI7BREaNnzpRfAAmL1m7PpHAz1M4LnLFDYK2vtobWiBTFwSJ6jSgYA1PbTZu1kOPX4qJ4dHpucZqorWAOwp4pEEzJw1XX3HGaBV5P9F8Nws4YJ9hPD8rYffRmNlD9e9LK2KqZ1VUlJE30XLebgtM=",
  "Garbage Bags": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEuf3ZeO22mo9egctM86wyCIvDf1QEyRFq6s0iVkEp-4kmsfEPNfHK6jMsEnZCJqc8x76ARDXsgV3DJfIZ0DiaZ_pTbdi0LAnAibPshFhobzCuTPM1TwW_3xpzkW4Yj0M0ZLHSUdJeCGoYiykUXKQEIAjJhyvrbQqqkyBA0UdNeRRndxLp-cMKEs228wsxL1-TNXKJJ5Q==",
  "Tissue Paper": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH2Y6D1WcK-dO2X4kGHtjqY9UOynxh4T-jrRQ8F60w0RgkMKvk2eEBcmNARlkR38zIVv1ydRiKQ5zd32zIO6RdRghB-z-JcDt-_VxyJFANB5w805lE-5-kSG50fp7ALuSrA6ByNi-5NRrOdv3H7a-OtHVEhCVsaaP5comyTRbqH8Oo=",
  "Phenyl Cleaner": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFIk_n7GVvUmbYWTKlmD8nEARjMyJxOI3hLmK0Vh7m1pYTI9Ch9KdLR3mQe7jD18WqR8KO1VPYMWrKk1q40KX02jUA91sqaY5v__NLud1p49i1vv15RL0pDtXZJ2LOs_eFmiC-RSiB_nDq3y6xGKE8HREwKt2rgv7BF5f2q3dri2SUadFX_MA3u"
};

const resolve = async () => {
  const results = {};
  for (const [name, url] of Object.entries(redirects)) {
    if (url.startsWith('https://www.bbassets.com/')) {
      results[name] = url;
      console.log(`✅ "${name}" -> ${url}`);
      continue;
    }
    try {
      const res1 = await fetch(url, { method: 'GET', redirect: 'manual' });
      const target = res1.headers.get('location');
      if (!target) {
        console.log(`❌ "${name}": failed to redirect`);
        continue;
      }
      const res2 = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res2.text();
      let matches = html.match(/https?:\/\/[^\s"'<>]+?bbassets\.com\/media\/uploads\/p\/[^\s"'<>]+?\.(?:jpg|png|jpeg)/gi) || [];
      const uniqueMatches = [...new Set(matches)];
      if (uniqueMatches.length > 0) {
        // Pick the first match, replace /p/s/ or /p/m/ with /p/l/ to get the large image
        const imgUrl = uniqueMatches[0].replace(/\/media\/uploads\/p\/[sm]\//i, '/media/uploads/p/l/');
        // Verify large image exists
        const imgCheck = await fetch(imgUrl, { method: 'HEAD' });
        if (imgCheck.status === 200) {
          results[name] = imgUrl;
          console.log(`✅ "${name}" -> ${imgUrl}`);
        } else {
          // Fallback to original match if large doesn't exist
          results[name] = uniqueMatches[0];
          console.log(`⚠️ "${name}" (fallback) -> ${uniqueMatches[0]}`);
        }
      } else {
        console.log(`❌ "${name}": no images found on target`);
      }
    } catch (e) {
      console.log(`❌ "${name}" error:`, e.message);
    }
  }
  console.log('\n--- FINAL VERIFIED GENERAL STORE DICTIONARY ---');
  console.log(JSON.stringify(results, null, 2));
};

resolve();
