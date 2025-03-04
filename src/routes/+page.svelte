<script>
	import { onMount } from 'svelte';
	let messages = [];
	let user = '';
	let text = '';

	async function fetchMessages() {
		const res = await fetch('/api/messages');
		messages = await res.json();
	}

	async function sendMessage() {
		if (user && text) {
			const res = await fetch('/api/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user, text })
			});
			const newMessage = await res.json();
			messages.push(newMessage);
			text = '';
		}
	}

	onMount(() => {
		fetchMessages();
		const interval = setInterval(fetchMessages, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="chat-container">
	<div class="messages">
		{#each messages as { user, text, timestamp }}
			<div class="message">
				<span class="user">{user}</span>
				<span class="text">{text}</span>
				<span class="timestamp">{new Date(timestamp).toLocaleTimeString()}</span>
			</div>
		{/each}
	</div>
	<input bind:value={user} placeholder="Your name" />
	<input bind:value={text} placeholder="Your message" />
	<button on:click={sendMessage}>Send</button>
</div>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		max-width: 600px;
		margin: auto;
	}
	.messages {
		flex-grow: 1;
		overflow-y: auto;
		border: 1px solid #ccc;
		padding: 10px;
		margin-bottom: 10px;
	}
	.message {
		margin-bottom: 10px;
	}
	.message .user {
		font-weight: bold;
	}
	.message .text {
		margin-left: 10px;
	}
</style>
