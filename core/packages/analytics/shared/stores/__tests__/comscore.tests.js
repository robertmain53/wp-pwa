/* eslint no-underscore-dangle: ["error", { "allow": ["_comscore"] }] */
import { unprotect } from 'mobx-state-tree';
import { Stores } from '../mocks';

let stores;
let innerTextTracker;
beforeEach(() => {
  // Mock innerTextTracker
  innerTextTracker = jest.fn(() => async title => {
    await new Promise(resolve => setTimeout(resolve, 100));
    window.document.querySelector('title').innerHTML = title;
  });

  stores = Stores.create({}, { analytics: { innerTextTracker } });
  unprotect(stores);
});

describe('Analytics > ComScore', () => {
  test('comScoreIds', () => {
    expect(stores.analytics.comScore.ids).toMatchSnapshot();
  });

  test('init', async () => {
    // The ComScore snippet inserts its script before the first one,
    // so there must be an script in the DOM mock.
    const firstScript = window.document.createElement('script');
    window.document.body.appendChild(firstScript);

    window._comscore = [];
    const spyPush = jest.spyOn(window._comscore, 'push');

    const comScoreIds = ['test1', 'test2'];
    await stores.analytics.comScore.init(comScoreIds);
    expect(stores.analytics.comScore).toMatchSnapshot();
    expect(innerTextTracker).toHaveBeenCalled();
    expect(spyPush.mock.calls).toMatchSnapshot();
  });

  test('sendPageView', async () => {
    window.document.head.appendChild(window.document.createElement('title'));

    await stores.analytics.comScore.init(['test1', 'test2']);

    window.COMSCORE = { beacon: jest.fn() };
    await stores.analytics.comScore.sendPageView();
    expect(innerTextTracker).toHaveBeenCalled();
    expect(window.COMSCORE.beacon.mock.calls).toMatchSnapshot();
  });
});
