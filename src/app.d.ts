// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
// import * as Types from '$lib/types/types';
declare global {
	export type Field = {
		name: string
		type: string
		isArray: boolean
		isOptional: boolean
		isDataEntry: boolean
		attrs?: string
		permissions?: string
	}
	// no name; it should be part of Models with their name as a key
	export type Model = {
		fields: Field[]
		attrs?: string[]
		permissions?: string
	}
	export type Models = Record<string, Model>
	export type RouteName = string
	export type ModelName = string
	export type SelectedModel = Record<
		ModelName,
		{
			routeName: string
			permissions?: string
		}
	>
	export type SelectedModels = Record<RouteName, SelectedModel>
	export type Components = string[]
	export type Payload = Record<string, SelectedModels | Model | string[] | string>; // { route: string | null } = { route: null };

	// props for creating +page.svelte/+page.server.ts route pager
	export type TCreatePageProps = {
		routeName: string;
		model: Model;
	};
	export type TEnum = Record<string, string>;
	export type TEnums = Record<string, TEnum>;
	export type Position = { x: number; y: number; color: string } | undefined;

	export const CStick = ['above', 'right', 'below', 'left'] as const;
	// export type TStick = typeof CStick[number];
	export type TStick = 'left' | 'right' | 'above' | 'below';
	export type TPos = { x: number; y: number };
	export type THovered = MouseEvent | HTMLElement | TPos;
	namespace App {
		// interface Error {}
		// interface Locals {
		// 	user: Types.UserPartial;
		// }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
