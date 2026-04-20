export async function convertBlobToWav(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();

  try {
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bytesPerSample = 2;
    const bitsPerSample = bytesPerSample * 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const dataLength = audioBuffer.length * blockAlign;
    const totalLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    const channelData = Array.from({ length: numberOfChannels }, (_, index) =>
      audioBuffer.getChannelData(index),
    );

    let offset = 44;

    for (
      let sampleIndex = 0;
      sampleIndex < audioBuffer.length;
      sampleIndex += 1
    ) {
      for (
        let channelIndex = 0;
        channelIndex < numberOfChannels;
        channelIndex += 1
      ) {
        const sample = Math.max(
          -1,
          Math.min(1, channelData[channelIndex][sampleIndex] ?? 0),
        );
        const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;

        view.setInt16(offset, int16Sample, true);
        offset += bytesPerSample;
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  } finally {
    await audioContext.close();
  }
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}
