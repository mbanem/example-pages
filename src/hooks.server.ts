import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const handle: Handle = (async ({ event, resolve }) => {
	let session = 'empty session';
	try {
		// getting cookie from the browser
		session = event.cookies.get('session');

		if (!session) {
			event.locals.user = {
				id: '',
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				roles: ['VISITOR'],
			};
			// prohibit access to ADMIN/USER-only allowed pages
			// TODO create the list of must-login-first pages
			if ('|fetch|news|store|comments|'.includes(`|${event.url.pathname.slice(1)}|`)) {
				throw redirect(303, '/login');
			}
			event.url.pathname = '/';
			return await resolve(event);
		}
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		console.log('hook getUser', msg);
	}

	try {
		// we can now authenticate user if logged in
		const user = await db.user.findUnique({
			where: {
				userAuthToken: session,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				role: true,
			},
		});

		if (user) {
			event.locals.user = {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				password: '',
				role: user.role,
			};
		} else {
			event.locals.user = {
				id: '',
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				role: 'VISITOR',
			};
		}
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		console.log('hook getUser', msg);
	}
	// console.log('hooks locals',event.locals);
	return await resolve(event);
}) satisfies Handle;
