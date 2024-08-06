
export function getFileTypeWithName(fileName) {
  const exten = fileName.split('.').pop()
  return exten
}

export function getPkTypeWithName(fileName) {
  const exten = getFileTypeWithName(fileName)
  if (exten === 'xls' || exten === 'xlsx') {
    return 'pk-xlsx'
  } else if (exten === 'doc' || exten === 'docx') {
    return 'pk-docx'
  } else if (exten === 'pdf') {
    return 'pk-pdf'
  } else if (exten === 'ppt' || exten === 'pptx') {
    return 'pk-pdf'
  } else if (exten === 'md') {
    return 'pk-md'
  }
  return 'pk-txt'
}
