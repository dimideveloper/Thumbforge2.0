const testEditThumbnail = async () => {
  const url = 'https://uqttwedqzxyrbgdtjorq.supabase.co/functions/v1/edit-thumbnail';
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-123'
      },
      body: JSON.stringify({
        imageUrl: "https://example.com/image.jpg",
        prompt: "test"
      })
    });
    
    console.log('Status:', res.status);
    console.log('Text:', await res.text());
  } catch (e) {
    console.error('Error:', e);
  }
};

testEditThumbnail();
