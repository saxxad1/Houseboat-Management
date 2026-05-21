type NetlifyFormPayload = Record<string, string | number | boolean | null | undefined>;

const encodeFormPayload = (payload: NetlifyFormPayload) => {
  const body = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      body.append(key, String(value));
    }
  });

  return body.toString();
};

export async function submitNetlifyForm(formName: string, payload: NetlifyFormPayload) {
  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeFormPayload({
      'form-name': formName,
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Netlify form submission failed with ${response.status}`);
  }
}
