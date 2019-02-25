const http = require('https')
const querystring = require('querystring')

function Connector() {
  this.authData = null
  this.tenant = null
  this.sessionID = null
}

/**
 * AUTHORIZATION 
 * TODO : sessionID取ってくるとこもう少し頭良い感じにする
 */
Connector.prototype.auth = (uid, upw, tenant) => {

  const self = this

  self.authData = querystring.stringify({
    'uid': uid,
    'upw': upw
  })
  self.tenant = tenant
  
  const authOptions = {
    hostname: 'd3w.ap.oproarts.com',
    path: `/d3w/api/${self.tenant}/login`,
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(self.authData)
    }
  }
  
  return new Promise((resolve,reject) => {
    const authreq = http.request(authOptions, res => {
      console.log(`STATUS: ${res.statusCode}`)
      res.setEncoding('utf8')
      const headers = JSON.stringify(res.headers).split(',')
      headers.forEach((e,i) => {
        if (i == 7) {
          let sessionID = headers[i].slice(26,-31)
          console.log('SESSIONID : ' + sessionID)
          console.log('ログインしました。')
          self.sessionID = sessionID
          resolve()
        }
      })
    })
    authreq.on('error', e => {
      console.error(`problem with request: ${e}`)
      reject()
    })
    authreq.write(self.authData)
    authreq.end()
  })
}

/**
 * ワーク一覧取得
 */
Connector.prototype.getWork = (uid, upw) => {
  
  const self = this
  const param = querystring.stringify({
    'uid': uid,
    'upw': upw
  })
  const options = {
    hostname: 'd3w.ap.oproarts.com',
    path: `/d3w/api/${self.tenant}/conf/works`,
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(self.authData)
    }
  }
  console.log(options)
  const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`)
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
    })
    res.on('end', () => {console.log('No more data')})
  })
  req.on('error', err => {
    console.error(`ERROR: ${err}`)
  })
  req.write(param)
  req.end()
}

/**
 * LOGOUT
 */
Connector.prototype.logout = () => {

  const self = this
  
  const options = {
    hostname: 'd3w.ap.oproarts.com',
    path: `/d3w/api/${self.tenant}/logout`,
    port: 443,
    method: 'POST',
    headers: {
      'Cookie': self.sessionID
    }
  }

  return new Promise((resolve,reject) => {
    const request = http.request(options, res => {
      console.log(`STATUS: ${res.statusCode}`)
      console.log('ログアウトしました。')
      resolve()
    })
    request.on('error', e => {
      console.error(`problem with request: ${e}`)
      console.log('ログアウト失敗')
      reject();
    })
    request.end()
  })
}

exports.Connector = Connector