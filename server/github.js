const GITHUB_API_BASE = 'https://api.github.com';

function joinPath(...parts) {
  return parts
    .filter(Boolean)
    .map((part) => String(part).replace(/^\/+|\/+$/g, ''))
    .filter((part) => part.length > 0)
    .join('/');
}

async function githubRequest({ method, url, token, body }) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      (payload && payload.message) ||
      (typeof payload === 'string' ? payload : '') ||
      response.statusText;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function getContents({ owner, repo, path, branch, token }) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`;
  return githubRequest({ method: 'GET', url, token });
}

async function getFileSha({ owner, repo, path, branch, token }) {
  try {
    const payload = await getContents({ owner, repo, path, branch, token });
    if (payload && payload.sha) {
      return payload.sha;
    }
    return null;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function folderExists({ owner, repo, path, branch, token }) {
  try {
    await getContents({ owner, repo, path, branch, token });
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}

async function getNextRunFolder({ owner, repo, basePath, connectorId, branch, token }) {
  for (let i = 1; i <= 999; i += 1) {
    const runName = `run_${String(i).padStart(3, '0')}`;
    const folderPath = joinPath(basePath, connectorId, runName);
    const exists = await folderExists({ owner, repo, path: folderPath, branch, token });
    if (!exists) {
      return folderPath;
    }
  }
  throw new Error('Unable to find available run folder');
}

async function upsertFile({
  owner,
  repo,
  branch,
  path,
  token,
  contentBase64,
  message,
}) {
  const sha = await getFileSha({ owner, repo, path, branch, token });
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURI(path)}`;
  const body = {
    message,
    content: contentBase64,
    branch,
  };

  if (sha) {
    body.sha = sha;
  }

  return githubRequest({ method: 'PUT', url, token, body });
}

export { joinPath, getNextRunFolder, upsertFile };
