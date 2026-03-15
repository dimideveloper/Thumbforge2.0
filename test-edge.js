import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ogwhnwthjuogmorswkpw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2hud3RoanVvZ21vcnN3a3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjI1ODYsImV4cCI6MjA4OTEzODU4Nn0.9lHQyCl2P9wmFQnEycG6e5DJJ2-AqAtZ5eMnsZdsM5Q";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function test() {
  console.log("Invoking skin-replace...");
  const thumbnailUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const skinUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  const { data, error } = await supabase.functions.invoke("skin-replace", {
    body: {
      thumbnailUrl,
      skinUrl,
      prompt: "test"
    }
  });

  console.log("Data:", data);
  console.log("Error:", error);
}

test();
