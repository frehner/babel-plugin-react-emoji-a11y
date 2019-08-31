const emojiRegex = require("emoji-regex")
const gemoji = require("gemoji")

module.exports = function testPlugin({types: t}) {
  return {
    // understand JSX syntax for us so we don't break when we do our work
    inherits: require("babel-plugin-syntax-jsx"),

    visitor: {
      // whenever babel runs into JSXText, on enter it will run this function.
      JSXText(path) {
        const regex = emojiRegex()
        const match = regex.exec(path.node.value)

        // if there's not an emoji in here, then no need to continue
        if(!match) return

        const emojiData = gemoji.unicode[match]

        const openingParentElement = path.parent.openingElement

        if(openingParentElement.name.name !== "span") {
          console.warn("You have an emoji that isn't accessible. We'll help you out by making it accessible, but you should really do that in your source code. :)")

          path.replaceWithMultiple([
            t.jSXText(path.node.value.slice(0, match.index)),
            t.jSXElement(
              t.jSXOpeningElement(
                t.jSXIdentifier("span"),
                [
                  t.jSXAttribute(t.jSXIdentifier("aria-description"), t.stringLiteral(emojiData.description)),
                  t.jSXAttribute(t.jSXIdentifier("role"), t.stringLiteral("img"))
                ]
              ),
              t.jSXClosingElement(t.jSXIdentifier("span")),
              [
                t.jSXText(emojiData.emoji)
              ],
              false
            ),
            t.jSXText(path.node.value.slice(match.index + 2))
          ])

        } else {
          let hasCorrectRole = false
          let hasAriaLabel = false
          for(let i = 0; i < openingParentElement.attributes.length; i++) {
            const attribute = openingParentElement.attributes[i]
            switch (attribute.name.name) {
              case "aria-label":
                hasAriaLabel = true
                break;

              case "role":
                if(attribute.value.value === "img") {
                  hasCorrectRole = true
                }

              default:
                break;
            }
          }

          if(!hasCorrectRole || !hasAriaLabel) {
            console.warn("You wrapped your emoji in a span, but didn't give it the correct roles and aria stuff. You're so close though, and we're proud of you.")
          }
        }
        // console.log("openingParentElement", path.parent.openingElement)
      }
    }
  };
};