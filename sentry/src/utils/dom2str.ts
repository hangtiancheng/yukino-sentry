const MAX_TRAVERSE_HEIGHT = 5;
const MAX_OUTPUT_LENGTH = 128;
const SEPARATOR = " > ";

function elementToSelector(element: HTMLElement): string {
  let selector = element.tagName.toLowerCase();
  if (element.id) {
    selector += `#${element.id}`;
  }
  const { className } = element;
  if (className && typeof className === "string") {
    for (const cls of className.split(/\s+/)) {
      if (cls) {
        selector += `.${cls}`;
      }
    }
  }
  return selector;
}

function dom2str(target: HTMLElement): string {
  try {
    const path: string[] = [];
    let length = 0;
    let height = 0;
    let current: HTMLElement | null = target;

    while (current && height++ < MAX_TRAVERSE_HEIGHT) {
      const selector = elementToSelector(current);
      const nextLength =
        length + path.length * SEPARATOR.length + selector.length;
      if (
        selector === "html" ||
        (height > 1 && nextLength >= MAX_OUTPUT_LENGTH)
      ) {
        break;
      }
      path.push(selector);
      length += selector.length;
      current = current.parentElement;
    }

    return path.reverse().join(SEPARATOR);
  } catch {
    return "<unknown>";
  }
}

export default dom2str;
