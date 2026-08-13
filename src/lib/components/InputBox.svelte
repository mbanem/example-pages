<script lang="ts">
	import { browser } from '$app/environment';
	import * as utils from '$lib/utils';
	import { onMount } from 'svelte';
	type TExportValueOn = 'keypress' | 'keypress|blur' | 'enter' | 'blur' | 'enter|blur';
	// import { setContext } from 'svelte';

	// style.setProperty('--color', `${color}`)
	type PROPS = {
		id?: string;
		title: string;
		width?: string;
		height?: string;
		fontsize?: string;
		margin?: string;
		type?: string | number | Date | boolean | password | time | text | tel | range | radio | checkbox | textarea;
		rows?: string;
		cols?: string;
		value?: string;
		required?: boolean;
		capitalize?: boolean;
		err?: string[] | undefined;
		onButtonNext?: () => void;
		exportValueOn?: TExportValueOn;
		onInputIsReadyCallback?: () => void; // call parent when onInputIsReadyCallback for 'enter', otherwise on every key
		clearOnInputIsReady?: boolean; // clear input value on onInputIsReadyCallback
	};

	let {
		id,
		title,
		width = '16rem',
		height = '2.5rem',
		fontsize = '16px',
		margin = '0',
		type,
		rows = '4',
		cols = '30',
		value = $bindable(),
		required = false,
		err = undefined,
		onButtonNext,
		exportValueOn = 'enter',
		onInputIsReadyCallback = undefined,
		capitalize = false,
		clearOnInputIsReady = false,
	}: PROPS = $props();

	// make capitalizes as capitalize is already defined in $Props()
	const capitalizes = (str: string): string => {
		try {
			// if this is not field name but an information message
			if (str.split(' ').length > 3) return str;
			// @ts-expect-error
			str = str.capitalize();
			const arr = str.match(/\s+/g);
			if (!arr || arr.length > 3) return str;
		} catch (err) {
			console.log('capitalizes', err);
		}
		return str;
	};
	// NOTE: enter non breaking unicode space: type 00A0 and press Alt + X
	// here we held between apostrophes three non breaking spaces
	title = '   ' + capitalizes(title);
	let requiredStr = required ? `${title} is required` : '';

	(function () {
		// IIFE
		exportValueOn = exportValueOn.toLowerCase() as TExportValueOn;
		// make combination be with 'enter|blur' and 'keypress|blur' if inverted
		const parts = exportValueOn.split('|');
		if (parts.length > 1 && parts[0] === 'blur') {
			exportValueOn = `${parts[1]}|${parts[0]}` as TExportValueOn;
		}
	})();
	const topPosition = `${-1 * Math.floor(parseInt(fontsize) / 3)}px`;

	// allow pre-defined values to show up when user specify them
	let inputValue = $state<string>('');

	if (browser) {
		try {
			utils.setCSSValue('--INPUT-BOX-LABEL-TOP-POS', topPosition);
			if (width) utils.setCSSValue('--INPUT-COMRUNNER-WIDTH', width as string);
			if (height) utils.setCSSValue('--INPUT-COMRUNNER-HEIGHT', height as string);
			if (fontsize) utils.setCSSValue('--INPUT-COMRUNNER-FONT-SIZE', fontsize as string);
			width = utils.getCSSValue('--INPUT-COMRUNNER-WIDTH') as string;
		} catch (err) {
			console.log('<InputBox get/setCSSValue', err);
		}
	}

	const onFocusHandler = (event: FocusEvent) => {
		event.preventDefault();
		labelStyle = 'opacity:1;top:3px;';
	};

	const onChangeHandler = () => {
		labelStyle = 'opacity:1; top:3px;';
	};
	const onBlurHandler = (event: FocusEvent) => {
		event.preventDefault();

		// no entry yet so no export is ready buy is dirty -- only handle placeholder if entry is required
		if (inputValue === '') {
			// input is required so warn the user with pink placeholder required message
			if (required) {
				inputEl.placeholder = requiredStr;
				labelStyle = 'opacity:1; top:3px;';
				utils.setPlaceholderColor('pink');
			} else {
				// input is not required so lower down field label inside the input box
				labelStyle = 'opacity:0.5;25px';
			}
		}
		if (exportValueOn.includes('blur')) {
			value = inputValue;
			if (onInputIsReadyCallback) {
				onInputIsReadyCallback();
			}
		}
	};
	const onKeyUpHandler = (event: KeyboardEvent) => {
		event.preventDefault();
		if (event.key === 'Tab') return;
		if (capitalize) {
			// NOTE: reactive variable inputbox value does not updates
			// inputbox value when changed via script, so inputEl.value
			// as a workaround is updated instead
			inputEl.value = utils.capitalize(inputValue);
		}
		// if keypress is Enter and exportValueOn does not include Enter we return
		if (exportValueOn.includes('enter') && event.key !== 'Enter') {
			if (capitalize && inputValue) {
				// inputValue = capitalizes(inputValue);
				inputValue = utils.capitalize(inputValue);
			}
			return;
		}
		// already prevented blur|keypress and blur|enter
		// blur always follows if any case
		if (!'keypress|blur|enter|blur'.includes(exportValueOn)) {
			inputValue = capitalizes(inputValue);
			return;
		}
		if (inputValue && inputValue.length > 0) {
			if (capitalize) {
				value = utils.capitalize(inputValue);
			}

			// if input should be returned
			// (blur is handled in a separate onBlurHandler)
			if (exportValueOn.includes('keypress') || (exportValueOn.includes('enter') && event.key === 'Enter')) {
				value = inputValue;

				if (onInputIsReadyCallback) {
					onInputIsReadyCallback();
					if (clearOnInputIsReady) {
						inputValue = '';
					}
				}
			}
		}
	};

	// input box has a label text instead of a placeholder in order to
	// move it up on focus, but the text does not set focus on input
	// element on click -- so we have to set the focus when the label
	// text is selected
	let labelStyle = $state('opacity:0.5;top:25px;');
	let label: HTMLLabelElement;
	let inputEl: HTMLInputElement | HTMLTextAreaElement;
	export const setFocus = () => {
		inputEl.focus();
	};

	// parent call to set input box value
	export const setInputBoxValue = (str: string, blur: boolean = false) => {
		if (blur) {
			setTimeout(() => {
				inputEl.blur();
			}, 1000);
		}
		inputEl.focus();
		inputValue = str;
	};
	// setContext('setInputBoxValue', setInputBoxValue);
	onMount(() => {
		label = document.getElementsByTagName('label')[0] as HTMLLabelElement;
		// if (inputValue && inputEl) {
		//   setFocus();
		// }
	});
</script>

<div class="input-wrapper" style="margin:{margin};">
	{#if type === 'textarea'}
		<textarea
			id="inp"
			bind:this={inputEl}
			{rows}
			{cols}
			required
			bind:value
			onkeyup={onKeyUpHandler}
			onfocus={onFocusHandler}
			onblur={onBlurHandler}
			onchange={onChangeHandler}
			disabled={false}
		>
		</textarea>
	{:else}
		<input
			id="inp"
			bind:this={inputEl}
			type={type ? type : 'text'}
			required
			bind:value
			onkeyup={onKeyUpHandler}
			onfocus={onFocusHandler}
			onblur={onBlurHandler}
			disabled={false}
		/>
	{/if}
	<label for="x" onclick={setFocus} aria-hidden={true} style={`${labelStyle}`}>
		{title}
		<span class="err" id="x">
			{err ? ` - ${err}` : ''}
		</span>
	</label>
</div>

<style lang="scss">
	:root {
		--INPUT-COMRUNNER-WIDTH: 16rem;
		--INPUT-BOX-LABEL-TOP-POS: -1px;
		--INPUT-COMRUNNER-HEIGHT: 2.5rem;
		--INPUT-COMRUNNER-FONT-SIZE: 16px;
	}

	.input-wrapper {
		position: relative;
		width: max-content;
		/* adjust label to look like placeholder */
		padding-top: 0.8rem;
		label {
			position: absolute;
			// transform: translateY(-50%);
			// top: calc(var(--INPUT-COMRUNNER-HEIGHT) * 0.5);
			left: 15px;
			// top: 26px;
			font-size: var(--INPUT-COMRUNNER-FONT-SIZE);
			color: var(--INPUT-COLOR);
			background-color: var(--INPUT-BACKGROUND-COLOR);
			// opacity: 0.5;
			transition: 0.5s;
			// .stay-on-top {
			//   top: -15px;
			// }
		}
		input {
			display: inline-block;
			width: var(--INPUT-COMRUNNER-WIDTH);
			height: var(--INPUT-COMRUNNER-HEIGHT);
			font-size: var(--INPUT-COMRUNNER-FONT-SIZE);
			padding: 0 10px;
			margin: 0;
			color: var(--TEXT-COLOR);
			&:focus {
				color: var(--INPUT-FOCUS-COLOR);
			}
			&:focus ~ label,
			&:valid ~ label {
				top: var(--INPUT-BOX-LABEL-TOP-POS);
				font-size: var(--INPUT-COMRUNNER-FONT-SIZE);
				opacity: 1;
			}
		}
	}

	.err {
		color: pink;
		// border: 1px solid #808080;
		// border-radius: 3px;
		padding: 1px 0.5rem;
	}
</style>
