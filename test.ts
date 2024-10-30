export const getSelfPerson = async (slackId: string) => {
  const url = `https://api.airtable.com/v0/${process.env.BASE_ID}/people`;
  const filterByFormula = encodeURIComponent(`{slack_id} = '${slackId}'`);
  const response = await fetch(`${url}?filterByFormula=${filterByFormula}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.records[0];
};

const r = await getSelfPerson("U07TETATJE7");
console.log(r)
