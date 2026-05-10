#!/usr/bin/env node
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import process from "node:process";
import readline from "node:readline/promises";
import { google } from "googleapis";

dotenv.config({ path: ".env.local" });
dotenv.config();

const OLD_DOMAIN = "startfrenchnow.com";
const NEW_DOMAIN = "startfrenchnow.ch";
const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"];
const DEFAULT_REDIRECT_URI = "http://127.0.0.1:4815/oauth2callback";
const DEFAULT_TOKEN_PATH = path.resolve("scripts/youtube/.local/youtube-oauth-token.json");
const DEFAULT_CLIENT_SECRET_PATH = path.resolve("scripts/youtube/.local/client_secret.json");
const DEFAULT_LOG_DIR = path.resolve("scripts/youtube/logs");
const ARGS = new Set(process.argv.slice(2));

const parseBoolean = (value, fallback) => {
    if (value === undefined) return fallback;
    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
    return fallback;
};

const parseInteger = (value, fallback) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const DRY_RUN = parseBoolean(process.env.DRY_RUN, true);
const MAX_UPDATES_PER_RUN = parseInteger(process.env.MAX_UPDATES_PER_RUN, 20);
const TOKEN_PATH = path.resolve(process.env.YOUTUBE_OAUTH_TOKEN_PATH || DEFAULT_TOKEN_PATH);
const CLIENT_SECRET_PATH = path.resolve(process.env.YOUTUBE_OAUTH_CLIENT_SECRET_PATH || DEFAULT_CLIENT_SECRET_PATH);
const LOG_DIR = path.resolve(process.env.YOUTUBE_LOG_DIR || DEFAULT_LOG_DIR);

const chunk = (items, size) => {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
};

const sanitizeFileName = (value) => value.replace(/[^a-z0-9._-]+/gi, "-").replace(/-+/g, "-");

function printHelp() {
    console.log(`
Usage:
  npm run youtube:update-descriptions

Environment:
  DRY_RUN=true|false                  Default: true
  MAX_UPDATES_PER_RUN=20              Safety limit for videos.update calls
  YOUTUBE_OAUTH_CLIENT_ID=...
  YOUTUBE_OAUTH_CLIENT_SECRET=...
  YOUTUBE_OAUTH_REDIRECT_URI=...      Default: ${DEFAULT_REDIRECT_URI}
  YOUTUBE_OAUTH_CLIENT_SECRET_PATH=... Default: ${DEFAULT_CLIENT_SECRET_PATH}
  YOUTUBE_OAUTH_TOKEN_PATH=...        Default: ${DEFAULT_TOKEN_PATH}
  YOUTUBE_LOG_DIR=...                 Default: ${DEFAULT_LOG_DIR}

Notes:
  - The script only updates videos whose description contains ${OLD_DOMAIN}.
  - In real mode, the terminal requires typing UPDATE before any videos.update call.
  - OAuth client JSON and token files are ignored by git.
`);
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function readOAuthClientConfig() {
    const envClientId = process.env.YOUTUBE_OAUTH_CLIENT_ID?.trim();
    const envClientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET?.trim();
    const envRedirectUri = process.env.YOUTUBE_OAUTH_REDIRECT_URI?.trim();

    if (envClientId && envClientSecret) {
        return {
            clientId: envClientId,
            clientSecret: envClientSecret,
            redirectUri: envRedirectUri || DEFAULT_REDIRECT_URI,
        };
    }

    if (!(await fileExists(CLIENT_SECRET_PATH))) {
        throw new Error(
            `Missing OAuth client credentials. Set YOUTUBE_OAUTH_CLIENT_ID/YOUTUBE_OAUTH_CLIENT_SECRET or place an OAuth client JSON at ${CLIENT_SECRET_PATH}.`,
        );
    }

    const raw = await fs.readFile(CLIENT_SECRET_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const oauthClient = parsed.installed || parsed.web;

    if (!oauthClient?.client_id || !oauthClient?.client_secret) {
        throw new Error(`Invalid OAuth client JSON at ${CLIENT_SECRET_PATH}. Expected installed/web client credentials.`);
    }

    return {
        clientId: oauthClient.client_id,
        clientSecret: oauthClient.client_secret,
        redirectUri: envRedirectUri || oauthClient.redirect_uris?.[0] || DEFAULT_REDIRECT_URI,
    };
}

async function saveToken(token) {
    await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
    await fs.writeFile(TOKEN_PATH, JSON.stringify(token, null, 2));
}

async function readSavedToken() {
    if (!(await fileExists(TOKEN_PATH))) return null;
    const raw = await fs.readFile(TOKEN_PATH, "utf8");
    return JSON.parse(raw);
}

function createLoopbackServer(redirectUri) {
    const url = new URL(redirectUri);

    if (!["127.0.0.1", "localhost"].includes(url.hostname) || url.protocol !== "http:") {
        return null;
    }

    let server;

    const waitForCode = new Promise((resolve, reject) => {
        server = http.createServer((request, response) => {
            const requestUrl = new URL(request.url || "/", redirectUri);
            if (requestUrl.pathname !== url.pathname) {
                response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
                response.end("Not found.");
                return;
            }

            if (requestUrl.searchParams.get("error")) {
                const error = requestUrl.searchParams.get("error");
                response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
                response.end(`Authorization failed: ${error}`);
                server.close();
                reject(new Error(`Google OAuth returned an error: ${error}`));
                return;
            }

            const code = requestUrl.searchParams.get("code");
            if (!code) {
                response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
                response.end("Missing authorization code.");
                return;
            }

            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            response.end("<html><body><h1>Authorization received.</h1><p>You can close this tab and return to the terminal.</p></body></html>");
            server.close();
            resolve(code);
        });

        server.on("error", reject);
        server.listen(Number(url.port || 80), url.hostname);
    });

    return {
        close: () =>
            new Promise((resolve) => {
                if (!server) {
                    resolve();
                    return;
                }
                server.close(() => resolve());
            }),
        waitForCode,
    };
}

async function promptForAuthorizationCode(authUrl) {
    console.log("");
    console.log("Open this URL in your browser and approve access:");
    console.log(authUrl);
    console.log("");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answer = await rl.question("Paste the full redirect URL or the authorization code: ");
    rl.close();

    const trimmed = answer.trim();
    if (!trimmed) {
        throw new Error("No authorization code provided.");
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return new URL(trimmed).searchParams.get("code") || "";
    }

    return trimmed;
}

async function getAuthenticatedYoutubeClient() {
    const { clientId, clientSecret, redirectUri } = await readOAuthClientConfig();
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const savedToken = await readSavedToken();

    if (savedToken) {
        oauth2Client.setCredentials(savedToken);
    } else {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: SCOPES,
        });

        const loopbackServer = createLoopbackServer(redirectUri);
        let code = "";

        if (loopbackServer) {
            console.log("");
            console.log("Open this URL in your browser and approve access:");
            console.log(authUrl);
            console.log("");
            console.log(`Waiting for Google OAuth redirect on ${redirectUri} ...`);

            code = await Promise.race([
                loopbackServer.waitForCode,
                new Promise((resolve) => {
                    setTimeout(() => resolve(""), 120000);
                }),
            ]);

            if (!code) {
                await loopbackServer.close();
                code = await promptForAuthorizationCode(authUrl);
            }
        } else {
            code = await promptForAuthorizationCode(authUrl);
        }

        if (!code) {
            throw new Error("Authorization code was empty.");
        }

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        await saveToken(tokens);
        console.log(`OAuth token saved to ${TOKEN_PATH}`);
    }

    oauth2Client.on("tokens", (tokens) => {
        if (!tokens.refresh_token && !tokens.access_token) return;
        const merged = {
            ...oauth2Client.credentials,
            ...tokens,
        };
        saveToken(merged).catch((error) => {
            console.error(`Failed to persist refreshed OAuth token: ${error instanceof Error ? error.message : String(error)}`);
        });
    });

    return google.youtube({
        version: "v3",
        auth: oauth2Client,
    });
}

async function getUploadsPlaylistId(youtube) {
    const response = await youtube.channels.list({
        part: ["contentDetails", "snippet"],
        mine: true,
    });

    const channel = response.data.items?.[0];
    const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
        throw new Error("Could not find the uploads playlist for the connected YouTube channel.");
    }

    console.log(`Connected channel: ${channel.snippet?.title || "Unknown channel"}`);
    console.log(`Uploads playlist: ${uploadsPlaylistId}`);

    return uploadsPlaylistId;
}

async function listUploadVideoIds(youtube, uploadsPlaylistId) {
    const videoIds = [];
    let pageToken;

    do {
        const response = await youtube.playlistItems.list({
            part: ["contentDetails"],
            playlistId: uploadsPlaylistId,
            maxResults: 50,
            pageToken,
        });

        for (const item of response.data.items || []) {
            const videoId = item.contentDetails?.videoId;
            if (videoId) videoIds.push(videoId);
        }

        pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    return videoIds;
}

async function listVideoSnippets(youtube, videoIds) {
    const items = [];

    for (const ids of chunk(videoIds, 50)) {
        const response = await youtube.videos.list({
            part: ["snippet"],
            id: ids,
            maxResults: 50,
        });

        items.push(...(response.data.items || []));
    }

    return items;
}

function buildUpdatedSnippet(snippet, newDescription) {
    if (!snippet?.title?.trim()) {
        throw new Error("Cannot update a video without snippet.title.");
    }

    if (!snippet?.categoryId?.trim()) {
        throw new Error("Cannot update a video without snippet.categoryId.");
    }

    const nextSnippet = {
        title: snippet.title,
        description: newDescription,
        categoryId: snippet.categoryId,
    };

    if (Array.isArray(snippet.tags) && snippet.tags.length > 0) {
        nextSnippet.tags = snippet.tags;
    }

    if (typeof snippet.defaultLanguage === "string" && snippet.defaultLanguage.trim()) {
        nextSnippet.defaultLanguage = snippet.defaultLanguage;
    }

    if (typeof snippet.defaultAudioLanguage === "string" && snippet.defaultAudioLanguage.trim()) {
        nextSnippet.defaultAudioLanguage = snippet.defaultAudioLanguage;
    }

    return nextSnippet;
}

async function confirmRealRun(candidateCount, cappedCount) {
    if (DRY_RUN) return true;
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        throw new Error("Real mode requires an interactive terminal confirmation. Re-run with DRY_RUN=true to preview changes.");
    }

    console.log("");
    console.log("REAL MODE");
    console.log(`The script found ${candidateCount} matching video(s).`);
    console.log(`MAX_UPDATES_PER_RUN=${MAX_UPDATES_PER_RUN}, so ${cappedCount} video(s) will be updated in this run.`);
    console.log(`Each videos.update call costs quota and will replace ${OLD_DOMAIN} with ${NEW_DOMAIN}.`);
    console.log("");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const answer = await rl.question(`Type UPDATE to continue with ${cappedCount} update(s): `);
    rl.close();

    return answer.trim() === "UPDATE";
}

async function writeLogFile(entries) {
    await fs.mkdir(LOG_DIR, { recursive: true });
    const fileName = sanitizeFileName(`youtube-description-update-${new Date().toISOString()}.json`);
    const logPath = path.join(LOG_DIR, fileName);
    await fs.writeFile(logPath, JSON.stringify(entries, null, 2));
    return logPath;
}

async function run() {
    if (ARGS.has("--help") || ARGS.has("-h")) {
        printHelp();
        return;
    }

    console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "REAL RUN"}`);
    console.log(`Replacement: ${OLD_DOMAIN} -> ${NEW_DOMAIN}`);
    console.log(`MAX_UPDATES_PER_RUN: ${MAX_UPDATES_PER_RUN}`);

    const youtube = await getAuthenticatedYoutubeClient();
    const uploadsPlaylistId = await getUploadsPlaylistId(youtube);
    const uploadVideoIds = await listUploadVideoIds(youtube, uploadsPlaylistId);

    console.log(`Videos found in uploads playlist: ${uploadVideoIds.length}`);

    if (uploadVideoIds.length === 0) {
        const logPath = await writeLogFile([]);
        console.log(`No videos found. Log written to ${logPath}`);
        return;
    }

    const videos = await listVideoSnippets(youtube, uploadVideoIds);
    const candidates = videos
        .map((video) => {
            const description = video.snippet?.description || "";
            if (!description.includes(OLD_DOMAIN)) return null;

            return {
                videoId: video.id || "",
                title: video.snippet?.title || "",
                oldDescription: description,
                newDescription: description.split(OLD_DOMAIN).join(NEW_DOMAIN),
                snippet: video.snippet,
            };
        })
        .filter(Boolean);

    console.log(`Videos matching "${OLD_DOMAIN}": ${candidates.length}`);

    if (candidates.length === 0) {
        const logPath = await writeLogFile([]);
        console.log(`Nothing to update. Log written to ${logPath}`);
        return;
    }

    const toUpdate = candidates.slice(0, MAX_UPDATES_PER_RUN);
    const overLimit = candidates.slice(MAX_UPDATES_PER_RUN);

    for (const item of toUpdate) {
        console.log(`- ${item.videoId} | ${item.title}`);
    }

    if (overLimit.length > 0) {
        console.log(`${overLimit.length} additional matching video(s) skipped in this run because of MAX_UPDATES_PER_RUN.`);
    }

    const confirmed = await confirmRealRun(candidates.length, toUpdate.length);
    const logEntries = candidates.map((item, index) => ({
        videoId: item.videoId,
        title: item.title,
        oldDescription: item.oldDescription,
        newDescription: item.newDescription,
        updated: false,
        error: index >= MAX_UPDATES_PER_RUN ? `Skipped because MAX_UPDATES_PER_RUN=${MAX_UPDATES_PER_RUN}.` : null,
    }));

    if (!confirmed) {
        if (!DRY_RUN) {
            console.log("Confirmation declined. No update sent to YouTube.");
        } else {
            console.log("Dry run completed. No update sent to YouTube.");
        }

        const logPath = await writeLogFile(logEntries);
        console.log(`Log written to ${logPath}`);
        return;
    }

    for (const item of toUpdate) {
        const entry = logEntries.find((logItem) => logItem.videoId === item.videoId);

        try {
            if (DRY_RUN) {
                continue;
            }

            await youtube.videos.update({
                part: ["snippet"],
                requestBody: {
                    id: item.videoId,
                    snippet: buildUpdatedSnippet(item.snippet, item.newDescription),
                },
            });

            entry.updated = true;
            entry.error = null;
            console.log(`Updated ${item.videoId} | ${item.title}`);
        } catch (error) {
            entry.updated = false;
            entry.error = error instanceof Error ? error.message : String(error);
            console.error(`Failed ${item.videoId} | ${item.title}: ${entry.error}`);
        }
    }

    if (DRY_RUN) {
        console.log("Dry run completed. No update sent to YouTube.");
    }

    const updatedCount = logEntries.filter((entry) => entry.updated).length;
    const failedCount = logEntries.filter((entry) => !entry.updated && entry.error && !entry.error.startsWith("Skipped because")).length;
    const logPath = await writeLogFile(logEntries);

    console.log(`Updated videos: ${updatedCount}`);
    console.log(`Failed updates: ${failedCount}`);
    console.log(`Log written to ${logPath}`);
}

run().catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
