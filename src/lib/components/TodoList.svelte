<script lang="ts">
	import { send, receive } from '$utils/transitions';
	import { flip } from 'svelte/animate';
	import CRTooltip from '$components/CRTooltip.svelte';

	type TSnippet = {
		id: string;
		selectedUserId: string;
		toggleCompleted: (todo: UTodo) => void;
		prepareUpdate: (todo: UTodo) => void;
		deleteTodo: (id: string) => void;
	};

	type PROPS = {
		id: string; // logged in locals.user.id
		role: string;
		users: UserPartial[];
		selectedUserId: string;
		uTodos: UTodo[];
		toggleCompleted: (todo: UTodo) => void;
		deleteTodo: (id: string) => void;
		prepareUpdate: (todo: UTodo) => void;
	};
	let {
		id,
		role,
		users,
		selectedUserId = $bindable(),
		uTodos,
		toggleCompleted,
		deleteTodo,
		prepareUpdate,
	}: PROPS = $props();

	console.log('$props()', id, role, users, selectedUserId, uTodos, toggleCompleted, deleteTodo, prepareUpdate);
	const permission = 'owner only permission';
	const getSelectedRole = () => {
		return (uTodos.filter((t) => t.id === selectedUserId)[0] as UTodo)?.role;
	};
	const listTodos = () => {
		return uTodos?.filter((t) => {
			return getSelectedRole() === 'ADMIN' ? true : t.id === selectedUserId ? true : false;
		});
	};
	// for Flip we need two areas, usually le3ft and right, for flipping between
	// so we make left and right from uTodos based on completed left=false, right=true
	// let left = $state<UTodo[]>([])
	// let right = $state<UTodo[]>([])
	// $effect(() => {
	// 	left = uTodos.filter((t) => t.completed === false) as UTodo[]
	// 	right = uTodos.filter((t) => t.completed === true) as UTodo[]
	// })

	let left = uTodos.filter((t) => t.completed === false) as UTodo[];
	let right = uTodos.filter((t) => t.completed === true) as UTodo[];
	// console.log('left', left);
	// console.log('right', right);

	const move = (item: UTodo, from: UTodo[], to: UTodo[]) => {
		to.push(item);
		return [from.filter((i) => i !== item), to];
	};

	const moveLeft = (item: UTodo) => {
		// @ts-expect-error
		[right, left] = move(item, right, left);
	};

	const moveRight = (item: UTodo) => {
		// @ts-expect-error
		[left, right] = move(item, left, right);
	};

	const td = {
		id,
		selectedUserId,
		toggleCompleted,
		prepareUpdate,
		deleteTodo,
	};
</script>

<!-- css can be dynamically changed via style:rule={value} and class:class_name={predicate} -->
{#snippet tooltip(tf: boolean, title: string)}
	{#if !tf}
		<!-- <Tooltip> -->
		<p>{permission}</p>
		<!-- </Tooltip> -->
	{:else}
		<!-- <Tooltip> -->
		<p>{title}</p>
		<!-- </Tooltip> -->
	{/if}
{/snippet}

{#snippet tooltipContent(todo: UTodo, tuSu: boolean = todo.id === id)}
	<div class="todo-tooltip">
		<p>priority</p>
		<p>{todo?.priority}</p>
		<p>created on</p>
		<p class="prop-value">{(todo?.createdAt as Date)?.toLocaleString()}</p>
		<p>updated on</p>
		<p class="prop-value">{(todo?.updatedAt as Date)?.toLocaleString()}</p>
		<p>owner: {tuSu}</p>
		<!-- NOTE: Tooltip accepts style setting but not class -->
		<p style={`margin-bottom:8px; color:${tuSu ? 'skyblue' : 'pink'}`}>
			{todo?.firstName}
			{todo?.lastName}
		</p>
	</div>
{/snippet}
{#snippet todos(td: TSnippet, todos: UTodo[], completed: boolean)}
	<div>
		<p class="caption">{completed ? 'Completed' : 'Not Completed'}</p>
		{#each todos as todo (todo)}
			<!-- tuSu -- flag true this is the selected user todo-->
			{@const tuSu = todo.id === id}
			<li
				style:width={'40vw'}
				class:uncompleted={!todo.completed}
				animate:flip={{ delay: 500, duration: 1000 }}
				in:send={{ key: todo.todoId }}
				out:receive={{ key: todo.todoId }}
			>
				<label for="ww">
					<input
						type="checkbox"
						id="ww"
						in:receive={{ key: todo.todoId }}
						out:send={{ key: todo.todoId }}
						class={tuSu ? 'ok-hover' : 'no-hover'}
						checked={todo.completed}
						disabled={!tuSu}
						onclick={() => {
							tuSu && td.toggleCompleted(todo);
							completed ? moveLeft(todo) : moveRight(todo);
						}}
					/>
					<div class="tooltip-wrapper">
						<CRTooltip panel={tooltipContent} panelArgs={todo}>
							<div class={`${todo.id === id ? 'blue' : 'gray'} ${tuSu ? 'ok-hover' : 'no-hover'}`}>
								{todo.title}
								<p class="todo-content">{todo.content}</p>
							</div>
						</CRTooltip>
					</div>
					<div class="tooltip-wrapper">
						<CRTooltip caption={tuSu ? 'delete ToDo' : 'owner permission only'}>
							<button
								class={tuSu ? 'ok-hover' : 'no-hover'}
								onclick={() => {
									tuSu && td.deleteTodo(todo.todoId);
								}}
								aria-label="Delete Todo"
							>
								{#if tuSu}
									❌
								{:else}
									🍀
								{/if}
							</button>
						</CRTooltip>
					</div>
					<div class="tooltip-wrapper">
						<CRTooltip caption={tuSu ? 'prepare for update' : 'owner permission only'}>
							<button
								class={tuSu ? 'ok-hover' : 'no-hover'}
								onclick={() => {
									tuSu && td.prepareUpdate(todo);
								}}
								aria-label="Update Todo"
							>
								📝</button
							>
						</CRTooltip>
					</div>
				</label>
			</li>
		{/each}
	</div>
{/snippet}
<!-- <pre>id {id}, role {role}, selectedUserId {selectedUserId}, uTodos{JSON.stringify(
  uTodos,
  null,
  2,
  )}</pre> -->
<!-- <pre>todo list selectedUserId {selectedUserId}</pre> -->
<!-- <pre>loggedInUserId {loggedInUserId}</pre> -->
<div class="container">
	{@render todos(td, listTodos()?.filter((t) => t.completed === false) as UTodo[], false)}
	{@render todos(td, listTodos()?.filter((t) => t.completed === true) as UTodo[], true)}
</div>

<style lang="scss">
	.container {
		display: grid;
		width: 98vw;
		grid-template-columns: 1fr 1fr;
	}

	.tooltip-wrapper {
		position: relative;
		p {
			display: flex;
			justify-content: space-between;
			align-content: flex-start;
			gap: 0.1rem;
			padding: 0 0 0 5px;
			margin: 0;
		}
		// .tooltip-todo {
		//   position: absolute;
		//   left: 5rem !important;
		//   top: -5rem !important;
		//   background-color: black !important;
		//   opacity: 1 !important;
		// }
		.todo-content {
			color: yellow;
		}
		&:hover {
			cursor: pointer;
		}
	}
	.todo-tooltip {
		display: grid;
		grid-template-columns: 6rem 30rem;
		justify-content: flex-start;
		width: 18rem !important;
		border: 1px solid yellow;
		border-radius: 6px;
		padding: 3px 1rem;
		background-color: var(--TOOLTIP-BACKGROUND-COLOR);
		color: var(--TOOLTIP-COLOR);
		font-size: 14px;
		font-weight: 400;
		p:nth-child(even) {
			color: yellow;
		}
	}
	.prop-value {
		margin-bottom: 8px;
		color: yellow;
	}
	.caption {
		border-bottom: 1px solid gray;
		width: 40vw;
	}
	.list-item {
		padding: 2px 6px;
		border: 1px solid transparent;
		&:hover {
			border-color: yellow;
			border-radius: 6px;
		}
	}
	// :global(.tooltip-todo) {
	//   position: absolute;
	//   left: 12rem !important;
	//   top: -5rem !important;
	//   display: grid;
	//   grid-template-columns: 6rem 30rem;
	//   justify-content: flex-start;
	//   width: 18rem !important;
	//   color: skyblue !important;
	//   font-size: 14px;
	//   font-weight: 400;
	//   padding: 3px 1rem;
	//   text-align: center;
	//   background-color: var(--TOOLTIP-BACKGROUND-COLOR);
	//   border: var(--TOOLTIP-BORDER);
	//   border-radius: 6px;
	//   p:nth-child(even) {
	//     color: yellow;
	//   }
	// }

	.blue {
		color: skyblue;
		margin-bottom: 6px !important;
	}
	.gray {
		color: lightgray;
		margin-bottom: 6px !important;
	}
	.todos {
		margin-left: 1rem;
		padding: 0;
	}
	label {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		width: 100%;
		height: 100%;
		input {
			width: 1rem;
			height: 1rem;
			padding: 0;
			margin: 0;
		}
	}

	button {
		width: 1rem !important;
		background-color: transparent;
		border: 2px solid transparent;
		&:hover {
			border: 2px solid gray;
			cursor: pointer;
		}
	}
	.ok-hover {
		&:hover {
			cursor: pointer;
		}
	}
	.no-hover {
		&:hover {
			border-color: gray;
			cursor: not-allowed;
		}
	}
	button.ok-hover,
	button.no-hover {
		padding: 2px 5px;
		margin: 0;
		width: 2rem !important;
	}
	li {
		color: white;
		list-style: none;
		opacity: 0.4;
		&.uncompleted {
			color: yellow;
			opacity: 1;
		}
	}
	.prop-red {
		margin-bottom: 8px;
		color: red;
	}
</style>
