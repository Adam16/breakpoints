const {JSDOM} = require('jsdom');
const path = require('path');

jest.useFakeTimers();

function setupDom(width) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  dom.window.innerWidth = width;
  global.window = dom.window;
  global.document = dom.window.document;
  const $ = require('jquery')(dom.window);
  global.jQuery = $;
  global.$ = $;
  // load plugin after jQuery is present
  require(path.resolve(__dirname, '../breakpoints.js'));
  return $;
}

function advance() {
  // advance timers enough so the interval executes at least once
  jest.advanceTimersByTime(300);
}

test('plugin triggers enter and exit events as window size changes', () => {
  const $ = setupDom(300);
  const events = [];

  $(window)
    .on('enterBreakpoint320', () => events.push('enter320'))
    .on('exitBreakpoint320', () => events.push('exit320'))
    .on('enterBreakpoint480', () => events.push('enter480'))
    .on('exitBreakpoint480', () => events.push('exit480'));

  $(window).setBreakpoints({ distinct: true, breakpoints: [320, 480] });
  advance();
  expect(events).toEqual([]);

  // grow into first breakpoint
  window.innerWidth = 350;
  advance();
  expect(events).toEqual(['enter320']);

  // grow into second breakpoint
  window.innerWidth = 500;
  advance();
  expect(events.slice(-2)).toEqual(['exit320', 'enter480']);

  // shrink back to first breakpoint
  window.innerWidth = 430;
  advance();
  expect(events.slice(-2)).toEqual(['exit480', 'enter320']);
});
