<script lang="ts">
	import { onMount } from 'svelte';
	import * as utils from '$lib/utils';

	// fake part for Extension
	const vscode = {
		postMessage: (msg: { command: string; payload?: string | object }) => {
			console.log(msg.command, msg.payload);
		},
	};

	// fake part for Extension

	let installPartTwoBtnEl: HTMLButtonElement;

	async function installPrismaPartTwo() {
		installPartTwoBtnEl.innerText = 'Installing...';
		await utils.sleep(2000);
		vscode.postMessage({ command: 'installPrismaPartTwo' });
	}
	onMount(() => {
		installPartTwoBtnEl = document.getElementById('installPartTwoBtnId') as HTMLButtonElement;
		// rightColumnEl = document.getElementById('rightColumnId');

		// fires once so be ready it extension waits for schema and connection
		installPartTwoBtnEl.addEventListener('click', installPrismaPartTwo);
		// if (installPartTwoPending) {
		// 	vscode.postMessage({ command: 'log', payload: 'pending!' });
		// 	installPartTwoBtnEl.addEventListener('click', installPartTwo);
		// 	cancelPartTwoBtnEl.addEventListener('click', cancelAnyPart);
		// }
	});
</script>

<div class="main">
	<pre>
          <h3>Prisma Installation Part Two</h3>
We assume that you finished the below tasks
  -  Ctrl + double-click on .env file to open it beside this Extension
      and enter a valid connection string and save the file
  -  Ctrl + double-click on /prisma/schema.prisma to open it beside the Extension
      and prepare the schema models/tables
      Use model abilities for setting defaults, generating Ids,...
      Save the model.

By selecting the continue button the extension  will issue the final commands for
installing Prisma ORM; otherwise you can enter the following commands yourself

	DBNAME="MyDBNAME"		# your database name
	DBOWNER='JohnDoe'		# the name of the database 
  dropdb --if-exists -U "$DBOWNER" "$DBNAME" || true
	# or using this command
  sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DBNAME;"

  createdb "$DBNAME" -U "$DBOWNER" "GRANT ALL ON SCHEMA public TO $DBOWNER; GRANT CONNECT ON DATABASE $DBNAME TO $DBOWNER;"

  sudo -u postgres psql -d "$DBNAME" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO $DBOWNER; ALTER SCHEMA public OWNER TO $DBOWNER; ALTER DATABASE dbtest OWNER TO $DBOWNER;"

  sudo -u postgres psql -d "$DBNAME" -c
	"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DBOWNER;
	ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DBOWNER;"

  pnpx prisma migrate dev --name init		# create first migration (when ready)
  pnpx prisma generate

  <button id="installPartTwoBtnId">Continue</button><button id="cancelPartTwoBtnId">Cancel</button>  
</pre>
</div>

<style>
	.main {
		margin-left: 2rem;
	}
	.main-grid {
		display: grid;
		grid-template-columns: 33rem 20rem;
	}

	.grid-wrapper {
		display: grid;
		grid-template-columns: 20rem 12rem;
		column-gap: 0.5rem;
		row-gap: 1rem;
	}

	.span-two {
		margin-left: -8rem;
	}
	pre {
		grid-column: 1 / span 2;
		text-align: justify;
		font-size: 12px;
		color: var(--pre-color);
	}
	/* .part-one {
		color: var(--pre-color);
	} */

	#createBtnId {
		width: 12rem;
		padding: 4px 0;
		margin: 2rem 0 0 0;
		padding: 5px 0;
		opacity: 0.8;
	}

	#createBtnId:hover {
		opacity: 1;
	}

	input[type='text'] {
		width: 18rem;
		height: 20px;
		padding: 6px 0 8px 1rem;
		outline: none;
		font-size: 16px;
		border: 1px solid gray;
		border-radius: 4px;
		outline: 1px solid transparent;
		margin-top: 8px;
		margin-bottom: 10px;
	}

	input[type='text']:focus {
		outline: 1px solid gray;
	}

	.left-column {
		grid-column: 1;
	}

	.left-column label,
	.left-column label:focus {
		display: block;
		width: 12rem;
		cursor: pointer;
	}

	.fields-list {
		position: relative;
		cursor: pointer;
	}

	.middle-column {
		position: relative;
		grid-column: 2;
		border: 1px solid gray;
		border-radius: 5px;
		margin-top: 1.45rem;
	}

	.middle-column .candidate-fields-caption {
		position: absolute;
		top: -1.5rem;
		left: 0.5rem;
		color: skyblue;
	}

	.right-column {
		position: relative;
		border: 1px solid gray;
		border-radius: 6px;
		padding: 6px 3px 8px 10px;
		margin-top: 1.5rem;
	}

	#schemaContainerId {
		height: 30rem;
		overflow-y: auto;
	}

	.right-column .prisma-model-caption {
		position: absolute;
		top: -1.5rem;
		left: 0.5rem;
		display: inline-block;
		color: skyblue;
		cursor: pointer;
	}
	.collapse-all {
		color: lightgreen;
		font-size: 12px;
		border: 1px solid gray;
		border-radius: 4px;
		padding: 2px 0 2px 1rem;
	}
	.embellishments {
		position: relative;
		grid-column: span 2;
		display: grid;
		grid-template-columns: 1rem 20rem;

		column-gap: 0.5rem;
		row-gap: 0.1rem;
		align-items: center;
		padding: 8px 1rem;
		border: 1px solid gray;
		border-radius: 6px;
		margin-top: 3rem;
		user-select: none;
	}

	.checkbox-item {
		display: contents;
	}

	.checkbox-item input[type='checkbox'] {
		grid-column: 1;
		justify-self: start;
		align-self: center;
		margin: 0;
	}

	.checkbox-item label {
		grid-column: 2;
		justify-self: start;
		align-self: center;
		cursor: pointer;
		line-height: 1;
		width: 25rem !important;
	}

	.checkbox-item label:hover {
		background-color: cornsilk;
		cursor: pointer;
		width: 25rem !important;
	}

	/* for CSS class names inserted as a markup string into innerHTML
      class the names should be defined :global as they are in a new scope
      but WebView CSP Restrictions: VS Code WebViews have strict CSP
      and pseudo classes do not work, though they work in Svelte
    */
	.list-el {
		background-color: skyblue;
		width: 100%;
		height: 20px;
		font-size: 18px;
		line-height: 18px;
		text-align: center;
		margin: 6px 0 0 0;
	}

	.list-el:hover {
		cursor: pointer;
	}

	.field-text {
		display: block;
		height: 20px;
		text-align: center;
	}

	.remove-hint {
		position: absolute;
		left: 1.5rem !important;
		z-index: 10;
		font-size: 12px;
		color: red;
		padding: 0 0.5rem 1px 0.5rem;
		background-color: cornsilk;
		opacity: 0;
		text-align: center;
		border: 1px solid lightgray;
		border-radius: 5px;
		transition: opacity 0.2s;
		pointer-events: none;
		white-space: nowrap;
	}

	.list-el:hover .remove-hint {
		opacity: 1;
	}

	.models-list {
		border: 1px solid gray;
	}

	.models-list ul {
		color: skyblue;
	}

	.models-list ul li {
		color: yellow;
	}

	.model-name {
		color: #3e3e3e;
		background-color: #e3e3e3;
		margin-top: 3px;
		width: calc(100% -1rem);
		border-radius: 6px;
		padding-left: 1rem;
		cursor: pointer;
	}

	.fields-column {
		display: grid;
		grid-template-columns: 7rem 9.5rem;
		column-gap: 5px;
		width: max-content;
		padding: 6px 0 6px 1rem;
		height: auto;
		font-family: Georgia, 'Times New Roman', Times, serif;
		font-size: 15px !important;
		font-weight: 500 !important;
	}

	.fields-column p {
		margin: 4px 0 0 0;
		padding: 2px 0 4px 6px;
		border-bottom: 1px solid lightgray;
		text-wrap: wrap;
	}

	.fields-column p:nth-child(odd) {
		color: skyblue;
		cursor: pointer;
		width: 100%;
		padding: 2px 0 2px 0.5rem;
	}

	.fields-column p:nth-child(even) {
		font-weight: 400 !important;
		font-size: 12px !important;
	}

	button {
		cursor: pointer;
		user-select: none;
	}
	.crud-support-done {
		width: max-content;
		padding: 5px 2rem;
		margin: 1rem 0 0 0;
		color: lightgreen;
		font-size: 14px;
		border: 1px solid gray;
		border-radius: 5px;
		cursor: pointer;
		text-align: center;
	}
	.hidden {
		display: inline-block; /* none; */
	}
	.dbname-block {
		display: grid;
		grid-template-columns: repeat(3, 12rem);
		column-gap: 0.2rem;
		margin: 0;
		padding: 0;

		label {
			width: 10rem;
			padding: 0;
			margin: 0 1rem 6px 0;
		}

		input {
			width: 11rem;
			margin: 0;
			padding: 3px 0 3px 0.5rem !important;
			border: 1px solid lightgray;
			border-radius: 3px;

			&:focus {
				outline: 1px solid skyblue;
			}
		}
	}
</style>
