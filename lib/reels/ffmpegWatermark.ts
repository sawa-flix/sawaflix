export async function prepareWatermarkedVideoSource(videoUrl: string): Promise<string> {
  if (typeof window === 'undefined' || !videoUrl) return videoUrl;

  try {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    const sourceResponse = await fetch(videoUrl);
    if (!sourceResponse.ok) return videoUrl;

    const sourceBlob = await sourceResponse.blob();
    const logoResponse = await fetch('/logos_and_pwas/loaderLogo.png');
    if (!logoResponse.ok) return videoUrl;

    const logoBlob = await logoResponse.blob();

    await ffmpeg.writeFile('input.mp4', await fetchFile(sourceBlob));
    await ffmpeg.writeFile('sawaflix-logo.png', await fetchFile(logoBlob));

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-i',
      'sawaflix-logo.png',
      '-filter_complex',
      '[0:v][1:v]overlay=main_w-overlay_w-20:main_h-overlay_h-20:format=auto,format=yuv420p',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '28',
      '-movflags',
      '+faststart',
      '-an',
      'watermarked-output.mp4',
    ]);

    const outputData = await ffmpeg.readFile('watermarked-output.mp4');
    const output = outputData instanceof Uint8Array ? outputData : new Uint8Array(outputData as ArrayBuffer);
    const outputBuffer = output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength);
    const blob = new Blob([outputBuffer], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('[ffmpegWatermark] Unable to prepare processed reel video:', error);
    return videoUrl;
  }
}
