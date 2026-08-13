<script lang="ts">
  /*	used as a regular button getting URL to navigate on click
			with title and CSS style string to style it completely
	*/
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let title: string = 'Submit';
  export let css_style: string = '';
  export let css_on_hover: string = '';
  export let href: string = '/';

  const def = `
	color: white;
	background-color:darkred;
	border: 1px solid transparent;
	border-radius: 5px;
	padding: 3px 0.5rem;
	text-align: center;
	width: 6rem;
	opacity:1;
	cursor:pointer;
	margin-left:auto;
`;

  //  HTML document exists in browser so wait until onMount fires
  let initialized = false;
  onMount(() => {
    cssClass(
      'cr-class',
      def + css_style + ';display:inline-block;\n',
      css_on_hover,
    );
    initialized = true;
  });
  const selectorExists = (selector: string) => {
    if (!browser) return;
    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        const rules = document.styleSheets[i]?.cssRules as CSSRuleList;
        for (let ix in rules) {
          if ((rules[ix] as CSSStyleRule).selectorText === selector) {
            return true;
          }
        }
      }
      return false;
    } finally {
    }
  };

  const cssClass = (name: string, style: string, hover?: string) => {
    if (!browser) return;
    try {
      const styleEl = document.createElement('style');
      styleEl.id = name; // so you can get and alter/replace/remove later
      const onHover = hover ? `.${name}:hover {${hover}}` : '';
      styleEl.innerHTML = `.${name} {${style}} ${onHover}`;
      const header = document.getElementsByTagName('HEAD')[0];
      header?.appendChild(styleEl);
    } finally {
    }
  };
</script>

<button class="cr-class" on:click={() => goto(href)}> {title} </button>

<style lang="scss">
  .cr-class {
    @include on-focus {
      border: solid 2px #999;
      margin-left: 1rem;
      width: 8rem;
      &:hover {
        border-color: lightgreen;
      }
    }
  }
</style>
