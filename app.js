const GAME_CONFIG = {
  2: { hand: 10, table: 12, draw: 20 },
  3: { hand: 7, table: 10, draw: 21 },
  4: { hand: 5, table: 12, draw: 20 },
};

const SUITS = [
  { key: "hearts", symbol: "\u2665", label: "红桃", red: true },
  { key: "diamonds", symbol: "\u2666", label: "方块", red: true },
  { key: "clubs", symbol: "\u2663", label: "梅花", red: false },
  { key: "spades", symbol: "\u2660", label: "黑桃", red: false },
];

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const TEN_RANKS = new Set(["10", "J", "Q", "K"]);
const VALUE_LABELS = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
};
const DICE_SYMBOLS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAtiIL6O85gozi1QvrcUyvKuuQWFGWWnTA",
  authDomain: "redpoint-rank.firebaseapp.com",
  projectId: "redpoint-rank",
  storageBucket: "redpoint-rank.firebasestorage.app",
  messagingSenderId: "342375707603",
  appId: "1:342375707603:web:4ef04713a34d3996b2f526",
};
const FIRESTORE_COLLECTIONS = {
  profiles: "profiles",
  gameIds: "gameIds",
  gameResults: "gameResults",
};

let firebaseApp = null;
let auth = null;
let db = null;

const ui = {
  heroSection: document.getElementById("hero-section"),
  setupPanel: document.getElementById("setup-panel"),
  gameLayout: document.getElementById("game-layout"),
  rulesTriggers: [...document.querySelectorAll(".rules-trigger")],
  rulesModal: document.getElementById("rules-modal"),
  rulesBackdrop: document.getElementById("rules-backdrop"),
  rulesClose: document.getElementById("rules-close"),
  rulesAck: document.getElementById("rules-ack"),
  playerCount: document.getElementById("player-count"),
  useDice: document.getElementById("use-dice"),
  authEmail: document.getElementById("auth-email"),
  authPassword: document.getElementById("auth-password"),
  authLogin: document.getElementById("auth-login"),
  authRegister: document.getElementById("auth-register"),
  authLogout: document.getElementById("auth-logout"),
  authStatus: document.getElementById("auth-status"),
  playerId: document.getElementById("player-id"),
  playerIdHint: document.getElementById("player-id-hint"),
  playerIdSelect: document.getElementById("player-id-select"),
  startGame: document.getElementById("start-game"),
  viewLastResult: document.getElementById("view-last-result"),
  restartGame: document.getElementById("restart-game"),
  restartRound: document.getElementById("restart-round"),
  backToSetup: document.getElementById("back-to-setup"),
  statusText: document.getElementById("status-text"),
  drawCount: document.getElementById("draw-count"),
  tableCount: document.getElementById("table-count"),
  tablePublicSlot: document.getElementById("table-public-slot"),
  selectionHint: document.getElementById("selection-hint"),
  feedbackBanner: document.getElementById("feedback-banner"),
  actionStage: document.getElementById("action-stage"),
  actionTitle: document.getElementById("action-title"),
  actionCopy: document.getElementById("action-copy"),
  actionCards: document.getElementById("action-cards"),
  drawPileVisual: document.getElementById("draw-pile-visual"),
  drawPileCount: document.getElementById("draw-pile-count"),
  drawPreview: document.getElementById("draw-preview"),
  drawPreviewText: document.getElementById("draw-preview-text"),
  drawPreviewCard: document.getElementById("draw-preview-card"),
  selectedCardDisplay: document.getElementById("selected-card-display"),
  selectedTableTotal: document.getElementById("selected-table-total"),
  ruleTargetText: document.getElementById("rule-target-text"),
  tableCards: document.getElementById("table-cards"),
  currentPlayerTitle: document.getElementById("current-player-title"),
  turnNote: document.getElementById("turn-note"),
  humanSummary: document.getElementById("human-summary"),
  handCards: document.getElementById("hand-cards"),
  confirmAction: document.getElementById("confirm-action"),
  discardAction: document.getElementById("discard-action"),
  clearSelection: document.getElementById("clear-selection"),
  logList: document.getElementById("log-list"),
  resultPanel: document.getElementById("result-panel"),
  resultGrid: document.getElementById("result-grid"),
  historyPanel: document.getElementById("history-panel"),
  historyGrid: document.getElementById("history-grid"),
  historyMeta: document.getElementById("history-meta"),
  playerStatsCard: document.getElementById("player-stats-card"),
  leaderboardList: document.getElementById("leaderboard-list"),
  passOverlay: document.getElementById("pass-overlay"),
  overlayTag: document.getElementById("overlay-tag"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayCopy: document.getElementById("overlay-copy"),
  overlayDetails: document.getElementById("overlay-details"),
  overlayButton: document.getElementById("overlay-button"),
  seatTopLeft: document.getElementById("seat-top-left"),
  seatTop: document.getElementById("seat-top"),
  seatTopRight: document.getElementById("seat-top-right"),
  seatLeft: document.getElementById("seat-left"),
  seatRight: document.getElementById("seat-right"),
  seatDiceLayer: document.getElementById("seat-dice-layer"),
  seatResultLayer: document.getElementById("seat-result-layer"),
};

const state = {
  phase: "setup",
  players: [],
  tableCards: [],
  drawPile: [],
  currentPlayerIndex: 0,
  pendingDrawCard: null,
  selectedHandCardId: null,
  selectedTable: new Set(),
  focusedTableIds: new Set(),
  feedback: null,
  log: [],
  diceSummary: [],
  actionDisplay: null,
  aiTimer: null,
  diceAnimation: null,
  diceInterval: null,
  diceTimeout: null,
  diceResultTimeout: null,
  openingStage: null,
  openingTimers: [],
  roundPlan: null,
  lastFinishedResult: null,
  lastFinishedAt: "",
  playerStats: {},
  currentPlayerId: "",
  authUser: null,
  authBusy: false,
  authReady: false,
  authStatusMessage: "正在连接 Firebase...",
  playerIdHintMessage: "",
  leaderboardLoaded: false,
  hasBoundGameId: false,
  gameIdEditable: true,
  renderCache: {
    humanSummary: "",
    humanHand: "",
    tableCards: "",
    drawPile: "",
    actionStage: "",
    log: "",
    results: "",
    history: "",
    playerStats: "",
    leaderboard: "",
    seats: {},
    seatDice: "",
    seatResults: "",
    seenCards: {
      hand: new Set(),
      table: new Set(),
      action: new Set(),
    },
  },
  rulesOpen: true,
  settings: {
    playerCount: 2,
    useDice: true,
  },
};

function init() {
  ui.rulesTriggers.forEach((button) => button.addEventListener("click", openRulesModal));
  ui.rulesBackdrop.addEventListener("click", closeRulesModal);
  ui.rulesClose.addEventListener("click", closeRulesModal);
  ui.rulesAck.addEventListener("click", closeRulesModal);
  ui.authLogin.addEventListener("click", handleAuthLogin);
  ui.authRegister.addEventListener("click", handleAuthRegister);
  ui.authLogout.addEventListener("click", handleAuthLogout);
  ui.playerId.addEventListener("input", handlePlayerIdInput);
  ui.startGame.addEventListener("click", async () => {
    await startGame(Number(ui.playerCount.value), ui.useDice.checked);
  });
  ui.viewLastResult.addEventListener("click", handleViewLastResult);
  ui.restartGame.addEventListener("click", () => {
    startGame(state.settings.playerCount, state.settings.useDice);
  });
  ui.restartRound.addEventListener("click", () => {
    startGame(state.settings.playerCount, state.settings.useDice);
  });
  ui.backToSetup.addEventListener("click", handleBackToSetup);
  ui.overlayButton.addEventListener("click", handleOverlayButton);
  ui.confirmAction.addEventListener("click", handleConfirmAction);
  ui.discardAction.addEventListener("click", handleDiscardAction);
  ui.clearSelection.addEventListener("click", clearSelection);
  document.addEventListener("keydown", handleKeyDown);

  const legacyIdLabel = ui.playerIdSelect?.closest("label");
  if (legacyIdLabel) {
    legacyIdLabel.classList.add("hidden");
  }
  const leaderboardTitle = document.querySelector(".leaderboard-block .compact-head h2");
  const leaderboardCopy = document.querySelector(".leaderboard-block .compact-head p");
  if (leaderboardTitle) {
    leaderboardTitle.textContent = "云端排行榜";
  }
  if (leaderboardCopy) {
    leaderboardCopy.textContent = "按累计积分、胜场、局数排序，不同电脑和手机会共用同一份榜单。";
  }

  state.playerIdHintMessage = "先登录或注册账号，再创建全局唯一的游戏 ID。";
  renderAuthControls();
  render();
  initFirebase();
}

function handleKeyDown(event) {
  if (event.key === "Escape" && state.rulesOpen) {
    closeRulesModal();
  }
}

function openRulesModal() {
  state.rulesOpen = true;
  renderRulesModal();
}

function closeRulesModal() {
  state.rulesOpen = false;
  renderRulesModal();
}

function normalizePlayerId(value) {
  return value.replace(/\s+/g, " ").trim().slice(0, 20);
}

function getSortedPlayerStats() {
  return Object.values(state.playerStats)
    .sort((a, b) =>
      b.totalScore - a.totalScore
      || b.wins - a.wins
      || b.rounds - a.rounds
      || a.id.localeCompare(b.id, "zh-CN"),
    );
}

function ensurePlayerProfile(playerId) {
  if (!state.playerStats[playerId]) {
    state.playerStats[playerId] = {
      id: playerId,
      rounds: 0,
      wins: 0,
      totalScore: 0,
      bestScore: 0,
      lastScore: 0,
    };
  }
  return state.playerStats[playerId];
}

function hydratePlayerIdControls() {
  const sorted = getSortedPlayerStats();
  ui.playerIdSelect.innerHTML = '<option value="">选择已有 ID</option>';
  sorted.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.id} · ${item.totalScore} 分`;
    ui.playerIdSelect.appendChild(option);
  });

  ui.playerId.value = state.currentPlayerId || "";
  ui.playerIdSelect.value = state.currentPlayerId && state.playerStats[state.currentPlayerId]
    ? state.currentPlayerId
    : "";
}

function handlePlayerIdSelect() {
  if (!ui.playerIdSelect.value) {
    return;
  }
  state.currentPlayerId = ui.playerIdSelect.value;
  ui.playerId.value = state.currentPlayerId;
  localStorage.setItem(LAST_PLAYER_ID_STORAGE_KEY, state.currentPlayerId);
  render();
}

function handlePlayerIdInput() {
  state.currentPlayerId = normalizePlayerId(ui.playerId.value);
  render();
}

function prepareCurrentPlayerProfile() {
  const playerId = normalizePlayerId(ui.playerId.value || state.currentPlayerId || "");
  if (!playerId) {
    ui.playerIdHint.textContent = "请先输入一个游戏 ID，再开始对局。";
    return false;
  }

  state.currentPlayerId = playerId;
  ui.playerId.value = playerId;
  ensurePlayerProfile(playerId);
  savePlayerStats();
  localStorage.setItem(LAST_PLAYER_ID_STORAGE_KEY, playerId);
  hydratePlayerIdControls();
  ui.playerIdHint.textContent = "同一浏览器内可累计战绩和排行。";
  return true;
}

function getPlayerProfileDefaults(playerId = "", uid = "") {
  return {
    id: playerId,
    uid,
    rounds: 0,
    wins: 0,
    totalScore: 0,
    bestScore: 0,
    lastScore: 0,
  };
}

function profileFromData(uid, data = {}) {
  return {
    ...getPlayerProfileDefaults(data.gameId || "", uid),
    rounds: Number(data.rounds || 0),
    wins: Number(data.wins || 0),
    totalScore: Number(data.totalScore || 0),
    bestScore: Number(data.bestScore || 0),
    lastScore: Number(data.lastScore || 0),
  };
}

function upsertPlayerProfile(profile) {
  if (!profile?.id) {
    return;
  }

  state.playerStats = {
    ...state.playerStats,
    [profile.id]: profile,
  };
}

function maskEmail(email) {
  if (!email || !email.includes("@")) {
    return "已登录账号";
  }

  const [name, domain] = email.split("@");
  const safeName = name.length <= 2
    ? `${name[0] || "*"}*`
    : `${name.slice(0, 2)}***`;
  return `${safeName}@${domain}`;
}

function getDefaultPlayerIdHint() {
  if (!state.authUser) {
    return "先登录或注册账号，再创建全局唯一的游戏 ID。";
  }
  if (state.hasBoundGameId && state.currentPlayerId) {
    if (state.gameIdEditable) {
      return `当前账号暂时绑定了 ID：${state.currentPlayerId}。因为还没产生正式战绩，你现在仍然可以改成别的 ID。`;
    }
    return `当前账号已绑定唯一 ID：${state.currentPlayerId}`;
  }
  return "首次开始游戏时，会创建这个唯一 ID；创建后不能与别人重复，也不能再次修改。";
}

function renderAuthControls() {
  const signedIn = Boolean(state.authUser);
  const lockedId = signedIn && state.hasBoundGameId && !state.gameIdEditable;

  ui.authEmail.disabled = state.authBusy || signedIn;
  ui.authPassword.disabled = state.authBusy || signedIn;
  ui.authLogin.disabled = state.authBusy || signedIn || !auth;
  ui.authRegister.disabled = state.authBusy || signedIn || !auth;
  ui.authLogout.disabled = state.authBusy || !signedIn;
  ui.startGame.disabled = state.authBusy || !signedIn || !state.authReady;
  ui.playerId.disabled = state.authBusy || !signedIn || lockedId;
  ui.authStatus.textContent = state.authStatusMessage;
  ui.playerId.value = state.currentPlayerId || ui.playerId.value;
  ui.playerIdHint.textContent = state.playerIdHintMessage || getDefaultPlayerIdHint();
}

function formatAuthError(error) {
  const code = error?.code || "";
  if (code === "auth/invalid-email") {
    return "邮箱格式不正确。";
  }
  if (code === "auth/missing-password" || code === "auth/weak-password") {
    return "密码至少需要 6 位。";
  }
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "账号不存在，或邮箱/密码不匹配。";
  }
  if (code === "auth/email-already-in-use") {
    return "这个邮箱已经注册，请直接登录。";
  }
  if (code === "auth/too-many-requests") {
    return "尝试次数过多，请稍后再试。";
  }
  return error?.message || "出现了一点问题，请稍后再试。";
}

async function initFirebase() {
  if (!window.firebase) {
    state.authReady = true;
    state.authStatusMessage = "Firebase SDK 加载失败，请检查网络或刷新页面。";
    renderAuthControls();
    render();
    return;
  }

  try {
    firebaseApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    state.authStatusMessage = "Firebase 已连接，正在读取账号状态...";
    renderAuthControls();
    render();

    await loadLeaderboard();

    auth.onAuthStateChanged(async (user) => {
      state.authUser = user;
      state.authReady = true;

      if (user) {
        state.authStatusMessage = `已登录：${maskEmail(user.email)}`;
        await loadCurrentUserProfile();
      } else {
        state.currentPlayerId = "";
        state.hasBoundGameId = false;
        state.gameIdEditable = true;
        state.playerIdHintMessage = "先登录或注册账号，再创建全局唯一的游戏 ID。";
        ui.playerId.value = "";
        ui.authPassword.value = "";
        state.authStatusMessage = "还没有登录账号。";
      }

      await loadLeaderboard();
      renderAuthControls();
      render();
    });
  } catch (error) {
    state.authReady = true;
    state.authStatusMessage = `Firebase 初始化失败：${formatAuthError(error)}`;
    renderAuthControls();
    render();
  }
}

function getAuthFormCredentials() {
  const email = ui.authEmail.value.trim();
  const password = ui.authPassword.value;

  if (!auth) {
    state.authStatusMessage = "Firebase 还没准备好，请稍等一下再操作。";
    renderAuthControls();
    render();
    return null;
  }

  if (!email || !password) {
    state.authStatusMessage = "先输入邮箱和密码，再进行登录或注册。";
    renderAuthControls();
    render();
    return null;
  }

  return { email, password };
}

async function handleAuthLogin() {
  const credentials = getAuthFormCredentials();
  if (!credentials) {
    return;
  }

  const { email, password } = credentials;
  state.authBusy = true;
  state.authStatusMessage = "正在登录账号...";
  renderAuthControls();
  render();

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    state.authStatusMessage = formatAuthError(error);
  } finally {
    state.authBusy = false;
    renderAuthControls();
    render();
  }
}

async function handleAuthRegister() {
  const credentials = getAuthFormCredentials();
  if (!credentials) {
    return;
  }

  const { email, password } = credentials;
  state.authBusy = true;
  state.authStatusMessage = "正在注册账号...";
  renderAuthControls();
  render();

  try {
    await auth.createUserWithEmailAndPassword(email, password);
  } catch (error) {
    state.authStatusMessage = formatAuthError(error);
  } finally {
    state.authBusy = false;
    renderAuthControls();
    render();
  }
}

async function handleAuthLogout() {
  if (!auth || !state.authUser) {
    return;
  }

  state.authBusy = true;
  state.authStatusMessage = "正在退出登录...";
  renderAuthControls();
  render();

  try {
    await auth.signOut();
  } catch (error) {
    state.authStatusMessage = formatAuthError(error);
  } finally {
    state.authBusy = false;
    renderAuthControls();
    render();
  }
}

async function loadLeaderboard() {
  if (!db) {
    return;
  }

  try {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.profiles).get();
    const nextStats = {};
    snapshot.forEach((doc) => {
      const profile = profileFromData(doc.id, doc.data());
      if (profile.id) {
        nextStats[profile.id] = profile;
      }
    });
    state.playerStats = nextStats;
    state.leaderboardLoaded = true;
  } catch (error) {
    state.authStatusMessage = `读取排行榜失败：${formatAuthError(error)}`;
  }
}

async function loadCurrentUserProfile() {
  if (!db || !state.authUser) {
    return null;
  }

  try {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid).get();
    if (!snapshot.exists) {
      state.currentPlayerId = normalizePlayerId(ui.playerId.value || "");
      state.hasBoundGameId = false;
      state.gameIdEditable = true;
      state.playerIdHintMessage = getDefaultPlayerIdHint();
      return null;
    }

    const profile = profileFromData(snapshot.id, snapshot.data());
    state.currentPlayerId = profile.id;
    state.hasBoundGameId = Boolean(profile.id);
    state.gameIdEditable = Number(profile.rounds || 0) === 0;
    ui.playerId.value = profile.id;
    state.playerIdHintMessage = getDefaultPlayerIdHint();
    upsertPlayerProfile(profile);
    return profile;
  } catch (error) {
    state.authStatusMessage = `读取账号资料失败：${formatAuthError(error)}`;
    return null;
  }
}

async function prepareCurrentPlayerProfile() {
  if (!state.authReady || !db || !auth) {
    state.authStatusMessage = "Firebase 还没准备好，请稍等一下再开始。";
    renderAuthControls();
    return false;
  }

  if (!state.authUser) {
    state.authStatusMessage = "请先登录或注册账号。";
    renderAuthControls();
    return false;
  }

  const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
  const desiredPlayerId = normalizePlayerId(ui.playerId.value || state.currentPlayerId || "");

  try {
    const existingProfile = await profileRef.get();
    if (existingProfile.exists && existingProfile.data()?.gameId) {
      const profile = profileFromData(existingProfile.id, existingProfile.data());
      const canReplace = Number(profile.rounds || 0) === 0;
      state.hasBoundGameId = Boolean(profile.id);
      state.gameIdEditable = canReplace;

      if (!desiredPlayerId || desiredPlayerId === profile.id) {
        state.currentPlayerId = profile.id;
        ui.playerId.value = profile.id;
        state.playerIdHintMessage = getDefaultPlayerIdHint();
        upsertPlayerProfile(profile);
        renderAuthControls();
        return true;
      }

      if (!canReplace) {
        state.currentPlayerId = profile.id;
        ui.playerId.value = profile.id;
        state.playerIdHintMessage = "这个账号已经产生正式战绩，游戏 ID 不能再修改了。";
        upsertPlayerProfile(profile);
        renderAuthControls();
        return true;
      }
    }
  } catch (error) {
    state.authStatusMessage = `检查游戏 ID 失败：${formatAuthError(error)}`;
    renderAuthControls();
    return false;
  }

  const playerId = desiredPlayerId;
  if (!playerId) {
    state.playerIdHintMessage = "请输入你想创建的游戏 ID，再开始本局。";
    renderAuthControls();
    return false;
  }

  const normalizedId = playerId.toLowerCase();
  let createdProfile = null;

  state.authBusy = true;
  state.playerIdHintMessage = "正在检查这个游戏 ID 是否可用...";
  renderAuthControls();
  render();

  try {
    await db.runTransaction(async (transaction) => {
      const currentProfile = await transaction.get(profileRef);
      const existingData = currentProfile.exists ? currentProfile.data() : {};
      const previousGameId = existingData?.gameId || "";
      const previousNormalized = previousGameId ? String(previousGameId).toLowerCase() : "";
      const canReplace = !previousGameId || Number(existingData?.rounds || 0) === 0;
      if (previousGameId && !canReplace) {
        createdProfile = profileFromData(currentProfile.id, existingData);
        return;
      }
      const gameIdRef = db.collection(FIRESTORE_COLLECTIONS.gameIds).doc(normalizedId);
      const gameIdSnapshot = await transaction.get(gameIdRef);
      if (gameIdSnapshot.exists && gameIdSnapshot.data()?.uid !== state.authUser.uid) {
        throw new Error("GAME_ID_TAKEN");
      }
      if (previousNormalized && previousNormalized !== normalizedId) {
        const previousGameIdRef = db.collection(FIRESTORE_COLLECTIONS.gameIds).doc(previousNormalized);
        transaction.delete(previousGameIdRef);
      }

      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const payload = {
        uid: state.authUser.uid,
        gameId: playerId,
        gameIdNormalized: normalizedId,
        rounds: 0,
        wins: 0,
        totalScore: 0,
        bestScore: 0,
        lastScore: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      transaction.set(profileRef, payload, { merge: true });
      transaction.set(gameIdRef, {
        uid: state.authUser.uid,
        gameId: playerId,
        createdAt: timestamp,
      });
      createdProfile = profileFromData(state.authUser.uid, payload);
    });

    if (createdProfile) {
      state.currentPlayerId = createdProfile.id;
      state.hasBoundGameId = Boolean(createdProfile.id);
      state.gameIdEditable = Number(createdProfile.rounds || 0) === 0;
      ui.playerId.value = createdProfile.id;
      state.playerIdHintMessage = getDefaultPlayerIdHint();
      upsertPlayerProfile(createdProfile);
    }

    await loadLeaderboard();
    renderAuthControls();
    return true;
  } catch (error) {
    state.playerIdHintMessage = error?.message === "GAME_ID_TAKEN"
      ? "这个游戏 ID 已经被别人用了，换一个新的再试。"
      : `创建游戏 ID 失败：${formatAuthError(error)}`;
    renderAuthControls();
    return false;
  } finally {
    state.authBusy = false;
    renderAuthControls();
    render();
  }
}

function clearAiTimer() {
  if (state.aiTimer) {
    clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }
}

function clearDiceTimers() {
  if (state.diceInterval) {
    clearInterval(state.diceInterval);
    state.diceInterval = null;
  }
  if (state.diceTimeout) {
    clearTimeout(state.diceTimeout);
    state.diceTimeout = null;
  }
  if (state.diceResultTimeout) {
    clearTimeout(state.diceResultTimeout);
    state.diceResultTimeout = null;
  }
}

function clearOpeningTimers() {
  state.openingTimers.forEach((timer) => clearTimeout(timer));
  state.openingTimers = [];
}

function scheduleOpeningStep(callback, delay) {
  const timer = setTimeout(() => {
    state.openingTimers = state.openingTimers.filter((item) => item !== timer);
    callback();
  }, delay);
  state.openingTimers.push(timer);
}

function clearAllRoundTimers() {
  clearAiTimer();
  clearDiceTimers();
  clearOpeningTimers();
}

function handleBackToSetup() {
  returnToSetup();
  if (state.lastFinishedResult) {
    setTimeout(() => {
      ui.historyPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }
}

function handleViewLastResult() {
  if (!state.lastFinishedResult) {
    return;
  }
  ui.historyPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function returnToSetup() {
  clearAllRoundTimers();
  state.phase = "setup";
  state.pendingDrawCard = null;
  state.selectedHandCardId = null;
  state.selectedTable = new Set();
  state.focusedTableIds = new Set();
  state.feedback = null;
  state.actionDisplay = null;
  state.diceAnimation = null;
  state.openingStage = null;
  state.roundPlan = null;
  render();
}

function scheduleAiStep(callback, delay = 900) {
  clearAiTimer();
  state.aiTimer = setTimeout(() => {
    state.aiTimer = null;
    callback();
  }, delay);
}

function buildRoundPlan(playerCount, useDice) {
  const config = GAME_CONFIG[playerCount];
  const deck = shuffle(createDeck());
  const players = Array.from({ length: playerCount }, (_, index) => ({
    id: `p-${index + 1}`,
    name: `玩家 ${index + 1}`,
    isHuman: index === 0,
    hand: deck.splice(0, config.hand),
    captured: [],
    diceTrail: [],
    lastAction: null,
  }));

  let orderedPlayers = players;
  const setupLog = [
    `开始新对局，${playerCount} 人模式。`,
    `每人手牌 ${config.hand} 张，台面 ${config.table} 张，牌堆 ${config.draw} 张。`,
  ];

  if (useDice) {
    const diceResult = resolveTurnOrder(players);
    orderedPlayers = diceResult.order.map((index) => players[index]);
    state.diceSummary = diceResult.summary;
    setupLog.push(...diceResult.notes);
  } else {
    state.diceSummary = [];
    setupLog.push("未启用摇骰子，按默认座次开始。");
  }

  return {
    players: orderedPlayers,
    tableCards: deck.splice(0, config.table),
    drawPile: deck.splice(0, config.draw),
    setupLog,
  };
}

function startGameRound(playerCount, useDice) {
  clearAllRoundTimers();
  const roundPlan = buildRoundPlan(playerCount, useDice);

  state.phase = useDice ? "dice-rolling" : "opening-deal";
  state.players = roundPlan.players.map((player) => ({
    ...player,
    hand: [],
    captured: [],
    lastAction: null,
  }));
  state.roundPlan = {
    playerHands: Object.fromEntries(roundPlan.players.map((player) => [player.id, [...player.hand]])),
    tableCards: [...roundPlan.tableCards],
    drawPile: [...roundPlan.drawPile],
  };
  state.tableCards = [];
  state.drawPile = [];
  state.currentPlayerIndex = 0;
  state.pendingDrawCard = null;
  state.selectedHandCardId = null;
  state.selectedTable = new Set();
  state.focusedTableIds = new Set();
  state.feedback = null;
  state.log = [];
  state.actionDisplay = null;
  state.diceAnimation = null;
  state.openingStage = null;
  state.renderCache = {
    humanSummary: "",
    humanHand: "",
    tableCards: "",
    drawPile: "",
    actionStage: "",
    log: "",
    results: "",
    history: "",
    seats: {},
    seatDice: "",
    seatResults: "",
    seenCards: {
      hand: new Set(),
      table: new Set(),
      action: new Set(),
    },
  };
  state.settings = { playerCount, useDice };

  roundPlan.players.forEach((player, index) => {
    pushLog(`${index + 1} 号位：${player.name}${player.isHuman ? "（你）" : "（电脑）"}`);
  });
  roundPlan.setupLog.reverse().forEach((entry) => pushLog(entry));

  hideOverlay();
  render();

  if (useDice) {
    setActionDisplay({
      playerId: "dice",
      playerName: "开局阶段",
      text: "所有玩家正在摇骰子决定先手",
      cards: [],
      tone: "draw",
    });
    setFeedback("摇骰子中，牌还没有发出，请先看各座位前的骰子。", "info");
    render();
    startDiceSequence();
    return;
  }

  startOpeningSequence();
}

async function startGame(playerCount, useDice) {
  if (!(await prepareCurrentPlayerProfile())) {
    render();
    return;
  }
  startGameRound(playerCount, useDice);
  return;
  clearAiTimer();
  clearDiceTimers();
  const config = GAME_CONFIG[playerCount];
  const deck = shuffle(createDeck());
  const players = Array.from({ length: playerCount }, (_, index) => ({
    id: `p-${index + 1}`,
    name: `玩家 ${index + 1}`,
    isHuman: index === 0,
    hand: deck.splice(0, config.hand),
    captured: [],
    diceTrail: [],
    lastAction: null,
  }));

  let orderedPlayers = players;
  const setupLog = [
    `开始新对局：${playerCount} 人模式。`,
    `每人手牌 ${config.hand} 张，台面亮 ${config.table} 张，牌堆 ${config.draw} 张。`,
  ];

  if (useDice) {
    const diceResult = resolveTurnOrder(players);
    orderedPlayers = diceResult.order.map((index) => players[index]);
    state.diceSummary = diceResult.summary;
    setupLog.push(...diceResult.notes);
  } else {
    state.diceSummary = [];
    setupLog.push("未启用摇骰子，按默认座次开始。");
  }

  state.phase = useDice ? "dice" : "human-turn";
  state.players = orderedPlayers;
  state.tableCards = deck.splice(0, config.table);
  state.drawPile = deck.splice(0, config.draw);
  state.currentPlayerIndex = 0;
  state.pendingDrawCard = null;
  state.selectedHandCardId = null;
  state.selectedTable = new Set();
  state.focusedTableIds = new Set();
  state.feedback = null;
  state.log = [];
  state.actionDisplay = null;
  state.aiTimer = null;
  state.diceAnimation = null;
  state.diceInterval = null;
  state.diceTimeout = null;
  state.diceResultTimeout = null;
  state.renderCache = {
    humanSummary: "",
    humanHand: "",
    tableCards: "",
    drawPile: "",
    actionStage: "",
    log: "",
    results: "",
    seats: {},
    seatDice: "",
    seatResults: "",
    seenCards: {
      hand: new Set(),
      table: new Set(),
      action: new Set(),
    },
  };
  state.settings = { playerCount, useDice };

  orderedPlayers.forEach((player, index) => {
    pushLog(`${index + 1} 号位：${player.name}${player.isHuman ? "（你）" : "（电脑）"}`);
  });
  setupLog.reverse().forEach((entry) => pushLog(entry));

  ui.setupPanel.classList.add("hidden");
  ui.gameLayout.classList.remove("hidden");

  if (useDice) {
    hideOverlay();
    state.phase = "dice-rolling";
    setActionDisplay({
      playerId: "dice",
      playerName: "开局阶段",
      text: "所有玩家正在摇骰子决定先手",
      cards: [],
      tone: "draw",
    });
    setFeedback("摇骰子中，请观察各玩家位置前的骰子。", "info");
    render();
    startDiceSequence();
  } else {
    hideOverlay();
    beginCurrentTurn();
    render();
  }
}

function createDeck() {
  let serial = 0;
  const deck = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `c-${serial}`,
        suit: suit.key,
        rank,
        playValue: getPlayValue(rank),
        scoreValue: getScoreValue(rank),
      });
      serial += 1;
    }
  }

  return deck;
}

function shuffle(deck) {
  const clone = [...deck];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function getPlayValue(rank) {
  if (rank === "A") {
    return 1;
  }
  if (TEN_RANKS.has(rank)) {
    return 10;
  }
  return Number(rank);
}

function getScoreValue(rank) {
  if (rank === "A") {
    return 10;
  }
  if (TEN_RANKS.has(rank)) {
    return 10;
  }
  return Number(rank);
}

function resolveTurnOrder(players) {
  const notes = [];
  const ranked = rankByDice(players.map((_, index) => index), players, notes);
  notes.push(`最终先手：${players[ranked[0]].name}`);

  return {
    order: ranked,
    notes,
    summary: ranked.map((index, orderIndex) => ({
      id: players[index].id,
      name: players[index].name,
      order: orderIndex + 1,
      finalRoll: players[index].diceTrail.at(-1) || 0,
      rolls: [...players[index].diceTrail],
    })),
  };
}

function rankByDice(indices, players, notes) {
  const rolls = indices.map((index) => ({
    index,
    roll: randomDice(),
  }));
  const grouped = new Map();

  rolls.forEach((item) => {
    players[item.index].diceTrail.push(item.roll);
  });

  rolls.forEach((item) => {
    if (!grouped.has(item.roll)) {
      grouped.set(item.roll, []);
    }
    grouped.get(item.roll).push(item.index);
  });

  const orderedRolls = [...grouped.keys()].sort((a, b) => b - a);
  const orderedIndices = [];

  orderedRolls.forEach((roll) => {
    const group = grouped.get(roll);
    notes.push(`${group.map((index) => players[index].name).join("、")} 掷出 ${roll} 点。`);
    if (group.length === 1) {
      orderedIndices.push(group[0]);
      return;
    }

    notes.push(`${group.map((index) => players[index].name).join("、")} 同点，重新摇骰决定顺序。`);
    orderedIndices.push(...rankByDice(group, players, notes));
  });

  return orderedIndices;
}

function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function startDiceSequence() {
  const faces = {};
  state.players.forEach((player) => {
    faces[player.id] = randomDice();
  });

  state.diceAnimation = {
    stage: "rolling",
    faces,
  };

  state.diceInterval = setInterval(() => {
    const nextFaces = {};
    state.players.forEach((player) => {
      nextFaces[player.id] = randomDice();
    });
    state.diceAnimation = {
      stage: "rolling",
      faces: nextFaces,
    };
    render();
  }, 120);

  state.diceTimeout = setTimeout(() => {
    clearInterval(state.diceInterval);
    state.diceInterval = null;

    const finalFaces = {};
    state.diceSummary.forEach((item) => {
      finalFaces[item.id] = item.finalRoll;
    });

    state.diceAnimation = {
      stage: "result",
      faces: finalFaces,
    };
    state.phase = "dice-result";
    const firstPlayer = getCurrentPlayer();
    setActionDisplay({
      playerId: "dice",
      playerName: "摇骰子结果",
      text: `${firstPlayer.name}${firstPlayer.isHuman ? "（你）" : ""} 先手`,
      cards: [],
      tone: "collect",
    });
    setFeedback(`摇骰子结束，${firstPlayer.name}${firstPlayer.isHuman ? "（你）" : ""} 先手。`, "info");
    render();

    state.diceResultTimeout = setTimeout(() => {
      state.diceAnimation = null;
      startOpeningSequence();
    }, 2200);
  }, 3200);
}

function startOpeningSequence() {
  if (!state.roundPlan) {
    beginCurrentTurn();
    return;
  }

  clearOpeningTimers();
  state.phase = "opening-deal";
  state.openingStage = "deal-hands";
  state.tableCards = [];
  state.drawPile = [];
  state.pendingDrawCard = null;
  clearSelection(false);
  clearFocusedTargets();
  setActionDisplay({
    playerId: "setup",
    playerName: "开局发牌",
    text: "正在给每位玩家发手牌",
    cards: [],
    tone: "draw",
  });
  setFeedback("骰子结束，开始发手牌。", "info");
  render();

  const maxHand = Math.max(...state.players.map((player) => state.roundPlan.playerHands[player.id]?.length || 0), 0);
  let elapsed = 120;

  for (let roundIndex = 0; roundIndex < maxHand; roundIndex += 1) {
    state.players.forEach((player) => {
      const nextCard = state.roundPlan.playerHands[player.id]?.[roundIndex];
      if (!nextCard) {
        return;
      }
      scheduleOpeningStep(() => {
        player.hand.push(nextCard);
        render();
      }, elapsed);
      elapsed += 120;
    });
  }

  scheduleOpeningStep(() => {
    state.openingStage = "reveal-table";
    setActionDisplay({
      playerId: "setup",
      playerName: "开局发牌",
      text: "正在逐张翻开桌面公共牌",
      cards: [],
      tone: "reveal",
    });
    setFeedback("手牌发完了，正在翻开桌面公共牌。", "info");
    render();
  }, elapsed);
  elapsed += 180;

  state.roundPlan.tableCards.forEach((card) => {
    scheduleOpeningStep(() => {
      state.tableCards.push(card);
      render();
    }, elapsed);
    elapsed += 130;
  });

  scheduleOpeningStep(() => {
    state.drawPile = [...state.roundPlan.drawPile];
    state.roundPlan = null;
    state.openingStage = null;
    setFeedback("发牌完成，准备进入首回合。", "info");
    render();
    beginCurrentTurn();
  }, elapsed + 120);
}

function handleOverlayButton() {
  if (state.phase === "game-over") {
    hideOverlay();
    return;
  }
}

function showOverlay(tag, title, copy, buttonText = "继续", detailsHtml = "") {
  ui.overlayTag.textContent = tag;
  ui.overlayTitle.textContent = title;
  ui.overlayCopy.textContent = copy;
  ui.overlayButton.textContent = buttonText;

  if (detailsHtml) {
    ui.overlayDetails.innerHTML = detailsHtml;
    ui.overlayDetails.classList.remove("hidden");
  } else {
    ui.overlayDetails.innerHTML = "";
    ui.overlayDetails.classList.add("hidden");
  }

  ui.passOverlay.classList.remove("hidden");
}

function hideOverlay() {
  ui.passOverlay.classList.add("hidden");
}

function renderDiceSummaryHtml() {
  if (!state.diceSummary.length) {
    return "";
  }

  const items = state.diceSummary.map((item, index) => `
    <div class="dice-result-item${index === 0 ? " top" : ""}">
      <div>
        <div class="dice-name">第 ${item.order} 位：${item.name}</div>
        <div>${item.rolls.join(" → ")}${item.rolls.length > 1 ? "（含重摇）" : ""}</div>
      </div>
      <div class="dice-roll">${item.finalRoll}</div>
    </div>
  `).join("");

  return `<div class="dice-result-list">${items}</div>`;
}

function getCurrentPlayer() {
  return state.players[state.currentPlayerIndex];
}

function beginCurrentTurn() {
  clearAiTimer();
  clearFocusedTargets();
  clearSelection(false);

  const player = getCurrentPlayer();
  if (!player) {
    return;
  }

  if (player.isHuman) {
    state.phase = "human-turn";
    setFeedback("轮到你了，先选一张手牌，再决定钓牌还是弃到台面。", "info");
    render();
    return;
  }

  state.phase = "ai-turn";
  setFeedback(`${player.name} 正在思考出牌...`, "info");
  render();
  scheduleAiStep(runAiTurn, 900);
}

function runAiTurn() {
  const player = getCurrentPlayer();
  if (!player || player.isHuman || state.phase === "game-over") {
    return;
  }

  if (state.pendingDrawCard) {
    stageAiDrawTurn(player);
    return;
  }

  const move = chooseBestHandMove(player);
  stageAiHandTurn(player, move);
}

function stageAiHandTurn(player, move) {
  setActionDisplay({
    playerId: player.id,
    playerName: player.name,
    text: move.kind === "capture" ? "打出一张牌，准备钓桌面" : "打出一张牌，准备弃到桌面",
    cards: [move.card],
    tone: "reveal",
  });
  updateLastAction(player, move.kind === "capture" ? "准备钓牌" : "准备弃牌", [move.card]);
  setFeedback(`${player.name} 已经亮出一张牌。`, "info");
  render();

  scheduleAiStep(() => {
    if (move.kind === "capture") {
      focusTargets(move.targets);
      setActionDisplay({
        playerId: player.id,
        playerName: player.name,
        text: `正在瞄准 ${move.targets.map(cardLabel).join("、")}`,
        cards: [move.card, ...move.targets],
        tone: "aim",
      });
      setFeedback(`${player.name} 正在瞄准桌上的目标牌。`, "info");
      render();
      scheduleAiStep(() => {
        const resolution = resolveCapture(move.card, move.targets);
        if (resolution.success) {
          captureHandCard(player, move.card, move.targets, resolution, false);
          return;
        }
        discardHandCard(player, move.card, false);
      }, 1200);
      return;
    }

    setActionDisplay({
      playerId: player.id,
      playerName: player.name,
      text: `决定放下 ${cardLabel(move.card)}`,
      cards: [move.card],
      tone: "discard",
    });
    setFeedback(`${player.name} 决定放弃这次钓牌。`, "info");
    render();
    scheduleAiStep(() => discardHandCard(player, move.card, false), 1100);
  }, 1200);
}

function stageAiDrawTurn(player) {
  const drawCard = state.pendingDrawCard;
  setActionDisplay({
    playerId: player.id,
    playerName: player.name,
    text: `摸到 ${cardLabel(drawCard)}，正在判断是否补枪`,
    cards: [drawCard],
    tone: "draw",
  });
  updateLastAction(player, "摸牌补枪", [drawCard]);
  render();

  scheduleAiStep(() => {
    const move = chooseBestCaptureMove(drawCard);
    if (!move) {
      setActionDisplay({
        playerId: player.id,
        playerName: player.name,
        text: `决定把 ${cardLabel(drawCard)} 放到桌面`,
        cards: [drawCard],
        tone: "discard",
      });
      setFeedback(`${player.name} 觉得这张摸牌补不上。`, "info");
      render();
      scheduleAiStep(() => discardPendingDrawCard(player, false), 1100);
      return;
    }

    focusTargets(move.targets);
    setActionDisplay({
      playerId: player.id,
      playerName: player.name,
      text: `补枪目标：${move.targets.map(cardLabel).join("、")}`,
      cards: [drawCard, ...move.targets],
      tone: "aim",
    });
    setFeedback(`${player.name} 准备用摸牌补枪。`, "info");
    render();
    scheduleAiStep(() => {
      const resolution = resolveCapture(drawCard, move.targets);
      if (resolution.success) {
        capturePendingDraw(player, move.targets, resolution, false);
        return;
      }
      discardPendingDrawCard(player, false);
    }, 1200);
  }, 1200);
}

function chooseBestHandMove(player) {
  let bestMove = null;

  player.hand.forEach((card) => {
    const move = chooseBestCaptureMove(card);
    if (!move) {
      return;
    }

    if (!bestMove || move.score > bestMove.score) {
      bestMove = {
        kind: "capture",
        card,
        targets: move.targets,
        score: move.score,
      };
    }
  });

  if (bestMove) {
    return bestMove;
  }

  return {
    kind: "discard",
    card: chooseDiscardCard(player.hand),
    targets: [],
    score: -1,
  };
}

function chooseBestCaptureMove(sourceCard) {
  const candidates = [];
  const sameRankCards = state.tableCards.filter((card) => card.rank === sourceCard.rank);

  if (sameRankCards.length >= 3) {
    const targets = sameRankCards.slice(0, 3);
    candidates.push({
      targets,
      score: scoreMove(sourceCard, targets, true),
    });
  }

  state.tableCards.forEach((targetCard) => {
    if (canCapturePair(sourceCard, targetCard)) {
      candidates.push({
        targets: [targetCard],
        score: scoreMove(sourceCard, [targetCard], false),
      });
    }
  });

  if (!candidates.length) {
    return null;
  }

  return candidates.sort((a, b) => b.score - a.score)[0];
}

function scoreMove(sourceCard, targets, isTriple) {
  const cards = [sourceCard, ...targets];
  const redScore = cards.reduce((sum, card) => sum + (isRedCard(card) ? card.scoreValue : 0), 0);
  const rawScore = cards.reduce((sum, card) => sum + card.scoreValue, 0);
  return redScore * 10 + rawScore + (isTriple ? 12 : 0);
}

function chooseDiscardCard(cards) {
  return [...cards].sort((a, b) => {
    const aPenalty = (isRedCard(a) ? 100 : 0) + a.scoreValue;
    const bPenalty = (isRedCard(b) ? 100 : 0) + b.scoreValue;
    return aPenalty - bPenalty;
  })[0];
}

function handleConfirmAction() {
  const player = getCurrentPlayer();
  if (!player || !player.isHuman || state.phase !== "human-turn") {
    return;
  }

  const sourceCard = getSelectedSourceCard();
  if (!sourceCard) {
    setFeedback("请先选择当前要出的手牌。", "error");
    render();
    return;
  }

  const selectedTableCards = getSelectedTableCards();
  if (selectedTableCards.length === 0) {
    setFeedback("请先选择要钓的台面牌；如果不打算钓，请点“弃到台面”。", "error");
    render();
    return;
  }

  const resolution = resolveCapture(sourceCard, selectedTableCards);
  if (!resolution.success) {
    setFeedback(resolution.message, "error");
    render();
    return;
  }

  if (state.pendingDrawCard) {
    capturePendingDraw(player, selectedTableCards, resolution, true);
    return;
  }

  captureHandCard(player, sourceCard, selectedTableCards, resolution, true);
}

function handleDiscardAction() {
  const player = getCurrentPlayer();
  if (!player || !player.isHuman || state.phase !== "human-turn") {
    return;
  }

  if (state.pendingDrawCard) {
    discardPendingDrawCard(player, true);
    return;
  }

  const sourceCard = getSelectedSourceCard();
  if (!sourceCard) {
    setFeedback("请先选择一张准备弃到台面的手牌。", "error");
    render();
    return;
  }

  discardHandCard(player, sourceCard, true);
}

function getSelectedSourceCard() {
  if (state.pendingDrawCard) {
    return state.pendingDrawCard;
  }

  const player = getCurrentPlayer();
  return player.hand.find((card) => card.id === state.selectedHandCardId) || null;
}

function captureHandCard(player, sourceCard, targets, resolution, fromHuman) {
  const cardIndex = player.hand.findIndex((card) => card.id === sourceCard.id);
  if (cardIndex === -1) {
    setFeedback("未找到这张手牌，已重置选择。", "error");
    clearSelection();
    return;
  }

  const playedCard = player.hand.splice(cardIndex, 1)[0];
  removeTableCards(targets);
  player.captured.push(playedCard, ...targets);
  updateLastAction(player, resolution.description, [playedCard, ...targets]);
  setActionDisplay({
    playerId: player.id,
    playerName: player.name,
    text: resolution.description,
    cards: [playedCard, ...targets],
    tone: "collect",
  });
  pushLog(`${player.name} 打出 ${cardLabel(playedCard)}，${resolution.description}。`);
  clearSelection(false);
  setFeedback(
    fromHuman
      ? `你成功得牌：${[playedCard, ...targets].map(cardLabel).join("、")}`
      : `${player.name} 完成了一次钓牌。`,
    "info",
  );
  startDrawPhase(player);
}

function discardHandCard(player, sourceCard, fromHuman) {
  const cardIndex = player.hand.findIndex((card) => card.id === sourceCard.id);
  if (cardIndex === -1) {
    setFeedback("未找到这张手牌，已重置选择。", "error");
    clearSelection();
    return;
  }

  const discardedCard = player.hand.splice(cardIndex, 1)[0];
  state.tableCards.push(discardedCard);
  updateLastAction(player, `弃下 ${cardLabel(discardedCard)}`, [discardedCard]);
  setActionDisplay({
    playerId: player.id,
    playerName: player.name,
    text: `弃下 ${cardLabel(discardedCard)}`,
    cards: [discardedCard],
    tone: "discard",
  });
  pushLog(`${player.name} 打出 ${cardLabel(discardedCard)}，未钓牌，留在台面。`);
  clearSelection(false);
  setFeedback(
    fromHuman
      ? `你将 ${cardLabel(discardedCard)} 放到了桌面。`
      : `${player.name} 放了一张牌到桌面。`,
    "info",
  );
  startDrawPhase(player);
}

function capturePendingDraw(player, targets, resolution, fromHuman) {
  const drawCard = state.pendingDrawCard;
  removeTableCards(targets);
  player.captured.push(drawCard, ...targets);
  state.pendingDrawCard = null;
  updateLastAction(player, `补枪成功：${resolution.description}`, [drawCard, ...targets]);
  setActionDisplay({
    playerId: player.id,
    playerName: player.name,
    text: `补枪成功：${resolution.description}`,
    cards: [drawCard, ...targets],
    tone: "collect",
  });
  pushLog(`${player.name} 用摸到的 ${cardLabel(drawCard)} 完成补枪。`);
  clearSelection(false);
  setFeedback(
    fromHuman
      ? `你用 ${cardLabel(drawCard)} 完成了补枪。`
      : `${player.name} 用摸牌完成了补枪。`,
    "info",
  );
  finishTurnAfterAction(player);
}

function discardPendingDrawCard(player, fromHuman) {
  const drawCard = state.pendingDrawCard;
  state.tableCards.push(drawCard);
  state.pendingDrawCard = null;
  updateLastAction(player, `补枪失败，落台 ${cardLabel(drawCard)}`, [drawCard]);
  setActionDisplay({
    playerId: player.id,
    playerName: player.name,
    text: `补枪失败，落台 ${cardLabel(drawCard)}`,
    cards: [drawCard],
    tone: "discard",
  });
  pushLog(`${player.name} 的摸牌 ${cardLabel(drawCard)} 无法补枪，落到台面。`);
  clearSelection(false);
  setFeedback(
    fromHuman
      ? `你摸到的 ${cardLabel(drawCard)} 无法补枪，已放到桌面。`
      : `${player.name} 的摸牌没有补上。`,
    "info",
  );
  finishTurnAfterAction(player);
}

function startDrawPhase(player) {
  state.pendingDrawCard = state.drawPile.shift() || null;
  clearSelection(false);

  if (!state.pendingDrawCard) {
    pushLog("牌堆已空，本回合没有补枪。");
    finishTurnAfterAction(player);
    return;
  }

  if (player.isHuman) {
    setActionDisplay({
      playerId: player.id,
      playerName: player.name,
      text: `你摸到了 ${cardLabel(state.pendingDrawCard)}，可以立刻补枪`,
      cards: [state.pendingDrawCard],
    });
    updateLastAction(player, `摸到 ${cardLabel(state.pendingDrawCard)}`, [state.pendingDrawCard]);
    setFeedback(`你摸到了 ${cardLabel(state.pendingDrawCard)}，现在可以继续补枪。`, "info");
    render();
    return;
  }

  setActionDisplay({
    playerId: player.id,
    playerName: player.name,
    text: `摸到 ${cardLabel(state.pendingDrawCard)}，准备判断补枪`,
    cards: [state.pendingDrawCard],
  });
  updateLastAction(player, `摸到 ${cardLabel(state.pendingDrawCard)}`, [state.pendingDrawCard]);
  setFeedback(`${player.name} 摸到了一张牌。`, "info");
  render();
  scheduleAiStep(runAiTurn, 1100);
}

function finishTurnAfterAction(player) {
  clearFocusedTargets();
  if (isGameOver()) {
    finishGame();
    return;
  }

  if (!player.isHuman) {
    scheduleAiStep(advanceTurn, 1600);
    render();
    return;
  }

  advanceTurn();
}

function advanceTurn() {
  clearAiTimer();

  if (isGameOver()) {
    finishGame();
    return;
  }

  let nextIndex = state.currentPlayerIndex;
  let checked = 0;
  do {
    nextIndex = (nextIndex + 1) % state.players.length;
    checked += 1;
  } while (checked <= state.players.length && state.players[nextIndex].hand.length === 0);

  state.currentPlayerIndex = nextIndex;
  beginCurrentTurn();
}

function isGameOver() {
  return state.players.every((player) => player.hand.length === 0) && state.pendingDrawCard === null;
}

function finishGame() {
  clearAiTimer();
  state.phase = "game-over";
  const result = getRankedPlayers();
  const humanResult = result.find((item) => item.name === "玩家 1");
  state.lastFinishedResult = result.map((item) => ({
    ...item,
    redCards: [...item.redCards],
  }));
  state.lastFinishedAt = new Date().toLocaleString("zh-CN", {
    hour12: false,
  });
  const bestScore = result[0].score;
  const winners = result.filter((item) => item.score === bestScore).map((item) => item.name);
  const winnerText = winners.length > 1 ? `${winners.join("、")} 并列第一` : `${winners[0]} 获胜`;

  if (false && humanResult) {
    currentProfile.rounds += 1;
    currentProfile.totalScore += humanResult.score;
    currentProfile.lastScore = humanResult.score;
    currentProfile.bestScore = Math.max(currentProfile.bestScore, humanResult.score);
    if (winners.includes("玩家 1")) {
      currentProfile.wins += 1;
    }
    savePlayerStats();
    localStorage.setItem(LAST_PLAYER_ID_STORAGE_KEY, currentProfile.id);
    hydratePlayerIdControls();
  }

  setFeedback(`结算完成：${winnerText}。`, "info");
  pushLog(`游戏结束，${winnerText}。`);
  showOverlay("本局结束", "本局结束", `${winnerText}。点击按钮查看完整结算榜单。`, "查看结果");
  if (humanResult && state.authUser && state.currentPlayerId) {
    syncRoundResultToCloud(humanResult, winners.includes("鐜╁ 1"));
  }
  render();
}

async function syncRoundResultToCloud(humanResult, isWin) {
  if (!db || !state.authUser || !state.currentPlayerId) {
    return;
  }

  try {
    const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
    const resultRef = db.collection(FIRESTORE_COLLECTIONS.gameResults).doc();
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(profileRef);
      const currentData = snapshot.exists ? snapshot.data() : {};
      const nextProfile = {
        uid: state.authUser.uid,
        gameId: state.currentPlayerId,
        gameIdNormalized: state.currentPlayerId.toLowerCase(),
        rounds: Number(currentData.rounds || 0) + 1,
        wins: Number(currentData.wins || 0) + (isWin ? 1 : 0),
        totalScore: Number(currentData.totalScore || 0) + humanResult.score,
        bestScore: Math.max(Number(currentData.bestScore || 0), humanResult.score),
        lastScore: humanResult.score,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (!snapshot.exists) {
        nextProfile.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }

      transaction.set(profileRef, nextProfile, { merge: true });
      transaction.set(resultRef, {
        uid: state.authUser.uid,
        gameId: state.currentPlayerId,
        score: humanResult.score,
        isWin,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    await loadCurrentUserProfile();
    await loadLeaderboard();
    state.hasBoundGameId = true;
    state.gameIdEditable = false;
    renderAuthControls();
    render();
  } catch (error) {
    state.authStatusMessage = `云端结算写入失败：${formatAuthError(error)}`;
    renderAuthControls();
    render();
  }
}

function resolveCapture(sourceCard, tableCards) {
  const evaluation = evaluateTableSelection(sourceCard, tableCards);

  if (!evaluation.allowed) {
    return {
      success: false,
      message: evaluation.message,
      description: "",
    };
  }

  if (evaluation.mode === "triple") {
    return {
      success: true,
      message: "",
      description: `触发“三张相同”，一把钓走 ${tableCards.map(cardLabel).join("、")}`,
    };
  }

  if (tableCards.length === 1 && canCapturePair(sourceCard, tableCards[0])) {
    return {
      success: true,
      message: "",
      description: `成功钓走 ${cardLabel(tableCards[0])}`,
    };
  }

  return {
    success: false,
    message: "当前选择还不能构成有效钓牌。",
    description: "",
  };
}

function canCapturePair(sourceCard, targetCard) {
  if (TEN_RANKS.has(sourceCard.rank) || TEN_RANKS.has(targetCard.rank)) {
    return TEN_RANKS.has(sourceCard.rank) && sourceCard.rank === targetCard.rank;
  }

  return sourceCard.playValue + targetCard.playValue === 10;
}

function evaluateTableSelection(sourceCard, tableCards) {
  if (!sourceCard) {
    return {
      allowed: false,
      message: "请先选择手牌，再选择台面牌。",
      helper: "请选择自己的手牌。",
      mode: "empty",
      ready: false,
    };
  }

  if (tableCards.length === 0) {
    return {
      allowed: true,
      message: "",
      helper: TEN_RANKS.has(sourceCard.rank)
        ? `${sourceCard.rank} 只能钓 ${sourceCard.rank}`
        : `${sourceCard.rank} 需要找 ${VALUE_LABELS[10 - sourceCard.playValue]}`,
      mode: "empty",
      ready: false,
    };
  }

  if (tableCards.length > 3) {
    return {
      allowed: false,
      message: "一次最多只能选 3 张台面牌。",
      helper: "",
      mode: "invalid",
      ready: false,
    };
  }

  if (tableCards.length === 1) {
    const target = tableCards[0];
    if (canCapturePair(sourceCard, target)) {
      return {
        allowed: true,
        message: "",
        helper: `${cardLabel(sourceCard)} 可以钓 ${cardLabel(target)}`,
        mode: "pair",
        ready: true,
      };
    }

    if (target.rank === sourceCard.rank) {
      return {
        allowed: true,
        message: "",
        helper: "再选 2 张同点牌，可尝试“三张相同”",
        mode: "triple-build",
        ready: false,
      };
    }

    return {
      allowed: false,
      message: getSingleSelectionMessage(sourceCard, target),
      helper: "",
      mode: "invalid",
      ready: false,
    };
  }

  const allSameRank = tableCards.every((card) => card.rank === sourceCard.rank);
  if (!allSameRank) {
    return {
      allowed: false,
      message: "只有台面 3 张与出牌完全同点时，才能触发“三张相同”。",
      helper: "",
      mode: "invalid",
      ready: false,
    };
  }

  if (tableCards.length === 2) {
    return {
      allowed: true,
      message: "",
      helper: "再选 1 张同点牌即可触发“三张相同”",
      mode: "triple-build",
      ready: false,
    };
  }

  return {
    allowed: true,
    message: "",
    helper: "当前组合可触发“三张相同”",
    mode: "triple",
    ready: true,
  };
}

function getSingleSelectionMessage(sourceCard, targetCard) {
  if (TEN_RANKS.has(sourceCard.rank)) {
    return `${sourceCard.rank} 只能钓 ${sourceCard.rank}。`;
  }

  if (TEN_RANKS.has(targetCard.rank)) {
    return `${cardLabel(sourceCard)} 不能钓 ${cardLabel(targetCard)}，需要找 ${VALUE_LABELS[10 - sourceCard.playValue]}。`;
  }

  return `${cardLabel(sourceCard)} 需要找 ${VALUE_LABELS[10 - sourceCard.playValue]}，当前选的是 ${cardLabel(targetCard)}。`;
}

function selectHandCard(cardId) {
  const player = getCurrentPlayer();
  if (!player || !player.isHuman || state.phase !== "human-turn" || state.pendingDrawCard) {
    return;
  }

  state.selectedHandCardId = state.selectedHandCardId === cardId ? null : cardId;
  state.selectedTable = new Set();
  const sourceCard = getSelectedSourceCard();
  setFeedback(sourceCard ? getSelectionHelper(sourceCard, []) : "请选择一张手牌开始本回合。", "info");
  render();
}

function toggleTableCard(cardId) {
  const player = getCurrentPlayer();
  if (!player || !player.isHuman || state.phase !== "human-turn") {
    return;
  }

  const sourceCard = getSelectedSourceCard();
  if (!sourceCard) {
    setFeedback("请先选择手牌，再点台面牌。", "error");
    render();
    return;
  }

  if (state.selectedTable.has(cardId)) {
    state.selectedTable.delete(cardId);
    setFeedback(getSelectionHelper(sourceCard, getSelectedTableCards()), "info");
    render();
    return;
  }

  const nextSelection = getSelectedTableCards();
  const targetCard = state.tableCards.find((card) => card.id === cardId);
  nextSelection.push(targetCard);
  const evaluation = evaluateTableSelection(sourceCard, nextSelection);
  if (!evaluation.allowed) {
    setFeedback(evaluation.message, "error");
    render();
    return;
  }

  state.selectedTable.add(cardId);
  setFeedback(evaluation.helper || "当前选择可结算。", "info");
  render();
}

function clearSelection(shouldRender = true) {
  state.selectedHandCardId = null;
  state.selectedTable = new Set();
  if (state.phase !== "ai-turn") {
    clearFocusedTargets();
  }
  if (shouldRender) {
    render();
  }
}

function getSelectionHelper(sourceCard, tableCards) {
  return evaluateTableSelection(sourceCard, tableCards).helper || "请选择合适的台面牌。";
}

function getSelectedTableCards() {
  return state.tableCards.filter((card) => state.selectedTable.has(card.id));
}

function removeTableCards(cardsToRemove) {
  const ids = new Set(cardsToRemove.map((card) => card.id));
  state.tableCards = state.tableCards.filter((card) => !ids.has(card.id));
}

function updateLastAction(player, text, cards) {
  player.lastAction = {
    text,
    cards: [...cards],
    stamp: Date.now(),
  };
}

function setActionDisplay(action) {
  state.actionDisplay = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ...action,
  };
}

function focusTargets(cards) {
  state.focusedTableIds = new Set(cards.map((card) => card.id));
}

function clearFocusedTargets() {
  state.focusedTableIds = new Set();
}

function setFeedback(message, type = "info") {
  state.feedback = { message, type };
}

function pushLog(message) {
  state.log.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
  });
  state.log = state.log.slice(0, 6);
}

function getRedScore(cards) {
  return cards.reduce((sum, card) => sum + (isRedCard(card) ? card.scoreValue : 0), 0);
}

function getRankedPlayers() {
  return state.players
    .map((player) => ({
      name: player.name,
      score: getRedScore(player.captured),
      captured: player.captured.length,
      redCards: player.captured.filter(isRedCard),
    }))
    .sort((a, b) => b.score - a.score || b.captured - a.captured);
}

function getPlayableTargetIds(sourceCard) {
  const ids = new Set();
  if (!sourceCard) {
    return ids;
  }

  const sameRankCount = state.tableCards.filter((card) => card.rank === sourceCard.rank).length;
  state.tableCards.forEach((card) => {
    if (canCapturePair(sourceCard, card)) {
      ids.add(card.id);
    }
    if (sameRankCount >= 3 && card.rank === sourceCard.rank) {
      ids.add(card.id);
    }
  });

  return ids;
}

function cardLabel(card) {
  const suit = SUITS.find((item) => item.key === card.suit);
  return `${suit.label}${card.rank}`;
}

function cardSymbol(card) {
  return SUITS.find((item) => item.key === card.suit)?.symbol || "";
}

function isRedCard(card) {
  return SUITS.find((item) => item.key === card.suit)?.red || false;
}

function renderSetupHistory() {
  ui.viewLastResult.classList.toggle("hidden", !state.lastFinishedResult);

  const signature = !state.lastFinishedResult
    ? "hidden"
    : state.lastFinishedResult.map((item) => `${item.name}:${item.score}:${item.captured}`).join("|");

  if (state.renderCache.history === signature) {
    return;
  }
  state.renderCache.history = signature;

  if (!state.lastFinishedResult) {
    ui.historyGrid.innerHTML = "";
    return;
  }

  ui.historyMeta.textContent = `上一局结束于 ${state.lastFinishedAt}。`;
  ui.historyGrid.innerHTML = "";
  state.lastFinishedResult.forEach((item, index) => {
    const redCardText = item.redCards.length
      ? item.redCards.map((card) => `${cardLabel(card)}(${card.scoreValue})`).join("、")
      : "本局没有赢到红牌";
    const article = document.createElement("article");
    article.className = `result-card${index === 0 ? " top" : ""}`;
    article.innerHTML = `
      <p class="result-rank">第 ${index + 1} 名</p>
      <h3>${item.name}</h3>
      <p class="result-score">${item.score} 分</p>
      <p class="result-meta">已赢 ${item.captured} 张牌，红牌 ${item.redCards.length} 张</p>
      <p class="result-red-cards">${redCardText}</p>
    `;
    ui.historyGrid.appendChild(article);
  });
}

function renderPlayerStatsDashboard() {
  const currentProfile = state.currentPlayerId && state.playerStats[state.currentPlayerId]
    ? state.playerStats[state.currentPlayerId]
    : null;
  const sorted = getSortedPlayerStats();

  const playerSignature = currentProfile
    ? `${currentProfile.id}:${currentProfile.rounds}:${currentProfile.wins}:${currentProfile.totalScore}:${currentProfile.bestScore}:${currentProfile.lastScore}:${ui.playerIdHint.textContent}`
    : `empty:${ui.playerIdHint.textContent}`;
  if (state.renderCache.playerStats !== playerSignature) {
    state.renderCache.playerStats = playerSignature;
    if (!currentProfile) {
      ui.playerStatsCard.innerHTML = `
        <p>当前还没有选定游戏 ID。</p>
        <p>输入一个新的 ID，或者从已有 ID 里选一个，就能累计局数和积分。</p>
      `;
    } else {
      ui.playerStatsCard.innerHTML = `
        <p>当前 ID：${currentProfile.id}</p>
        <p>累计积分：${currentProfile.totalScore} 分 · 总局数：${currentProfile.rounds} 局</p>
        <p>胜场：${currentProfile.wins} 局 · 单局最高：${currentProfile.bestScore} 分 · 上一局：${currentProfile.lastScore} 分</p>
      `;
    }
  }

  const leaderboardSignature = sorted.map((item) =>
    `${item.id}:${item.totalScore}:${item.wins}:${item.rounds}:${item.bestScore}`,
  ).join("|");
  if (state.renderCache.leaderboard === leaderboardSignature) {
    return;
  }
  state.renderCache.leaderboard = leaderboardSignature;

  ui.leaderboardList.innerHTML = "";
  if (!sorted.length) {
    ui.leaderboardList.appendChild(createEmptyState("还没有人打完过一局，先创建一个游戏 ID 开始吧。"));
    return;
  }

  sorted.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = `leaderboard-item${item.id === state.currentPlayerId ? " active" : ""}`;
    article.innerHTML = `
      <div class="leaderboard-rank">#${index + 1}</div>
      <div class="leaderboard-main">
        <h3>${item.id}</h3>
        <p>累计积分 ${item.totalScore} · 胜场 ${item.wins} · 局数 ${item.rounds}</p>
      </div>
      <div class="leaderboard-side">
        <strong>${item.bestScore}</strong>
        <span>单局最高</span>
      </div>
    `;
    ui.leaderboardList.appendChild(article);
  });
}

function render() {
  renderAuthControls();
  renderRulesModal();
  renderSetupHistory();
  renderPlayerStatsDashboard();

  if (state.phase === "setup") {
    ui.heroSection.classList.remove("hidden");
    ui.setupPanel.classList.remove("hidden");
    ui.historyPanel.classList.toggle("hidden", !state.lastFinishedResult);
    ui.gameLayout.classList.add("hidden");
    return;
  }

  ui.heroSection.classList.add("hidden");
  ui.setupPanel.classList.add("hidden");
  ui.historyPanel.classList.add("hidden");
  ui.gameLayout.classList.remove("hidden");

  const currentPlayer = getCurrentPlayer();
  const selectedSourceCard = getSelectedSourceCard();
  const selectedTableCards = getSelectedTableCards();
  const evaluation = evaluateTableSelection(selectedSourceCard, selectedTableCards);

  ui.statusText.textContent = getStatusText();
  ui.drawCount.textContent = `${state.drawPile.length} 张`;
  ui.tableCount.textContent = `${state.tableCards.length} 张`;
  ui.currentPlayerTitle.textContent = "你的手牌";
  ui.turnNote.textContent = getTurnNote(currentPlayer);
  ui.selectedCardDisplay.textContent = selectedSourceCard
    ? `${cardLabel(selectedSourceCard)}${state.pendingDrawCard ? "（摸牌）" : ""}`
    : "未选择";
  ui.selectedTableTotal.textContent = `${selectedTableCards.length} 张`;
  ui.ruleTargetText.textContent = selectedSourceCard ? getRuleTargetText(selectedSourceCard, selectedTableCards, evaluation) : "凑十 / 三张相同";
  ui.selectionHint.textContent = getSelectionHint();
  ui.confirmAction.textContent = state.pendingDrawCard ? "尝试补枪" : "尝试钓牌";
  ui.discardAction.textContent = state.pendingDrawCard ? "摸牌落台" : "弃到台面";

  const humanPlayer = state.players.find((player) => player.isHuman);
  const humanDiceSignature = state.diceAnimation ? `${state.diceAnimation.stage}:${state.diceAnimation.faces[humanPlayer.id] || 1}` : "no-dice";
  const humanSummarySignature = `${humanPlayer.hand.length}|${getRedScore(humanPlayer.captured)}|${humanDiceSignature}|${state.currentPlayerId}`;
  if (state.renderCache.humanSummary !== humanSummarySignature) {
    state.renderCache.humanSummary = humanSummarySignature;
    ui.humanSummary.innerHTML = `
      <p>身份：你${state.currentPlayerId ? ` · ID：${state.currentPlayerId}` : ""}</p>
      <p>剩余手牌：${humanPlayer.hand.length} 张</p>
      <p>已赢红牌：${getRedScore(humanPlayer.captured)} 分</p>
      ${renderDiceWidget(humanPlayer)}
    `;
  }

  const canUseControls = currentPlayer?.isHuman && state.phase === "human-turn";
  ui.confirmAction.disabled = !canUseControls;
  ui.discardAction.disabled = !canUseControls;
  ui.clearSelection.disabled = !canUseControls;

  renderFeedback();
  renderDrawPile();
  renderActionStage();
  renderDrawPreview();
  renderSeats();
  renderTableCards(selectedSourceCard);
  renderHumanHand(humanPlayer);
  renderLog();
  renderResults();
}

function getStatusText() {
  if (state.phase === "dice-rolling") {
    return "摇骰子中";
  }
  if (state.phase === "dice-result") {
    return "摇骰子结果";
  }
  if (state.phase === "opening-deal") {
    return state.openingStage === "reveal-table" ? "正在翻公共牌" : "正在发手牌";
  }
  if (state.phase === "game-over") {
    const top = getRankedPlayers()[0];
    return `${top.name} 暂列第一，红牌 ${top.score} 分`;
  }
  if (state.phase === "ai-turn") {
    return `${getCurrentPlayer().name} 正在行动`;
  }
  return "等待你操作";
}

function getTurnNote(currentPlayer) {
  if (state.phase === "game-over") {
    return "本局已经结束，可以查看桌面上的结算卡，或返回模式选择查看上一局结算。";
  }

  if (state.phase === "dice-rolling") {
    return "所有玩家都在摇骰子，几秒后会自动显示结果。";
  }

  if (state.phase === "dice-result") {
    return `${currentPlayer.name}${currentPlayer.isHuman ? "（你）" : ""} 拿到先手，马上开始。`;
  }

  if (state.phase === "opening-deal") {
    return state.openingStage === "reveal-table"
      ? "手牌已经发完，正在逐张翻开桌面公共牌。"
      : "骰子结束后，正在依次把手牌发给所有玩家。";
  }

  if (!currentPlayer?.isHuman) {
    return `${currentPlayer.name} 的动作会直接展示在牌桌中央。`;
  }

  if (state.pendingDrawCard) {
    return `你摸到了 ${cardLabel(state.pendingDrawCard)}，现在可以继续补枪。`;
  }

  return "现在由你出牌。先选手牌，再决定钓牌还是弃到台面。";
}

function getSelectionHint() {
  if (state.phase === "opening-deal") {
    return state.openingStage === "reveal-table"
      ? "桌面公共牌会依次翻开，翻完后才正式开始第一回合。"
      : "开局发牌中，当前不能操作。";
  }
  if (state.phase === "ai-turn") {
    return "电脑玩家正在出牌，请观察桌面中央和各座位前方的动作。";
  }
  if (state.pendingDrawCard) {
    return "补枪阶段不需要再选手牌，只需要从公共牌中选目标；不想补就让摸牌落台。";
  }
  return "A 按 1 点参与凑十；10/J/Q/K 只能钓同点牌；三张相同需要台面恰好选 3 张同点牌。";
}

function getRuleTargetText(sourceCard, selectedTableCards, evaluation) {
  if (selectedTableCards.length === 3) {
    return evaluation.allowed ? "三张相同可结算" : "三张相同未满足";
  }

  if (TEN_RANKS.has(sourceCard.rank)) {
    return `${sourceCard.rank} 只能钓 ${sourceCard.rank}`;
  }

  return `${sourceCard.rank} 需要找 ${VALUE_LABELS[10 - sourceCard.playValue]}`;
}

function renderFeedback() {
  if (!state.feedback?.message) {
    ui.feedbackBanner.className = "feedback-banner hidden";
    ui.feedbackBanner.textContent = "";
    return;
  }

  ui.feedbackBanner.className = `feedback-banner ${state.feedback.type}`;
  ui.feedbackBanner.textContent = state.feedback.message;
}

function renderActionStage() {
  const signature = state.actionDisplay
    ? `${state.actionDisplay.id}|${state.actionDisplay.tone || ""}|${state.actionDisplay.cards.map((card) => card.id).join(",")}|${state.actionDisplay.text}`
    : "empty";

  if (state.renderCache.actionStage === signature) {
    return;
  }
  state.renderCache.actionStage = signature;

  if (!state.actionDisplay) {
    ui.actionStage.dataset.tone = "idle";
    ui.actionTitle.textContent = "等待首个动作";
    ui.actionCopy.textContent = "开始游戏后，这里会展示玩家实际打出的牌。";
    ui.actionCards.innerHTML = "";
    return;
  }

  ui.actionStage.dataset.tone = state.actionDisplay.tone || "idle";
  ui.actionTitle.textContent = `${state.actionDisplay.playerName} 的动作`;
  ui.actionCopy.textContent = state.actionDisplay.text;
  ui.actionCards.innerHTML = "";
  state.actionDisplay.cards.forEach((card, index) => {
    const shouldAnimate = !state.renderCache.seenCards.action.has(card.id);
    state.renderCache.seenCards.action.add(card.id);
    ui.actionCards.appendChild(createCardButton(card, {
      disabled: true,
      cardIndex: index,
      animate: shouldAnimate,
    }));
  });
}

function renderDrawPile() {
  const signature = `${state.drawPile.length}|${state.pendingDrawCard?.id || "none"}|${getCurrentPlayer()?.isHuman ? "human" : "ai"}`;
  if (state.renderCache.drawPile === signature) {
    return;
  }
  state.renderCache.drawPile = signature;

  ui.drawPileCount.textContent = `${state.drawPile.length} 张`;
  ui.drawPileVisual.classList.toggle("empty", state.drawPile.length === 0);
}

function renderDrawPreview() {
  if (!state.pendingDrawCard || !getCurrentPlayer()?.isHuman) {
    ui.drawPreview.classList.add("hidden");
    ui.drawPreviewText.textContent = "未摸牌";
    ui.drawPreviewCard.innerHTML = "";
    return;
  }

  ui.drawPreview.classList.remove("hidden");
  ui.drawPreviewText.textContent = cardLabel(state.pendingDrawCard);
  ui.drawPreviewCard.innerHTML = "";
  const shouldAnimate = !state.renderCache.seenCards.action.has(state.pendingDrawCard.id);
  state.renderCache.seenCards.action.add(state.pendingDrawCard.id);
  ui.drawPreviewCard.appendChild(createCardButton(state.pendingDrawCard, {
    disabled: true,
    cardIndex: 0,
    animate: shouldAnimate,
  }));
}

function renderSeats() {
  const seats = getSeatAssignments();

  renderSeat(ui.seatTopLeft, seats["top-left"]);
  renderSeat(ui.seatTop, seats.top);
  renderSeat(ui.seatTopRight, seats["top-right"]);
  renderSeat(ui.seatLeft, seats.left);
  renderSeat(ui.seatRight, seats.right);
  renderSeatDice(seats);
  renderSeatResults(seats);
}

function getSeatAssignments() {
  const seats = {
    "top-left": null,
    top: null,
    "top-right": null,
    left: null,
    right: null,
    bottom: state.players.find((player) => player.isHuman) || null,
  };

  const opponents = state.players.filter((player) => !player.isHuman);
  if (state.players.length === 2) {
    seats.top = opponents[0] || null;
  } else if (state.players.length === 3) {
    seats.top = opponents[0] || null;
    seats.left = opponents[1] || null;
  } else if (state.players.length === 4) {
    seats.left = opponents[0] || null;
    seats.top = opponents[1] || null;
    seats.right = opponents[2] || null;
  }

  return seats;
}

function renderSeat(container, player) {
  const key = container.id;
  const signature = !player
    ? "empty"
    : [
        player.id,
        player.hand.length,
        getRedScore(player.captured),
        player.id === getCurrentPlayer()?.id ? "active" : "idle",
        player.lastAction?.stamp || 0,
        player.lastAction?.text || "",
        player.lastAction?.cards?.map((card) => card.id).join(",") || "",
      ].join("|");

  if (state.renderCache.seats[key] === signature) {
    return;
  }
  state.renderCache.seats[key] = signature;

  container.innerHTML = "";
  if (!player) {
    return;
  }

  const seat = document.createElement("article");
  seat.className = `seat-card${player.id === getCurrentPlayer()?.id ? " active" : ""}`;

  const backs = Array.from({ length: Math.min(player.hand.length, 6) }, (_, index) => `
    <div class="card-back" style="--stack-index:${index}"></div>
  `).join("");

  const lastCards = player.lastAction?.cards?.map((card) => `
    <div class="seat-mini-card ${isRedCard(card) ? "red" : "black"}">${card.rank}${cardSymbol(card)}</div>
  `).join("") || "";

  seat.innerHTML = `
    <div>
      <h3>${player.name}（电脑）</h3>
      <p class="seat-meta">
        <span>手牌 ${player.hand.length}</span>
        <span>红牌 ${getRedScore(player.captured)}</span>
      </p>
    </div>
    <div class="seat-backs">
      ${backs}
      <span class="card-back-count">${player.hand.length}</span>
    </div>
    <div class="seat-action">
      <p class="seat-action-copy">${player.lastAction?.text || "暂未出牌"}</p>
      <div class="seat-action-cards">${lastCards}</div>
    </div>
    ${renderDiceWidget(player)}
  `;

  container.appendChild(seat);
}

function renderDiceWidget(player) {
  return "";
}

function renderSeatDice(seats) {
  const activePlayers = Object.entries(seats)
    .filter(([, player]) => Boolean(player))
    .map(([slot, player]) => ({ slot, player }));

  const signature = !state.diceAnimation
    ? "hidden"
    : [
        state.diceAnimation.stage,
        ...activePlayers.map(({ slot, player }) => `${slot}:${player.id}:${state.diceAnimation.faces[player.id] || 1}:${getCurrentPlayer()?.id === player.id ? "first" : "normal"}`),
      ].join("|");

  if (state.renderCache.seatDice === signature) {
    return;
  }
  state.renderCache.seatDice = signature;

  ui.seatDiceLayer.innerHTML = "";
  if (!state.diceAnimation) {
    return;
  }

  activePlayers.forEach(({ slot, player }) => {
    const face = state.diceAnimation.faces[player.id] || 1;
    const isRolling = state.diceAnimation.stage === "rolling";
    const isFirst = state.phase === "dice-result" && getCurrentPlayer()?.id === player.id;
    const dice = document.createElement("div");
    dice.className = `seat-dice seat-dice-${slot}${isRolling ? " rolling" : " result"}${isFirst ? " first" : ""}`;
    dice.innerHTML = `
      <div class="seat-dice__cube">${DICE_SYMBOLS[face] || "⚀"}</div>
      <div class="seat-dice__label">${player.isHuman ? "你" : player.name}</div>
      <div class="seat-dice__meta">${isRolling ? "摇骰子中" : `点数 ${face}${isFirst ? " · 先手" : ""}`}</div>
    `;
    ui.seatDiceLayer.appendChild(dice);
  });
}

function renderSeatResults(seats) {
  const rankedPlayers = state.phase === "game-over" ? getRankedPlayers() : [];
  const resultByName = new Map(rankedPlayers.map((item, index) => [item.name, { ...item, rank: index + 1 }]));
  const activePlayers = Object.entries(seats)
    .filter(([, player]) => Boolean(player))
    .map(([slot, player]) => ({ slot, player, result: resultByName.get(player.name) || null }));

  const signature = state.phase !== "game-over"
    ? "hidden"
    : activePlayers.map(({ slot, player, result }) => {
      if (!result) {
        return `${slot}:${player.id}:none`;
      }
      return [
        slot,
        player.id,
        result.rank,
        result.score,
        result.captured,
        result.redCards.map((card) => card.id).join(","),
      ].join(":");
    }).join("|");

  if (state.renderCache.seatResults === signature) {
    return;
  }
  state.renderCache.seatResults = signature;

  ui.seatResultLayer.innerHTML = "";
  if (state.phase !== "game-over") {
    return;
  }

  activePlayers.forEach(({ slot, player, result }) => {
    if (!result) {
      return;
    }

    const article = document.createElement("article");
    article.className = `seat-result seat-result-${slot}${result.rank === 1 ? " top" : ""}`;
    const redCardsHtml = result.redCards.length
      ? result.redCards
        .map((card) => `<span class="seat-result__card">${cardSymbol(card)}${card.rank} ${card.scoreValue}</span>`)
        .join("")
      : '<p class="seat-result__empty">本局未赢到红牌</p>';

    article.innerHTML = `
      <div class="seat-result__header">
        <span class="seat-result__rank">第 ${result.rank} 名</span>
        ${result.rank === 1 ? '<span class="seat-result__winner">最高分</span>' : ""}
      </div>
      <div>
        <h3>${player.name}${player.isHuman ? "（你）" : ""}</h3>
        <p class="seat-result__score">${result.score} 分</p>
      </div>
      <div class="seat-result__meta">
        <span>红牌 ${result.redCards.length} 张</span>
        <span>总赢牌 ${result.captured} 张</span>
      </div>
      <div class="seat-result__cards">${redCardsHtml}</div>
    `;
    ui.seatResultLayer.appendChild(article);
  });
}

function renderTableCards(selectedSourceCard) {
  if (ui.tableCards.parentElement !== ui.tablePublicSlot) {
    ui.tablePublicSlot.appendChild(ui.tableCards);
  }

  const currentPlayer = getCurrentPlayer();
  const playableIds = currentPlayer?.isHuman && state.phase === "human-turn" ? getPlayableTargetIds(selectedSourceCard) : new Set();
  const signature = [
    state.tableCards.map((card) => card.id).join(","),
    [...state.selectedTable].sort().join(","),
    [...state.focusedTableIds].sort().join(","),
    [...playableIds].sort().join(","),
    currentPlayer?.id || "",
    state.phase,
  ].join("|");

  if (state.renderCache.tableCards === signature) {
    return;
  }
  state.renderCache.tableCards = signature;

  ui.tableCards.innerHTML = "";
  if (state.tableCards.length === 0) {
    const emptyText = state.phase === "opening-deal"
      ? "公共牌正在逐张翻开"
      : "公共牌区暂时没有明牌";
    ui.tableCards.appendChild(createEmptyState(emptyText));
    return;
  }

  state.tableCards.forEach((card, index) => {
    const shouldAnimate = !state.renderCache.seenCards.table.has(card.id);
    state.renderCache.seenCards.table.add(card.id);
    ui.tableCards.appendChild(createCardButton(card, {
      selected: state.selectedTable.has(card.id),
      focused: state.focusedTableIds.has(card.id),
      table: true,
      playable: playableIds.has(card.id),
      onClick: () => toggleTableCard(card.id),
      disabled: !currentPlayer?.isHuman || state.phase !== "human-turn",
      cardIndex: index,
      animate: shouldAnimate,
    }));
  });
}

function renderHumanHand(humanPlayer) {
  const signature = !humanPlayer
    ? "empty"
    : [
        humanPlayer.hand.map((card) => card.id).join(","),
        state.selectedHandCardId || "",
        getCurrentPlayer()?.id || "",
        state.phase,
        state.pendingDrawCard?.id || "",
      ].join("|");

  if (state.renderCache.humanHand === signature) {
    return;
  }
  state.renderCache.humanHand = signature;

  ui.handCards.innerHTML = "";
  if (!humanPlayer || humanPlayer.hand.length === 0) {
    const emptyText = state.phase === "opening-deal"
      ? "正在发你的手牌"
      : "你的手牌已经出完";
    ui.handCards.appendChild(createEmptyState(emptyText));
    return;
  }

  humanPlayer.hand.forEach((card, index) => {
    const shouldAnimate = !state.renderCache.seenCards.hand.has(card.id);
    state.renderCache.seenCards.hand.add(card.id);
    ui.handCards.appendChild(createCardButton(card, {
      selected: state.selectedHandCardId === card.id,
      hiddenZone: true,
      onClick: () => selectHandCard(card.id),
      disabled: getCurrentPlayer()?.id !== humanPlayer.id || state.phase !== "human-turn" || Boolean(state.pendingDrawCard),
      cardIndex: index,
      animate: shouldAnimate,
    }));
  });
}

function renderLog() {
  const signature = state.log.map((entry) => entry.id).join(",");
  if (state.renderCache.log === signature) {
    return;
  }
  state.renderCache.log = signature;

  ui.logList.innerHTML = "";
  state.log.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "log-entry";
    article.innerHTML = `<p>${entry.message}</p>`;
    ui.logList.appendChild(article);
  });
}

function renderResults() {
  const signature = state.phase === "game-over"
    ? getRankedPlayers().map((item) => `${item.name}:${item.score}:${item.captured}`).join("|")
    : "hidden";

  if (state.renderCache.results === signature) {
    return;
  }
  state.renderCache.results = signature;

  if (state.phase !== "game-over") {
    ui.resultPanel.classList.add("hidden");
    ui.resultGrid.innerHTML = "";
    return;
  }

  ui.resultPanel.classList.add("hidden");
  ui.resultGrid.innerHTML = "";
  return;
  getRankedPlayers().forEach((item, index) => {
    const redCardText = item.redCards.length
      ? item.redCards.map((card) => `${cardLabel(card)}(${card.scoreValue})`).join("、")
      : "本局没有赢到红牌";
    const article = document.createElement("article");
    article.className = `result-card${index === 0 ? " top" : ""}`;
    article.innerHTML = `
      <p class="result-rank">第 ${index + 1} 名</p>
      <h3>${item.name}</h3>
      <p class="result-score">${item.score} 分</p>
      <p class="result-meta">已赢 ${item.captured} 张牌，红牌 ${item.redCards.length} 张</p>
      <p class="result-red-cards">${redCardText}</p>
    `;
    ui.resultGrid.appendChild(article);
  });
}

function renderRulesModal() {
  ui.rulesModal.classList.toggle("hidden", !state.rulesOpen);
  ui.rulesModal.setAttribute("aria-hidden", String(!state.rulesOpen));
}

function createCardButton(card, options = {}) {
  const button = document.createElement("button");
  const classes = ["card-btn"];

  if (isRedCard(card)) {
    classes.push("red-card");
  } else {
    classes.push("black-card");
  }

  if (options.hiddenZone) {
    classes.push("hidden-zone");
  }
  if (options.selected && options.table) {
    classes.push("table-selected");
  }
  if (options.selected && !options.table) {
    classes.push("source-selected");
  }
  if (options.focused) {
    classes.push("ai-focused");
  }
  if (options.playable) {
    classes.push("playable-target");
  }
  if (options.animate) {
    classes.push("new-card");
  }

  button.className = classes.join(" ");
  button.type = "button";
  button.disabled = Boolean(options.disabled);
  button.style.setProperty("--card-index", String(options.cardIndex ?? 0));
  if (options.onClick) {
    button.addEventListener("click", options.onClick);
  }

  button.innerHTML = `
    <div class="card-top">
      <span>${cardSymbol(card)}</span>
      <span class="card-value">钓牌 ${card.playValue} / 计分 ${card.scoreValue}</span>
    </div>
    <div class="card-bottom">
      <span class="card-rank">${card.rank}</span>
      <span>${SUITS.find((item) => item.key === card.suit)?.label || ""}</span>
    </div>
  `;

  return button;
}

function createEmptyState(text) {
  const element = document.createElement("div");
  element.className = "empty-state";
  element.textContent = text;
  return element;
}

init();
