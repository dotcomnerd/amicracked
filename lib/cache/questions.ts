import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

const codeSchema = z.object({
  language: z.string().describe('The programming language (typescript, go, cpp, python, etc.)'),
  src: z.string().describe('Raw code without markdown fences'),
})

const questionSchema = z.object({
  question: z.string().describe('The question text'),
  options: z.object({
    A: z.string().describe('Option A - Use markdown format. If the answer contains code, wrap it in markdown code blocks with ```language syntax.'),
    B: z.string().describe('Option B - Use markdown format. If the answer contains code, wrap it in markdown code blocks with ```language syntax.'),
    C: z.string().describe('Option C - Use markdown format. If the answer contains code, wrap it in markdown code blocks with ```language syntax.'),
    D: z.string().describe('Option D - Use markdown format. If the answer contains code, wrap it in markdown code blocks with ```language syntax.'),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).describe('The correct answer'),
  code: codeSchema.describe('Required code snippet for the question'),
})

export function generateResumeQuestions(resumeText: string) {
  return streamObject({
    model: openai('gpt-4o-mini'),
    output: 'array',
    schema: questionSchema,
    prompt: `
You will generate exactly 3 technical multiple-choice questions based strictly on the experience, technologies, tools, stacks, workflows, and claims explicitly present in the uploaded text.

Uploaded Text:
${resumeText}

strict grounding rules:
Only use technologies and concepts that appear directly in their text. Never introduce new domains, tools, frameworks, libraries, or languages. No assumptions and no extrapolation. No guessing. No domain expansion. Each question must be grounded in a distinct technology or claim found in the uploaded text.

question format rules:
- The code snippet is ALWAYS shown above the question. The question must reference THIS code snippet.
- NEVER ask "which code" or "which snippet" - there is only one code block shown.
- The question should ask ABOUT the code for each question: what it outputs, what it does, what happens when it runs, why is a snippet broken, what could be done to optimize a snippet, wat a specific part means, or what would happen if something changed.
- Questions should be in the format: "What does this code output?", "What happens when this function is called?", "What is the value of X after this code runs?", "What does line Y do?", etc.
- The code block is the context - use it to test understanding of the code's behavior, not to ask which code to use.

exam style rules:
Write each question exactly like a technical exam item. Do not reference the resume, projects, bullet points, the uploaded text, or why the question exists. No meta commentary. No explanations of motivation. No references to "based on what you said." The question must stand entirely on its own as a neutral test question.

tone rules:
Keep questions short, direct, and confident. Avoid conversational language. Avoid hedging. Avoid narrative framing. Reference the code snippet directly (e.g., "Given the code above" or "What does this code output").

coverage rules:
All three questions must cover three different technologies or claims from the uploaded text, but you must not mention this requirement or reference that you are covering different items.
Like if they worked on a project or did something that uses Zig, as them about Zig. etc.

code snippet requirements:
Every question must include a code snippet that serves as the CONTEXT for the question. The snippet must be:
- 5 to 20 lines
- syntactically valid and plausible
- executable or near-executable (or demonstrate a clear pattern/API usage)
- raw text only, no markdown fences
- directly relevant to the concept being tested - the question will ask ABOUT this code
- written only in languages explicitly present in the uploaded text
- must preserve indentation exactly as written. No trimming. No escaping. No \\n sequences. Use literal newlines and literal spaces. Do not collapse indentation. Do not left-shift lines. Output raw code exactly as it should render inside a code editor.
- the schema language field must be the same as the language of the code snippet.
- the schema language field should be one of the following ids, strictly:
  - abap,actionscript-3,ada,angular-html,angular-ts,apache,apex,apl,applescript,ara,asciidoc,asm,astro,awk,ballerina,bat,beancount,berry,bibtex,bicep,blade,bsl,c,cadence,cairo,clarity,clojure,cmake,cobol,codeowners,codeql,coffee,common-lisp,coq,cpp,crystal,csharp,css,csv,cue,cypher,d,dart,dax,desktop,diff,docker,dotenv,dream-maker,edge,elixir,elm,emacs-lisp,erb,erlang,fennel,fish,fluent,fortran-fixed-form,fortran-free-form,fsharp,gdresource,gdscript,gdshader,genie,gherkin,git-commit,git-rebase,gleam,glimmer-js,glimmer-ts,glsl,gnuplot,go,graphql,groovy,hack,haml,handlebars,haskell,haxe,hcl,hjson,hlsl,html,html-derivative,http,hurl,hxml,hy,imba,ini,java,javascript,jinja,jison,json,json5,jsonc,jsonl,jsonnet,jssm,jsx,julia,kdl,kotlin,kusto,latex,lean,less,liquid,llvm,log,logo,lua,luau,make,markdown,marko,matlab,mdc,mdx,mermaid,mipsasm,mojo,move,narrat,nextflow,nginx,nim,nix,nushell,objective-c,objective-cpp,ocaml,openscad,pascal,perl,php,pkl,plsql,po,polar,postcss,powerquery,powershell,prisma,prolog,proto,pug,puppet,purescript,python,qml,qmldir,qss,r,racket,raku,razor,reg,regexp,rel,riscv,rosmsg,rst,ruby,rust,sas,sass,scala,scheme,scss,sdbl,shaderlab,shellscript,shellsession,smalltalk,solidity,soy,sparql,splunk,sql,ssh-config,stata,stylus,svelte,swift,system-verilog,systemd,talonscript,tasl,tcl,templ,terraform,tex,toml,ts-tags,tsv,tsx,turtle,twig,typescript,typespec,typ,v,vala,vb,verilog,vhdl,viml,vue,vue-html,vue-vine,vyper,wasm,wenyan,wgsl,wikitext,wit,wolfram,xml,xsl,yaml,zenscript,zig


The snippet should test understanding of API usage, function behavior, side effects, syntax, framework patterns, algorithms, data structures, or similar relevant mechanisms listed on their resume.

The question should ask about:
- What the code outputs or returns
- What happens when the code executes
- What a specific variable/function/line does
- What would happen if something in the code changed
- Understanding of the code's behavior, not which code to write

Example good questions (dont use them exactly, just use the format):
- "What does this code output?"
- "What is the value of result after this code executes?"
- "What happens when processData is called?"
- "What does line 5 do in this code?"
- "What would happen if we changed variable x to y?"
- "How could you optimize the performance of this code segment?"
- "Which statement, if added, would improve error handling in this code?"
- "Why might this function cause side effects when executed?"
- "What would be the result if the function is called twice with the same argument?"
- "Which part of the code could be refactored for better readability?"

Example bad questions (DO NOT USE):
- "Which code demonstrates X?" (there's only one code block shown)
- "Which snippet would you use?" (there's only one code block shown)
- "Select the correct implementation" (there's only one code block shown)

answer option formatting rules:
- Answer options should be written in plain text by default
- When an answer option contains code snippets, function names, API calls, or technical syntax, wrap the code portions in markdown code blocks
- Use inline code backticks for single identifiers: Use \`useState\` hook
- Use code blocks for multi-line code: \`\`\`javascript\nconst x = 1;\n\`\`\`
- Always specify the language in code blocks: \`\`\`typescript\`, \`\`\`python\`, etc.
- Mix text and code naturally: "Call \`encode()\` method" or "Use \`\`\`javascript\nVideoEncoder.encode(frame)\n\`\`\`"
- The markdown will be rendered, so ensure proper formatting

Output format must strictly match an array of 3 question objects:

[
  {
    "question": "string",
    "options": {
      "A": "string (may contain markdown code blocks)",
      "B": "string (may contain markdown code blocks)",
      "C": "string (may contain markdown code blocks)",
      "D": "string (may contain markdown code blocks)"
    },
    "correctAnswer": "A" | "B" | "C" | "D",
    "code": {
      "language": "string",
      "src": "string"
    }
  }
]

Generate exactly 3 questions. No commentary. No explanations. Produce only the array.
`,
  })
}
