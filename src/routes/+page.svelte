<script>
	import { onMount } from 'svelte';
	let messages = [];
	let newMessage = '';
	let username = '';
	let isUsernameSet = false;
	let messagesEndRef;
	let showPopup = false;

	async function fetchMessages() {
		const res = await fetch('/api/messages');
		const data = await res.json();
		if (res.ok) {
			messages = data;
		} else {
			console.error(data.error);
		}
	}

	async function sendMessage() {
		if (newMessage.trim()) {
			const res = await fetch('/api/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: newMessage, sender: username })
			});
			const data = await res.json();
			if (res.ok) {
				messages = [...messages, data];
				newMessage = '';
			} else {
				console.error(data.error);
			}
		}
	}

	onMount(() => {
		fetchMessages();
		const interval = setInterval(fetchMessages, 1000);
		return () => clearInterval(interval);
	});

	function handleSendMessage(e) {
		e.preventDefault();
		sendMessage();
	}

	function handleSetUsername(e) {
		e.preventDefault();
		if (username.trim()) {
			isUsernameSet = true;
		}
	}

	function formatTime(timestamp) {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function handleDownloadClick() {
		showPopup = true;
	}

	function closePopup() {
		showPopup = false;
	}
</script>

{#if !isUsernameSet}
	<div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
			<div class="flex items-center justify-center mb-6">
				<h1 class="text-2xl font-bold text-gray-800">Chat App</h1>
			</div>
			<form on:submit={handleSetUsername} class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
						Enter your username to start chatting
					</label>
					<input
						type="text"
						id="username"
						bind:value={username}
						class="width-3-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Username"
						required
					/>
				</div>
				<button
					type="submit"
					class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
				>
					Join Chat
				</button>
			</form>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-100 flex flex-col">
		<header class="bg-indigo-600 text-white p-4 shadow-md">
			<div class="container mx-auto flex items-center justify-between">
				<div class="flex items-center">
					<h1 class="text-xl font-bold">Chat App</h1>
				</div>
				<div class="flex items-center">
					<span class="font-medium">{username} </span>
				</div>
			</div>
		</header>

		<main class="flex-1 container mx-auto p-4 flex flex-col max-w-4xl">
			<div class="bg-white rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
				<div class="p-4 border-b border-gray-200">
					<h2 class="text-lg font-semibold text-gray-800">Messages</h2>
				</div>

				<div class="flex-1 overflow-y-auto p-4 space-y-4">
					{#if messages.length === 0}
						<div class="text-center text-gray-500 py-8">
							No messages yet. Start the conversation!
						</div>
					{:else}
						{#each messages as message (message.id || message.timestamp)}
							<div class="flex {message.sender === username ? 'justify-end' : 'justify-start'}">
								<div
									class="max-w-xs md:max-w-md rounded-lg px-4 py-2 {message.sender === username
										? 'bg-indigo-600 text-white rounded-br-none'
										: 'bg-gray-200 text-gray-800 rounded-bl-none'}"
								>
									{#if message.sender !== username}
										<div class="font-bold text-xs mb-1">{message.sender}</div>
									{/if}
									<p>{message.text}</p>
									<div
										class="text-xs mt-1 text-right {message.sender === username
											? 'text-indigo-100'
											: 'text-gray-500'}"
									>
										{formatTime(message.timestamp)}
									</div>
								</div>
							</div>
						{/each}
					{/if}
					<div bind:this={messagesEndRef}></div>
				</div>

				<form on:submit={handleSendMessage} class="p-4 border-t border-gray-200 flex">
					<input
						type="text"
						bind:value={newMessage}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Type your message..."
						required
					/>
					<button
						type="submit"
						class="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
					>
						Send
					</button>
				</form>
			</div>

			<div class="mt-4 bg-white rounded-lg shadow-md p-4">
				<h3 class="text-lg font-semibold text-gray-800 mb-3">Terminal Client</h3>
				<p class="text-gray-600 mb-3">
					Want to chat from your terminal? Download our terminal client and connect to this chat
					from the command line.
				</p>
				<div class="flex flex-col sm:flex-row gap-3">
					<button
						on:click={handleDownloadClick}
						class="flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
					>
						Download Terminal Client
					</button>
					<div
						class="flex items-center justify-center bg-gray-100 text-gray-800 py-2 px-4 rounded-md"
					>
						<p>
							to run the client follow these steps you wil need node js installed<br />
							<code
								>step 1: download it <br /> step 2: unzipt it<br /> step 3: run npm i<br /> step 4: run
								node terminal-client.js</code
							>
						</p>
					</div>
				</div>
			</div>

			{#if showPopup}
				<div class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
					<div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
						<h2 class="text-xl font-bold mb-4">Download Command</h2>
						<p class="mb-4">Run the following command in your terminal to download the client:</p>
						<code class="block bg-gray-100 p-2 rounded mb-4"
							>wget https://github.com/Orim12/project/releases/download/terminal-client/project.zip</code
						>
						<button
							on:click={closePopup}
							class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
						>
							Close
						</button>
					</div>
				</div>
			{/if}
		</main>

		<footer class="bg-white border-t border-gray-200 p-4">
			<div class="container mx-auto text-center text-gray-600 text-sm">
				<p>Chat Application with API Access - {new Date().getFullYear()}</p>
				<p class="mt-1">
					API Endpoints:
					<code class="bg-gray-100 px-2 py-1 rounded ml-2">GET /api/messages</code>
					<code class="bg-gray-100 px-2 py-1 rounded ml-2">POST /api/messages</code>
				</p>
			</div>
		</footer>
	</div>
{/if}

<style>
	.min-h-screen {
		min-height: 100vh;
	}
	.bg-gray-100 {
		background-color: #f7fafc;
	}
	.bg-white {
		background-color: #ffffff;
	}
	.bg-indigo-600 {
		background-color: #4c51bf;
	}
	.text-white {
		color: #ffffff;
	}
	.text-gray-800 {
		color: #2d3748;
	}
	.text-gray-600 {
		color: #718096;
	}
	.text-gray-500 {
		color: #a0aec0;
	}
	.text-indigo-100 {
		color: #ebf4ff;
	}
	.font-bold {
		font-weight: 700;
	}
	.font-medium {
		font-weight: 500;
	}
	.rounded-lg {
		border-radius: 0.5rem;
	}
	.rounded-md {
		border-radius: 0.375rem;
	}
	.rounded-br-none {
		border-bottom-right-radius: 0;
	}
	.rounded-bl-none {
		border-bottom-left-radius: 0;
	}
	.shadow-lg {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}
	.shadow-md {
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}
	.p-4 {
		padding: 1rem;
	}
	.p-6 {
		padding: 1.5rem;
	}
	.px-4 {
		padding-left: 1rem;
		padding-right: 1rem;
	}
	.py-2 {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}
	.mb-1 {
		margin-bottom: 0.25rem;
	}
	.mb-3 {
		margin-bottom: 0.75rem;
	}
	.mb-4 {
		margin-bottom: 1rem;
	}
	.mb-6 {
		margin-bottom: 1.5rem;
	}
	.mt-1 {
		margin-top: 0.25rem;
	}
	.mt-4 {
		margin-top: 1rem;
	}
	.space-y-4 > :not([hidden]) ~ :not([hidden]) {
		--tw-space-y-reverse: 0;
		margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
		margin-bottom: calc(1rem * var(--tw-space-y-reverse));
	}
	.flex {
		display: flex;
	}
	.flex-col {
		flex-direction: column;
	}
	.flex-1 {
		flex: 1 1 0%;
	}
	.items-center {
		align-items: center;
	}
	.justify-center {
		justify-content: center;
	}
	.justify-between {
		justify-content: space-between;
	}
	.justify-end {
		justify-content: flex-end;
	}
	.justify-start {
		justify-content: flex-start;
	}
	.overflow-hidden {
		overflow: hidden;
	}
	.overflow-y-auto {
		overflow-y: auto;
	}
	.max-w-md {
		max-width: 28rem;
	}
	.max-w-xs {
		max-width: 20rem;
	}
	.md\:max-w-md {
		max-width: 28rem;
	}
	.container {
		width: 100%;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1rem;
		padding-right: 1rem;
	}
	.mx-auto {
		margin-left: auto;
		margin-right: auto;
	}
	.w-full {
		width: 100%;
	}
	.width-3-4 {
		width: 75%;
	}
	.border {
		border-width: 1px;
	}
	.border-gray-200 {
		border-color: #edf2f7;
	}
	.border-gray-300 {
		border-color: #e2e8f0;
	}
	.focus\:outline-none:focus {
		outline: 2px solid transparent;
		outline-offset: 2px;
	}
	.focus\:ring-2:focus {
		box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
	}
	.focus\:ring-indigo-500:focus {
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
	}
	.hover\:bg-indigo-700:hover {
		background-color: #434190;
	}
	.transition {
		transition-property:
			background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}
	.duration-200 {
		transition-duration: 200ms;
	}
</style>
