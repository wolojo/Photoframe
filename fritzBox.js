import { createHash } from 'crypto'

const password = process.env.FRITZBOX_PASSWORD
const baseUrl = 'http://fritz.box'
const defaultUrl = `${baseUrl}/nas/api/data.lua`
const loginUrl = `${baseUrl}/login_sid.lua`
let sid;

const objectToSearchParams = (obj) => new URLSearchParams(Object.entries(obj)).toString();

const doRequest = async ({ uri = defaultUrl, postData, query }) => {

    const fetchData = {
        "headers": {
            "accept": "application/json",
            "cache-control": "no-cache",
            "pragma": "no-cache"
        },
        "referrer": `${baseUrl}/nas`,
        method: "GET",
    }
    
    if (postData !== undefined) {
        fetchData.method = 'POST';
        fetchData.body = objectToSearchParams(postData);
        fetchData.headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }
    
    if (query !== undefined) {
        uri += '?' + objectToSearchParams(query)
    }
    
    const res = await fetch(uri, fetchData);
    
    return res;
}

async function getLoginInfo() {
    const response = await doRequest({ uri: loginUrl });

    const loginInfo = await response.json();
    return loginInfo;
}

function encryptChallenge(challenge) {
    const buffer = Buffer.from(challenge + '-' + password, 'UTF-16LE');
    const challengeAnswer = challenge + '-' + createHash('md5').update(buffer).digest('hex');
    return challengeAnswer;
}

async function solveLoginChallenge(loginInfo) {
    const query = {
        username: loginInfo.sessionInfo.users[0].user,
        response: encryptChallenge(loginInfo.sessionInfo.challenge),
    }

    const challengeResponse = await doRequest({ uri: loginUrl, query });
    const answer = await challengeResponse.json();
    return answer;
}

async function getSid() {
    if (sid) return sid;

    const loginInfo = await getLoginInfo();
    const answer = await solveLoginChallenge(loginInfo);
    sid = answer.sessionInfo.sid;

    if (sid === '0000000000000000') {
        throw 'Could not login to Fritz!Box. Invalid login?'
    }

    return sid
}

export async function listFiles(path) {
    const postData = {
        sid: await getSid(),
        path: path,
        c: 'files',
        a: 'browse',
    }
    const res = await doRequest({ postData });

    const data = await res.json();
    return data.files;
}

export async function getFile(path) {
    const query = {
        sid: await getSid(),
        path,
        c: 'files',
        a: 'get',
    }
    const res = await doRequest({ query });
    const data = await res.blob();
    return data;
}