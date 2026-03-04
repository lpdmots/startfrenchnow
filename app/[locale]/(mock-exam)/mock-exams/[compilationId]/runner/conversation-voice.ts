export type ActivityAIVoiceGender = "male" | "female";

const DEFAULT_MALE_VOICE = "ash";
const DEFAULT_FEMALE_VOICE = "marin";

const normalizeVoice = (value?: string) => value?.trim() || "";

export const resolveConversationVoice = (gender?: string) => {
    const safeGender: ActivityAIVoiceGender = gender === "female" ? "female" : "male";

    if (safeGender === "female") {
        return normalizeVoice(process.env.OPENAI_REALTIME_VOICE_PHONE_A2_FEMALE) || DEFAULT_FEMALE_VOICE;
    }

    return normalizeVoice(process.env.OPENAI_REALTIME_VOICE_PHONE_A2_MALE) || normalizeVoice(process.env.OPENAI_REALTIME_VOICE_PHONE_A2) || DEFAULT_MALE_VOICE;
};
