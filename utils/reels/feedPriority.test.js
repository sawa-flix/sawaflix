import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBlendedFeedOrder, mergeCategoryVideoResults } from './feedPriority.js';

test('buildBlendedFeedOrder prioritizes culture, heritage, and tourism', () => {
  const order = buildBlendedFeedOrder(['all', 'news', 'music', 'comedy', 'tourism', 'heritage', 'culture']);

  assert.deepEqual(order.slice(0, 4), ['culture', 'heritage', 'tourism', 'music']);
  assert.equal(order.indexOf('culture'), 0);
  assert.equal(order.indexOf('heritage'), 1);
  assert.equal(order.indexOf('tourism'), 2);
});

test('mergeCategoryVideoResults deduplicates and keeps priority order', () => {
  const videos = [
    { id: 'a', category: 'music' },
    { id: 'b', category: 'culture' },
    { id: 'a', category: 'culture' },
    { id: 'c', category: 'tourism' },
    { id: 'd', category: 'news' },
  ];

  const merged = mergeCategoryVideoResults(videos);
  assert.deepEqual(merged.map((video) => video.id), ['b', 'c', 'a', 'd']);
});
