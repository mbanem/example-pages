// model.ts (or model.svelte.ts if in a Svelte project)
import { lowercaseTypes } from './data';
type TField = [fieldName: string, fieldType: string]; // tuple [fieldName, fieldType]
type TModel = Record<string, TField[]>;

enum UI {
	all,
	namesOnly,
	ui,
	nonUI,
}

// Private module state (replaces static private fields)
let _initialized = false;
const _models: TModel = {};

const _ordered: string[] = [
	'id',
	'authorId',
	'userId',
	'employeeId',
	'customerId',
	'ownerId',
	'firstName',
	'lastName',
	'middleName',
	'name',
	'profileId',
	'dob',
	'dateOfBirth',
	'email',
	'password',
	'address',
	'city',
	'state',
	'title',
	'content',
	'category',
	'role',
	'priority',
	'price',
	'updatedAt',
];

// Public API
export function Model(lowercaseTypes: string) {
	try {
		const cleanedString = lowercaseTypes
			.replace(/export type/g, '')
			.replace(/[\n\r\s]+/g, '')
			.replace(/[{}]/g, '');

		const segments = cleanedString.replace(/;;/g, ';').split('=');
		for (let i = 0; i < segments.length - 1; i++) {
			let objectName: string;
			let rawBody: string;

			if (i === 0) {
				objectName = segments[i];
			} else {
				const parts = segments[i].split(';');
				objectName = parts.pop()!;
			}
			const bodySegment = segments[i + 1];

			if (i < segments.length - 2) {
				const parts = bodySegment.split(';');
				parts.pop();
				rawBody = parts.join(';');
			} else {
				// Last segment
				rawBody = bodySegment;
			}

			const fields: Array<[string, string]> = rawBody
				.split(';')
				.filter(Boolean)
				.map((fieldStr) => {
					const [fieldName, fieldType] = fieldStr.split(':');
					return [fieldName, fieldType];
				});

			_models[objectName] = fields;
		}
		_initialized = true;
	} catch (err) {
		console.log('initialize: ', err);
	}
	function m() {}

	m.initialized = () => {
		return _initialized;
	};
	m.modelTypes = (): string => {
		let mt = '|';
		for (const key of Object.keys(_models)) {
			mt += key + '|';
		}
		return mt;
	};

	m.fieldsWithType = (modelName: string, excludeName: string = ''): string => {
		const fields = m.model(modelName as keyof TModel);
		let fl = ``;
		for (const field of fields) {
			if (field[0] === 'nonUI') {
				break;
			}
			if (field[0] !== excludeName) {
				fl += field[0] + ': ' + field[1] + '\n\t\t\t';
			}
		}
		return fl.slice(0, -4);
	};

	m.fieldsList = (model: string, excludeName: string = '', delimiter: string = ', '): string => {
		const fields = m.fieldNames(model as keyof TModel, UI.namesOnly);
		let fl = '';
		for (const field of fields) {
			if (field !== excludeName) {
				fl += field + delimiter;
			}
		}
		return fl.slice(0, -delimiter.length);
	};

	m.fieldNames = <ModelName extends keyof TModel>(model: ModelName, kind: UI) => {
		const t = kind === UI.ui ? ': true' : '';
		const fn = _models[model].map((field) => field[0]) as string[];
		return m.sortArrByOrdered(fn, kind).map((fieldName) => fieldName + t);
	};

	m.fieldTypes = <ModelName extends keyof TModel>(model: ModelName) => {
		return m.sortArrByOrdered(_models[model].map((field) => field[1]) as string[]);
	};

	m.model = <ModelName extends keyof TModel>(model: ModelName): (string | TField)[] => {
		return m.sortArrByOrdered(_models[model] as TField[]);
	};

	m.mustLoginFirst = (): string => {
		return `if ('${m.modelTypes}'.includes(|\${event.url.pathname.slice(1)}|)) {
        throw redirect(303, '/login');
      }`;
	};

	m.sortArrByOrdered = (arg: string[] | TField[], kind: UI = UI.all) => {
		const arrType = typeof arg[0] === 'string'; // true if string[], false if TField[]
		let orderedPart: string[] | TField[] = [];
		let leftoverPart: string[] | TField[] = [];

		if (arrType) {
			if (kind === UI.ui || kind === UI.all) {
				orderedPart = _ordered.map((key) => (arg as TField[]).find((item) => item[0] === key)) as TField[];
			}
			if (kind === UI.nonUI || kind === UI.all) {
				leftoverPart = (arg as TField[]).filter((item) => {
					const key = item[0].trim();
					return !_ordered.includes(key);
				}) as TField[];
			}
			if (kind === UI.all) {
				(leftoverPart as TField[]).unshift(['nonUI', '']);
			}
		} else {
			if (kind === UI.ui || kind === UI.all || kind === UI.namesOnly) {
				orderedPart = _ordered.map((key) => (arg as string[]).find((item) => item === key)) as string[];
			}
			if (kind === UI.nonUI || kind === UI.all) {
				leftoverPart = (arg as string[]).filter((item) => {
					const key = item.split(':')[0].trim();
					return !_ordered.includes(key);
				}) as string[];
			}
			if (kind === UI.all) {
				(leftoverPart as string[]).unshift('nonUI');
			}
		}
		return [...orderedPart, ...leftoverPart].filter(Boolean);
	};
}
const model = Model(lowercaseTypes);
Object.defineProperty(Model, 'initialized', {
	get() {
		return _initialized;
	},
});

// Initialization call (usually at app startup)
