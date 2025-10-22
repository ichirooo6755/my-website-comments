import fetch from 'node-fetch';

export async function handler(event) {
    const { name, comment } = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'ユーザー名/リポジトリ名';
    const PATH = 'comments.json';
    const BRANCH = 'main';

    // 1. 現在のcomments.jsonを取得
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await res.json();
    const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));

    // 2. 新しいコメントを追加
    content.push({ name, comment });

    // 3. JSONをBase64に変換
    const updatedContent = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

    // 4. GitHubに更新
    await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
        method: 'PUT',
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        body: JSON.stringify({
            message: 'Add comment',
            content: updatedContent,
            sha: data.sha,
            branch: BRANCH
        })
    });

    return { statusCode: 200, body: 'OK' };
}