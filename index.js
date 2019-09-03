const emojiRegex = require("emoji-regex");
const gemoji = require("gemoji");

module.exports = function testPlugin({ types: t }) {
  return {
    // understand JSX syntax for us so we don't break when we do our work
    inherits: require("babel-plugin-syntax-jsx"),

    visitor: {
      // whenever babel runs into JSXText, on enter it will run this function.
      JSXText(path) {
        const regex = emojiRegex();
        const match = regex.exec(path.node.value);

        // if there's not an emoji in here, then no need to continue
        if (!match) return;

        const emojiData = gemoji.unicode[match];

        const openingParentElement = path.parent.openingElement;

        // if it is wrapped but there's other text around it as well
        const emojiIsAlone = path.node.value.trim() === emojiData.emoji;

        if (openingParentElement.name.name !== "span" || !emojiIsAlone) {
          console.warn(
            "You may have an emoji that isn't accessible. We'll help out by making it accessible, but you should really do that in your source code. :)"
          );

          path.replaceWithMultiple([
            t.jSXText(path.node.value.slice(0, match.index)),
            t.jSXElement(
              t.jSXOpeningElement(t.jSXIdentifier("span"), [
                t.jSXAttribute(
                  t.jSXIdentifier("aria-label"),
                  t.stringLiteral(emojiData.description)
                ),
                t.jSXAttribute(t.jSXIdentifier("role"), t.stringLiteral("img"))
              ]),
              t.jSXClosingElement(t.jSXIdentifier("span")),
              [t.jSXText(emojiData.emoji)],
              false
            ),
            t.jSXText(path.node.value.slice(match.index + 2))
          ]);
        } else {
          let hasCorrectRole = false;
          let hasCorrectAriaLabel = false;

          for (let i = 0; i < openingParentElement.attributes.length; i++) {
            const attribute = openingParentElement.attributes[i];
            switch (attribute.name.name) {
              case "aria-label":
                // if they put something in there, then we'll assume it's good
                if (attribute.value.value.trim()) hasCorrectAriaLabel = true;
                break;

              case "role":
                if (attribute.value.value === "img") hasCorrectRole = true;

              default:
                break;
            }
          }

          if (!hasCorrectRole) {
            console.warn(
              `You wrapped your emoji in a span, but didn't give it a role="img".`
            );
            openingParentElement.attributes.push(
              t.jSXAttribute(t.jSXIdentifier("role"), t.stringLiteral("img"))
            );
          }

          if (!hasCorrectAriaLabel) {
            console.warn(
              `You wrapped your emoji in a span, but didn't give it an aria-label="{label}".`
            );
            openingParentElement.attributes.push(
              t.jSXAttribute(
                t.jSXIdentifier("aria-label"),
                t.stringLiteral(emojiData.description)
              )
            );
          }
        }
      }
    }
  };
};
