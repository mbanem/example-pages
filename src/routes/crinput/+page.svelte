<!--
@component
-->

<script lang="ts">
	import CRInput from '$lib/components/CRInput.svelte';
	let snap = {
		id: 'ftykubqwlldijaw',
		firstName: 'Filip',
		lastName: 'Isakovic',
		email: 'filip@isak.com',
		password: 'password',
		role: 'User',
		updatedAt: '2024-02-11'
	};
</script>

<div class="main">
	<CRInput
		title="email"
		exportValueOn="enter|blur"
		type="text"
		capitalize={false}
		bind:value={snap.email as string}
		required={true}
		width="22.5rem"
	></CRInput>
	<CRInput
		title="firstName"
		exportValueOn="enter|blur"
		type="text"
		capitalize={true}
		bind:value={snap.firstName as string}
		required={true}
		width="22.5rem"
	></CRInput>
	<CRInput
		title="id"
		exportValueOn="enter|blur"
		type="text"
		capitalize={false}
		bind:value={snap.id as string}
		required={true}
		width="22.5rem"
	></CRInput>
	<CRInput
		title="lastName"
		exportValueOn="enter|blur"
		type="text"
		capitalize={true}
		bind:value={snap.lastName as string}
		required={true}
		width="22.5rem"
	></CRInput>
	<CRInput
		title="password"
		exportValueOn="enter|blur"
		type="password"
		capitalize={false}
		bind:value={snap.password as string}
		required={true}
		width="22.5rem"
	></CRInput>
	<CRInput
		title="role"
		exportValueOn="enter|blur"
		type="text"
		capitalize={true}
		bind:value={snap.role}
		required={true}
		width="22.5rem"
	></CRInput>
	<CRInput
		title="updatedAt"
		exportValueOn="enter|blur"
		type="text"
		capitalize={true}
		bind:value={snap.updatedAt}
		required={true}
		width="22.5rem"
	></CRInput>
</div>

<style lang="scss">
	.main {
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
</style>
