const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function analyzeDocument(file) {
  const form1 = new FormData();
  form1.append('file', file);
  const form2 = new FormData();
  form2.append('file', file);

  const [sectionsRes, agentRes] = await Promise.all([
    fetch(`${BASE}/analyze`, { method: 'POST', body: form1 }),
    fetch(`${BASE}/agent/analyze`, { method: 'POST', body: form2 }),
  ]);

  if (!sectionsRes.ok) throw new Error(await sectionsRes.text());
  if (!agentRes.ok) throw new Error(await agentRes.text());

  const [sections, agent] = await Promise.all([sectionsRes.json(), agentRes.json()]);
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
