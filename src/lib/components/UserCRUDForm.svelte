<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  let id: string = '';
  let firstName: string = '',
    lastName: string = '',
    email: string = '';
  $: isValidUuid =
    id.length === 36 &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      id,
    );

  async function resetForm() {
    id = '';
    firstName = '';
    lastName = '';
    email = '';
    await invalidateAll();
  }
</script>

<form method="POST" use:enhance>
  <div>
    <label for="id">Delete for Record Id</label>
    <input
      type="text"
      id="id"
      name="id"
      bind:value={id}
      placeholder="Enter UUID for deletion"
    />
  </div>

  <div>
    <label for="firstName">FirstName</label>
    <input type="text" id="firstName" name="firstName" bind:value={firstName} />
  </div>

  <div>
    <label for="lastName">LastName</label>
    <input type="text" id="lastName" name="lastName" bind:value={lastName} />
  </div>

  <div>
    <label for="email">Email</label>
    <input type="text" id="email" name="email" bind:value={email} />
  </div>
  <div>
    <button type="submit" formaction="/user-crud-form?/create">Create</button>
    <button
      type="submit"
      formaction="/user-crud-form?/update"
      disabled={!isValidUuid}>Update</button
    >
    {#if isValidUuid}
      <button type="submit" formaction="/user-crud-form?/delete">Delete</button>
    {/if}
    <button type="button" on:click={resetForm}>Reset</button>
  </div>
</form>
