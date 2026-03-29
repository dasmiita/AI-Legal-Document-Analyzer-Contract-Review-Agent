const BASE = 'http://localhost:8000';

export async function analyzeDocument(file) {
  const form1 = new FormData();
  form1.append('file', file);
  const form2 = new FormData();
  form2.append('file', file);

  const [agentRes, sectionsRes] = await Promise.all([
    fetch(`${BASE}/agent/analyze`, { method: 'POST', body: form1 }),
    fetch(`${BASE}/analyze`, { method: 'POST', body: form2 }),
  ]);

  if (!agentRes.ok) throw new Error(await agentRes.text());
  if (!sectionsRes.ok) throw new Error(await sectionsRes.text());

  const [agent, sections] = await Promise.all([agentRes.json(), sectionsRes.json()]);
  return { status: 'success', analysis: agent.analysis, filename: sections.filename, sections: sections.sections };
}

export async function askQuestion(question) {
  const res = await fetch(`${BASE}/agent/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
