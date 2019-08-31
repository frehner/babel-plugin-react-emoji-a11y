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
  console.log(code);
  // expect(code).toMatchSnapshot()
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
  console.log(code);
  // expect(code).toMatchSnapshot()
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
  // expect(code).toMatchSnapshot()
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
});
