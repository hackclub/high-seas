import { getSession, setSession } from "@/app/utils/auth";
import { redirect } from "next/navigation";
import {NextResponse} from "next/server";
import { getSelfPersonId, base} from "@/app/utils/airtable";
import {getPersonBySlackId} from "@/../lib/battles/airtable";

export async function POST(request, {params}) {
    const session = await getSession();
    const person = await getPersonBySlackId(session.payload.sub)
    if(!person) {
        return NextResponse.json(
            { error: "i don't even know who you are" },
            { status: 418 },
        );
    }

    const b = await base()
    const items = await b("shop_items")

    console.log("awawawawawa", `{identifier} = '${params.item}'`)
    const recs = await items.select({filterByFormula: `{identifier} = '${params.item}'`, maxRecords: 1}).firstPage();
    if(recs.length < 1){
        return NextResponse.json(
            { error: "what do you want?!" },
            { status: 418 },
        );
    }
    const item = recs[0]

    const people = await b("people")

    const otp = Math.random().toString(16).slice(2)
    await people.update(person.id, {shop_otp:otp ,shop_otp_expires_at: new Date(new Date().getTime() + 5*60*1000).toISOString()})
    console.log(item)
    return redirect(`${item.fields.fillout_base_url}${otp}`)
}
