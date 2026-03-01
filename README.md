## Inspiration
We wanted to build something that we believed solves a real problem and could be useful to anyone. Slightly inspired by the South Park episode “humancentipad” where a character blindly accepts the terms and conditions and faces serious consequences, we created an app that helps users better understand what they’re agreeing to.
## What it does
PolicyLens allows users to upload a text file or paste a website’s Terms and Conditions directly into the app. Users can select broad categories to scan, such as data sharing/tracking, arbitration clauses , and Liability, and specific issues they may care about such as auto-renewals and copyright policies. The app also includes a context field where users can describe who they are (for example, a student or small business owner), enabling a more applicable and personalized summary based on their situation.

The application then scans the document using keyword detection, flags relevant sections, and displays them in clickable snippets that allow users to jump directly to the corresponding part of the policy. Each flagged section is then analyzed using Google’s Gemini, which generates a simplified structured summary in plain language. 

## How we built it
We built PolicyLens using React and TypeScript, adding Tailwind CSS near the end to refine the UI. When a document is submitted, we first normalize and clean the text, then split it into 500-character chunks. For each category we support, we created a list of associated keywords to perform rule-based clause detection. The system scans each chunk against these keyword sets and stores any flagged sections.
The flagged chunks are then sent to Google’s Gemini API along with a structured prompt. Gemini generates a categorized summary and assigns each bullet point a predefined tag. If a tag matches a topic the user marked as important, that bullet is visually highlighted in the interface, allowing users to immediately see the issues that matter most to them.
## Challenges we ran into
We did not originally intend to implement AI integration so we had to restructure part of our architecture to include a backend to secure use the Gemini API key

Styling with CSS ended up being much harder than we expected. It started out simple, but as the project grew, it slowly turned into a mess where even small adjustments became a huge hassle. We eventually decided to pivot to Tailwind, even though neither of us had much experience 

Handling edge cases was an ongoing challenge. Inconsistent policy formatting, truncated AI responses and inconsistent resetting with the clear button just to name a few, it felt like every time we fixed one two more sprung up
## Accomplishments that we're proud of
We’re really proud of how the final UI turned out after everything we went through. We even added a bunch of smaller features we didn’t think we’d have time for. Many of them being far more challenging than expected, such as allowing users to click a flagged clause and instantly jump to the exact location in the policy. Seeing those small interactive details come together made the final product feel much more complete and polished which we are proud of.  
## What we learned
Throughout this project, we learned how to set up and structure a backend using Node.js, including securely integrating and communicating with an LLM through an API, time management, handling merge conflicts, and final tailwind css
## What's next for PolicyLens
