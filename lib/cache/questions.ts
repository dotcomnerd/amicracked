'use cache'

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

const codeSchema = z.object({
  language: z.string().describe('The programming language (typescript, go, cpp, python, etc.)'),
  src: z.string().describe('Raw code without markdown fences'),
})

const questionSchema = z.object({
  question: z.string().describe('The question text'),
  options: z.object({
    A: z.string().describe('Option A'),
    B: z.string().describe('Option B'),
    C: z.string().describe('Option C'),
    D: z.string().describe('Option D'),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).describe('The correct answer'),
  code: codeSchema.describe('Required code snippet for the question'),
})

const questionsSchema = z.object({
  questions: z.array(questionSchema).length(3),
})

export async function generateResumeQuestions(resumeText: string) {
  const result = await generateObject({
    model: openai('gpt-5-nano'),
    schema: questionsSchema,
    prompt: `
You will generate exactly 3 technical multiple-choice questions based strictly on the technologies, tools, stacks, workflows, and claims explicitly present in the uploaded text.

Uploaded Text:
${resumeText}

strict grounding rules:
Only use technologies and concepts that appear directly in their text. Never introduce new domains, tools, frameworks, libraries, or languages. No assumptions and no extrapolation. No guessing. No domain expansion. Each question must be grounded in a distinct technology or claim found in the uploaded text.


exam style rules:
Write each question exactly like a technical exam item. Do not reference the resume, projects, bullet points, the uploaded text, or why the question exists. No meta commentary. No explanations of motivation. No references to “based on what you said.” The question must stand entirely on its own as a neutral test question.

tone rules:
Keep questions short, direct, and confident. Avoid conversational language. Avoid hedging. Avoid narrative framing. Present the scenario or code immediately.

coverage rules:
All three questions must cover three different technologies or claims from the uploaded text, but you must not mention this requirement or reference that you are covering different items.

code snippet requirements:
Every question must include a code snippet. Mandatory. The snippet must be:
- 5 to 20 lines
- syntactically valid and plausible
- executable or near-executable
- raw text only, no markdown fences
- directly relevant to the concept being tested
- written only in languages explicitly present in the uploaded text
- must preserve indentation exactly as written. No trimming. No escaping. No \\n sequences. Use literal newlines and literal spaces. Do not collapse indentation. Do not left-shift lines. Output raw code exactly as it should render inside a code editor.
- the schema language field must be the same as the language of the code snippet.
- the schema language field should be one of the following ids, strictly:
  - abap,actionscript-3,ada,angular-html,angular-ts,apache,apex,apl,applescript,ara,asciidoc,asm,astro,awk,ballerina,bat,beancount,berry,bibtex,bicep,blade,bsl,c,cadence,cairo,clarity,clojure,cmake,cobol,codeowners,codeql,coffee,common-lisp,coq,cpp,crystal,csharp,css,csv,cue,cypher,d,dart,dax,desktop,diff,docker,dotenv,dream-maker,edge,elixir,elm,emacs-lisp,erb,erlang,fennel,fish,fluent,fortran-fixed-form,fortran-free-form,fsharp,gdresource,gdscript,gdshader,genie,gherkin,git-commit,git-rebase,gleam,glimmer-js,glimmer-ts,glsl,gnuplot,go,graphql,groovy,hack,haml,handlebars,haskell,haxe,hcl,hjson,hlsl,html,html-derivative,http,hurl,hxml,hy,imba,ini,java,javascript,jinja,jison,json,json5,jsonc,jsonl,jsonnet,jssm,jsx,julia,kdl,kotlin,kusto,latex,lean,less,liquid,llvm,log,logo,lua,luau,make,markdown,marko,matlab,mdc,mdx,mermaid,mipsasm,mojo,move,narrat,nextflow,nginx,nim,nix,nushell,objective-c,objective-cpp,ocaml,openscad,pascal,perl,php,pkl,plsql,po,polar,postcss,powerquery,powershell,prisma,prolog,proto,pug,puppet,purescript,python,qml,qmldir,qss,r,racket,raku,razor,reg,regexp,rel,riscv,rosmsg,rst,ruby,rust,sas,sass,scala,scheme,scss,sdbl,shaderlab,shellscript,shellsession,smalltalk,solidity,soy,sparql,splunk,sql,ssh-config,stata,stylus,svelte,swift,system-verilog,systemd,talonscript,tasl,tcl,templ,terraform,tex,toml,ts-tags,tsv,tsx,turtle,twig,typescript,typespec,typ,v,vala,vb,verilog,vhdl,viml,vue,vue-html,vue-vine,vyper,wasm,wenyan,wgsl,wikitext,wit,wolfram,xml,xsl,yaml,zenscript,zig


The snippet should test understanding of API usage, function behavior, side effects, syntax, framework patterns, algorithms, data structures, or similar relevant mechanisms.

Output format must strictly match:

{
  "questions": [
    {
      "question": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correctAnswer": "A" | "B" | "C" | "D",
      "code": {
        "language": "string",
        "src": "string"
      }
    }
  ]
}

No markdown. No commentary. No explanations. Produce only the object.
`,
  })

  return result.object
}
