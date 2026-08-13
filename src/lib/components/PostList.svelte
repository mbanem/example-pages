<script lang="ts">
  import CRTooltip from '$components/CRTooltip.svelte';
  let preferPos = $state<string>('top,left,right,bottom,');
  const props = $derived({
    delay: 250,
    duration: 800,
    baseScale: 0,
    toolbarHeight: 32,
    preferredPos: preferPos,
  });
  type ARGS = {
    postAuthors: PostAuthor[];
    deletePost: (id: string) => void;
    toUpdatePost: (event: MouseEvent | KeyboardEvent, id: string) => void;
    selectedUserId: string;
  };
  let { postAuthors, deletePost, toUpdatePost, selectedUserId }: ARGS =
    $props();
</script>

<!-- <pre>{selectedUserId} {JSON.stringify(postAuthors, null, 2)}</pre> -->
<!-- <pre>{selectedUserId} {postAuthors[0]?.title}</pre> -->

{#snippet tooltip(allowed: boolean, title: string)}
  <!-- NOTE the way to toggle string content based on a predicate -->
  <CRTooltip caption={`${allowed ? 'delete' : 'false'}`}>
    <p>
      {allowed ? title : 'owner only permission'}
    </p>
  </CRTooltip>
{/snippet}

{#snippet item_delete(allowed: boolean, pA: PostAuthor)}
  <div class="tooltip-wrapper">
    <CRTooltip caption={allowed ? 'delete post' : 'owner only permission'}>
      <button
        class={allowed ? 'ok-hover box' : 'no-hover box'}
        onclick={(event: MouseEvent | KeyboardEvent) => {
          event.preventDefault();
          allowed && deletePost(pA?.id);
        }}
        aria-label="Delete Post"
        aria-hidden={true}
      >
        <span style="color:red;">X</span>
      </button>
    </CRTooltip>
  </div>
{/snippet}

{#snippet item_prepare_update(allowed: boolean, pA: PostAuthor)}
  <div class="tooltip-wrapper">
    <CRTooltip
      caption={`${allowed ? 'Prepare for update' : 'owner permission only'}`}
    >
      <button
        class={allowed ? 'ok-hover box' : 'no-hover box'}
        onclick={(event: MouseEvent | KeyboardEvent) => {
          event.preventDefault();
          allowed && pA && toUpdatePost(event, pA?.id);
        }}
        aria-label="Update Post"
        aria-hidden={true}
      >
        📝
      </button>
    </CRTooltip>
  </div>
{/snippet}

{#snippet title_with_content(allowed: boolean, pA: PostAuthor)}
  <section
    onclick={(event: MouseEvent | KeyboardEvent) => {
      event.preventDefault();
      allowed && toUpdatePost(event, pA?.id);
    }}
    aria-hidden={true}
  >
    <p
      class={`${allowed ? 'blue' : 'gray'} ${allowed ? 'ok-hover' : 'no-hover'}`}
    >
      {pA?.title}
    </p>
    <p>{pA?.content}</p>
  </section>
{/snippet}

{#snippet blockPanel(pA: PostAuthor)}
  <div class="block-panel">
    <p>published</p>
    <p>{pA?.published ? 'YES' : 'Not Yet'}</p>
    <p>created at</p>
    <p>{pA?.createdAt.toLocaleString()}</p>
    <p>updated at</p>
    <p>{pA?.updatedAt.toLocaleString()}</p>
    <p>categories</p>
    <p class="category-names">{pA?.categoryNames}</p>
  </div>
{/snippet}

{#snippet category_names()}
  <div class="category-names">
    <p>
      Categories:
      {#if postAuthors[0]?.categoryNames?.length}
        {#each postAuthors[0].categoryNames as category, index (postAuthors[0].id)}
          {postAuthors[0].firstName}
          {postAuthors[0].lastName}{index <
          postAuthors[0].categoryNames.length - 1
            ? ', '
            : ''}
        {/each}
      {:else}
        None
      {/if}
    </p>
  </div>
{/snippet}

{#snippet infoPanel(pA: PostAuthor)}
  <div class="todo-tooltip">
    <p>First name</p>
    <p class="prop-value">{pA?.firstName}</p>
    <p>Last name</p>
    <p class="prop-value">{pA?.lastName}</p>
    <p>created on</p>
    <p class="prop-value">{(pA?.createdAt as Date)?.toLocaleString()}</p>
    <p>updated on</p>
    <p class="prop-value">{(pA?.updatedAt as Date)?.toLocaleString()}</p>
  </div>
{/snippet}

{#snippet post_block(allowed: boolean, pA: PostAuthor)}
  <!-- <CRTooltip caption="Caption instead of panel"> -->
  <CRTooltip panel={blockPanel} panelArgs={pA}>
    <div class="tooltip-wrapper wide">
      <!-- {pA.title}
      {pA.content} -->
      {@render title_with_content(allowed, pA)}
    </div>
  </CRTooltip>
{/snippet}

<!-- Todo it was {postAuthors[0].firstName.slice(0, -1)} below-->
<!-- <pre style="font-size:11px;">postAuthors[0] {JSON.stringify(postAuthors[0], null, 2)}</pre> -->
<div class="post-container">
  <ul>
    {#if postAuthors[0]}
      <p class="author_name">
        {postAuthors[0].firstName.replace(/^T-/, '')}
        {postAuthors[0].lastName}
        <span class="count"
          >{postAuthors.length} post{postAuthors.length === 1 ? '' : 's'}</span
        >
      </p>

      {#if postAuthors}
        {#each postAuthors as pA}
          {@const isOwner = pA?.author}
          <li class="post-block">
            <label>
              {@render item_prepare_update?.(isOwner, pA)}
              {@render item_delete?.(isOwner, pA)}

              {@render post_block(isOwner, pA)}
            </label>
          </li>
        {/each}
      {/if}
    {/if}
  </ul>
</div>

<style lang="scss">
  .post-container {
    // border: 1px solid gray;
    // border-radius: 8px;
    // padding: 0.5rem;
    // margin: 0.5rem 0;
    // background-color: var(--BODY-BACKGROUND-COLOR); // #3e3e3e;
    // box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
    max-width: 40rem;
    min-width: 20rem;
  }
  .block-panel {
    display: grid;
    grid-template-columns: auto auto;
    grid-auto-rows: 20px;
    width: auto;
    height: 6.3rem;
    column-gap: 1rem;
    padding: 0 1rem;
    font-size: 14px;
    color: yellow;
    background-color: navy; // #3e3e3e;
    border: 1px solid yellow;
    border-radius: 8px;
    // max-width: 20rem;
  }
  .title-content {
    border: 1px solid gray;
    width: max-content;
  }

  .tooltip-wrapper {
    position: relative;
    display: inline-block;

    p {
      color: yellow;
      padding: 0 0 0 5px;
      margin: 0;
    }
    p:first(child) {
      color: lightgreen;
    }
    p &:hover {
      color: lightgreen;
      cursor: pointer;
    }
  }
  .narow {
    width: 2rem !important;
    height: 2rem !important;
    border: 1px solid gray;
    border-radius: 6px !important;
  }
  .wide {
    width: 70rem; /* Or any other desired fixed width */
    max-height: 3.9rem;
    overflow-x: hidden;
    overflow-y: auto !important;
    text-wrap: auto !important;
    &:hover {
      cursor: pointer;
    }
  }
  .category-names {
    // padding: 0;
    // margin: 0;
    // width: 10rem;
    // text-wrap: wrap;
    // overflow-x: auto;
  }
  .author_name {
    position: sticky;
    top: -5px;
    font-style: italic;
    color: lightgreen;
    font-size: 16px;
    margin-bottom: 8px;
    height: 1.6rem;
    padding: 4px 1rem 0 1rem;
    background-color: vat(--BODY-BACKGROUND-COLOR); // #3e3e3e;
    opacity: 1;
    z-index: 5;
    .count {
      font-size: 12px;
      margin-left: 1.5rem;
    }
  }
  .post-block {
    position: relative;
    list-style: none;
    margin: 0.6rem 0 0 0;
    padding: 0 5px 0 0;
    margin-bottom: 1rem;
  }

  .highlight {
    width: 1rem !important;
  }
  .content {
    display: inline-block;
    font-size: 20px;
    // font-family: Verdana, sans-serif;
    font-family: 'Times New Roman', Times, serif;
    font-weight: 300;
    padding: 0 1rem;
    margin: 0;
  }
  label {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
    height: 100%;
  }
  .box {
    width: 2rem;
    height: 2rem;
    border: 1px solid gray; //1px solid transparent;
    border-radius: 4px;
  }
  .ok-hover,
  .no-hover {
    padding: 1px 3px;
    outline: none;
    font-size: 20px;
    color: lightblue;
  }
  .no-hover {
    &:hover {
      // border-color: gray;
      cursor: not-allowed;
    }
  }
</style>
