import { buildFeed } from '$lib/feed';

export const prerender = true;

export function GET() {
	return new Response(buildFeed(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=300, must-revalidate'
		}
	});
}
