/**
 * 去除空格
 */
export function trim(val: string): string {
  return val.replace(/(^\s*$)|(\s*$)/g, "")
}

/**
 * 去除左边空格
 */
export function ltrim(val: string): string {
  return val.replace(/(^\s*)/g, "")
}

/**
 * 去除右边空格
 */
export function rtrim(val: string): string {
  return val.replace(/(\s*$)/g, "")
}

/**
 * 去除两端 ,
 */
export function trimComma(val: string): string {
  return val.replace(/(^,*)|(,*$)/g, "")
}

/**
 * 去除两端 |
 */
export function trimVerticalBar(val: string): string {
  return val.replace(/(^\|*)|(\|*$)/g, "")
}
