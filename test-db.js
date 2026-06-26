const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Ensure URL does not have a trailing slash for safety
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
  console.log("Connecting to Supabase at:", url);
  try {
    const { data, error } = await supabase.from('houseboat_settings').select('*').limit(1);
    
    if (error) {
      console.error("Error connecting to database:", error.message);
    } else if (data && data.length > 0) {
      console.log("SUCCESS! Connected to database.");
      console.log("Houseboat Name:", data[0].houseboat_name);
    } else {
      console.log("Connected successfully, but houseboat_settings table is empty.");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

testConnection();
