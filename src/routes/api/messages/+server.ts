import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });

    if (error) {
        return json({ error: error.message }, { status: 500 });
    }

    return json(messages);
}

export async function POST({ request }) {
    const { sender, text } = await request.json();
    const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([{ sender, text, timestamp: new Date() }])
        .single();

    if (error) {
        return json({ error: error.message }, { status: 500 });
    }

    return json(newMessage);
}