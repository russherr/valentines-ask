// ============================================================
// config.ts — Edit this file to personalize your Valentine's ask!
// ============================================================

export interface ChatMessage {
  side: "left" | "right";
  text: string;
}

export interface Config {
  sender: {
    name: string;
    avatar: string;
  };
  receiver: {
    name: string;
    age: number;
    avatar: string;
    subtitle: string;
    bio: string;
    tags: string[];
  };
  chat: {
    phase1: {
      headerName: string;
      messages: ChatMessage[];
    };
    blackoutText: string;
    phase2: {
      headerName: string;
      messages: ChatMessage[];
    };
  };
  match: {
    subtitle: string;
  };
  ask: {
    words: string[];
    highlightWordIndex: number;
  };
  plan: {
    date: string;
    lines: string[];
    signoff: string;
    hint: string;
  };
}

const config: Config = {
  // -- Who's sending this (you) --------------------------------
  sender: {
    name: "Nissa",
    avatar: "/sender.svg",
  },

  // -- Who you're asking (your crush / partner) ----------------
  receiver: {
    name: "Leian",
    age: 26,
    avatar: "/receiver.svg",
    subtitle: "Economics · SBU 2023",
    bio: "Creative, adventurous, and always down for a good time",
    tags: ["Sports", "Sleep", "Coffee"],
  },

  // -- Chat conversation ---------------------------------------
  chat: {
    // Phase 1: "Early days" — the first messages when you matched
    phase1: {
      headerName: "Leian",
      messages: [
        { side: "left", text: "Hey, we matched!" },
        { side: "right", text: "Hi! Are you the cute guy from Economics?" },
        { side: "left", text: "Yeah, how'd you know? LOL" },
        { side: "right", text: "Actually, I've had a little crush on you for awhile now" },
        { side: "right", text: "You're so cute when you smile!" },
        { side: "left", text: "Haha, thanks for the compliment!" },
        { side: "right", text: "Wanna come to Jom's house and grab some drinks with Oig and the others?" },
      ],
    },

    // Text shown during the blackout transition between phases
    blackoutText: "Best decision of my life.",

    // Phase 2: "Today" — present-day messages, more intimate
    phase2: {
      headerName: "Lablab",
      messages: [
        { side: "left", text: "lablabbbb" },
        { side: "right", text: "yes mahal ko" },
        { side: "left", text: "ano gawa uuuu hehehe" },
        { side: "right", text: "just cleaning the house, why po?" },
        { side: "left", text: "baby, can I ask you something?" },
      ],
    },
  },

  // -- Match screen --------------------------------------------
  match: {
    subtitle: "Like there was ever any doubt.",
  },

  // -- The big ask ---------------------------------------------
  ask: {
    words: ["Will", "you", "be", "my", "Valentine?"],
    highlightWordIndex: 4, // which word gets the special highlight (0-indexed)
  },

  // -- The plan screen (after they say yes) --------------------
  plan: {
    date: "February 14th",
    lines: [
      "You and me.",
      "This year, next year, and for the rest of our lives.",
    ],
    signoff: "— See you soon!",
    hint: "Happy Valentine's! I love you soooo muchyyy",
  },
};

export default config;
