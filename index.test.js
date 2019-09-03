const babel = require("babel-core");
const plugin = require("./index");

jest.spyOn(console, "warn");

beforeEach(() => {
  jest.clearAllMocks();
});

it(`should wrap an emoji that doesn't have any accessibility span`, () => {
  const original = `
    function Bad() {
      return (
        <div>
          test 🐽 blah
        </div>
      )
    }
  `;

  const { code } = babel.transform(original, { plugins: [plugin] });
  expect(code).toMatchSnapshot();
  expect(console.warn).toBeCalledTimes(1);
});

it(`should add "role" to a span that doesn't have it`, () => {
  const original = `
    class AlmostThere extends React.component {
      render() {
        return (
          <span aria-label="pig nose">🐽</span>
        )
      }
    }
  `;
  const { code } = babel.transform(original, { plugins: [plugin] });
  expect(code).toMatchSnapshot();
  expect(console.warn).toBeCalledTimes(1);
});

it(`should add "aria-label" to a span that doesn't have it`, () => {
  const original = `
    class AlmostThere extends React.component {
      render() {
        return (
          <span role="img">🐽</span>
        )
      }
    }
  `;
  const { code } = babel.transform(original, { plugins: [plugin] });
  expect(code).toMatchSnapshot();
  expect(console.warn).toBeCalledTimes(1);
});

it(`should fix emojis that are in accessible spans but with other text`, () => {
  const original = `
    function NotQuiteButClose() {
      return (
        <span aria-label="shouldn't change" role="img">asd 🐽 asdf</span>
      )
    }
  `;

  const { code } = babel.transform(original, { plugins: [plugin] });
  expect(code).toMatchSnapshot();
  expect(console.warn).toBeCalledTimes(1);
});

it(`should do nothing if the emoji is accessible already`, () => {
  const original = `
    function Correct() {
      return (
        <span aria-label="shouldn't change" role="img">🐽</span>
      )
    }
  `;

  const { code } = babel.transform(original, { plugins: [plugin] });
  expect(code).toMatchSnapshot();
  expect(console.warn).toBeCalledTimes(0);
});

it(`should be able to handle multiple emojis separated by text`, () => {
  const original = `
    function Bad() {
      return (
        <div>
          test 🐽 blah 💩
        </div>
      )
    }
  `;

  const { code } = babel.transform(original, { plugins: [plugin] });
  expect(code).toMatchSnapshot();
  expect(console.warn).toBeCalledTimes(2);
});

it(`should be able to handle multiple emojis next to each other`, () => {
  const original = `
    function Bad() {
      return (
        <div>
          🐽💩
        </div>
      )
    }
  `;

  const { code } = babel.transform(original, { plugins: [plugin] });
  expect(code).toMatchSnapshot();
  expect(console.warn).toBeCalledTimes(2);
});

it(`should be able to handle multiple emojis, with one being good and another needing fixing`, () => {
  const original = `
    function Bad() {
      return (
        <div>
          <span role="img" aria-label="pig nose">🐽</span>💩
        </div>
      )
    }
  `;

  const { code } = babel.transform(original, { plugins: [plugin] });
  expect(code).toMatchSnapshot();
  expect(console.warn).toBeCalledTimes(1);
});
