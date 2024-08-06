import crypto from 'crypto-js'

const key = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH'
const iv = 1234567890123456

export function encrypt(txt) {
  const crypted = crypto.AES.encrypt(txt, key, {
    iv,
    mode: crypto.mode.ECB,
    padding: crypto.pad.Pkcs7
  })
  return crypted
}

export function decrypt(txt) {
  const decrypted = crypto.AES.decrypt(txt, key, {
    iv,
    mode: crypto.mode.ECB,
    padding: crypto.pad.Pkcs7
  })
  return decrypted.toString(crypto.enc.Utf8).toString()
}
