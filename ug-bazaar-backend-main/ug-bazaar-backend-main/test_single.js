const resolve = async () => {
  const url = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFiiQsxczQOB2c3EtctQH_i1wQp1edxI108WWLnEo29Bp_vnq0G0VjLaRxzltfNOsTa87PapjLjN7ufdzgOI7BREaNnzpRfAAmL1m7PpHAz1M4LnLFDYK2vtobWiBTFwSJ6jSgYA1PbTZu1kOPX4qJ4dHpucZqorWAOwp4pEEzJw1XX3HGaBV5P9F8Nws4YJ9hPD8rYffRmNlD9e9LK2KqZ1VUlJE30XLebgtM=";
  try {
    const res1 = await fetch(url, { method: 'GET', redirect: 'manual' });
    console.log('Redirect Status:', res1.status);
    const target = res1.headers.get('location');
    console.log('Target Location:', target);
    if (target) {
      const res2 = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res2.text();
      let matches = html.match(/https?:\/\/[^\s"'<>]+?bbassets\.com\/media\/uploads\/p\/[^\s"'<>]+?\.(?:jpg|png|jpeg)/gi) || [];
      const uniqueMatches = [...new Set(matches)];
      console.log('Matches:', uniqueMatches.slice(0, 3));
    }
  } catch (e) {
    console.log('Error:', e);
  }
};
resolve();
