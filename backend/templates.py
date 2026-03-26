"""
templates.py — Gold standard NDA clause templates.
These are the "ideal" versions of each clause type.
The vector store compares uploaded clauses against these.
"""

GOLD_STANDARD_TEMPLATES = {
    "Confidential Information": """
Confidential Information means any information disclosed by the Disclosing Party 
to the Receiving Party that is designated as confidential or that reasonably should 
be understood to be confidential given the nature of the information and circumstances 
of disclosure. Confidential Information does not include information that: (a) is or 
becomes publicly known through no breach of this Agreement; (b) was rightfully known 
before receipt from Disclosing Party; (c) is rightfully received from a third party 
without restriction; or (d) is independently developed without use of Confidential Information.
""",

    "Obligations of Receiving Party": """
The Receiving Party shall: (a) hold the Confidential Information in strict confidence 
using at least the same degree of care it uses for its own confidential information, 
but no less than reasonable care; (b) not disclose Confidential Information to any 
third party without prior written consent; (c) limit access to Confidential Information 
to employees who have a need to know and are bound by confidentiality obligations at 
least as protective as this Agreement; (d) notify Disclosing Party promptly of any 
unauthorized disclosure.
""",

    "Term and Termination": """
This Agreement shall commence on the Effective Date and continue for a period of two (2) 
years unless earlier terminated. Either party may terminate this Agreement upon thirty (30) 
days written notice. The confidentiality obligations shall survive termination for a period 
of three (3) years. Upon termination, Receiving Party shall promptly return or destroy 
all Confidential Information.
""",

    "Carve-outs / Exclusions": """
The obligations of confidentiality shall not apply to information that: (a) was in the 
public domain at the time of disclosure; (b) entered the public domain after disclosure 
through no fault of Receiving Party; (c) was already known to Receiving Party prior to 
disclosure as evidenced by written records; (d) was disclosed to Receiving Party by a 
third party legally entitled to make such disclosure; (e) was independently developed 
by Receiving Party without reference to Confidential Information; (f) is required to be 
disclosed by law or court order, provided Receiving Party gives prompt written notice 
to Disclosing Party.
""",

    "Governing Law": """
This Agreement shall be governed by and construed in accordance with the laws of the 
State of Delaware, without regard to its conflict of laws provisions. Any disputes 
arising under this Agreement shall be resolved exclusively in the state or federal 
courts located in Delaware, and both parties consent to personal jurisdiction therein.
""",

    "Remedies": """
The Receiving Party acknowledges that breach of this Agreement would cause irreparable 
harm to the Disclosing Party for which monetary damages would be inadequate. The 
Disclosing Party shall be entitled to seek equitable relief, including injunction and 
specific performance, in addition to all other remedies available at law or in equity, 
without the requirement of posting bond.
""",

    "Return or Destruction": """
Upon written request by the Disclosing Party or upon termination of this Agreement, 
the Receiving Party shall promptly, and in any event within ten (10) business days, 
return or certifiably destroy all Confidential Information and all copies thereof, 
including any notes, summaries or analyses derived therefrom, and certify in writing 
that it has done so.
""",

    "Non-Solicitation": """
During the term of this Agreement and for a period of one (1) year thereafter, 
neither party shall directly solicit for employment any employee of the other party 
who was involved in the discussions or work contemplated by this Agreement, without 
prior written consent. General advertising not targeted at the other party's employees 
shall not constitute solicitation under this clause.
""",

    "Miscellaneous": """
This Agreement constitutes the entire agreement between the parties with respect to 
its subject matter and supersedes all prior agreements. This Agreement may not be 
amended except by a written instrument signed by both parties. If any provision is 
found invalid or unenforceable, the remaining provisions shall continue in full force. 
Failure to enforce any provision shall not constitute a waiver. This Agreement may be 
executed in counterparts.
"""
}

# Risk flags — deviations from these patterns are HIGH risk
HIGH_RISK_PATTERNS = {
    "perpetual_confidentiality": [
        "shall survive indefinitely",
        "no time limit",
        "in perpetuity",
        "forever",
        "shall never expire"
    ],
    "no_carveouts": [
        "no exceptions",
        "without exception",
        "regardless of how obtained"
    ],
    "unlimited_liability": [
        "unlimited liability",
        "any and all damages",
        "without limitation"
    ],
    "unilateral_amendment": [
        "may be amended by disclosing party",
        "reserves the right to modify",
        "at its sole discretion"
    ]
}
