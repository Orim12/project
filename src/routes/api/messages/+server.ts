import { json } from '@sveltejs/kit';

const messages = [];

export async function GET() {
    return json(messages);
}

export async function POST({ request }) {
    const { sender, text } = await request.json();
    const newMessage = { sender, text, timestamp: new Date() };
    messages.push(newMessage);
    return json(newMessage);
}