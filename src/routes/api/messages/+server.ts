import { json } from '@sveltejs/kit';

const messages = [];

export async function GET() {
    return json(messages);
}

export async function POST({ request }) {
    const { user, text } = await request.json();
    const newMessage = { user, text, timestamp: new Date() };
    messages.push(newMessage);
    return json(newMessage);
}