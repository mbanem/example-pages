<script lang="ts">
	import { lowercaseTypes } from './data';
	import { browser } from '$app/environment';

	type TField = [name: string, type: string];
	type TModel = Record<string, TField[]>;
	enum UI {
		ui = 'UI',
		namesOnly = 'namesOnly',
		nonUI = 'nonUI',
		all = 'All',
	}

	class Model {
		private static initialized_ = false;
		private static models_: TModel = {};
		private constructor() {} // Prevent direct instantiation
		static initialize(lowercaseTypes: string): void {
			const cleanedString = lowercaseTypes
				.replace(/export type/g, '') // Remove keywords
				.replace(/[\n\r\s]+/g, '') // Remove all whitespace/newlines
				.replace(/[{}]/g, ''); // Remove brackets

			const segments = cleanedString.split('=');

			for (let i = 0; i < segments.length - 1; i++) {
				let objectName: string;
				let rawBody: string;

				if (i === 0) {
					objectName = segments[i];
				} else {
					const parts = segments[i].split(';');
					objectName = parts.pop()!;
				}
				let bodySegment = segments[i + 1];

				if (i < segments.length - 2) {
					const parts = bodySegment.split(';');
					parts.pop();
					rawBody = parts.join(';');
				} else {
					// Last segment
					rawBody = bodySegment;
				}

				const fields: TField[] = rawBody
					.split(';')
					.filter(Boolean)
					.map((fieldStr) => {
						const [fieldName, fieldType] = fieldStr.split(':').map((s) => s.trim());
						return [fieldName, fieldType];
					});

				Model.models_[objectName] = fields;
			}
			Model.initialized_ = true;
		}
		static get initialized(): boolean {
			return Model.initialized_;
		}
		static get modelTypes(): string {
			let mt = '|';
			for (const key of Object.keys(Model.models_)) {
				mt += key + '|';
			}
			return mt;
		}
		static fieldsWithType(model: string, excludeName: string = ''): string {
			const fields = model in Model.models_ ? Model.models_[model] : [];
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
		}
		static fieldsList(model: string, excludeName: string = '', delimiter: string = ', '): string {
			const fields = Model.fieldNames(model, UI.namesOnly);
			let fl = '';
			for (const field of fields) {
				if (field !== excludeName) {
					fl += field + delimiter;
				}
			}
			return fl.slice(0, -delimiter.length);
		}
		static fieldNames<ModelName extends keyof typeof Model.models_>(model: ModelName, kind: UI) {
			const t = kind === UI.ui ? ': true' : '';
			const fn = Model.models_[model].map((field) => field[0]) as string[];
			return Model.sortArrByOrdered(fn, kind).map((fieldName) => fieldName + t);
		}
		static fieldTypes<ModelName extends keyof typeof Model.models_>(model: ModelName) {
			return Model.sortArrByOrdered(Model.models_[model].map((field) => field[1]) as string[]);
		}
		static model<ModelName extends keyof typeof Model.models_>(model: ModelName) {
			return Model.sortArrByOrdered(Model.models_[model] as TField[]);
		}
		static get mustLoginFirst(): string {
			// const allModelNames = Model.models_.map(model => )
			return `if ('${Model.modelTypes}'.includes(|\${event.url.pathname.slice(1)}|)) {
          throw redirect(303, '/login');
        }`;
		}
		private static ordered: string[] = [
			'id',
			'authorId',
			'userId',
			'employeeId',
			'customerId',
			'ownerId',
			'firstName',
			'lastName',
			'middleName',
		];
		static sortArrByOrdered(arg: string[] | TField[], kind: UI = UI.all) {
			const arrType = Array.isArray(arg[0]);
			let orderedPart: string[] | TField[] = [];
			let leftoverPart: string[] | TField[] = [];
			if (arrType) {
				if (kind === UI.ui || kind === UI.all) {
					orderedPart = Model.ordered.map((key) => (arg as TField[]).find((item) => item[0] === key)) as TField[];
				}
				if (kind === UI.nonUI || kind === UI.all) {
					leftoverPart = (arg as TField[]).filter((item) => {
						const key = item[0].trim();
						return !Model.ordered.includes(key);
					}) as TField[];
				}
				if (kind === UI.all) {
					(leftoverPart as TField[]).unshift(['nonUI', '']);
				}
			} else {
				if (kind === UI.ui || kind === UI.all || kind === UI.namesOnly) {
					orderedPart = Model.ordered.map((key) => (arg as string[]).find((item) => item === key)) as string[];
				}
				if (kind === UI.nonUI || kind === UI.all) {
					leftoverPart = (arg as string[]).filter((item) => {
						const key = item.split(':')[0].trim();
						return !Model.ordered.includes(key);
					}) as string[];
				}
				if (kind === UI.all) {
					(leftoverPart as string[]).unshift('nonUI');
				}
			}
			return [...orderedPart, ...leftoverPart].filter(Boolean);
		}
		static get hooks(): string {
			return `
	import { redirect } from '@sveltejs/kit';
  import type {Handle} from '@sveltejs/kit';
  import { db } from '$lib/server/db';

  export const handle: Handle = (async ({ event, resolve }) => {
    let session='empty session';
    try {
      // getting cookie from the browser
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
        // prohibit access to ADMIN/USER-only allowed pages
        // TODO create the list of must-login-first pages
        ${Model.mustLoginFirst}
        event.url.pathname = '/'
        return await resolve(event);
      }
    } catch (error) {
      throw redirect(303, '/login');
			event.url.pathname = '/'
      return await resolve(event);
    }

    try {
      // we can now authenticate user if logged in
      const user = await db.user.findUnique({
        where: {
          userAuthToken: session
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email:true,
          role: true
        }
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
      }else{
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
		static pageServerLoad(model: string) {
			//, excludeFields: string[] = []) {
			const lcModel = model.toLowerCase(); // lc lowercase
			const selectList = Model.fieldNames(model, UI.ui);
			return `
export const load: PageServerLoad = (async ({ locals, cookies }) => {
	const ${lcModel}s: ${model}Partial[] = await.db.${lcModel}.findMany({
		select: {
			${selectList}
		}
	}) as ${model}Partial[];
}) satisfies PageServerLoad`.replace(/,/g, ',\n\t\t');
		}
		static actions(model: string) {
			const lcModel = model.toLowerCase();
			return `

import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import type RequestEvent from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import bcrypt from 'bcrypt'
import * as utils from '$lib/utils';;
import { fail } from '@sveltejs/kit';

${Model.pageServerLoad('User')};

export const actions: Actions = {
	create: async ({ request }) => {
		const { ${Model.fieldsList(model, 'id')} } = Object.fromEntries(
			await request.formData()
		) as {
			${Model.fieldsWithType(model, 'id')}
		}
		if ( !(${Model.fieldsList(model, 'id', ' && ')}) ) {
			return fail(400, {
				data: {
					${Model.fieldsList(model, 'id')}
				},
				message: 'This ${lcModel} already exists'
			});
		}

		const ${lcModel}Exists = await db.${lcModel}.findFirst({
				where:{
					${Model.fieldsList(model, 'id')}
				}
		});
		if (${lcModel}Exists){
			return fail(400, {
				data: {
					${Model.fieldsList(model, 'id')}
				},
				message: 'Unacceptable data supplied'
		}else{
			dbObject = await db.${lcModel}.create({
				data: {
					${Model.fieldsList(model, 'id')}
				}
			})
		}
		
		return {
			success: true,
			data: { dbObject },
			message: '${lcModel} created successfully'
		}
	},
	update: async ({ request }) => {
		const input_data = Object.fromEntries(
			await request.formData()
		) as {
			${Model.fieldsWithType(model)}
		}
		
		const { ${Model.fieldsList(model)}} = inpit_data;
		if ( !(${Model.fieldsList(model, '', ' && ')}) ) {
			return fail(400, {
				data: {
					${Model.fieldsList(model)}
				},
				message: 'Insufficient data supplied'
			});
		}
		await utils.sleep(2000);	//TODO remove in production
		const data = Object.fromEntries(
			Object.entries(input_data).filter(([_, value]) => value).filter(Boolean)
		);
		try {
			await db.${lcModel}.update({
				where: {
					data.id
				},
				data:d,
			});
			return {
				${Model.fieldsList(model)},
				success: true,
				message: '${lcModel} updated successfully'
			}
		} catch( err ) {
			const msg = err instanceof Error ? msg.message : String(err);
			return fail(500, {message: msg});
		}
	},
	delete: async ({ request }) => {
		const input_data = Object.fromEntries(
			await request.formData()
		) as {
			${Model.fieldsWithType(model)}
		}
		
		if (!input_data.id){
			return fail(400, {
				message: '${lcModel}.id is necessary'
			})
		}
		await utils.sleep(2000);	// TODO remove for productioin
		try {
			await db.${lcModel}.delete({
				where:{ id }
			})
			return {
				id,
				success: "${lcModel} deleted successfully",
			};
		}catch(err){
			const msg = err instanceof Error ? msg.message : String(err);
			return fail(500, {message: msg});
		}
	}
} satisfies Actions;`;
		}
	}

	Model.initialize(lowercaseTypes);

	if (browser && Model.initialized) {
		setTimeout(() => {
			(document.getElementById('block-pre') as HTMLPreElement).innerText = Model.actions('User');
		}, 200);
	}

	// console.log('fieldNames\n', Model.fieldNames('User', UI.all));
	// console.log('fieldNames\n', Model.fieldNames('User', UI.ui));
	// console.log('fieldTypes', Model.fieldTypes('User'));
	// console.log(Model.model('User'));
	// console.log(selectDbFields('User'));
	// console.log(Model.getHooks());
	// console.log(Model.model('User'));

	// onMount(() => {
	// 	if (Model.initialized) {
	// 		console.log(JSON.stringify(Model.modelTypes, null, 2));
	// 	}
	// });
</script>

<pre id="block-pre"></pre>

<style lang="scss">
	pre {
		color: var(--pre-color);
		font-size: 13px;
		tab-size: 16px;
		width: 100vw;
	}
</style>
