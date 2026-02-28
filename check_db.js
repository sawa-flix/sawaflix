const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function check() {
    const { data, error } = await supabase.from('verification_submissions').select('*').limit(1);
    if (error) console.error(error.message);
    else if (data.length > 0) console.log('Columns:', Object.keys(data[0]));
    else {
        // try to get openapi structure for this table to see column names
        const https = require('https');
        const req = https.request({
            hostname: 'xjxbjnjspmmpfngbdihd.supabase.co',
            path: '/rest/v1/',
            method: 'GET',
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            }
        }, res => {
            let chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const spec = JSON.parse(Buffer.concat(chunks).toString());
                console.log('Columns from spec:', Object.keys(spec.definitions.verification_submissions.properties));
            });
        });
        req.end();
    }
}
check();
