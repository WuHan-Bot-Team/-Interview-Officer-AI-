// 实现Base64加密
function base64Encode(str) {
  let base64 = new Base64();
  return base64.encode(str);
}

// 实现Base64解密
function base64Decode(str) {
  let base64 = new Base64();
  return base64.decode(str);
}

// 定义Base64对象
function Base64() {

  // Base64字符集
  const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // 编码函数
  this.encode = function (str) {
    let result = '';
    for (let i = 0; i < str.length; i += 3) {
      let a = str.charCodeAt(i);
      let b = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
      let c = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;

      let a1 = a >> 2, a2 = ((a & 3) << 4) | (b >> 4), a3 = ((b & 15) << 2) | (c >> 6), a4 = c & 63;

      result += base64Chars[a1] + base64Chars[a2] + (i + 1 < str.length ? base64Chars[a3] : '=') + (i + 2 < str.length ? base64Chars[a4] : '=');
    }
    return result;
  }

  // 解码函数
  this.decode = function (str) {
    let result = '';
    let i = 0;
    while (i < str.length) {
      let a = base64Chars.indexOf(str.charAt(i++));
      let b = base64Chars.indexOf(str.charAt(i++));
      let c = base64Chars.indexOf(str.charAt(i++));
      let d = base64Chars.indexOf(str.charAt(i++));

      let a1 = (a << 2) | (b >> 4);
      let a2 = ((b & 15) << 4) | (c >> 2);
      let a3 = ((c & 3) << 6) | d;

      result += String.fromCharCode(a1);
      if (c != 64) {
        result += String.fromCharCode(a2);
      }
      if (d != 64) {
        result += String.fromCharCode(a3);
      }
    }
    return result;
  }
}

// 向外暴露方法
module.exports = {
  base64Encode: base64Encode,
  base64Decode: base64Decode
}
