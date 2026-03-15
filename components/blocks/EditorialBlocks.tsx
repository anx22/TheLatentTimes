import React from 'react';
import { MagazineItem } from '../../types';

// 1. Cover Story Block (Left aligned, red italic accent)
export const CoverStoryBlock: React.FC<{ data?: MagazineItem }> = ({ data }) => (
  <div className="flex flex-col h-full p-6 border-t border-black bg-[#faf9f6]">
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[10px] font-mono uppercase tracking-widest border border-black px-2 py-0.5 rounded-full">The Cover Story</span>
    </div>
    <h1 className="font-serif text-6xl leading-[0.9] tracking-tight mb-6">
      {data ? data.title : <>The <br /><span className="text-[#e60042] italic font-light">Synthetic</span> <br />Sublime</>}
    </h1>
    <p className="font-mono text-xs text-zinc-500 leading-relaxed mb-8 max-w-[80%]">
      {data ? data.dek : 'When the model begins to dream, does it dream of us? An investigation into the latent space of identity, desire, and digital couture.'}
    </p>
  </div>
);

// 2. Glamour in the Machine Block
export const GlamourBlock: React.FC<{ data?: MagazineItem }> = ({ data }) => (
  <div className="flex flex-col h-full p-6 border-t border-l border-black bg-[#faf9f6]">
    <div className="text-[10px] font-mono uppercase tracking-widest text-[#e60042] mb-4">Cover Story</div>
    <h2 className="font-serif text-5xl leading-[0.9] tracking-tight mb-4 uppercase">
      {data ? data.title : <>Glamour <br />In The <br />Machine.</>}
    </h2>
    <p className="font-serif text-sm italic text-zinc-600 mb-4">
      {data ? data.dek : 'The new aesthetic is generated, not found. A deep dive into the algorithmic beauty standard.'}
    </p>
    <div className="text-[10px] font-mono uppercase tracking-widest mb-8">By The Algorithm</div>
    <button className="mt-auto border border-black py-2 px-4 text-[10px] font-mono uppercase tracking-widest hover:bg-black hover:text-white transition-colors w-fit">
      Read The Cover Story
    </button>
  </div>
);

// 3. Image Block
export const ImageBlock: React.FC<{ imageUrl: string, caption?: string }> = ({ imageUrl, caption }) => (
  <div className="w-full h-full relative bg-[#e5e5e5]">
    <img src={imageUrl} alt="Editorial" className="w-full h-full object-cover grayscale contrast-125" />
    {caption && (
      <div className="absolute bottom-4 left-4 bg-black text-white p-4 max-w-[80%]">
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2 text-zinc-400">Inside</div>
        <div className="font-serif text-sm">{caption}</div>
      </div>
    )}
  </div>
);

// 4. Quote Block
export const QuoteBlock: React.FC<{ quote: string, author: string }> = ({ quote, author }) => (
  <div className="flex flex-col justify-center h-full p-8 border-t border-black bg-white">
    <h3 className="font-serif text-3xl italic leading-tight mb-4">
      "{quote}"
    </h3>
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
      — {author}
    </div>
  </div>
);

// 5. Section Header Block
export const SectionHeaderBlock: React.FC<{ text: React.ReactNode }> = ({ text }) => (
  <div className="flex items-center justify-center h-full p-12 border-t border-b border-black bg-[#faf9f6] text-center">
    <h2 className="font-serif text-4xl leading-tight max-w-4xl">
      {text}
    </h2>
  </div>
);

// 6. The New Canon Block
export const NewCanonBlock: React.FC = () => (
  <div className="flex flex-col h-full p-6 border-t border-l border-black bg-[#faf9f6]">
    <div className="text-[10px] font-mono uppercase tracking-widest text-[#e60042] mb-4">The New Canon</div>
    <h3 className="font-serif text-2xl leading-tight mb-4">The Death of the Prompt</h3>
    <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider leading-relaxed">
      Why agentic drift is the only metric that matters now.
    </p>
  </div>
);

// 7. Identity Systems Block
export const IdentitySystemsBlock: React.FC = () => (
  <div className="flex flex-col h-full p-8 border-t border-black bg-[#faf9f6]">
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[10px] font-mono uppercase tracking-widest border border-black px-2 py-0.5 rounded-full">Identity Systems</span>
    </div>
    <h2 className="font-serif text-5xl leading-[0.9] tracking-tight mb-6">
      Wear Your <br />
      <span className="text-[#e60042] italic font-light">Ghost.</span>
    </h2>
    <p className="font-sans text-sm text-zinc-800 uppercase tracking-wide leading-relaxed mb-8">
      In the age of agentic engineering, your avatar is no longer a static image. It is a self-healing workflow, a persona wrapper that navigates the social web while you sleep. We test the latest "identity rigs" from the underground labs of Kyoto.
    </p>
    <div className="mt-auto text-[10px] font-mono uppercase tracking-widest border-b border-black w-fit pb-1">
      Read The Report
    </div>
  </div>
);

// 8. The New Synthetic Era Block
export const SyntheticEraBlock: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 border-t border-l border-black bg-white text-center">
    <div className="font-sans font-bold text-2xl tracking-widest uppercase mb-2">The New</div>
    <div className="font-sans font-black text-6xl tracking-tighter uppercase italic">
      Synthetic <span className="text-black not-italic">Era</span>
    </div>
  </div>
);

// 9. The House View Block (Dark)
export const HouseViewBlock: React.FC = () => (
  <div className="flex flex-col h-full p-10 bg-[#111111] text-white">
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-8">The House View</div>
    <div className="text-[#e60042] text-6xl font-serif leading-none mb-4">"</div>
    <h3 className="font-serif text-3xl leading-snug mb-12 max-w-md">
      We stopped asking the machine to copy reality. We started asking it to improve it.
    </h3>
    <div className="mt-auto flex justify-between items-end text-[10px] font-mono uppercase tracking-widest text-zinc-500">
      <span>From "The House View"</span>
      <span>P. 34</span>
    </div>
  </div>
);

// 10. The Curator's Dilemma Block (Dark)
export const CuratorsDilemmaBlock: React.FC = () => (
  <div className="flex flex-col h-full p-10 bg-[#111111] text-white border-l border-zinc-800">
    <div className="text-[10px] font-mono uppercase tracking-widest text-[#e60042] mb-6">Feature</div>
    <h2 className="font-serif text-6xl leading-none tracking-tight mb-8">
      The Curator's <br /> Dilemma
    </h2>
    <p className="font-sans text-sm text-zinc-500 uppercase tracking-widest mb-12 max-w-xl leading-relaxed">
      When every frame is possible, the only scarce material is judgement. Inside the new economy of taste.
    </p>
    <div className="grid grid-cols-2 gap-12">
      <p className="font-serif text-sm text-zinc-300 leading-relaxed">
        <span className="float-left text-5xl font-serif text-[#e60042] leading-[0.8] mr-3 mt-1">I</span>
        t begins with a choice. Not of pixels, but of weights. The modern creative director does not hold a camera; they hold a seed. In the ateliers of Milan, screens have replaced sketchpads.
      </p>
      <p className="font-serif text-sm text-zinc-300 leading-relaxed">
        This shift is not merely technical—it is philosophical. If the machine can generate infinite variations of beauty, the value of the image collapses. The only thing that remains scarce is taste. Authority returns to the editor.
      </p>
    </div>
    <div className="mt-auto flex justify-between items-end pt-12">
      <div className="text-[10px] font-mono uppercase tracking-widest font-bold border-b border-white pb-1">Continue Reading</div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Read Time: 9 Min • The New Canon</div>
    </div>
  </div>
);

// 11. Small Article Block
export const SmallArticleBlock: React.FC<{ category: string, title: string, deck: string, imageUrl: string }> = ({ category, title, deck, imageUrl }) => (
  <div className="flex flex-col h-full border-t border-black bg-white">
    <div className="h-48 w-full border-b border-black">
      <img src={imageUrl} alt={title} className="w-full h-full object-cover grayscale" />
    </div>
    <div className="p-4 flex flex-col flex-1">
      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 mb-2">{category}</div>
      <h4 className="font-serif text-lg leading-tight mb-2">{title}</h4>
      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider leading-relaxed mt-auto">
        {deck}
      </p>
    </div>
  </div>
);

// 12. Large Quote Block
export const LargeQuoteBlock: React.FC = () => (
  <div className="flex items-center justify-center h-full p-12 border-t border-b border-black bg-white">
    <div className="flex items-center gap-8">
      <div className="w-32 h-32 rounded-full overflow-hidden border border-black shrink-0">
        <img src="https://picsum.photos/seed/brain/200/200" alt="Brain" className="w-full h-full object-cover grayscale contrast-150" />
      </div>
      <div className="flex flex-col">
        <h2 className="font-serif text-5xl italic leading-tight mb-4">
          "Prompting is the art of <br /> curating possibility."
        </h2>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold text-center">
          — The Editors
        </div>
      </div>
    </div>
  </div>
);

// 13. Massive Headline Block
export const MassiveHeadlineBlock: React.FC = () => (
  <div className="flex h-full border-b border-black bg-[#faf9f6]">
    <div className="flex-1 p-12 border-r border-black flex items-center justify-center">
      <h1 className="font-serif text-8xl leading-[0.85] tracking-tighter">
        The Engine <br /> of Dreams.
      </h1>
    </div>
    <div className="flex-1 p-12 flex flex-col items-center justify-center relative">
      <h2 className="font-serif text-6xl italic leading-none tracking-tight mb-8">
        Create <span className="not-italic">Everything.</span>
      </h2>
      <div className="flex gap-6 text-[10px] font-mono uppercase tracking-widest font-bold">
        <span className="text-[#e60042]">Subscribe</span>
        <span>Twitter</span>
        <span>Instagram</span>
      </div>
    </div>
  </div>
);

// 14. The Hook Factory Block
export const HookFactoryBlock: React.FC = () => (
  <div className="flex flex-col h-full p-8 border-t border-black bg-white">
    <div className="text-[10px] font-mono uppercase tracking-widest text-[#e60042] mb-2">Dispatch • Social Mechanics</div>
    <h2 className="font-serif text-4xl leading-none tracking-tight mb-8 uppercase">
      The Hook Factory
    </h2>
    <p className="font-sans text-sm font-bold uppercase tracking-wide mb-4">
      We live in the era of the nano banana.
    </p>
    <p className="font-serif text-sm text-zinc-700 leading-relaxed mb-4">
      It's small, it's yellow, and it stops the scroll. The modern hook factory is not a writer's room—it's a parameter sweep. Thousands of micro-narratives tested against the friction of the thumb. The winners are not the smartest; they are the stickiest.
    </p>
    <p className="font-serif text-sm text-zinc-700 leading-relaxed">
      "We don't write jokes anymore," says one anonymous prompt engineer from a basement in Berlin. "We architect dopamine spikes." This is the industrialization of wit.
    </p>
  </div>
);

// 15. The Latent Space Block
export const LatentSpaceBlock: React.FC = () => (
  <div className="flex flex-col h-full p-8 border-t border-l border-black bg-white">
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">The Issue</div>
    <h2 className="font-serif text-6xl leading-[0.85] tracking-tight mb-6">
      The <br />
      <span className="italic">Latent</span> <br />
      Space.
    </h2>
    <p className="font-serif text-sm text-zinc-700 leading-relaxed mb-8 max-w-xs">
      When artificial intelligence begins to hallucinate, it does not dream of sheep. It dreams of us. An editorial investigation into the new digital subconscious.
    </p>
    <div className="mt-auto text-[10px] font-mono uppercase tracking-widest text-zinc-500">
      [ Read The Cover Story ]
    </div>
  </div>
);

// 16. The Synthetic Hallucination Block
export const SyntheticHallucinationBlock: React.FC = () => (
  <div className="flex flex-col h-full p-8 border-t border-black bg-[#faf9f6]">
    <h2 className="font-serif text-5xl leading-[0.9] tracking-tight mb-4">
      The <br />
      <span className="text-[#e60042] italic font-light">Synthetic</span> <br />
      Hallucination
    </h2>
    <div className="mt-8 w-48 h-48 mx-auto border border-black p-2">
      <img src="https://picsum.photos/seed/ring/200/200" alt="Ring" className="w-full h-full object-cover grayscale" />
    </div>
  </div>
);

// 17. Index List Block
export const IndexListBlock: React.FC = () => (
  <div className="flex flex-col h-full border-t border-l border-black bg-white">
    {[
      { num: '01', title: 'NANO BANANA: THE TINY GIANT MODEL' },
      { num: '02', title: 'AGENTIC ENGINEERING PATTERNS' },
      { num: '03', title: 'SOCIAL HOOK FACTORIES' },
      { num: '04', title: 'IDENTITY SYSTEMS & AVATARS' },
      { num: '05', title: 'SELF-HEALING WORKFLOWS' },
      { num: '06', title: 'THE KLING 3 EFFECT' },
    ].map((item, i) => (
      <div key={i} className="flex flex-col p-4 border-b border-black last:border-b-0">
        <div className="text-[9px] font-mono text-zinc-400 mb-1">{item.num}</div>
        <div className="font-sans text-xs font-bold uppercase tracking-widest">{item.title}</div>
      </div>
    ))}
  </div>
);
