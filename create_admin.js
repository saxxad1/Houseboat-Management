const { createClient } = require('@supabase/supabase-js');


const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or URL in .env.local");
  process.exit(1);
}

// Create a Supabase client with the service_role key
const supabaseAdmin = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'demo@gmail.com';
  const password = 'password123'; // Default password

  console.log(`Checking if user ${email} exists...`);
  
  // Create user
  let userId = null;
  
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (userError) {
    if (userError.message.includes('already')) {
        console.log(`User already exists. Fetching UUID...`);
        // We have to list users to find the UUID
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        const existingUser = listData.users.find(u => u.email === email);
        if (existingUser) {
            userId = existingUser.id;
        } else {
            console.error("Could not find the user ID.");
            return;
        }
    } else {
        console.error("Error creating user:", userError.message);
        return;
    }
  } else {
    console.log(`User created successfully.`);
    userId = userData.user.id;
  }

  console.log(`User ID is: ${userId}`);
  console.log(`Making user an admin in admin_profiles...`);

  // Upsert into admin_profiles
  const { error: profileError } = await supabaseAdmin
    .from('admin_profiles')
    .upsert({
      user_id: userId,
      full_name: 'Demo Admin',
      role: 'admin',
      phone: '01XXXXXXXXX'
    });

  if (profileError) {
    console.error("Error creating admin profile:", profileError.message);
  } else {
    console.log("SUCCESS! Admin profile created.");
    console.log(`Login Email: ${email}`);
    console.log(`Login Password: ${password}`);
  }
}

createAdmin();
