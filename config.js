/* ==========================================================================
   NEXT LEVEL - CONFIGURATION
   ========================================================================== */

const supabaseUrl = 'https://dsgozmikjqxqzzlopgmy.supabase.co';
const supabaseAnonKey = 'sb_publishable_j-gNM0N_FzLu-lDK8HlGpw_-RgAlk6u';

// Create a single Supabase client for all scripts to use
// window.supabase is expected to be loaded via CDN script tag
if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
}

window.NEXTLEVEL_CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwXS1Oa0mhBZkBWR15D0Ajz1pL9qugL8YSLlvOG6U4-2Rx96yGwy0Z5FlLUrPa805GC/exec',
    downloadUrl: 'https://github.com/Sharkolle/Next-level-fitness/releases/download/v1.0.0/NextLevel-Fitness.zip',
    adminPassword: 'nextlevel2024',
    supabaseUrl: supabaseUrl,
    supabaseKey: supabaseAnonKey
};
