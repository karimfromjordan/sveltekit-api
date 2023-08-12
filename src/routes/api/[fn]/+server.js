const functions = {};

const validation = {};

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, request, locals }) {
	let response;

	try {
		let params = {};
		let path_array = url.pathname.substring(5).split('.');
		let fn = path_array.reduce((prev, curr) => prev?.[curr], functions);

		if (!fn) throw error(404);

		switch (request.headers.get('content-type')?.split(';')[0]) {
			case undefined:
				break;

			case 'application/json':
				Object.assign(params, await request.json());
				break;

			case 'multipart/form-data':
				Object.assign(params, map_to_object(await request.formData()));
				break;

			default:
				throw error(400);
		}

		response = await fn(params, locals).catch((e) => {
			throw error(500);
		});
	} catch (error) {}

	return new Response(JSON.stringify(response.body), {
		status: response.status ?? 200,
		headers: response.headers
	});
}
