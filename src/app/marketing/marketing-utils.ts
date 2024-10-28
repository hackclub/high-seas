"use server";
import { headers } from "next/headers";
import { type NextRequest } from "next/server";
import Airtable from "airtable";
import { createWaka } from "../utils/waka";
import { getSession } from "../utils/auth";

const highSeasPeopleTable = () => {
  const highSeasBaseId = process.env.BASE_ID;
  if (!highSeasBaseId) throw new Error("No Base ID env var set");
  return Airtable.base(highSeasBaseId)("tblfTzYVqvDJlIYUB");
};

export async function handleEmailSubmission(email: string): Promise<{
  apiKey: string;
  created: string;
  personRecordId: string;
  username: string;
} | null> {
  if (!email) throw new Error("No email supplied to handleEmailSubmission");

  // Look up email
  const records = await highSeasPeopleTable()
    .select({
      filterByFormula: `{email} = '${email}'`,
      maxRecords: 1,
    })
    .all();

  if (records.length > 0) return null;
  console.log("handleEmailSubmission Step 1:", records[0]);

  const ip = headers().get("x-forwarded-for");

  // Create row in Slack Join Requests base (high seas table)
  await new Promise((resolve, reject) => {
    Airtable.base("appaqcJtn33vb59Au")("tblQORJfOQcm4CoWn").create(
      [
        {
          fields: {
            Email: email,
            "Form Submission IP": ip,
          },
        },
      ],
      (err: Error, records: any) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("handleEmailSubmission Step 2:", records);
          resolve(null);
        }
      },
    );
  });

  // Create person record (email & IP) in High Seas base
  const personRecordId: any = await new Promise((resolve, reject) => {
    highSeasPeopleTable().create(
      [
        {
          fields: {
            email,
            ip_address: ip,
          },
        },
      ],
      (err: Error, records: any) => {
        if (err) {
          console.error(err);
          reject(err);
        } else if (!records || records.length < 1) {
          const error = new Error("No person record was created");
          console.error(error);
          reject(error);
        } else {
          const id = records[0].id;
          if (!id) {
            const error = new Error("Person record ID is missing");
            console.error(error);
            reject(error);
          } else {
            resolve(id);
          }
        }
      },
    );
  });
  console.log("handleEmailSubmission Step 3:", personRecordId);

  // Create HackaTime user
  const session = await getSession();
  let signup;
  try {
    signup = await createWaka(
      email,
      session?.name ?? null,
      session?.slackId ?? null,
    );
  } catch (e) {
    const error = new Error("Failed to create HackaTime user:", e);
    console.error(error);
    throw error;
  }
  console.log("handleEmailSubmission Step 4:", signup);

  const apiKey = signup.api_key;
  const created = signup.created;
  const username = signup.username;

  return {
    apiKey,
    created,
    personRecordId,
    username,
  };
}

export async function markArrpheusReadyToInvite(id: string): Promise<void> {
  console.log("Marking arrpheus ready to invite for", id);

  return new Promise((resolve, reject) => {
    highSeasPeopleTable().update(
      [
        {
          id,
          fields: {
            arrpheus_ready_to_invite: true,
          },
        },
      ],
      (err: Error, records: any) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });
}
