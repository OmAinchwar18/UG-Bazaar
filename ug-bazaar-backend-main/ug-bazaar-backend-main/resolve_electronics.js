const redirects = {
  "Wireless Keyboard": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEDZw07LFFtuWMtoZgkxPhjFK0cp_3JFOZuGubuQ6mhhSDcZs43W4qQRJC8BsVLtBCASWNxL9YeFrPhxHDGsWitkwYCoFiuvrsgN9dd1Q9g6-3ZGnjGKGV0r8UrXtLbEfyrJNS3IQ8yA6lUC-zcKpQ4iHcNUWJ_6BQVqL78CQvmta79RuMUdM4D1LNqjpSbIzQ9lRLNTleqpFAGHTuG3aEfzP7oAJ31cA==",
  "Wireless Mouse": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYG0g1oBdsmPOEw5hw3--Okby6_7tEFNM62gNYVx8m3u9Q25XwWjiFYoz4sLtI9rqJuI1wxRybvwNesENohLfF9ztWF_xpkjaLxkJbIsUDqvBcEPbYIEgdefA9ZhV5sPDL0MFZ9YIrkMC2FTxHTeZdzgLUmHRfp--h2sy_CbbsbW",
  "Gaming Mouse": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH8uzjv6xVscBU7VpnydFP49JxMy5xA21ZGxhldc6URknOZD6dhVF1-m3uHNWIgc_W1I9N9WXAMZ8tlV2EPfChhaIVvAA-yGj3MerKNnopjggzdHM9DReat4S0FUHI3_CBvnliIeKidcYnDi1sZmBwNvhz7E0K3T8QW9ichFlkHKgd6lGxu7ErHgLCa2ePGVzTUo4E6",
  "Bluetooth Headphones": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHzJzGasxyu_0nkcm4reSaEUE8DFyy_CcBNwTenlyIQBemAgFnE0fLxnlMIPzpwaFOjWTwu94h37ERIram1fq_oNA1O-jxxX0JX2JBdHgy_SWxkfr4sHFSM0YMz5Y2FLJXljT4Gudl-MpicEMftcIGPy7CkfdRmkCGUyQupmr3rZ0zgBvh8Np-6rBwC",
  "Wired Headphones": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEEgMnalBZYVTmuCUnrs6Gsk_TjLypSDXy2W5TytYeClGLWILnarRk-nea_O_X8Hdub9slTGU583gB83hA4Z-6sz8pKC13JBAI04FFKs5kiiFURn8stzUUb2kTLhBGJVKrzfreSQQNEOwjoUQoM7AMKA1MeDY7UoYJ1JTvsQK26fe3R18T8zOuobjsPljDy3r9gszeMRDdH85WbukNx",
  "Bluetooth Speaker": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEq6zQW-VfhmtyGXr37WMxeRKHOwQGOAXRg4uqyDgjIkc-X93Royphd1ZVXxGI8kplBIkBFV0YwUheJ0G19tbHnY5FenTiFELJlnnB9enLkBnYxKDPbKymEhzzFOwa3bUH4QAS3e4I25sZTsxq_OBTsA9OB9LpZ40wap_3fxjzUwMag2oKBRxGJ9eRUnhAzNPE=",
  "Soundbar": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEYtNVYI2jTsG3Eltejy7RTzJGpMKML366wvQfQAfgGTy8Y2yx1HFAtmBt_rZsodC2fdDjQmXH3P4PX1N4qc-nwVwQIKWL9VDTEUFfdEdiPtgnWzRLhX79LtzWdzsUjic6GY98EFFXFRd_0PpqnRCq-fPZs6bQdnDnWP2vf35oo8z7de-JwFlpEDqP5WQ5R6RTtNiUY7XvU5L2-r88mz4mhQKJlJBy5wjq_saYKqg==",
  "Webcam": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG2f9gbgudDRa_G73Tto60aVGeOGCo3_KrqmgiO2VFUqH85wlkmcRCbFgiWxBxCRkZKwmoCbe0ZW-o7k88pvwqlD7TEY65rqcRk-VOEzEbLY9tgjTaMmcz97UyfEq84NE26tAQGoxNhCbUKXehg1XdJXctlNIVnEPj4wENmO4yNQ71ZLg==",
  "Monitor": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGKf2o0EhWeh9FszYGpuH0-MbUpJxVdUM9igy8w9cEoefH52ByUt1WTTDfz9AaMkIji0djW-3PyHwdzVpNtv0eI5pPHWn08GOlC9Epq2rebu7YaLMjBCxX29uQJGRvWR1V6IdSwGi80MbHPmTXENI-KmVzk55o4qCS6_7dwEpnRypyJtdCziuba",
  "External SSD": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFZJDNNZkLwfdL2bresKNdFzuMohcgsDTZJUUMCol9beQXwdg_dQ1pzD9GalKCetQgDHuOpbXASZO82V-emUpjkF57nRmSir9QvHmIU-rgM4XQjGrSvej3fyoe5m4nVjNBmxYr0sM0h5GaAc_WskdX4a5jlG8nB45jr04VUHVr9PwNMri16oyXxcBaBNdVK3AkkZhugqU1K7BVAMVcgfIVVTNK4CIe2",
  "USB Flash Drive": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFL0qsRx0_TK9GBPe9MoAs6dlgQ8qa-bi4ML5uhbMTYFCVHCXGLrVem8g2OkxxkJdSyJtR0sqKuqWfAtYReaP_nl9UCG14B6EpovGRAWJnEDwdBPwAQx3iWVfk5v1eJRVubWhdP_6PZHKZCCFequrEzkl1IWydgLrHfNzDcij9qAlTjAnSe9-ihXxlzcMGA44n49w==",
  "Power Bank": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEmIBXm-8qtqGZ6HltFENABeCds2X_ytjxdWpImWlqZCJRfG1wfY4gcAxD2J0i6sBF7FFt9gwUex-8ZTria5c14XcPCuYPYckek5o0snAb7vvxKTAxc_SQuwdZcDItspqHKW7mMCBgSiMG2yV50YaGl63F05Tjlw_FXfXGRf4wvz19XYxa3qUvfqqAiD_oqxyq0",
  "Tablet": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHR6gV_W1MESs-3BALioiNk-xC1-R0kb_OePXtdIdH5v0he9aPxRCp6oIjFEZrlDgjbtOmmiFjr3GH6aA6mva4o2NDPK6NnBjP8PPqFCEdHWi6N2lfdO1pUulQ50Gq_VaAj7B3JNjAtYHckrftrT4v8kd9yBIW5iDlmR6O5N4RdNkQg9vy2orJiisCZ",
  "Printer": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHK8GJLnuB0YzEYOCk6B50BOtPBGBBC2BSHuiHIa2OGHjY_z6cGcl9GBxCQLqA9p109dlUnwTHYj1Oh-xaga19WvF_YZHrOuub2328YAoEncChpXspS43SKGieGlgL20N6xrIzLAScbNnEV5UjTuNJTuOhThRHMGeH6KCAiU-4BDlSqLqOvJjKLsz5sSVgEj90l7XmFdnHh4NHJlg==",
  "WiFi Router": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHdOuN184tKdcRh5PHfi78ZzO2XwPBpOPp9e6X2GJZCXkX_uwtYPNRaLmsm4U0RGxj6BI4iQZbqqC9MjhrfTGWH4YWrMgGMa0uGajsgmD_tnJJ1PGxQwDICpQwLO6n5F_F8YKF38KtPsJUKR-NO-cbKZmmvmf7sNHNAf_hLVfN6Rx-eiGBCQK98QXccJXPDEg==",
  "CCTV Camera": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEeao1qjrXl9gPwtHfBttTPA8C61b-6qukr3oKXlpXYNshIgqT4fhsE0L56VkEcR8klLxpgGdC9tMQJALtEirmNcb4zg6lDXXXQet1ohqQMsbIw9VpED3ue4RY8ASGK6qtgCC--TCtxxomrdtvwLHNvpX2djWEIBOrxfnLAlwaTBAxKGMqhtL3G",
  "Smart Watch": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF5obYykOCRHY_iG1JGAWDvAmfLz2tNniGJAtZb__xJ9rFxl_oiY9o7PosyGeqHiDYVszqFHcd7izRlAy6kXeWsX-fxL11gM54ERzkPswXnxe312wSvc1EjX4VLnJdrfusMLoVpMBNGj0RYJtP5ZRvrucGafZ6aivmndEigmNVq",
  "Mechanical Keyboard": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHZqqll1Ts7vYDxpcZhYmwUQJ3NVL8lBm1LsdqnK38aHZZVR62EFH5Yo4UIe1UbOX_MuURNZ9C25CInHUWtjMUYiR2NZGzkAuJ0ukcxK_MkKBZAdvtMYnNNRfyw9rrB0rdApV3OyQ==",
  "Portable Speaker": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFo7xDzXNfsCMrsChEQSIhma3qlW3OjoTfcn-g10_R3AGUXtqiM0ip2hWNPLaJp9yNtyjBhzHgmUhidGm-xfm6zDKae3EdCY6tNXN5TaWavTXtI9CjYtLjgUx5r9Fhy9lUqbxbKHJuOkRpfxE6U_PYcVM9AQdMGyfPbb2w5sDYrgDFu1O3j2tF2gzsDNpndbsRXbSNA5apk-OTeP_TmItiF6jkDZWml2VmQjbDc",
  "Laptop Bag": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQET3eFpqyEu-CJ3IsgXUW4oW9_lRKwJY9bsOd3GPai-tLD_YCW5RUqCQGm1BSnZSPcUJewpOXzs-2FEaFP8_k04D9Gdd24PrlfiWDZww_S3tR80NlkMWH4vv91K6HISIETq6iaG_Qpyyx7U"
};

const resolve = async () => {
  for (const [name, url] of Object.entries(redirects)) {
    try {
      const res1 = await fetch(url, { method: 'GET', redirect: 'manual' });
      const target = res1.headers.get('location');
      if (!target) {
        console.log(`❌ "${name}": failed to redirect`);
        continue;
      }
      console.log(`=== "${name}" -> ${target} ===`);
      const res2 = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res2.text();
      let matches = [];
      if (target.includes('indiamart.com')) {
        matches = html.match(/https:\/\/[2-5]\.imimg\.com\/[^\s"'<>]+?\.(?:jpg|png|jpeg)/gi) || [];
      } else {
        matches = html.match(/https:\/\/cdn\.moglix\.com\/p\/[^\s"'<>]+?(?:-xxlarge|-large|-medium)?\.(?:jpg|png|jpeg)/gi) || [];
      }
      // Deduplicate matches
      const uniqueMatches = [...new Set(matches)];
      console.log(`Image Matches for "${name}":`, uniqueMatches.slice(0, 3));
    } catch (e) {
      console.log(`❌ "${name}" error:`, e.message);
    }
  }
};
resolve();
