<!--
@component
-->

<script lang="ts">
	type Theme = 'light' | 'dark';
	let theme = $state<Theme>('light');
	export function getIcon(theme: string) {
		return theme === 'dark' ? '☀️' : '🌙';
	}
</script>

<div class="page-wrapper">
	<nav>
		<span class="toggle-info-page" aria-hidden={true}>What Does This Page Do?</span>
		<p aria-hidden={true}>
			<span class="icon">{getIcon(theme)}</span>
		</p>
		<span class="page-info hidden"></span>
	</nav>
	<!-- <div class="main">
    <Current {setPageInfo}></Current>
  </div> -->
</div>

<style lang="scss">
	:root {
		--tab-bg: #eeeeee;
		--tab-border: #808080;
		--cr-text: #eeeeee;
	}
	@mixin border($padding: 0) {
		border: 1px solid gray;
		border-radius: 5px;
		padding: $padding;
	}
	@mixin nav-colors {
		color: var(--tab-color);
		background-color: var(--tab-bg);
	}
	.page-wrapper {
		position: relative;
		padding: 0;
		margin: 0;
		border: 1px solid blue;
		nav {
			position: absolute;
			top: 0;
			left: 0;
			display: flex;
			gap: 10px;
			justify-content: flex-start;
			align-items: center;
			width: 96vw;
			height: 1.5rem;
			padding: 0;
			margin: 0;
			@include nav-colors;
			@include border;
			p {
				position: relative;
				margin-left: auto;
				display: inline-block;
				height: 25px;
				width: 25px;
				outline: none;
				@include border;
				cursor: pointer;
				background-color: var(--tab-bg);
				z-index: 100;
				span.icon {
					position: absolute;
					top: 0;
					padding: 0;
					margin: 0;
				}
			}
		}
		.page-info {
			display: inline-block;
			width: max-content;
		}
		.toggle-info-page {
			display: inline-block;
			width: max-content;
			padding: 0;
			margin: 0;
			color: black; //var(--cr-text);
			@include border($padding: 0 0.5rem);
		}
		.main {
			position: relative;
			width: max-content;
			height: auto;
			padding: 0;
			margin: 0;
		}
		.hidden {
			display: none;
		}
	}
</style>
