export const clauses = [
  {
    id: 1,
    title: 'Non-Disclosure Obligation',
    risk: 'High',
    text: 'The Receiving Party shall not disclose, publish, or disseminate Confidential Information to anyone other than its employees who have a need to know, and shall take reasonable measures to avoid disclosure, dissemination, or unauthorized use of Confidential Information, including, at a minimum, those measures it takes to protect its own confidential information of a similar nature.',
    explanation: 'This clause places a very broad and strict obligation on you to keep all information secret. The definition of "confidential" is wide and the penalties for breach are severe. You have limited ability to share information even internally.',
    suggestion: 'Narrow the definition of Confidential Information to exclude publicly available data. Add a carve-out for legally required disclosures and limit the obligation to 3–5 years.',
    entities: {
      parties: ['Receiving Party', 'Disclosing Party'],
      dates: ['Effective Date: January 1, 2024'],
      money: [],
      jurisdiction: ['Delaware, USA'],
    },
  },
  {
    id: 2,
    title: 'Term and Termination',
    risk: 'Medium',
    text: 'This Agreement shall commence on the Effective Date and continue for a period of five (5) years unless earlier terminated by either party upon thirty (30) days written notice. Upon termination, the Receiving Party shall promptly return or destroy all Confidential Information.',
    explanation: 'The agreement lasts 5 years with a 30-day exit window. You must return or destroy all confidential materials upon exit, which could be operationally burdensome.',
    suggestion: 'Reduce the term to 2–3 years. Clarify "destroy" to include digital deletion with written certification. Add a survival clause specifying which obligations persist post-termination.',
    entities: {
      parties: ['Receiving Party', 'Disclosing Party'],
      dates: ['Effective Date: January 1, 2024', 'Term: 5 years'],
      money: [],
      jurisdiction: ['Delaware, USA'],
    },
  },
  {
    id: 3,
    title: 'Intellectual Property Rights',
    risk: 'High',
    text: 'All inventions, discoveries, developments, improvements, and innovations that the Receiving Party may conceive or make during the term of this Agreement, whether or not during working hours, that relate to the Disclosing Party\'s business, shall be the sole and exclusive property of the Disclosing Party.',
    explanation: 'This is an extremely broad IP assignment clause. Any idea you have — even outside work hours — that relates to the company\'s business becomes their property. This could affect your personal projects.',
    suggestion: 'Limit IP assignment to work done during working hours using company resources. Explicitly exclude pre-existing IP and personal projects unrelated to core business activities.',
    entities: {
      parties: ['Receiving Party', 'Disclosing Party'],
      dates: [],
      money: [],
      jurisdiction: ['Delaware, USA'],
    },
  },
  {
    id: 4,
    title: 'Governing Law',
    risk: 'Low',
    text: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising under this Agreement shall be resolved exclusively in the courts of Delaware.',
    explanation: 'Standard governing law clause. Delaware is a common and well-established jurisdiction for business contracts. This is generally favorable and predictable.',
    suggestion: 'No major changes needed. If you are based in a different state, consider negotiating for your local jurisdiction to reduce litigation costs.',
    entities: {
      parties: ['Both Parties'],
      dates: [],
      money: [],
      jurisdiction: ['Delaware, USA'],
    },
  },
  {
    id: 5,
    title: 'Liquidated Damages',
    risk: 'High',
    text: 'In the event of a breach of this Agreement by the Receiving Party, the Receiving Party agrees to pay liquidated damages in the amount of $500,000 per incident of unauthorized disclosure, which the parties agree represents a reasonable estimate of the harm caused by such breach.',
    explanation: 'A $500,000 penalty per breach is extremely high and potentially disproportionate. This clause could expose you to massive financial liability for even minor or accidental disclosures.',
    suggestion: 'Negotiate to remove liquidated damages entirely or cap them at a reasonable amount (e.g., $10,000–$50,000). Add a materiality threshold so minor technical breaches are excluded.',
    entities: {
      parties: ['Receiving Party'],
      dates: [],
      money: ['$500,000 per incident'],
      jurisdiction: ['Delaware, USA'],
    },
  },
  {
    id: 6,
    title: 'Non-Compete Restriction',
    risk: 'Medium',
    text: 'During the term of this Agreement and for a period of two (2) years following its termination, the Receiving Party shall not engage in any business activity that directly competes with the Disclosing Party\'s current or planned business operations within North America.',
    explanation: 'A 2-year non-compete covering all of North America is broad. Depending on your state, this may be unenforceable, but it could still create legal risk and deter future employers.',
    suggestion: 'Limit the geographic scope to specific cities or states. Reduce the post-termination period to 6–12 months. Define "competing business" narrowly with specific product/service categories.',
    entities: {
      parties: ['Receiving Party'],
      dates: ['Post-termination: 2 years'],
      money: [],
      jurisdiction: ['North America'],
    },
  },
];

export const summary = {
  totalClauses: clauses.length,
  highRisk: clauses.filter(c => c.risk === 'High').length,
  mediumRisk: clauses.filter(c => c.risk === 'Medium').length,
  lowRisk: clauses.filter(c => c.risk === 'Low').length,
  insights: [
    'Extremely broad IP assignment — review before signing',
    'Liquidated damages of $500K per breach is unusually high',
    'Non-compete covers all of North America for 2 years',
    'Governing law clause is standard and acceptable',
  ],
};

export const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'Hello! I\'m your AI Legal Assistant. I\'ve analyzed your NDA document. Ask me anything about the clauses, risks, or suggested modifications.',
  },
];

export const mockResponses = {
  default: 'Based on my analysis of your NDA, I recommend reviewing the IP assignment and liquidated damages clauses carefully before signing. Would you like me to explain any specific clause in detail?',
  risk: 'The highest risk clauses in your document are: (1) Liquidated Damages — $500K per breach, (2) IP Rights — overly broad assignment, and (3) Non-Disclosure Obligation — very strict scope. I recommend negotiating all three.',
  ip: 'The Intellectual Property clause (Clause 3) is particularly concerning. It assigns ownership of any idea you conceive — even outside work hours — to the Disclosing Party if it relates to their business. This is unusually broad and could affect your personal projects.',
  nda: 'This NDA contains 6 clauses. 3 are high risk, 2 are medium risk, and 1 is low risk. The overall risk score is HIGH. I strongly recommend legal counsel review before signing.',
  damages: 'The Liquidated Damages clause sets a $500,000 penalty per unauthorized disclosure. This is extremely high. Industry standard is typically $10,000–$50,000. You should negotiate this down significantly.',
  terminate: 'The termination clause allows either party to exit with 30 days written notice. Upon termination, you must return or destroy all confidential materials. The 5-year term is longer than typical NDAs (usually 1–2 years).',
};
