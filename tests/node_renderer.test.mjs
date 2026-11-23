import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { renderSceneFrameSVG, esc } from '../engine/vector_scene_renderer.mjs';

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

  const svg = renderSceneFrameSVG(rightHeroScene, 5, 60, 30);

  // Extract info_card translate(cx, cy)
  const cardMatch = svg.match(/<g id="info_card" transform="translate\(([\d.]+),\s*([\d.]+)\)"/);
  assert.ok(cardMatch, 'info_card transform should be present');
  const cardCx = parseFloat(cardMatch[1]);

  // Extract character ground shadow cx (heroX)
  const heroMatch = svg.match(/<g id="stickman_character">[\s\S]*?<ellipse cx="([\d.]+)"/);
  assert.ok(heroMatch, 'stickman_character ground shadow cx should be present');
  const heroX = parseFloat(heroMatch[1]);

  // Card is 440px wide (half-width 220), hero is at 0.75 * 1920 = 1440, card at 0.28 * 1920 = 537.6
  assert.equal(cardCx, 0.28 * 1920);
  assert.equal(heroX, 0.75 * 1920);
  assert.ok(cardCx + 220 < heroX - 100, `Card right edge (${cardCx + 220}) should be well left of hero (${heroX})`);
});
