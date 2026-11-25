import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { renderSceneFrameSVG, esc, POSE_RIGS, easeOutBack } from '../engine/vector_scene_renderer.mjs';
import { iconSVG } from '../engine/icons.mjs';

const examplePath = path.resolve('templates/storyboard-example.json');
const exampleStoryboard = JSON.parse(fs.readFileSync(examplePath, 'utf-8'));

test('render templates/storyboard-example.json does not contain hardcoded video-001 card strings', () => {
  const forbidden = ['PHONE UNLOCK', 'DOPAMINE', 'POTENTIAL REWARD', 'ATTENTION HOOK'];
  for (const scene of exampleStoryboard.scenes) {
    const svg = renderSceneFrameSVG(scene, 5, 60, 30);
    for (const term of forbidden) {
      assert.ok(
        !svg.includes(term),
        `Scene ${scene.scene_id} SVG should not contain hardcoded term "${term}"`
      );
    }
  }
});

test('scene with card.title = "DEADLINE" renders "DEADLINE" in SVG and omits card when absent', () => {
  const deadlineScene = exampleStoryboard.scenes.find(
    s => s.visual?.card?.title === 'DEADLINE'
  );
  assert.ok(deadlineScene, 'Example storyboard should have a scene with card.title = "DEADLINE"');
  const svg = renderSceneFrameSVG(deadlineScene, 5, 60, 30);
  assert.ok(svg.includes('DEADLINE'), 'SVG should contain card title "DEADLINE"');
  assert.ok(svg.includes('id="info_card"'), 'SVG should contain info_card group');

  const noCardScene = structuredClone(deadlineScene);
  delete noCardScene.visual.card;
  const svgNoCard = renderSceneFrameSVG(noCardScene, 5, 60, 30);
  assert.ok(!svgNoCard.includes('id="info_card"'), 'SVG without visual.card should not render info_card');
});

test('narration "Tom & Jerry <3" escapes XML characters and converts to PNG via sharp without error', async () => {
  assert.equal(esc('Tom & Jerry <3 "quote"'), 'Tom &amp; Jerry &lt;3 &quot;quote&quot;');

  const scene = structuredClone(exampleStoryboard.scenes[0]);
  scene.narration_text = 'Tom & Jerry <3';
  scene.visual.card = {
    icon: 'heart',
    title: 'TOM & JERRY <3',
    subtitle: 'A > B & "C"'
  };

  const svg = renderSceneFrameSVG(scene, 5, 60, 30);
  assert.ok(svg.includes('TOM &amp; JERRY &lt;3'));

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  assert.ok(pngBuffer.length > 1000, 'PNG buffer should be generated successfully');
});

test('with position.x = 0.75, card is placed on the left of the character without overlapping', () => {
  const rightHeroScene = exampleStoryboard.scenes.find(
    s => s.visual?.position?.x === 0.75
  );
  assert.ok(rightHeroScene, 'Example storyboard should have a scene with position.x = 0.75');

  const svg = renderSceneFrameSVG(rightHeroScene, 12, 60, 30);

  // Extract info_card translate(cx, cy)
  const cardMatch = svg.match(/<g id="info_card" transform="translate\(([\d.]+),\s*([\d.]+)\)/);
  assert.ok(cardMatch, 'info_card transform should be present');
  const cardCx = parseFloat(cardMatch[1]);

  // Extract character ground shadow cx (heroX)
  const heroMatch = svg.match(/<g id="stickman_character"[^>]*>[\s\S]*?<ellipse cx="([\d.]+)"/);
  assert.ok(heroMatch, 'stickman_character ground shadow cx should be present');
  const heroX = parseFloat(heroMatch[1]);

  // Card is 440px wide (half-width 220), hero is at 0.75 * 1920 = 1440, card at 0.28 * 1920 = 537.6
  assert.equal(cardCx, 0.28 * 1920);
  assert.equal(heroX, 0.75 * 1920);
  assert.ok(cardCx + 220 < heroX - 100, `Card right edge (${cardCx + 220}) should be well left of hero (${heroX})`);
});

test('iconSVG supports all 15 vocab icons plus fallback and renders non-empty PNGs', async () => {
  const icons = [
    'lightbulb', 'brain', 'clock', 'bell_off', 'lock', 'phone', 'mail_empty',
    'check', 'cross', 'question', 'warning', 'chart_up', 'chart_down',
    'coin', 'heart',
  ];

  for (const name of [...icons, 'unknown_icon_xyz']) {
    const frag = iconSVG(name, 80, 80, 1);
    assert.ok(typeof frag === 'string' && frag.length > 0, `iconSVG("${name}") should return non-empty string`);
    assert.ok(frag.startsWith('<'), `iconSVG("${name}") should start with "<"`);

    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">${frag}</svg>`;
    const png = await sharp(Buffer.from(fullSvg)).png().toBuffer();
    assert.ok(png.length > 0, `PNG for icon "${name}" should be non-empty`);
  }
});

test('header renders only from visual.header and 110-char caption fits <= 2 lines within 90% width', async () => {
  const sceneWithHeader = structuredClone(exampleStoryboard.scenes[0]);
  const svgWithHeader = renderSceneFrameSVG(sceneWithHeader, 5, 60, 30);
  assert.ok(svgWithHeader.includes('id="top_header"'), 'Should render top_header when visual.header exists');
  assert.ok(svgWithHeader.includes('PROCRASTINATION'), 'Should render visual.header.title');
  assert.ok(svgWithHeader.includes('WHY WE KEEP DELAYING'), 'Should render visual.header.subtitle');

  const sceneNoHeader = structuredClone(exampleStoryboard.scenes[1]);
  assert.ok(!sceneNoHeader.visual.header, 'Example scene 2 has no visual.header');
  const svgNoHeader = renderSceneFrameSVG(sceneNoHeader, 5, 60, 30);
  assert.ok(!svgNoHeader.includes('id="top_header"'), 'Should omit top_header when visual.header is absent');

  // 110-character narration test
  const longText = 'This is a deliberately long narration sentence with exactly one hundred and ten characters to test caption wrap.';
  assert.ok(longText.length >= 110, `Expected >= 110 chars, got ${longText.length}`);

  const longScene = structuredClone(sceneNoHeader);
  longScene.narration_text = longText;
  const svgLong = renderSceneFrameSVG(longScene, 5, 60, 30);

  const captionMatch = svgLong.match(/<g id="bottom_caption">[\s\S]*?<text[^>]*font-size="(\d+)"[^>]*>([\s\S]*?)<\/text>/);
  assert.ok(captionMatch, 'bottom_caption text element should exist');
  const fontSize = parseInt(captionMatch[1], 10);
  const tspans = [...captionMatch[2].matchAll(/<tspan[^>]*>([\s\S]*?)<\/tspan>/g)].map(m => m[1]);

  assert.ok(tspans.length >= 1 && tspans.length <= 2, `Caption must have 1-2 lines, got ${tspans.length}`);
  const maxSafeW = 0.90 * 1920;
  for (const line of tspans) {
    const estWidth = line.length * fontSize * 0.62;
    assert.ok(estWidth <= maxSafeW, `Line "${line}" (${line.length} chars * ${fontSize}px) est width ${estWidth} > ${maxSafeW}`);
  }

  const png = await sharp(Buffer.from(svgLong)).png().toBuffer();
  assert.ok(png.length > 1000, 'Long caption SVG should convert to PNG cleanly');
});

test('POSE_RIGS: idle vs idea_lightbulb differ, f=0 equals prev pose, f=12 equals current, no NaN', () => {
  assert.deepEqual(
    Object.keys(POSE_RIGS).sort(),
    ['celebrate_win', 'idea_lightbulb', 'idle_neutral', 'pointing_target', 'running_hurry', 'shocked_fall', 'stressed_headache', 'thinking'].sort()
  );

  const mk = (pose) => {
    const s = structuredClone(exampleStoryboard.scenes[1]);
    s.visual.stickman_pose = pose;
    s.visual.props = [];
    return s;
  };
  const idle = mk('idle_neutral');
  const idea = mk('idea_lightbulb');
  const arms = (svg) => svg.match(/<g id="arms">([\s\S]*?)<\/g>/)[1];

  assert.notEqual(arms(renderSceneFrameSVG(idle, 20, 90, 30)), arms(renderSceneFrameSVG(idea, 20, 90, 30)));

  // f=0: idea scene after idle scene looks exactly like idle (both with same prevScene so x matches)
  assert.equal(
    arms(renderSceneFrameSVG(idea, 0, 90, 30, idle)),
    arms(renderSceneFrameSVG(idle, 0, 90, 30, idle))
  );
  // f=12 (0.4s): blend finished, equals current pose regardless of prevScene
  assert.equal(
    arms(renderSceneFrameSVG(idea, 12, 90, 30, idle)),
    arms(renderSceneFrameSVG(idea, 12, 90, 30, idea))
  );
  // unknown pose falls back to idle_neutral
  const weird = mk('does_not_exist');
  assert.equal(
    arms(renderSceneFrameSVG(weird, 5, 90, 30)),
    arms(renderSceneFrameSVG(idle, 5, 90, 30))
  );

  assert.ok(Math.abs(easeOutBack(0)) < 1e-9 && Math.abs(easeOutBack(1) - 1) < 1e-9);

  for (const pose of Object.keys(POSE_RIGS)) {
    for (const f of [0, 3, 6, 12, 40]) {
      for (const x of [0.25, 0.75]) {
        const s = mk(pose);
        s.visual.position.x = x;
        const svg = renderSceneFrameSVG(s, f, 90, 30, idle);
        assert.ok(!/NaN|undefined|Infinity/.test(svg), `NaN/undefined in SVG for ${pose} f=${f} x=${x}`);
      }
    }
  }
});

test('background and phone placement come from visual.background and visual.props, not description', () => {
  const baseScene = structuredClone(exampleStoryboard.scenes[1]);
  baseScene.visual.stickman_pose = 'idle_neutral';
  baseScene.visual.action = 'idle';
  baseScene.visual.description = 'hospital doctor phone put it down resting on desk';

  // Even though description mentions hospital & phone, background defaults to office and no phone is drawn
  delete baseScene.visual.background;
  baseScene.visual.props = [];
  const svgDefault = renderSceneFrameSVG(baseScene, 5, 60, 30);
  assert.ok(svgDefault.includes('Type: office'), `Expected office background, got: ${svgDefault.match(/Type: \w+/)?.[0]}`);
  assert.ok(!svgDefault.includes('fill="#18191c"'), 'Should not draw phone in hand without phone_in_hand prop');
  assert.ok(!svgDefault.includes('fill="#202124"'), 'Should not draw phone on desk without phone_on_desk prop');

  // Explicit background = nature
  baseScene.visual.background = 'nature';
  const svgNature = renderSceneFrameSVG(baseScene, 5, 60, 30);
  assert.ok(svgNature.includes('Type: nature'), 'Should use visual.background = nature');

  // phone_in_hand prop
  baseScene.visual.background = 'office';
  baseScene.visual.props = ['phone_in_hand'];
  const svgInHand = renderSceneFrameSVG(baseScene, 5, 60, 30);
  assert.ok(svgInHand.includes('fill="#18191c"'), 'Should draw phone in hand when props includes phone_in_hand');

  // phone_on_desk prop
  baseScene.visual.props = ['phone_on_desk'];
  const svgOnDesk = renderSceneFrameSVG(baseScene, 5, 60, 30);
  assert.ok(svgOnDesk.includes('fill="#202124"'), 'Should draw phone on desk when props includes phone_on_desk');
});

test('camera, mood (all 6), slide-in, card easeOutBack, and talking head nod', () => {
  const s = structuredClone(exampleStoryboard.scenes[0]);

  // 1. Camera: wide+static has no transform; zoom_in changes scale across frames
  s.visual.camera = { framing: 'wide', movement: 'static' };
  const svgWide = renderSceneFrameSVG(s, 10, 60, 30, s);
  assert.ok(!svgWide.includes('id="camera_rig" transform='), 'wide+static should have no camera transform');

  s.visual.camera = { framing: 'medium', movement: 'zoom_in' };
  const svgCam0 = renderSceneFrameSVG(s, 0, 60, 30, s);
  const svgCam59 = renderSceneFrameSVG(s, 59, 60, 30, s);
  const scale0 = parseFloat(svgCam0.match(/id="camera_rig" transform="[^"]*scale\(([\d.]+)\)"/)[1]);
  const scale59 = parseFloat(svgCam59.match(/id="camera_rig" transform="[^"]*scale\(([\d.]+)\)"/)[1]);
  assert.ok(scale59 > scale0, `zoom_in should increase scale (${scale0} -> ${scale59})`);

  // 2. Mood: all 6 moods render without NaN and deadpan differs from happy
  const faces = {};
  for (const mood of ['neutral', 'eager', 'happy', 'flat', 'deadpan', 'sad']) {
    const ms = structuredClone(s);
    ms.visual.mood = mood;
    const svgM = renderSceneFrameSVG(ms, 65, 70, 30, ms);
    assert.ok(!/NaN|undefined/.test(svgM), `Mood ${mood} should not produce NaN`);
    faces[mood] = svgM.match(/<circle cx="[\d.]+" cy="[\d.]+" r="66"[\s\S]*?<\/g>/)[0];
  }
  assert.notEqual(faces.happy, faces.deadpan);
  assert.notEqual(faces.sad, faces.eager);

  // 3. Slide-in on first scene: heroX at f=0 < heroX at f=12
  const svgSlide0 = renderSceneFrameSVG(s, 0, 60, 30, null);
  const svgSlide12 = renderSceneFrameSVG(s, 12, 60, 30, null);
  const hx0 = parseFloat(svgSlide0.match(/<g id="stickman_character"[^>]*>[\s\S]*?<ellipse cx="([-\d.]+)"/)[1]);
  const hx12 = parseFloat(svgSlide12.match(/<g id="stickman_character"[^>]*>[\s\S]*?<ellipse cx="([-\d.]+)"/)[1]);
  assert.ok(hx0 < 0 && Math.abs(hx12 - 0.25 * 1920) < 1, `Expected slide-in from left (${hx0} -> ${hx12})`);

  // 4. Card easeOutBack: scale at f=0 < scale at f=12
  const cs0 = parseFloat(svgSlide0.match(/id="info_card" transform="[^"]*scale\(([\d.]+)\)"/)[1]);
  assert.ok(cs0 < 0.2, `Card should start small at f=0 (got ${cs0})`);
  assert.ok(!svgSlide12.includes('id="info_card" transform="translate(1382.4, 480) scale('), 'Card settles at scale 1 by f=12');
});
