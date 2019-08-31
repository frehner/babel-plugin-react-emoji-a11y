const babel = require("babel-core");
const plugin = require("./index");

fit(`should be able to find an emoji`, () => {
  const example = `
    function Blah() {
      return (
        <div role="button">
          test testing test 🐽 blah bal
        </div>
      )
    }

    class Something extends React.component {
      render() {
        return (
          <span aria-label="pig nose">🐽</span>
        )
      }
    }
  `;
  const { code } = babel.transform(example, { plugins: [plugin] });
  console.log(code);
  // expect(code).toMatchSnapshot()
});

it(`should not warn if they did it correctly`, () => {
  const example = `
    function Correct() {
      return (
        <span aria-label="pig nose" role="img">🐽</span>
      )
    }
  `;

  const { code } = babel.transform(example, { plugins: [plugin] });
});
