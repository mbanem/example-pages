<script lang="ts">
	// type TUser = {
	// 	id: number;
	// 	name: string;
	// };
	// let user = $state<TUser>({ id: 1, name: 'not yet initialized' });
	// console.log('empty user');
	// function getUser(tf: boolean) {
	// 	return new Promise((resolve, reject) => {
	// 		if (tf) resolve({ id: 12, name: 'Matia Isakovic' });
	// 		reject('not found');
	// 	});
	// }
	// async function main(tf: boolean) {
	// 	try {
	// 		user = (await getUser(tf)) as TUser;
	// 	} catch (err: unknown) {
	// 		const msg = err instanceof Error ? err.message : String(err);
	// 		console.log(msg);
	// 	}
	// 	console.log(user);
	// }
	// console.log(main(true));
	// console.log(main(false));
	// console.log(main(true));
	// --------------------------------------------
	// let tooltipEl: HTMLDivElement;
	// let customStyle = {
	// 	color: 'yellow',
	// 	border: '1px solid blue',
	// 	backgroundColor: 'navy',
	// 	fontWeight: 'bold',
	// 	width: '16rem',
	// };

	// function setStyle() {
	// 	Object.assign(tooltipEl.style, customStyle);
	// }

	// ----------------------------------------------
	let toto = 'Test Tooltip Message,  with some line of, db params verificatioin';
	const ttEl = document.createElement('div') as HTMLDivElement;

	ttEl.innerHTML = toto
		.split(',')
		.map((part) => `<p>${part}</p>`)
		.join('');

	ttEl.classList.add('tooltip-content');

	document.body.appendChild(ttEl);
</script>

<!-- <div class="main">Look in Developer Tools for console.logs</div> -->

<!-- <button onclick={setStyle}>set style</button>
<div bind:this={tooltipEl} class="no-delete">
	<p>Not Allowed</p>
	<p>Role owns some db objets and</p>
	<p>cannot be removed before them</p>
</div> -->

<style lang="scss">
	.no-delete {
		opacity: 0.6;
		font-style: italic;
	}

	.main {
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
	.tooltip-content {
		border: 1px solid gray;
		border-radius: 6px;
		color: yellow;
		background-color: navy;
		width: max-content;
		padding: 0 1rem;
		p {
			padding: 0;
			margin: 0;
			font-style: italic;
		}
	}
</style>
