type VoiceCloneCompleteStateProps = {
  id: string;
};

export function VoiceCloneCompleteState({ id }: VoiceCloneCompleteStateProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-3xl font-semibold text-slate-950">
          ボイスクローン完了です
        </p>
        <p className="text-base text-slate-600">
          生成された音声ファイルをダウンロードできます。
        </p>
      </div>
      <a
        href={`/api/voice_clones/${id}/file`}
        download
        className="inline-flex rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-[0_20px_60px_rgba(16,185,129,0.28)] transition hover:bg-emerald-600"
      >
        クローン音声をダウンロード
      </a>
    </div>
  );
}
