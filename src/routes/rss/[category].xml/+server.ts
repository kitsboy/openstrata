import { buildFeed, feedCategories, slugToCategory } from '$lib/feed';

export const prerender = true;

export function entries() {
	return feedCategories().map((category) => ({
		category: category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
	}));
}

export function GET({ params }: { params: { category: string } }) {
	const category = slugToCategory(params.category);
	if (!category) {
		return new Response('Unknown feed category', { status: 404 });
	}
	return new Response(buildFeed(category), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=300, must-revalidate'
		}
	});
}
