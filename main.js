const Connector = require('./d3Utils/connector').Connector

/**
 * Authorize
 */
const uid = 'xxx'
const upw = 'yyy'
const tenant = 'zzz'

const conn = new Connector()
conn.auth(uid, upw, tenant)
.then(() => conn.getWork(uid, upw))
