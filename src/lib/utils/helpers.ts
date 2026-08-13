import { browser } from '$app/environment';
// import type RequestEvent from '@sveltejs/kit';

/* how to use CyclicIterator<T>
	const getNext = createCyclicPicker(elements);
	console.log(getNext());
*/
export class CyclicIterator<T> implements Iterable<T> {
	private items: T[];

	constructor(items: T[]) {
		if (items.length === 0) {
			throw new Error("Sequence cannot be empty.");
		}
		this.items = [...items]; // make an items copy to avoid external mutation
	}

	// Implementacija iterator protokola
	*[Symbol.iterator](): Iterator<T> {
		let index = 0;
		while (true) {
			yield this.items[index] as T;
			// Kada stigne do kraja, vraća se na 0 i počinje novi ciklus
			index = (index + 1) % this.items.length;
		}
	}
}
// 
export const createCyclicPicker = <T>(items: T[]): (() => T) => {
	let index = 0;
	return function next(): T {
		const item = items[index];
		index = (index + 1) % items.length;
		return item as T;
	};
}
//----------------  end of CyclicIterator ----------------------
// export const vscode =
// 	typeof acquireVsCodeApi !== 'undefined'
// 			acquireVsCodeApi()
// 		: {
// 				postMessage: (msg: any) => {
// 					console.log(`[DEV] ${msg.command} in progress...`);
// 					setTimeout(() => {
// 						console.log(`${msg.command} is done`, msg.payload ?? 'with no payload');
// 					}, 3000);
// 				},
// 			};
export const handleTryCatch = (err: unknown, info?: string) => {
	const msg = err instanceof Error ? err.message : String(err);
	console.log(info, msg);
};
// change placeholder color to red on required messages
export const setColor = (color: string) => {
	if (browser) {
		document.documentElement.style.setProperty('--PLACEHOLDER-COLOR', color);
		setTextColor('--MESSAGE-COLOR', color === 'red' ? 'pink' : color);
	}
};
export const setPlaceholderColor = (color: string) => {
	if (browser) {
		document.documentElement.style.setProperty('--PLACEHOLDER-COLOR', color);
		setTextColor('--MESSAGE-COLOR', color === 'red' ? 'pink' : color);
	}
};

export const capitalize = (str: string) => {
	const spaceUpper = (su: string) => {
		// getting _string so return ' String' with a leading space
		return ` ${su[1]?.toUpperCase()}`;
	};
	let s = str[0]?.toUpperCase() + str.slice(1);
	return (
		s
			.replace(/\b[a-z](?=[a-z]{2})/g, (char) => char.toUpperCase())
			// snake_string_format replace _ with space
			.replace(/(_\w)/, spaceUpper)
	);
};

// @ts-expect-error capitalize does not exist of string
String.prototype.capitalize = function () {
	return capitalize(this as string);
};
export const getCSSValue = (varName: string): string | undefined => {
	if (!browser) return;

	try {
		const root = document.documentElement;
		const value = getComputedStyle(root).getPropertyValue(varName).trim();
		return value || undefined;
	} catch (err) {
		console.log('getCSSValue error:', (err as Error).message);
	}
};
export const setCSSValue = (varName: string, value: string | number) => {
	try {
		if (browser) {
			const root = document.querySelector(':root') as HTMLElement;
			if (root) {
				root.style.setProperty(varName, value as string);
				// console.log('cssValue',root.style.getPropertyValue(varName))
			}
		}
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		console.log('setCSSValue', msg);
	}
};
export const setTextColor = (varName: string, color: string) => {
	try {
		if (browser) {
			const root = document.querySelector(':root') as HTMLElement;
			if (root) {
				root.style.setProperty(varName, color);
			}
		}
	} catch (err) {
		console.log('setTextColor', err);
	}
};
export function isEmpty<T extends object>(obj: T) {
	return Object.keys(obj).length === 0;
}

//---------------  begin deep merge -----------------------
export function isPlainObject(item: unknown): item is Record<string, unknown> {
	return (
		item !== null &&
		typeof item === 'object' &&
		!Array.isArray(item) &&
		Object.getPrototypeOf(item) === Object.prototype
	);
}

/**
 * Deep merges two objects.
 * - Nested objects are merged recursively.
 * - Arrays and primitives from the source (second object) override the target.
 * - Creates a brand new object (immutable).
 */

export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
	const output = { ...target } as T & U;

	// Kastujemo u Record da bismo bezbedno pristupali ključevima preko string indeksa
	const outputObj = output as Record<string, unknown>;
	const sourceObj = source as Record<string, unknown>;

	for (const key of Object.keys(source)) {
		const targetVal = outputObj[key];
		const sourceVal = sourceObj[key];

		if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
			outputObj[key] = deepMerge(targetVal, sourceVal);
		} else {
			outputObj[key] = sourceVal;
		}
	}

	return output;
}

/**
 * Deep merge for any number of Record<string, T> (immutable, last-wins)
 */
export function deepMergeRecords<T>(...records: Record<string, T>[]): Record<string, T> {
	if (records.length === 0) return {};
	if (records.length === 1) return { ...records[0] };

	// Start with a shallow copy of the first record
	const result = { ...records[0] } as Record<string, T>;

	for (let i = 1; i < records.length; i++) {
		const current = records[i];

		for (const [key, value] of Object.entries(current as keyof typeof current) as [string, T][]) {
			const targetVal = result[key];
			const sourceVal = value;

			if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
				// Recursive deep merge on nested objects
				(result as any)[key] = deepMergeRecords(targetVal as Record<string, T>, sourceVal as Record<string, T>);
			} else {
				// Simple override (primitives, arrays, null, etc.)
				(result as any)[key] = sourceVal;
			}
		}
	}

	return result;
}
// ---------------  end deep merge -----------------------
const primitiveTypes = new Set(['string', 'number', 'boolean', 'Date', 'float', 'decimal', 'json', 'Role']);
export function isModelFieldUICandidate(models: Models, field: Field): boolean {
	const { name, type, isArray, isOptional, attrs } = field;
	// type = type.toLowerCase().trim();
	// model name could appear in schema as 'model User {' or as field type 'posts Post[]', so
	// the name and type arguments cannot bear model name, which is not ui candidates
	if (models[name] || models[type] || isArray) {
		return false;
	}
	if (name.includes('@@') || (type === 'Date' && name === 'createdAt') || /hash|token/i.test(name)) {
		return false;
	}
	// additional fields are data entry fields @id updatedAt and all primitive types
	const ui =
		/\b@id @default(uuid())\b/i.test(attrs as string) ||
		(type === 'Date' && name === 'updatedAt') ||
		primitiveTypes.has(type);
	return ui;
}
// returning tuple has the following type
export type TupleFieldAttrs = [string, string, boolean, boolean, string];
// returns an array of attribute values as quotted if non-booleans
export function attrArrayOptional(match: string[] | null): TupleFieldAttrs {
	if (!match) {
		return ['', '', false, false, ''];
	}
	// match is RegExpMatchArray object; we skip the first item with .slice(1,...)
	// as it holds the whole search string. We return an array of attributes
	return [...match.slice(1, 3), match[3] === '[]', match[4] === '?', match[5]] as TupleFieldAttrs;
}

export function fieldAttrsFromLine(line: string): TupleFieldAttrs {
	return attrArrayOptional(line.match(/\s*(\w+)\s*(\w+)(\[\])?(\?)?\s*([@a-xA-Z0-9_():\[\]'", \t]*)?/));
}
// created object should have the following properties
const attrNames = ['"name": ', '"type": ', '"isArray": ', '"isOptional": ', '"attrs": '];

// create an object with attrNames with attribute values
export function stringToFieldObject(line: string) {
	if (!line) {
		return null;
	}
	// non-boolean attributes must be quotted for JSON
	function w(ix: number, el: string | boolean): string | boolean {
		const q = [0, 1, 4].includes(ix) ? '"' : '';
		if (typeof el === 'string') {
			el = el.replace(/"/g, "'");
		}
		return `\t\t${attrNames[ix % 5]}${q}${el}${q},\n\t`;
	}
	const raw = attrArrayOptional(line.match(/\s*(\w+):?\s*(\w+)(\[\])?(\?)?\s*([@a-zA-Z0-9_():\[\]'", \t]*)?/)).reduce(
		(acc, el, ix) => {
			return ((acc as string) = (acc as string) + w(ix, el));
		},
		'\t{\n\t'
	);
	// return JSON.parse(raw.slice(0,-3)+'\n\t}')
	return JSON.parse((raw as string).slice(0, -3) + '\n\t}');
}

export const sleep = async (ms: number) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			// ms here is a dummy but required by
			// resolve to send out some value
			resolve(ms);
		}, ms);
	});
};
// utils/dragReorder.ts
export const sixHash = () => {
	const a = (Math.random() * 46656) | 0;
	const b = (Math.random() * 46656) | 0;
	return a.toString(36).slice(-3) + b.toString(36).slice(-3);
};
const querySelector = 'draggable';
/**
 * Enables drag-to-reorder for direct children of a list container
 * @param container The parent element (e.g., #fieldsListId)
 * @param querySelector is element draggable
 */
export function enableDragDrop(container: HTMLElement) {
	let draggedEl: HTMLElement | null = null;

	const handleDragStart = (e: DragEvent) => {
		const target = e.target as HTMLElement;
		if (!target.classList.contains(querySelector)) return;

		draggedEl = target;
		// Optional: add visual feedback
		target.style.opacity = '0.5';
		e.dataTransfer?.setData('text/plain', ''); // required for Firefox
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault(); // essential!
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		if (!draggedEl) return;

		const dropTarget = e.target as HTMLElement;
		const validTarget = dropTarget.classList.contains(querySelector) ? dropTarget : dropTarget.closest(querySelector);

		if (!validTarget || validTarget === draggedEl) {
			resetOpacity();
			return;
		}

		// Move dragged element before drop target
		container.insertBefore(draggedEl, validTarget);

		resetOpacity();
	};

	const handleDragEnd = () => {
		resetOpacity();
		draggedEl = null;
	};

	const resetOpacity = () => {
		if (draggedEl) draggedEl.style.opacity = '';
	};

	// Attach listeners
	container.addEventListener('dragstart', handleDragStart);
	container.addEventListener('dragover', handleDragOver);
	container.addEventListener('drop', handleDrop);
	container.addEventListener('dragend', handleDragEnd);

	// Return cleanup function
	return () => {
		container.removeEventListener('dragstart', handleDragStart);
		container.removeEventListener('dragover', handleDragOver);
		container.removeEventListener('drop', handleDrop);
		container.removeEventListener('dragend', handleDragEnd);
	};
}
