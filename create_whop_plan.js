const apiKey = "apik_sBlz4EDGF3LyJ_C4434974_C_4dbeb67b4f4e54e2673918641df58dd7f78020f95d44cd5be74e48125de874";
const productId = "prod_nZWtRnIbEYTYE";

async function createPlan(name, price) {
  try {
    const res = await fetch("https://api.whop.com/v2/plans", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product_id: productId,
        plan_type: "renewal",
        billing_period: 30,
        initial_price: price,
        renewal_price: price,
        base_currency: "usd",
        visibility: "visible",
        internal_notes: name
      })
    });
    
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Whop API Error (${res.status}): ${err}`);
    }
    
    const data = await res.json();
    return { name, link: data.direct_link, id: data.id };
  } catch (e) {
    console.error(`Failed to create ${name}:`, e.message);
    return null;
  }
}

async function run() {
  console.log("Creating Starter Plan...");
  const starter = await createPlan("Thumb Forge Starter", 9.00);
  console.log("Creating Pro Plan...");
  const pro = await createPlan("Thumb Forge Pro", 24.00);
  console.log("Creating Premium Plan...");
  const premium = await createPlan("Thumb Forge Premium", 49.00);
  
  const results = {
    starter: starter,
    pro: pro,
    premium: premium
  };
  
  require('fs').writeFileSync('generated_whop_links.json', JSON.stringify(results, null, 2));
  console.log("Done! Links saved to generated_whop_links.json.");
}

run();
