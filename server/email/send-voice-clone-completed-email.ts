import { z } from "zod";

const completedEmailEnvSchema = z.object({
  VOICE_CLONE_COMPLETE_EMAIL_FROM: z.email(),
  VOICE_CLONE_COMPLETE_EMAIL_TO: z.email(),
});

export async function sendVoiceCloneCompletedEmail(
  env: CloudflareEnv,
  voiceCloneId: string,
  clonedAt: Date,
) {
  const parsedEnv = completedEmailEnvSchema.parse(env);

  await env.VOICE_CLONE_COMPLETE_EMAIL.send({
    from: parsedEnv.VOICE_CLONE_COMPLETE_EMAIL_FROM,
    to: parsedEnv.VOICE_CLONE_COMPLETE_EMAIL_TO,
    subject: `音声クローン完了: ${voiceCloneId}`,
    text: [
      "音声クローンの完了通知です。",
      "",
      `ID: ${voiceCloneId}`,
      `完了日時: ${clonedAt.toISOString()}`,
      `詳細: https://neglegere.com/voice-clone/${voiceCloneId}`,
      "",
      "本文は仮の内容です。",
    ].join("\n"),
  });
}
