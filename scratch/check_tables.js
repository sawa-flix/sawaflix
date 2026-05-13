
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log('Checking tables...');
    const { data: movies, error: movieError } = await supabase.from('movies').select('*').limit(1);
    if (movieError) console.log('movies table error:', movieError.message);
    else console.log('movies table exists');

    const { data: videos, error: videoError } = await supabase.from('videos').select('*').limit(1);
    if (videoError) console.log('videos table error:', videoError.message);
    else console.log('videos table exists');
}

test();
