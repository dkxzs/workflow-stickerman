// engine/auto_director.mjs
// Turnkey End-to-End Video Generator (1-Command Master Pipeline)
// Integrates Voice Alignment, Dynamic LOD Backgrounds, Expressive Stickman & FFmpeg Muxing

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { spawn, spawnSync } from 'child_process';
import { renderSceneFrameSVG } from './vector_scene_renderer.mjs';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const BASE_DIR = path.resolve('.');

// Parse CLI flags
const args = process.argv.slice(2);
const projectArg = args.find(a => a.startsWith('--project='))?.split('=')[1] || 'video-001';
const previewArg = args.find(a => a.startsWith('--preview='))?.split('=')[1];
const maxScenes = previewArg ? parseInt(previewArg, 10) : (args.includes('--preview') ? 6 : 999);

const PROJECT_DIR = path.join(BASE_DIR, 'projects', projectArg);
const SB_PATH = path.join(PROJECT_DIR, '03_storyboard.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio_scenes');
const OUT_DIR = path.join(PROJECT_DIR, 'output');
const TEMP_SCENES_DIR = path.join(PROJECT_DIR, 'video_scenes_vector');
const BGM_PATH = path.join(BASE_DIR, 'assets', 'audio', 'bgm', 'bgm-sneaky-snitch.mp3');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TEMP_SCENES_DIR, { recursive: true });

if (!fs.existsSync(SB_PATH)) {
  console.error(`Storyboard not found at: ${SB_PATH}`);
  process.exit(1);
}

// Validate storyboard before rendering
const PYTHON = process.env.PYTHON_PATH || 'python';
const valResult = spawnSync(PYTHON, ['-m', 'engine.storyboard_validator', SB_PATH], {
  encoding: 'utf-8',
});
if (valResult.error) {
  console.error(`Failed to run storyboard validator: ${valResult.error.message}`);
  process.exit(1);
}
if (valResult.status !== 0) {
  if (valResult.stdout) console.error(valResult.stdout);
  if (valResult.stderr) console.error(valResult.stderr);
  console.error(`Storyboard validation failed (exit code ${valResult.status}).`);
  process.exit(1);
}

const storyboard = JSON.parse(fs.readFileSync(SB_PATH, 'utf-8'));
const FPS = 30;
const scenesToRender = storyboard.scenes.slice(0, maxScenes);

console.log(`\n========================================================`);
console.log(`🎬 AUTO DIRECTOR — 1-COMMAND YOUTUBE ENGINE`);
console.log(`Project: ${projectArg}`);
console.log(`Scenes:  ${scenesToRender.length} of ${storyboard.scenes.length}`);
console.log(`Mode:    ${previewArg ? `PREVIEW (${maxScenes} scenes)` : 'FULL PRODUCTION'}`);
console.log(`========================================================\n`);

async function renderSceneToMP4(scene, index) {
  const sceneId = scene.scene_id;
  const audioFile = path.join(PROJECT_DIR, scene.audio_file || `audio_scenes/${sceneId}.mp3`);
  const outMp4 = path.join(TEMP_SCENES_DIR, `${sceneId}.mp4`);

  // Calculate duration
  const duration = scene.actual_duration_sec || scene.estimated_duration_sec || 2.5;
  const totalFrames = Math.max(15, Math.round(duration * FPS));

  console.log(`[${index + 1}/${scenesToRender.length}] Rendering ${sceneId} (${duration.toFixed(2)}s, ${totalFrames} frames)...`);
  const t0 = performance.now();

  const tempFrameDir = path.join(TEMP_SCENES_DIR, `temp_${sceneId}`);
  fs.mkdirSync(tempFrameDir, { recursive: true });

  // 1. Render all frames in vector SVG -> PNG
  for (let f = 0; f < totalFrames; f++) {
    const svgStr = renderSceneFrameSVG(scene, f, totalFrames, FPS, scenesToRender[index - 1] || null);
    const pngPath = path.join(tempFrameDir, `${String(f).padStart(5, '0')}.png`);
    await sharp(Buffer.from(svgStr)).png().toFile(pngPath);
  }

  // 2. Mux with Scene Audio using FFmpeg
  await new Promise((resolve, reject) => {
    const hasAudio = fs.existsSync(audioFile);
    const ffmpegArgs = [
      '-y',
      '-framerate', String(FPS),
      '-i', path.join(tempFrameDir, '%05d.png'),
    ];

    if (hasAudio) {
      ffmpegArgs.push('-i', audioFile);
      ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    } else {
      ffmpegArgs.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
      ffmpegArgs.push('-t', String(duration), '-c:a', 'aac');
    }

    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'fast',
      '-crf', '18',
      outMp4
    );

    const proc = spawn(FFMPEG, ffmpegArgs, { stdio: 'ignore' });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  // Cleanup temp frames
  fs.rmSync(tempFrameDir, { recursive: true, force: true });

  const dt = ((performance.now() - t0) / 1000).toFixed(1);
  console.log(`   -> Finished ${sceneId} in ${dt}s`);
  return outMp4;
}

async function concatScenes(sceneMp4s, finalOutMp4) {
  console.log(`\nConcatenating ${sceneMp4s.length} scenes into Master Video...`);
  const listFile = path.join(OUT_DIR, 'concat_list.txt');
  const fileContent = sceneMp4s.map(p => `file '${path.resolve(p).replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listFile, fileContent, 'utf-8');

  const rawConcat = path.join(OUT_DIR, 'temp_raw_concat.mp4');

  // Step 1: Concat video + voiceover
  await new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-c', 'copy',
      rawConcat
    ], { stdio: 'inherit' });
    proc.on('close', code => (code === 0 ? resolve() : reject(new Error(`Concat error ${code}`))));
  });

  // Step 2: Add background music ducked at -24dB if BGM exists
  if (fs.existsSync(BGM_PATH)) {
    console.log(`Adding ducked background music from: ${BGM_PATH}`);
    await new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG, [
        '-y',
        '-i', rawConcat,
        '-stream_loop', '-1',
        '-i', BGM_PATH,
        '-filter_complex',
        '[1:a]volume=0.08[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]',
        '-map', '0:v',
        '-map', '[aout]',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        finalOutMp4
      ], { stdio: 'inherit' });
      proc.on('close', code => (code === 0 ? resolve() : reject(new Error(`BGM mux error ${code}`))));
    });
    fs.unlinkSync(rawConcat);
  } else {
    fs.renameSync(rawConcat, finalOutMp4);
  }

  fs.unlinkSync(listFile);
  console.log(`\n🎉 MASTER VIDEO COMPLETE: ${finalOutMp4}\n`);
}

async function run() {
  const masterOut = path.join(OUT_DIR, previewArg ? 'video_preview_master.mp4' : 'video_full_master.mp4');
  const renderedFiles = [];

  for (let i = 0; i < scenesToRender.length; i++) {
    const mp4 = await renderSceneToMP4(scenesToRender[i], i);
    renderedFiles.push(mp4);
  }

  await concatScenes(renderedFiles, masterOut);
}

run().catch(err => {
  console.error('Fatal Auto Director Error:', err);
  process.exit(1);
});
