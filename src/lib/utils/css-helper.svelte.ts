/**
 * A function that converts rgb/rgba into #RRGGBB or #RRGGBBAA format
 *
 * @param rgb/rgba string with comma or space separators including / for alpha channel
 * @returns #RRGGBB or #RRGGBBAA
 *
 * @example
 * ```ts
 * const hex = rgba2hex('rgba(255, 0, 0, 0.5)');
 * ```
 */
const rgba2hex = (rgba: string) => {
  const getHex = (n: string) => {
    // in rgba alpha chanel is less then 1 so we parseFloat and then
    // turn the float into integer by the or operator |
    // for other numbers we keep is in 255 range using module %
    let c = parseFloat(n) < 1 ? (parseFloat(n) * 255) | 0 : Number(n) % 255
    // as the numbers are up to 255 toString(16) could have only one hex digit
    // so we prepend the number with 0 and return the last two hex digits
    return ('0' + c.toString(16)).slice(-2)
  }
  return (
    '#' +
    (rgba.replace(/(\s*\/\s*)|[, ]/g, ',').match(/(0?\.?\d+)/g) as string[])
      .map((n) => getHex(n))
      .join('')
  )
}

export type NumberArray = [number, number, number, number?]
export const hsla2hex = (hsla: string) => {
  const sep = hsla.includes(',') ? ',' : ' '

  // if alpha channel is separated by /
  hsla = hsla.replace('/', sep)

  // convert hsla entries into numbers
  let [h, s, l, a] = hsla
    .replace(/hsla\(|\)|%/g, '')
    .replace(/\s*,\s*|\//g, ' ')
    .split(' ')
    .map((s) => {
      let x = parseFloat(s)
      return x < 1 ? x * 100 : x
    }) as NumberArray // this exclude ability to be undefined
  // .split(hsla.includes(',') ? ',' : ' ')
  // .map((n) => parseFloat(n));
  if (a === undefined) {
    a = 0
  }
  // no negative numbers should be allowed
  if (h * s * l < 0 || a < 0) return

  // as members of NumberArray are not undefined so this is unambiguous
  s /= 100
  l /= 100

  // initialization
  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2
  const ix = Math.floor(h / 60)
  // values for x and c depend on h position in 60 parts intervals 9--360
  const rgb = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ]
  let [r, g, b] = rgb[ix] as NumberArray

  // NOTE: could not use if (n===0) return '' as join('') looses some valid entry
  const hex = (n: number, _m: number) => {
    return ('0' + Math.round((n + _m) * 255).toString(16)).slice(-2)
  }

  return (
    (('#' + [hex(r, m), hex(g, m), hex(b, m)].join('')) as string) +
    (hex(a, 0) === '00' ? '' : hex(a, 0))
  )
}

export const convertToHexColor = (color: string) => {
  if (color.startsWith('#')) {
    return color
  } else if (color.startsWith('rgb') || color.startsWith('rgba')) {
    return rgba2hex(color)
  } else if (color.startsWith('hsla')) {
    return hsla2hex(color)
  } else {
    return color
  }
}

export const styleSheetFromSelector = (selector: string) => {
  for(let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i]
    for(let ix in sheet?.rules || sheet?.cssRules) {
        if(typeof rules[ix].selectorText == selector) {
          return sheet
        }
    }
  }
  return null
}

export const getAllSelectors = () => { 
    const ret: string[] = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
        const rules = document.styleSheets[i]?.rules || document.styleSheets[i]?.cssRules;
        for (let x in rules) {
            if (!(rules?.[x] instanceof CSSStyleRule)) {
                continue;
            }
            if (typeof rules?.[x].selectorText === 'string') {
                ret.push(rules?.[x].selectorText);
            }
        }
    }
    return ret;
};


const selectorExists = (selector: string) => {
		if (!browser) return
		try {
			for (let i = 0; i < document.styleSheets.length; i++) {
				const rules = document.styleSheets[i]?.cssRules as CSSRuleList
				for (let ix in rules) {
					if ((rules[ix] as CSSStyleRule).selectorText === selector) {
						return true
					}
				}
			}
			return false
		} finally {
		}
	}