import { lowercaseTypes } from './data';
type Model = {
	fields: [name: { type: string; attrs?: string }];
	attrs?: string[]; // e.g. ["@@map(\"users\")", "@@index([email])"]
};
interface Models {
	[name: string]: Model;
}
// TypeScript does not like enums
const UI = {
	ui: 'ui',
	namesOnly: 'namesOnly',
	nonUI: 'nonUI',
	all: 'all',
} as const;

type UIType = (typeof UI)[keyof typeof UI];

function isUI(value: keyof typeof UI): value is UIType {
	return Object.values(UI).includes(value);
}
/* usaage
  const models: Models = {}
  const fn = 'id', type = 'number', attrs = 'SERIAL PRIMERYKEY'
  models['Category'] = {
    fields: [{ name: fn, type, attrs }],
    attrs: [
      '@@map("category")'
    ]
  }
  models.Category.fields.push({ name: 'firstName', type: 'string' })
  models.Category.fields.push({ name: 'createdAt', type: 'Date', attrs: '@default(now())' })

  const modelProfile = 'Profile'
  const profileFields = [
    { name: 'id', type: 'string', attrs: '@id @default(uuid()' },
    { name: 'ownerId', type: 'string' },
    { name: 'bio', type: 'string' },
    { name: 'createdAt', type: 'Date', attrs: '@default(now()) @map("created_at")' }
  ]

  models[modelProfile] = {
    fields: profileFields,
    attrs: [
      '@@map("profile")'
    ]
  }
*/
let ordered = [
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

export function createModel(lowercaseTypes: string) {
	// --- Private state (replaces static class fields) ---
	// let initialized_ = false
	// const models_: Models = {}

	function initialize(lowercaseTypes: string): void {
		const cleanedString = lowercaseTypes
			.replace(/export type\s*/g, '')
			.replace(/[\n\r\s]+/g, '')
			.replace(/[{}]/g, '');

		const segments = cleanedString.split('=');
		// for (const segment of segments) {
		//   console.log('segment\n', segment)
		// }
		for (let i = 0; i < segments.length - 1; i++) {
			let objectName: string;
			let rawBody: string;

			if (i === 0) {
				objectName = segments[i].trim(); // starts with model name
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

			//   const fields: FTypeAttrs[] = rawBody
			//     .split(';')
			//     .filter(Boolean)
			//     .map((fieldStr) => {
			//       const [fieldName, fieldType] = fieldStr.split(':').map(s => s.trim())
			//       if (uiType.includes(fieldType)) {
			//         uiSet.add(fieldName)
			//       } else {
			//         nonUiSet.add(fieldName)
			//       }
			//       fullSet.add(fieldName)
			//       return [fieldName, fieldType]
			//     })

			//   models_[objectName] = fields
		}
		// uiFieldNames = sortArrByOrdered(Array.from(uiSet) as string[], UI.ui) as string[]
		// nonUIFieldNames = sortArrByOrdered(Array.from(nonUiSet) as string[], UI.nonUI) as string[]
		// allFieldNames = sortArrByOrdered(Array.from(fullSet) as string[]) as string[]

		// initialized_ = true
	}

	function sortArrByOrdered(arr: string[]) {
		const orderedPart = ordered.map((key) => arr.find((item: string) => item.startsWith(key + ':'))).filter(Boolean);
		const leftoverPart = arr.filter((item) => {
			const key = item.split(':')[0].trim();
			return !ordered.includes(key);
		});
		return [...orderedPart, ...leftoverPart];
	}
	initialize(lowercaseTypes);

	// models are ready get read of ordered
	ordered = [];
}
