
import { AgentDef } from "../types";

export const AGENT_ROSTER: Record<string, AgentDef> = {
    SCOUT: {
        id: 'agent_scout',
        name: 'The Scout',
        role: 'SCOUT',
        description: 'Retrieves signals, ignores noise.',
        color: 'emerald',
        icon: '◉'
    },
    CRITIC: {
        id: 'agent_critic',
        name: 'The Critic',
        role: 'CRITIC',
        description: 'Judges cultural voltage and risk.',
        color: 'red',
        icon: '⚡'
    },
    EDITOR: {
        id: 'agent_editor',
        name: 'Editor In Chief',
        role: 'EDITOR',
        description: 'Final verdict and routing.',
        color: 'white',
        icon: '✦'
    },
    WRITER: {
        id: 'agent_writer',
        name: 'Lead Writer',
        role: 'WRITER',
        description: 'Drafts, rewrites, and polishes.',
        color: 'neutral',
        icon: '✎'
    },
    ARTIST: {
        id: 'agent_artist',
        name: 'Atelier',
        role: 'ARTIST',
        description: 'Generates visual metaphors.',
        color: 'purple',
        icon: '◈'
    },
    ENGINEER: {
        id: 'agent_engineer',
        name: 'Engineer',
        role: 'ENGINEER',
        description: 'Builds logic recipes.',
        color: 'blue',
        icon: '⚙'
    }
};
