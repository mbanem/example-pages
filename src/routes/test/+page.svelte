<script lang="ts">
	import ShowMessage from '$lib/components/CRShowTooltip.svelte';
	let sm: ShowMessage;
	function getVal() {
		return Math.floor(Math.random() * 300 + 50);
	}
	let x = 0;
	let y = 0;

	// =========== schema enums to object ===============
	const schema = `
	model Profile {
		bio: string
	}
	enum Role {
		USER
		ADMIN
		VISITOR
		MODERATOR
	}
	model User {
		firstName: string
	}
	`;
	// const enumRegex = /\s*enum\s+(\w+)\s*{([\s\S]*?)^\}/gm
	const enumRegex = /enum\s+([a-zA-z_0-9]+)\s+([^}]+)/gm;
	const match = enumRegex.exec(schema);
	console.log(match?.[1]);
	// console.log(match[2])
	const m = match[2].match(/\w+/gm);
	console.log(m);
	// const m as const
	// type en = 'ADMIN'|'USER'|'VISITOR'
	// type e ={
	// 	USER:'USER',
	// 	ADMIN:'ADMIN'
	// } as const;

	// let UI = {[key:string]:string} as const;
	// (m as RegExpMatchArray).forEach((role) => {
	// 	UI[role] = role;
	// });

	// type UIType = (typeof UI)[keyof typeof UI];

	// =======================================
	const log = console.log;
	type PageKey = 'OrmOne' | 'OrmTwo' | 'OrmThree';
	let p: PageKey = 'OrmTwo';

	log(p);
	let theme = $state('☀️');
	function toggleTheme() {
		theme = theme === '🌙' ? '☀️' : '🌙';
	}
</script>

<nav class="app-nav">
	<p class="theme-btn" onclick={toggleTheme} aria-hidden={true}>{theme}</p>
	<p>Bane</p>
	<p>Milutinovic</p>
	<p>Fruskogorska 27</p>
</nav>

<ShowMessage bind:this={sm} />
<div
	onclick={(e: MouseEvent) =>
		sm?.showTooltip(e, `Random Position at (x: ${(x = getVal())}, y: ${(y = getVal())})`, {
			x: `${x}`,
			y: `${y}`,
			color: 'navy',
		})}
	class="div-button"
	aria-hidden={true}
>
	show message
</div>

<div onclick={(e: MouseEvent) => sm.showTooltip(e, 'Login model deleted')} class="div-button" aria-hidden={true}>
	show another message
</div>
<div
	onclick={(e: MouseEvent) => sm.showTooltip(e, 'Turn the engine off, please')}
	class="div-button"
	aria-hidden={true}
>
	turning engine off
</div>

<style lang="scss">
	.msg {
		transition: opacity 0.5s ease-in;
	}
	.div-button {
		margin: 10rem 0 0 10rem;
		border: 1px solid gray;
		border-radius: 5px;
		background-color: aliceblue;
		color: navy;
		width: max-content;
		padding: 2px 1rem;
		text-align: center;
		cursor: pointer;
	}
	.theme-btn {
		display: inline-block;
		padding: 0;
		margin: 0;
		height: 25px;
		width: 25px;
		outline: none;
		border-radius: 5px;
		cursor: pointer;
		background-color: var(--cr-bg);
		z-index: 200;
	}
	.app-nav {
		// display: inline-block;
		width: 100vw;
		// border: 1px solid gray;
		// border-radius: 5px;
		display: flex;
		gap: 10px;
		align-items: center;
		height: 1.3rem;
		background-color: var(--cr-bg);
		// z-index: 30;
	}
</style>
