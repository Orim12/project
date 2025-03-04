import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hdxbntzyayldfquevjop.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeGJudHp5YXlsZGZxdWV2am9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDYwMDEsImV4cCI6MjA1NjY4MjAwMX0.Ul4Nnyqz71fje-24a7zK7dt5xW-AzSNEVsZIdukS6Jc';
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