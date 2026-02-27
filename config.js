import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://dsgozmikjqxqzzlopgmy.supabase.co'
const supabaseAnonKey = 'sb_publishable_j-gNM0N_FzLu-lDK8HlGpw_-RgAlk6u'

window.supabase = createClient(supabaseUrl, supabaseAnonKey)

window.NEXTLEVEL_CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwXS1Oa0mhBZkBWR15D0Ajz1pL9qugL8YSLlvOG6U4-2Rx96yGwy0Z5FlLUrPa805GC/exec',
    adminPassword: 'nextlevel2024',
    supabaseUrl: supabaseUrl,
    supabaseKey: supabaseAnonKey
};
