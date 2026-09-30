<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { councilSeats, getUnit } from '$lib/demo/building';
	import { agm, bylawCase, lastCouncil, nextAgm, nextCouncil, quorum, voteGuide } from '$lib/demo/meetings';
</script>

<svelte:head>
	<title>Meetings — Evergreen House</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker="Council of five · AGM quorum is 14 of 40"
		title="Meetings and votes"
		lede="The next meeting is {nextCouncil.date}. The package has to be out on {nextCouncil.packageDue}. Last month’s fine is already on the books. The AGM that set this year’s fees was {agm.date}. The next AGM is {nextAgm.date}. The statute’s last day is {nextAgm.statutory}."
	/>

	<div class="grid gap-3 sm:grid-cols-3">
		<div class="rounded-2xl border border-border bg-white p-4">
			<p class="text-xs font-bold uppercase tracking-wide text-slate-400">AGM quorum</p>
			<p class="mt-1 text-2xl font-bold">{quorum.agmNeed} of {quorum.lots}</p>
			<p class="mt-1 text-sm text-slate-600">{quorum.agmRule}</p>
		</div>
		<div class="rounded-2xl border border-border bg-white p-4">
			<p class="text-xs font-bold uppercase tracking-wide text-slate-400">Council quorum</p>
			<p class="mt-1 text-2xl font-bold">{quorum.councilNeed} of 5</p>
			<p class="mt-1 text-sm text-slate-600">{quorum.councilRule}</p>
		</div>
		<div class="rounded-2xl border border-border bg-white p-4">
			<p class="text-xs font-bold uppercase tracking-wide text-slate-400">If people don’t show</p>
			<p class="mt-1 text-sm leading-relaxed text-slate-600">{quorum.adjourn}</p>
		</div>
	</div>

	<section class="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
		<div>
			<h2 class="font-bold text-slate-900">Council</h2>
			<ul class="mt-3 space-y-3">
				{#each councilSeats as seat}
					<li class="rounded-2xl border border-border bg-white p-4">
						<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{seat.role} · since {seat.since}</p>
						<p class="font-semibold text-slate-900">{getUnit(seat.unitId).owner}</p>
						<p class="text-sm text-slate-500">Lot {seat.unitId}</p>
						<p class="mt-1 text-sm text-slate-600">{seat.duty}</p>
					</li>
				{/each}
			</ul>
		</div>
		<div class="rounded-2xl border border-border bg-white p-5">
			<p class="text-xs font-bold uppercase tracking-wide text-brand-700">Next meeting</p>
			<h2 class="text-2xl font-bold text-slate-900">{nextCouncil.date}</h2>
			<p class="text-sm text-slate-500">{nextCouncil.time} · {nextCouncil.place}</p>
			<ol class="mt-4 space-y-4">
				{#each nextCouncil.agenda as item, index}
					<li>
						<p class="font-semibold text-slate-900">{index + 1}. {item.item}</p>
						<p class="text-sm leading-relaxed text-slate-600">{item.detail}</p>
					</li>
				{/each}
			</ol>
		</div>
	</section>

	<section class="mt-8 grid gap-6 lg:grid-cols-2">
		<article class="rounded-2xl border border-border bg-white p-5">
			<h2 class="font-bold text-slate-900">Minutes — {lastCouncil.date}</h2>
			<p class="text-sm text-slate-500">{lastCouncil.attendance}</p>
			<ul class="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
				{#each lastCouncil.minutes as line}
					<li>{line}</li>
				{/each}
			</ul>
		</article>
		<article class="rounded-2xl border border-border bg-white p-5">
			<h2 class="font-bold text-slate-900">AGM — {agm.date}</h2>
			<p class="text-sm text-slate-500">{agm.attendance}. {agm.quorum}.</p>
			<p class="mt-2 text-sm leading-relaxed text-slate-600">Next AGM {nextAgm.date}. {nextAgm.note}</p>
			<ul class="mt-3 space-y-3">
				{#each agm.resolutions as resolution}
					<li>
						<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{resolution.vote} · {resolution.result}</p>
						<p class="text-sm leading-relaxed text-slate-700">{resolution.text}</p>
					</li>
				{/each}
			</ul>
		</article>
	</section>

	<section class="mt-8 rounded-2xl border border-border bg-white p-5">
		<h2 class="font-bold text-slate-900">Bylaw file — lot {bylawCase.lot}</h2>
		<p class="mt-1 text-sm text-slate-600">{bylawCase.bylaw}. Fine {bylawCase.fine}. {bylawCase.ceiling}</p>
		<ol class="mt-4 space-y-3">
			{#each bylawCase.steps as step}
				<li class="grid gap-1 sm:grid-cols-[180px_1fr]">
					<p class="text-sm font-semibold text-slate-800">{step.date}</p>
					<p class="text-sm text-slate-600"><span class="font-semibold text-slate-800">{step.label}.</span> {step.detail}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section class="mt-8">
		<h2 class="font-bold text-slate-900">Which vote is which</h2>
		<div class="mt-3 grid gap-3 md:grid-cols-2">
			{#each voteGuide as vote}
				<div class="rounded-2xl border border-border bg-white p-4">
					<p class="font-semibold text-slate-900">{vote.kind}</p>
					<p class="text-sm text-slate-500">{vote.use}</p>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">{vote.count}</p>
				</div>
			{/each}
		</div>
	</section>
</div>
