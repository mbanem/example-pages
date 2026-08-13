type FTypeAttrs = [name: string, type: string];
type TModel = Record<string, FTypeAttrs[]>;
export enum UI {
	ui = 'UI',
	namesOnly = 'namesOnly',
	nonUI = 'nonUI',
	all = 'All',
}
// In your .svelte file (or better: move this logic to a .ts module!)
export function createModel(lowercaseTypes: string) {
	// --- Private state (replaces static class fields) ---
	let initialized_ = false;
	const models_: TModel = {};

	// --- Private helper (same as class method) ---
	const ordered = [
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
		'completed',
		'profileId',
		'dob',
		'dateOfBirth',
		'email',
		'password',
		'bio',
		'biography',
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

	let uiFieldNames: string[] = [];
	let nonUIFieldNames: string[] = [];
	let allFieldNames: string[] = [];
	const uiType = '|string|number|Date|boolean|enum|Role|';

	function sortArrByOrdered(arr: string[]) {
		return [1, 2, 3, 4, 5];
		// const orderedPart = ordered.map((key) => arr.find((item: string) => item.startsWith(key + ':'))).filter(Boolean)
		// const leftoverPart = arr.filter((item) => {
		//   const key = item.split(':')[0].trim()
		//   return !ordered.includes(key)
		// }
		// return [...orderedPart, ...leftoverPart]
	}
	// --- Initialization logic ---
	function initialize(lowercaseTypes: string): void {
		const uiSet = new Set();
		const nonUiSet = new Set();
		const fullSet = new Set();
		const cleanedString = lowercaseTypes
			.replace(/export type/g, '')
			.replace(/[\n\r\s]+/g, '')
			.replace(/[{}]/g, '');

		const segments = cleanedString.split('=');

		for (let i = 0; i < segments.length - 1; i++) {
			let objectName: string;
			let rawBody: string;

			if (i === 0) {
				objectName = segments[i].trim(); // starging with model name
			} else {
				// fieldName: fieldType
				const parts = segments[i].split(';');

				objectName = parts.pop()!.trim(); // remove and return the last element from parts array
			}

			const bodySegment = segments[i + 1];
			if (i < segments.length - 2) {
				const parts = bodySegment.split(';');
				parts.pop();
				rawBody = parts.join(';');
			} else {
				rawBody = bodySegment;
			}

			const fields: FTypeAttrs[] = rawBody
				.split(';')
				.filter(Boolean)
				.map((fieldStr) => {
					const [fieldName, fieldType] = fieldStr.split(':').map((s) => s.trim());
					if (uiType.includes(fieldType)) {
						uiSet.add(fieldName);
					} else {
						nonUiSet.add(fieldName);
					}
					fullSet.add(fieldName);
					return [fieldName, fieldType];
				});

			models_[objectName] = fields;
		}
		uiFieldNames = sortArrByOrdered(Array.from(uiSet) as string[], UI.ui) as string[];
		nonUIFieldNames = sortArrByOrdered(Array.from(nonUiSet) as string[], UI.nonUI) as string[];
		allFieldNames = sortArrByOrdered(Array.from(fullSet) as string[]) as string[];

		initialized_ = true;
	}

	// --- Public methods (will be attached to the function object) ---
	function getInitialized(): boolean {
		return initialized_;
	}

	function getModelTypes(): string {
		let mt = '|';
		for (const key of Object.keys(models_)) {
			mt += key + '|';
		}
		return mt;
	}

	function fieldsWithType(model: string, excludeName: string = ''): string {
		const fields = model in models_ ? models_[model] : [];
		let fl = ``;
		for (const field of fields) {
			if (field[0] === 'nonUI') break;
			if (field[0] !== excludeName) {
				fl += field[0] + ': ' + field[1] + '\n';
			}
		}
		return fl.slice(0, -4);
	}

	function fieldsList(model: string, excludeName: string = '', delimiter: string = ', '): string {
		const fields = fieldNames(model, UI.namesOnly);
		let fl = '';
		for (const field of fields) {
			if (field !== excludeName) {
				fl += field + delimiter;
			}
		}
		return fl.slice(0, -delimiter.length);
	}

	function fieldNames<ModelName extends keyof TModel>(model: ModelName, kind: UI) {
		const t = kind === UI.ui ? ': true' : '';
		const fn = models_[model].map((field) => field[0]);
		return sortArrByOrdered(fn, kind).map((fieldName) => fieldName + t);
	}

	function fieldTypes<ModelName extends keyof TModel>(model: ModelName) {
		const ord = sortArrByOrdered(models_[model]); //.map((field) => field[1]))
		return ord.map((field) => field[1]).filter(Boolean);
	}

	function model<ModelName extends keyof TModel>(model: ModelName) {
		return sortArrByOrdered(models_[model]);
	}

	function getMustLoginFirst(): string {
		return `if ('${getModelTypes()}'.includes(|\${event.url.pathname.slice(1)}|)) {
          throw redirect(303, '/login');
        }`;
	}

	function getHooks(): string {
		return `
    import { redirect } from '@sveltejs/kit';
    import type {Handle} from '@sveltejs/kit';
    import { db } from '$lib/server/db';

    export const handle: Handle = (async ({ event, resolve }) => {
      let session='empty session';
      try {
        session = event.cookies.get('session');
        
        if (!session) {
          event.locals.user = {
            id: '',
            firstName: '',
            lastName: '',
            email:'',
            password:'',
            roles: ['VISITOR']
          };
          ${getMustLoginFirst()}
          event.url.pathname = '/'
          return await resolve(event);
        }
      } catch (error) {
        throw redirect(303, '/login');
        event.url.pathname = '/'
        return await resolve(event);
      }

      try {
        const user = await db.user.findUnique({
          where: { userAuthToken: session },
          select: { id: true, firstName: true, lastName: true, email:true, role: true }
        });

        if (user) {
          event.locals.user = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password:'',
            role: user.role
          }
        } else {
          event.locals.user = {
            id: '',
            firstName: '',
            lastName: '',
            email:'',
            password:'',
            Role: 'VISITOR'
          };
        }
      } catch (err) {
        console.log('hook getUser', err);
      }
      return await resolve(event);
    }) satisfies Handle;`;
	}

	function pageServerLoad(model: string): string {
		const lcModel = model.toLowerCase();
		const selectList = fieldNames(model, UI.ui);
		return `
      export const load: PageServerLoad = (async ({ locals, cookies }) => {
      const ${lcModel}s: ${model}Partial[] = await db.${lcModel}.findMany({
        select: {
          ${selectList}
        }
      }) as ${model}Partial[];
    }) satisfies PageServerLoad`.replace(/,/g, ',\n\t\t');
	}

	function actions(model: string): string {
		// (Keep your original logic — just replace `Model.xxx` with local function calls)
		const lcModel = model.toLowerCase();
		return `
    import { db } from '$lib/server/db';
    import type { PageServerLoad } from './$types';
    import { error, fail, redirect } from '@sveltejs/kit';
    import type { Actions } from '@sveltejs/kit';
    import bcrypt from 'bcrypt'
    import * as utils from '$lib/utils';;
    import { fail } from '@sveltejs/kit';

    ${pageServerLoad('User')};

    export const actions: Actions = {
      create: async ({ request }) => {
        const { ${fieldsList(model, 'id')} } = Object.fromEntries(
          await request.formData()
        ) as {
          ${fieldsWithType(model, 'id')}
        }
        if ( !(${fieldsList(model, 'id', ' && ')}) ) {
          return fail(400, {
            data: { ${fieldsList(model, 'id')} },
            message: 'This ${lcModel} already exists'
          });
        }

        const ${lcModel}Exists = await db.${lcModel}.findFirst({
          where: { ${fieldsList(model, 'id')} }
        });
        if (${lcModel}Exists){
          return fail(400, {
            data: { ${fieldsList(model, 'id')} },
            message: 'Unacceptable data supplied'
          });
        } else {
          const dbObject = await db.${lcModel}.create({
            data: { ${fieldsList(model, 'id')} }
          });
          return {
            success: true,
            data: { dbObject },
            message: '${lcModel} created successfully'
          };
        }
      },
      update: async ({ request }) => {
        const input_data = Object.fromEntries(
          await request.formData()
        ) as { ${fieldsWithType(model)} };
        
        const { ${fieldsList(model)} } = input_data;
        if ( !(${fieldsList(model, '', ' && ')}) ) {
          return fail(400, {
            data: { ${fieldsList(model)} },
            message: 'Insufficient data supplied'
          });
        }
        await utils.sleep(2000);
        const data = Object.fromEntries(
          Object.entries(input_data).filter(([_, value]) => value)
        );
        try {
          await db.${lcModel}.update({
            where: { id: data.id },
            data,
          });
          return {
            ${fieldsList(model)},
            success: true,
            message: '${lcModel} updated successfully'
          };
        } catch( err ) {
          const msg = err instanceof Error ? err.message : String(err);
          return fail(500, {message: msg});
        }
      },
      delete: async ({ request }) => {
        const input_data = Object.fromEntries(
          await request.formData()
        ) as { ${fieldsWithType(model)} };
        
        if (!input_data.id){
          return fail(400, { message: '${lcModel}.id is necessary' });
        }
        await utils.sleep(2000);
        try {
          await db.${lcModel}.delete({ where: { id: input_data.id } });
          return {
            id: input_data.id,
            success: "${lcModel} deleted successfully",
          };
        } catch(err){
          const msg = err instanceof Error ? err.message : String(err);
          return fail(500, {message: msg});
        }
      }
    } satisfies Actions;`;
	}
	// --- Create the main function object ---
	function Model() {
		// Optional: do something if called as function, or leave empty
	}

	// --- Attach all "static" methods as properties ---
	Model.initialize = initialize;
	Model.getInitialized = getInitialized;
	Model.initialized = getInitialized(); // or use getter (see below)
	Model.getModelTypes = getModelTypes;
	Model.modelTypes = getModelTypes();
	Model.fieldsWithType = fieldsWithType;
	Model.fieldsList = fieldsList;
	Model.fieldNames = fieldNames;
	Model.fieldTypes = fieldTypes;
	Model.model = model;
	Model.getMustLoginFirst = getMustLoginFirst;
	Model.mustLoginFirst = getMustLoginFirst();
	Model.getHooks = getHooks;
	Model.hooks = getHooks();
	Model.pageServerLoad = pageServerLoad;
	Model.actions = actions;

	// Optional: use getters for computed properties (like in the class)
	Object.defineProperty(Model, 'initialized', {
		get: getInitialized,
		enumerable: true,
	});
	Object.defineProperty(Model, 'modelTypes', {
		get: getModelTypes,
		enumerable: true,
	});
	Object.defineProperty(Model, 'mustLoginFirst', {
		get: getMustLoginFirst,
		enumerable: true,
	});
	Object.defineProperty(Model, 'hooks', {
		get: getHooks,
		enumerable: true,
	});

	// Initialize immediately
	initialize(lowercaseTypes);

	return Model;
}
