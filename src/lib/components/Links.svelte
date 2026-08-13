<script lang="ts">
  type ARGS = {
    paths: string[];
    prevPath: string;
  };
  let { paths, prevPath }: ARGS = $props();
  // import { goto } from '$app/navigation';
  import { goto } from '$app/navigation';
  import * as utils from '$lib/utils';

  const followPath = (path: string) => {
    if (path === prevPath.slice(1)) {
      // 'history to', prevPath);
      history.back();
    } else {
      // 'followPath to', path);
      path === 'home' ? goto('/') : goto(`/${path}`);
    }
    return path;
  };
</script>

{#each paths as path}
  {#if path === prevPath}
    {history.back()}
  {:else}
    <a
      type="button"
      data-sveltekit-preload-data="tap"
      href={followPath(path)}
      aria-hidden={true}>{utils.capitalize(path)}</a
    >
  {/if}
{/each}

<style lang="scss">
  a {
    display: inline-block;
    min-width: 5rem;
    border: 1px solid gray;
    border-radius: 4px !important;
    padding: 5px 5px;
    font-size: 16px;
    color: var(--LINK-COLOR);
    background-color: var(--LINK-BACKGROUND-COLOR);
    margin: 0;
    &:hover {
      color: var(--LINK-HOVER);
      border: vR(--LINK-BORDER);
    }
    &:active {
      border: 1px solid var(--LINK-HOVER);
    }
    &:disabled {
      background-color: VAR(--LINK-DISABLED);
    }
  }
</style>
