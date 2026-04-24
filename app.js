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
  friendRequests: "friendRequests",
  friendships: "friendships",
  roomInvites: "roomInvites",
  rooms: "rooms",
};
const LEADERBOARD_MODES = ["2", "3", "4"];

let firebaseApp = null;
let auth = null;
let db = null;

const ui = {
  heroSection: document.getElementById("hero-section"),
  setupPanel: document.getElementById("setup-panel"),
  gameLayout: document.getElementById("game-layout"),
  playStage: document.getElementById("play-stage"),
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
  leaderboardMode2: null,
  leaderboardMode3: null,
  leaderboardMode4: null,
  refreshLeaderboard: null,
  socialPanel: null,
  socialStatus: null,
  socialSearchInput: null,
  socialSearchButton: null,
  socialSearchResult: null,
  socialFriendRequests: null,
  socialFriends: null,
  socialRoomInvites: null,
  socialRoomCard: null,
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
  leaderboardMode: "2",
  leaderboardRefreshing: false,
  hasBoundGameId: false,
  gameIdEditable: true,
  socialBusy: false,
  socialStatusMessage: "",
  socialStatusTone: "info",
  socialSearchResult: null,
  socialFriendRequests: [],
  socialFriends: [],
  socialRoomInvites: [],
  socialActiveRoom: null,
  socialUnsubs: [],
  multiplayer: {
    active: false,
    roomId: "",
    localHand: [],
  },
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
    social: "",
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
  ui.restartGame.addEventListener("click", handleRestartRequest);
  ui.restartRound.addEventListener("click", handleRestartRequest);
  ui.backToSetup.addEventListener("click", handleBackToSetup);
  ui.overlayButton.addEventListener("click", handleOverlayButton);
  ui.confirmAction.addEventListener("click", handleConfirmAction);
  ui.discardAction.addEventListener("click", handleDiscardAction);
  ui.clearSelection.addEventListener("click", clearSelection);
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", updateGameLayoutScale);

  const legacyIdLabel = ui.playerIdSelect?.closest("label");
  if (legacyIdLabel) {
    legacyIdLabel.classList.add("hidden");
  }
  ensureLeaderboardControls();
  ensureSocialPanel();
  const leaderboardTitle = document.querySelector(".leaderboard-block .compact-head h2");
  const leaderboardCopy = document.querySelector(".leaderboard-block .compact-head p");
  if (leaderboardTitle) {
    leaderboardTitle.textContent = "云端排行榜";
  }
  if (leaderboardCopy) {
    leaderboardCopy.textContent = "按累计积分、胜场、局数排序，不同电脑和手机会共用同一份榜单。";
  }

  state.playerIdHintMessage = "先登录或注册账号，再创建全局唯一的游戏 ID。";
  ensureLeaderboardControls();
  renderAuthControls();
  render();
  initFirebase();
}

function ensureLeaderboardControls() {
  const block = document.querySelector(".leaderboard-block");
  if (!block) {
    return;
  }

  const leaderboardTitle = document.querySelector(".leaderboard-block .compact-head h2");
  const leaderboardCopy = document.querySelector(".leaderboard-block .compact-head p");
  if (leaderboardTitle) {
    leaderboardTitle.textContent = "云端排行榜";
  }
  if (leaderboardCopy) {
    leaderboardCopy.textContent = "2 / 3 / 4 人模式分开排行，按该模式下的单局最高分排序。";
  }

  if (!document.getElementById("leaderboard-toolbar")) {
    const toolbar = document.createElement("div");
    toolbar.className = "leaderboard-toolbar";
    toolbar.id = "leaderboard-toolbar";
    toolbar.innerHTML = `
      <div class="leaderboard-tabs" role="tablist" aria-label="排行榜模式">
        <button id="leaderboard-mode-2" class="leaderboard-tab active" type="button" data-mode="2">2人榜</button>
        <button id="leaderboard-mode-3" class="leaderboard-tab" type="button" data-mode="3">3人榜</button>
        <button id="leaderboard-mode-4" class="leaderboard-tab" type="button" data-mode="4">4人榜</button>
      </div>
      <button id="refresh-leaderboard" class="ghost-btn leaderboard-refresh" type="button">刷新排行</button>
    `;
    block.insertBefore(toolbar, ui.leaderboardList);
  }

  ui.leaderboardMode2 = document.getElementById("leaderboard-mode-2");
  ui.leaderboardMode3 = document.getElementById("leaderboard-mode-3");
  ui.leaderboardMode4 = document.getElementById("leaderboard-mode-4");
  ui.refreshLeaderboard = document.getElementById("refresh-leaderboard");

  [ui.leaderboardMode2, ui.leaderboardMode3, ui.leaderboardMode4].forEach((button) => {
    if (button && !button.dataset.bound) {
      button.dataset.bound = "1";
      button.addEventListener("click", () => {
        state.leaderboardMode = button.dataset.mode || "2";
        renderPlayerStatsDashboard();
      });
    }
  });

  if (ui.refreshLeaderboard && !ui.refreshLeaderboard.dataset.bound) {
    ui.refreshLeaderboard.dataset.bound = "1";
    ui.refreshLeaderboard.addEventListener("click", refreshLeaderboardNow);
  }
}

function renderSocialPanel() {
  if (!ui.socialPanel || !ui.socialStatus || !ui.socialSearchResult || !ui.socialFriendRequests || !ui.socialFriends || !ui.socialRoomInvites || !ui.socialRoomCard) {
    return;
  }

  const signedIn = Boolean(state.authUser);
  const room = state.socialActiveRoom;
  const signature = JSON.stringify({
    signedIn,
    currentPlayerId: state.currentPlayerId,
    socialBusy: state.socialBusy,
    socialStatusMessage: state.socialStatusMessage,
    socialStatusTone: state.socialStatusTone,
    socialSearchResult: state.socialSearchResult,
    socialFriendRequests: state.socialFriendRequests.map((item) => [item.id, item.fromGameId, item.toGameId]),
    socialFriends: state.socialFriends.map((item) => [item.uid, item.gameId]),
    socialRoomInvites: state.socialRoomInvites.map((item) => [item.id, item.fromGameId, item.mode]),
    socialActiveRoom: room
      ? {
          id: room.id,
          mode: room.mode,
          status: room.status,
          hostUid: room.hostUid,
          memberUids: room.memberUids,
          invitedUids: room.invitedUids,
          members: (room.members || []).map((member) => [member.uid, member.gameId]),
        }
      : null,
  });

  if (state.renderCache.social === signature) {
    return;
  }
  state.renderCache.social = signature;

  ui.socialPanel.classList.toggle("is-disabled", !signedIn);
  ui.socialSearchInput.disabled = !signedIn || state.socialBusy;
  ui.socialSearchButton.disabled = !signedIn || state.socialBusy;
  ui.socialStatus.className = `social-status is-${state.socialStatusTone || "info"}`;
  ui.socialStatus.textContent = state.socialStatusMessage || (signedIn
    ? "现在可以搜索好友、处理邀请、创建房间。"
    : "登录后可以搜索好友并创建房间。");

  ui.socialSearchResult.innerHTML = "";
  if (state.socialSearchResult?.type === "found") {
    const result = state.socialSearchResult;
    const card = document.createElement("article");
    card.className = "social-item";
    card.innerHTML = `
      <div>
        <strong>${result.gameId}</strong>
        <p>${result.isSelf ? "这是你自己的游戏 ID。" : result.isFriend ? "已经是你的好友了。" : "可以发送好友申请。"}</p>
      </div>
    `;
    const action = document.createElement("button");
    action.className = "ghost-btn";
    action.type = "button";
    action.textContent = result.isSelf ? "本人" : result.isFriend ? "已是好友" : "添加好友";
    action.disabled = result.isSelf || result.isFriend || state.socialBusy;
    if (!action.disabled) {
      action.addEventListener("click", () => handleSendFriendRequest(result.uid, result.gameId));
    }
    card.appendChild(action);
    ui.socialSearchResult.appendChild(card);
  }

  ui.socialRoomCard.innerHTML = "";
  if (!signedIn) {
    ui.socialRoomCard.appendChild(createEmptyState("登录后可以创建好友房间。"));
  } else if (!room) {
    const wrap = document.createElement("div");
    wrap.className = "social-room-inner";
    wrap.innerHTML = `
      <div>
        <strong>还没有等待中的房间</strong>
        <p>先创建一个 2 / 3 / 4 人房，再邀请好友加入。</p>
      </div>
    `;
    const actions = document.createElement("div");
    actions.className = "social-inline-actions";
    ["2", "3", "4"].forEach((mode) => {
      const button = document.createElement("button");
      button.className = "ghost-btn";
      button.type = "button";
      button.textContent = `创建${mode}人房`;
      button.disabled = state.socialBusy || !state.currentPlayerId;
      button.addEventListener("click", () => handleCreateRoom(mode));
      actions.appendChild(button);
    });
    wrap.appendChild(actions);
    ui.socialRoomCard.appendChild(wrap);
  } else {
    const members = Array.isArray(room.members) ? room.members : [];
    const targetCount = Number(room.mode || 2);
    const slotsLeft = Math.max(0, targetCount - members.length);
    const memberText = members.map((member) => member.gameId).join("、");
    const roomStatusText = room.status === "playing"
      ? "联机对局进行中"
      : slotsLeft > 0
        ? `等待中，还差 ${slotsLeft} 人`
        : "人数已满，可以开始联机";
    const card = document.createElement("div");
    card.className = "social-room-inner";
    card.innerHTML = `
      <div>
        <strong>${room.mode} 人房 · ${room.hostUid === state.authUser.uid ? "你是房主" : "好友房间"}</strong>
        <p>房间状态：${roomStatusText}</p>
        <p>当前成员：${memberText || "暂无"}</p>
      </div>
    `;
    const button = document.createElement("button");
    button.className = "ghost-btn";
    button.type = "button";
    button.textContent = room.hostUid === state.authUser.uid ? "关闭房间" : "离开房间";
    button.disabled = state.socialBusy;
    button.addEventListener("click", handleLeaveRoom);
    card.appendChild(button);
    const startButton = room.status === "waiting" && room.hostUid === state.authUser.uid && members.length === targetCount
      ? document.createElement("button")
      : null;
    if (startButton) {
      startButton.className = "ghost-btn";
      startButton.type = "button";
      startButton.textContent = "开始联机";
      startButton.disabled = state.socialBusy;
      startButton.addEventListener("click", handleStartRoomMatch);
      card.insertBefore(startButton, card.lastChild);
    }
    ui.socialRoomCard.appendChild(card);
  }

  ui.socialFriendRequests.innerHTML = "";
  if (!state.socialFriendRequests.length) {
    ui.socialFriendRequests.appendChild(createEmptyState("还没有新的好友申请。"));
  } else {
    state.socialFriendRequests.forEach((item) => {
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>想加你为好友</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = "通过";
      accept.disabled = state.socialBusy;
      accept.addEventListener("click", () => handleRespondFriendRequest(item.id, true));
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => handleRespondFriendRequest(item.id, false));
      actions.append(accept, reject);
      card.appendChild(actions);
      ui.socialFriendRequests.appendChild(card);
    });
  }

  ui.socialRoomInvites.innerHTML = "";
  if (!state.socialRoomInvites.length) {
    ui.socialRoomInvites.appendChild(createEmptyState("还没有新的房间邀请。"));
  } else {
    state.socialRoomInvites.forEach((item) => {
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>邀请你进入 ${item.mode} 人房</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = room ? "先离开当前房间" : "加入";
      accept.disabled = state.socialBusy;
      accept.addEventListener("click", () => {
        if (room) {
          setSocialStatus("你当前还在一个房间里，先点上面的“关闭房间”或“离开房间”，再来加入这个邀请。", "error");
          return;
        }
        handleRespondRoomInvite(item.id, true);
      });
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => handleRespondRoomInvite(item.id, false));
      actions.append(accept, reject);
      card.appendChild(actions);
      ui.socialRoomInvites.appendChild(card);
    });
  }

  ui.socialFriends.innerHTML = "";
  if (!state.socialFriends.length) {
    ui.socialFriends.appendChild(createEmptyState("还没有好友，先去搜索一个游戏 ID 吧。"));
  } else {
    state.socialFriends.forEach((friend) => {
      const card = document.createElement("article");
      card.className = "social-item";
      const memberUids = room?.memberUids || [];
      const invitedUids = room?.invitedUids || [];
      const roomMode = room?.mode || "";
      let inviteText = "先创建房间";
      let inviteDisabled = true;

      if (room) {
        if (room.hostUid !== state.authUser.uid) {
          inviteText = "仅房主可邀请";
        } else if (memberUids.includes(friend.uid)) {
          inviteText = "已在房间";
        } else if (invitedUids.includes(friend.uid)) {
          inviteText = "重新邀请";
          inviteDisabled = false;
        } else if (memberUids.length >= Number(room.mode || 2)) {
          inviteText = "房间已满";
        } else {
          inviteText = "邀请进房";
          inviteDisabled = false;
        }
      }

      card.innerHTML = `<div><strong>${friend.gameId}</strong><p>${room ? `可邀请进入 ${roomMode} 人房` : "先创建房间再邀请"}</p></div>`;
      const invite = document.createElement("button");
      invite.className = "ghost-btn";
      invite.type = "button";
      invite.textContent = inviteText;
      invite.disabled = state.socialBusy || inviteDisabled;
      if (!invite.disabled) {
        invite.addEventListener("click", () => handleInviteFriend(friend.uid, friend.gameId));
      }
      card.appendChild(invite);
      ui.socialFriends.appendChild(card);
    });
  }
}

function renderSocialPanel() {
  if (!ui.socialPanel || !ui.socialStatus || !ui.socialSearchResult || !ui.socialFriendRequests || !ui.socialFriends || !ui.socialRoomInvites || !ui.socialRoomCard) {
    return;
  }

  const signedIn = Boolean(state.authUser);
  const room = state.socialActiveRoom;
  const signature = JSON.stringify({
    signedIn,
    currentPlayerId: state.currentPlayerId,
    socialBusy: state.socialBusy,
    socialStatusMessage: state.socialStatusMessage,
    socialStatusTone: state.socialStatusTone,
    socialSearchResult: state.socialSearchResult,
    socialFriendRequests: state.socialFriendRequests.map((item) => [item.id, item.fromGameId, item.toGameId]),
    socialFriends: state.socialFriends.map((item) => [item.uid, item.gameId]),
    socialRoomInvites: state.socialRoomInvites.map((item) => [item.id, item.fromGameId, item.mode]),
    socialActiveRoom: room
      ? {
          id: room.id,
          mode: room.mode,
          status: room.status,
          hostUid: room.hostUid,
          memberUids: room.memberUids,
          invitedUids: room.invitedUids,
          members: (room.members || []).map((member) => [member.uid, member.gameId]),
        }
      : null,
  });

  if (state.renderCache.social === signature) {
    return;
  }
  state.renderCache.social = signature;

  ui.socialPanel.classList.toggle("is-disabled", !signedIn);
  ui.socialSearchInput.disabled = !signedIn || state.socialBusy;
  ui.socialSearchButton.disabled = !signedIn || state.socialBusy;
  ui.socialStatus.className = `social-status is-${state.socialStatusTone || "info"}`;
  ui.socialStatus.textContent = state.socialStatusMessage || (signedIn
    ? "现在可以搜索好友、处理邀请、创建房间。"
    : "登录后可以搜索好友并创建房间。");

  ui.socialSearchResult.innerHTML = "";
  if (state.socialSearchResult?.type === "found") {
    const result = state.socialSearchResult;
    const card = document.createElement("article");
    card.className = "social-item";
    card.innerHTML = `
      <div>
        <strong>${result.gameId}</strong>
        <p>${result.isSelf ? "这是你自己的游戏 ID。" : result.isFriend ? "已经是你的好友了。" : "可以发送好友申请。"}</p>
      </div>
    `;
    const action = document.createElement("button");
    action.className = "ghost-btn";
    action.type = "button";
    action.textContent = result.isSelf ? "本人" : result.isFriend ? "已是好友" : "添加好友";
    action.disabled = result.isSelf || result.isFriend || state.socialBusy;
    if (!action.disabled) {
      action.addEventListener("click", () => handleSendFriendRequest(result.uid, result.gameId));
    }
    card.appendChild(action);
    ui.socialSearchResult.appendChild(card);
  }

  ui.socialRoomCard.innerHTML = "";
  if (!signedIn) {
    ui.socialRoomCard.appendChild(createEmptyState("登录后可以创建好友房间。"));
  } else if (!room) {
    const wrap = document.createElement("div");
    wrap.className = "social-room-inner";
    wrap.innerHTML = `
      <div>
        <strong>还没有等待中的房间</strong>
        <p>先创建一个 2 / 3 / 4 人房，再邀请好友加入。</p>
      </div>
    `;
    const actions = document.createElement("div");
    actions.className = "social-inline-actions";
    ["2", "3", "4"].forEach((mode) => {
      const button = document.createElement("button");
      button.className = "ghost-btn";
      button.type = "button";
      button.textContent = `创建${mode}人房`;
      button.disabled = state.socialBusy || !state.currentPlayerId;
      button.addEventListener("click", () => handleCreateRoom(mode));
      actions.appendChild(button);
    });
    wrap.appendChild(actions);
    ui.socialRoomCard.appendChild(wrap);
  } else {
    const members = Array.isArray(room.members) ? room.members : [];
    const targetCount = Number(room.mode || 2);
    const slotsLeft = Math.max(0, targetCount - members.length);
    const memberText = members.map((member) => member.gameId).join("、");
    const roomStatusText = room.status === "playing"
      ? "联机对局进行中"
      : slotsLeft > 0
        ? `等待中，还差 ${slotsLeft} 人`
        : "人数已满，可以开始联机";
    const card = document.createElement("div");
    card.className = "social-room-inner";
    card.innerHTML = `
      <div>
        <strong>${room.mode} 人房 · ${room.hostUid === state.authUser.uid ? "你是房主" : "好友房间"}</strong>
        <p>房间状态：${roomStatusText}</p>
        <p>当前成员：${memberText || "暂无"}</p>
      </div>
    `;
    const button = document.createElement("button");
    button.className = "ghost-btn";
    button.type = "button";
    button.textContent = room.hostUid === state.authUser.uid ? "关闭房间" : "离开房间";
    button.disabled = state.socialBusy;
    button.addEventListener("click", handleLeaveRoom);
    card.appendChild(button);
    const startButton = room.status === "waiting" && room.hostUid === state.authUser.uid && members.length === targetCount
      ? document.createElement("button")
      : null;
    if (startButton) {
      startButton.className = "ghost-btn";
      startButton.type = "button";
      startButton.textContent = "开始联机";
      startButton.disabled = state.socialBusy;
      startButton.addEventListener("click", handleStartRoomMatch);
      card.insertBefore(startButton, card.lastChild);
    }
    ui.socialRoomCard.appendChild(card);
  }

  ui.socialFriendRequests.innerHTML = "";
  if (!state.socialFriendRequests.length) {
    ui.socialFriendRequests.appendChild(createEmptyState("还没有新的好友申请。"));
  } else {
    state.socialFriendRequests.forEach((item) => {
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>想加你为好友</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = "通过";
      accept.disabled = state.socialBusy;
      accept.addEventListener("click", () => handleRespondFriendRequest(item.id, true));
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => handleRespondFriendRequest(item.id, false));
      actions.append(accept, reject);
      card.appendChild(actions);
      ui.socialFriendRequests.appendChild(card);
    });
  }

  ui.socialRoomInvites.innerHTML = "";
  if (!state.socialRoomInvites.length) {
    ui.socialRoomInvites.appendChild(createEmptyState("还没有新的房间邀请。"));
  } else {
    state.socialRoomInvites.forEach((item) => {
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>邀请你进入 ${item.mode} 人房</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = room ? "先离开当前房间" : "加入";
      accept.disabled = state.socialBusy;
      accept.addEventListener("click", () => {
        if (room) {
          setSocialStatus("你当前还在一个房间里，先点上面的“关闭房间”或“离开房间”，再来加入这个邀请。", "error");
          return;
        }
        handleRespondRoomInvite(item.id, true);
      });
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => handleRespondRoomInvite(item.id, false));
      actions.append(accept, reject);
      card.appendChild(actions);
      ui.socialRoomInvites.appendChild(card);
    });
  }

  ui.socialFriends.innerHTML = "";
  if (!state.socialFriends.length) {
    ui.socialFriends.appendChild(createEmptyState("还没有好友，先去搜索一个游戏 ID 吧。"));
  } else {
    state.socialFriends.forEach((friend) => {
      const card = document.createElement("article");
      card.className = "social-item";
      const memberUids = room?.memberUids || [];
      const invitedUids = room?.invitedUids || [];
      const roomMode = room?.mode || "";
      let inviteText = "先创建房间";
      let inviteDisabled = true;

      if (room) {
        if (room.hostUid !== state.authUser.uid) {
          inviteText = "仅房主可邀请";
        } else if (memberUids.includes(friend.uid)) {
          inviteText = "已在房间";
        } else if (invitedUids.includes(friend.uid)) {
          inviteText = "重新邀请";
          inviteDisabled = false;
        } else if (memberUids.length >= Number(room.mode || 2)) {
          inviteText = "房间已满";
        } else {
          inviteText = "邀请进房";
          inviteDisabled = false;
        }
      }

      card.innerHTML = `<div><strong>${friend.gameId}</strong><p>${room ? `可邀请进入 ${roomMode} 人房` : "先创建房间再邀请"}</p></div>`;
      const invite = document.createElement("button");
      invite.className = "ghost-btn";
      invite.type = "button";
      invite.textContent = inviteText;
      invite.disabled = state.socialBusy || inviteDisabled;
      if (!invite.disabled) {
        invite.addEventListener("click", () => handleInviteFriend(friend.uid, friend.gameId));
      }
      card.appendChild(invite);
      ui.socialFriends.appendChild(card);
    });
  }
}

function renderSocialPanel() {
  if (!ui.socialPanel || !ui.socialStatus || !ui.socialSearchResult || !ui.socialFriendRequests || !ui.socialFriends || !ui.socialRoomInvites || !ui.socialRoomCard) {
    return;
  }

  const signedIn = Boolean(state.authUser);
  const room = state.socialActiveRoom;
  const signature = JSON.stringify({
    signedIn,
    currentPlayerId: state.currentPlayerId,
    socialBusy: state.socialBusy,
    socialStatusMessage: state.socialStatusMessage,
    socialStatusTone: state.socialStatusTone,
    socialSearchResult: state.socialSearchResult,
    socialFriendRequests: state.socialFriendRequests.map((item) => [item.id, item.fromGameId, item.toGameId]),
    socialFriends: state.socialFriends.map((item) => [item.uid, item.gameId]),
    socialRoomInvites: state.socialRoomInvites.map((item) => [item.id, item.fromGameId, item.mode]),
    socialActiveRoom: room
      ? {
          id: room.id,
          mode: room.mode,
          status: room.status,
          hostUid: room.hostUid,
          memberUids: room.memberUids,
          invitedUids: room.invitedUids,
          members: (room.members || []).map((member) => [member.uid, member.gameId]),
        }
      : null,
  });

  if (state.renderCache.social === signature) {
    return;
  }
  state.renderCache.social = signature;

  ui.socialPanel.classList.toggle("is-disabled", !signedIn);
  ui.socialSearchInput.disabled = !signedIn || state.socialBusy;
  ui.socialSearchButton.disabled = !signedIn || state.socialBusy;
  ui.socialStatus.className = `social-status is-${state.socialStatusTone || "info"}`;
  ui.socialStatus.textContent = state.socialStatusMessage || (signedIn
    ? "现在可以搜索好友、处理邀请、创建房间。"
    : "登录后可以搜索好友并创建房间。");

  ui.socialSearchResult.innerHTML = "";
  if (state.socialSearchResult?.type === "found") {
    const result = state.socialSearchResult;
    const card = document.createElement("article");
    card.className = "social-item";
    card.innerHTML = `
      <div>
        <strong>${result.gameId}</strong>
        <p>${result.isSelf ? "这是你自己的游戏 ID。" : result.isFriend ? "已经是你的好友了。" : "可以发送好友申请。"}</p>
      </div>
    `;
    const action = document.createElement("button");
    action.className = "ghost-btn";
    action.type = "button";
    action.textContent = result.isSelf ? "本人" : result.isFriend ? "已是好友" : "添加好友";
    action.disabled = result.isSelf || result.isFriend || state.socialBusy;
    if (!action.disabled) {
      action.addEventListener("click", () => handleSendFriendRequest(result.uid, result.gameId));
    }
    card.appendChild(action);
    ui.socialSearchResult.appendChild(card);
  }

  ui.socialRoomCard.innerHTML = "";
  if (!signedIn) {
    ui.socialRoomCard.appendChild(createEmptyState("登录后可以创建好友房间。"));
  } else if (!room) {
    const wrap = document.createElement("div");
    wrap.className = "social-room-inner";
    wrap.innerHTML = `
      <div>
        <strong>还没有等待中的房间</strong>
        <p>先创建一个 2 / 3 / 4 人房，再邀请好友加入。</p>
      </div>
    `;
    const actions = document.createElement("div");
    actions.className = "social-inline-actions";
    ["2", "3", "4"].forEach((mode) => {
      const button = document.createElement("button");
      button.className = "ghost-btn";
      button.type = "button";
      button.textContent = `创建${mode}人房`;
      button.disabled = state.socialBusy || !state.currentPlayerId;
      button.addEventListener("click", () => handleCreateRoom(mode));
      actions.appendChild(button);
    });
    wrap.appendChild(actions);
    ui.socialRoomCard.appendChild(wrap);
  } else {
    const members = Array.isArray(room.members) ? room.members : [];
    const targetCount = Number(room.mode || 2);
    const slotsLeft = Math.max(0, targetCount - members.length);
    const memberText = members.map((member) => member.gameId).join("、");
    const roomStatusText = room.status === "playing"
      ? "联机对局进行中"
      : slotsLeft > 0
        ? `等待中，还差 ${slotsLeft} 人`
        : "人数已满，可以开始联机";
    const card = document.createElement("div");
    card.className = "social-room-inner";
    card.innerHTML = `
      <div>
        <strong>${room.mode} 人房 · ${room.hostUid === state.authUser.uid ? "你是房主" : "好友房间"}</strong>
        <p>房间状态：${roomStatusText}</p>
        <p>当前成员：${memberText || "暂无"}</p>
      </div>
    `;
    const button = document.createElement("button");
    button.className = "ghost-btn";
    button.type = "button";
    button.textContent = room.hostUid === state.authUser.uid ? "关闭房间" : "离开房间";
    button.disabled = state.socialBusy;
    button.addEventListener("click", handleLeaveRoom);
    card.appendChild(button);
    const startButton = room.status === "waiting" && room.hostUid === state.authUser.uid && members.length === targetCount
      ? document.createElement("button")
      : null;
    if (startButton) {
      startButton.className = "ghost-btn";
      startButton.type = "button";
      startButton.textContent = "开始联机";
      startButton.disabled = state.socialBusy;
      startButton.addEventListener("click", handleStartRoomMatch);
      card.insertBefore(startButton, card.lastChild);
    }
    ui.socialRoomCard.appendChild(card);
  }

  ui.socialFriendRequests.innerHTML = "";
  if (!state.socialFriendRequests.length) {
    ui.socialFriendRequests.appendChild(createEmptyState("还没有新的好友申请。"));
  } else {
    state.socialFriendRequests.forEach((item) => {
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>想加你为好友</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = "通过";
      accept.disabled = state.socialBusy;
      accept.addEventListener("click", () => handleRespondFriendRequest(item.id, true));
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => handleRespondFriendRequest(item.id, false));
      actions.append(accept, reject);
      card.appendChild(actions);
      ui.socialFriendRequests.appendChild(card);
    });
  }

  ui.socialRoomInvites.innerHTML = "";
  if (!state.socialRoomInvites.length) {
    ui.socialRoomInvites.appendChild(createEmptyState("还没有新的房间邀请。"));
  } else {
    state.socialRoomInvites.forEach((item) => {
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>邀请你进入 ${item.mode} 人房</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = room ? "先离开当前房间" : "加入";
      accept.disabled = state.socialBusy;
      accept.addEventListener("click", () => {
        if (room) {
          setSocialStatus("你当前还在一个房间里，先点上面的“关闭房间”或“离开房间”，再来加入这个邀请。", "error");
          return;
        }
        handleRespondRoomInvite(item.id, true);
      });
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => handleRespondRoomInvite(item.id, false));
      actions.append(accept, reject);
      card.appendChild(actions);
      ui.socialRoomInvites.appendChild(card);
    });
  }

  ui.socialFriends.innerHTML = "";
  if (!state.socialFriends.length) {
    ui.socialFriends.appendChild(createEmptyState("还没有好友，先去搜索一个游戏 ID 吧。"));
  } else {
    state.socialFriends.forEach((friend) => {
      const card = document.createElement("article");
      card.className = "social-item";
      const memberUids = room?.memberUids || [];
      const invitedUids = room?.invitedUids || [];
      const roomMode = room?.mode || "";
      let inviteText = "先创建房间";
      let inviteDisabled = true;

      if (room) {
        if (room.hostUid !== state.authUser.uid) {
          inviteText = "仅房主可邀请";
        } else if (memberUids.includes(friend.uid)) {
          inviteText = "已在房间";
        } else if (invitedUids.includes(friend.uid)) {
          inviteText = "重新邀请";
          inviteDisabled = false;
        } else if (memberUids.length >= Number(room.mode || 2)) {
          inviteText = "房间已满";
        } else {
          inviteText = "邀请进房";
          inviteDisabled = false;
        }
      }

      card.innerHTML = `<div><strong>${friend.gameId}</strong><p>${room ? `可邀请进入 ${roomMode} 人房` : "先创建房间再邀请"}</p></div>`;
      const invite = document.createElement("button");
      invite.className = "ghost-btn";
      invite.type = "button";
      invite.textContent = inviteText;
      invite.disabled = state.socialBusy || inviteDisabled;
      if (!invite.disabled) {
        invite.addEventListener("click", () => handleInviteFriend(friend.uid, friend.gameId));
      }
      card.appendChild(invite);
      ui.socialFriends.appendChild(card);
    });
  }
}

async function handleInviteFriend(friendUid, friendGameId) {
  if (!db || !state.authUser || !state.currentPlayerId) {
    setSocialStatus("先登录并绑定游戏 ID，再邀请好友。");
    return;
  }

  const room = state.socialActiveRoom;
  if (!room || room.status !== "waiting") {
    setSocialStatus("请先创建一个等待中的房间。");
    return;
  }
  if (room.hostUid !== state.authUser.uid) {
    setSocialStatus("只有房主可以继续邀请好友。");
    return;
  }
  if ((room.memberUids || []).includes(friendUid)) {
    setSocialStatus(`${friendGameId} 已经在房间里了。`);
    return;
  }
  if ((room.memberUids || []).length >= Number(room.mode || 2)) {
    setSocialStatus("房间人数已经满了。");
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    if ((room.invitedUids || []).includes(friendUid)) {
      const pendingInvite = await db.collection(FIRESTORE_COLLECTIONS.roomInvites)
        .where("roomId", "==", room.id)
        .where("toUid", "==", friendUid)
        .where("status", "==", "pending")
        .limit(1)
        .get();

      if (!pendingInvite.empty) {
        setSocialStatus(`已经邀请过 ${friendGameId} 了。`);
        return;
      }

      await db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id).set({
        invitedUids: firebase.firestore.FieldValue.arrayRemove(friendUid),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    await db.collection(FIRESTORE_COLLECTIONS.roomInvites).add({
      roomId: room.id,
      mode: Number(room.mode || 2),
      fromUid: state.authUser.uid,
      fromGameId: state.currentPlayerId,
      toUid: friendUid,
      toGameId: friendGameId,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id).set({
      invitedUids: firebase.firestore.FieldValue.arrayUnion(friendUid),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    setSocialStatus(`已邀请 ${friendGameId} 进入 ${room.mode} 人房。`, "success");
  } catch (error) {
    setSocialStatus(`发送房间邀请失败：${formatAuthError(error)}`, "error");
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

async function handleRespondRoomInvite(inviteId, accept) {
  if (!db || !state.authUser || !state.currentPlayerId) {
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    const inviteRef = db.collection(FIRESTORE_COLLECTIONS.roomInvites).doc(inviteId);
    await db.runTransaction(async (transaction) => {
      const inviteSnap = await transaction.get(inviteRef);
      if (!inviteSnap.exists) {
        throw new Error("INVITE_MISSING");
      }
      const invite = inviteSnap.data();
      const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(invite.roomId);

      if (!accept) {
        transaction.set(roomRef, {
          invitedUids: firebase.firestore.FieldValue.arrayRemove(invite.toUid),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.set(inviteRef, {
          status: "rejected",
          respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
      }

      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists) {
        throw new Error("ROOM_MISSING");
      }
      const room = roomSnap.data();
      const memberUids = Array.isArray(room.memberUids) ? [...room.memberUids] : [];
      const members = Array.isArray(room.members) ? [...room.members] : [];
      if (room.status !== "waiting") {
        throw new Error("ROOM_CLOSED");
      }
      if (!memberUids.includes(state.authUser.uid)) {
        if (memberUids.length >= Number(room.mode || 2)) {
          throw new Error("ROOM_FULL");
        }
        memberUids.push(state.authUser.uid);
        members.push({
          uid: state.authUser.uid,
          gameId: state.currentPlayerId,
          joinedAt: Date.now(),
        });
      }

      transaction.set(roomRef, {
        memberUids,
        members,
        invitedUids: firebase.firestore.FieldValue.arrayRemove(invite.toUid),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(inviteRef, {
        status: "accepted",
        respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    setSocialStatus(accept ? "已加入好友房间。" : "已拒绝房间邀请。", "success");
  } catch (error) {
    const permissionBlocked = error?.code === "permission-denied";
    const message = error?.message === "ROOM_FULL"
      ? "这个房间已经满了，没法再加入。"
      : error?.message === "ROOM_CLOSED"
        ? "这个房间已经不是等待状态了，不能再加入。"
        : error?.message === "ROOM_MISSING"
          ? "这个房间已经不存在了。"
          : permissionBlocked
            ? "加入失败：不是你还在别的房间里，而是 Firebase 规则还没允许被邀请的人把自己加入房间，所以数据库把这一步拦住了。"
            : `处理房间邀请失败：${formatAuthError(error)}`;
    setSocialStatus(message, "error");
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}


async function refreshLeaderboardNow() {
  state.leaderboardRefreshing = true;
  renderPlayerStatsDashboard();
  await loadLeaderboard();
  if (state.authUser) {
    await loadCurrentUserProfile();
  }
  state.leaderboardRefreshing = false;
  renderPlayerStatsDashboard();
  renderAuthControls();
}

function ensureSocialPanel() {
  if (document.getElementById("social-panel")) {
    bindSocialPanelRefs();
    return;
  }

  const anchor = ui.playerStatsCard?.parentElement;
  if (!anchor || !ui.playerStatsCard) {
    return;
  }

  const panel = document.createElement("section");
  panel.className = "social-panel";
  panel.id = "social-panel";
  panel.innerHTML = `
    <div class="panel-head compact-head">
      <h2>好友与邀请</h2>
      <p>搜索游戏 ID、添加好友，并邀请好友进入 2 / 3 / 4 人等待房间。</p>
    </div>
    <div class="social-search-row">
      <input id="social-search-id" type="text" maxlength="20" placeholder="搜索游戏 ID">
      <button id="social-search-btn" class="ghost-btn" type="button">搜索</button>
    </div>
    <p id="social-status" class="social-status">登录后可以搜索好友并创建房间。</p>
    <div id="social-search-result" class="social-card-list"></div>
    <div id="social-room-card" class="social-room-card"></div>
    <div class="social-columns">
      <div class="social-column">
        <h3>好友申请</h3>
        <div id="social-friend-requests" class="social-card-list"></div>
      </div>
      <div class="social-column">
        <h3>房间邀请</h3>
        <div id="social-room-invites" class="social-card-list"></div>
      </div>
      <div class="social-column social-column-wide">
        <h3>好友列表</h3>
        <div id="social-friends" class="social-card-list"></div>
      </div>
    </div>
  `;

  anchor.insertBefore(panel, ui.playerStatsCard);
  bindSocialPanelRefs();
}

function bindSocialPanelRefs() {
  ui.socialPanel = document.getElementById("social-panel");
  ui.socialStatus = document.getElementById("social-status");
  ui.socialSearchInput = document.getElementById("social-search-id");
  ui.socialSearchButton = document.getElementById("social-search-btn");
  ui.socialSearchResult = document.getElementById("social-search-result");
  ui.socialFriendRequests = document.getElementById("social-friend-requests");
  ui.socialFriends = document.getElementById("social-friends");
  ui.socialRoomInvites = document.getElementById("social-room-invites");
  ui.socialRoomCard = document.getElementById("social-room-card");

  if (ui.socialSearchButton && !ui.socialSearchButton.dataset.bound) {
    ui.socialSearchButton.dataset.bound = "1";
    ui.socialSearchButton.addEventListener("click", handleSocialSearch);
  }
  if (ui.socialSearchInput && !ui.socialSearchInput.dataset.bound) {
    ui.socialSearchInput.dataset.bound = "1";
    ui.socialSearchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSocialSearch();
      }
    });
  }
}

function setSocialStatus(message, tone = "info") {
  state.socialStatusMessage = message;
  state.socialStatusTone = tone;
  renderSocialPanel();
}

function resetSocialState() {
  state.socialSearchResult = null;
  state.socialFriendRequests = [];
  state.socialFriends = [];
  state.socialRoomInvites = [];
  state.socialActiveRoom = null;
  state.socialBusy = false;
  state.socialStatusTone = "info";
  clearMultiplayerState();
}

function clearSocialListeners() {
  state.socialUnsubs.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch (error) {
      // ignore listener cleanup errors
    }
  });
  state.socialUnsubs = [];
}

function clearMultiplayerState() {
  state.multiplayer = {
    active: false,
    roomId: "",
    localHand: [],
  };
}

function isMultiplayerActive() {
  return Boolean(state.multiplayer.active && state.socialActiveRoom?.gameState);
}

function createHiddenHand(count, uid) {
  return Array.from({ length: count }, (_, index) => ({
    id: `hidden-${uid}-${index}`,
    suit: "spades",
    rank: "?",
    playValue: 0,
    scoreValue: 0,
    hidden: true,
  }));
}

function serializeRoomPlayersPublic() {
  return state.players.map((player) => ({
    uid: player.uid || player.id,
    name: player.name,
    handCount: player.hand.length,
    captured: [...player.captured],
    lastAction: player.lastAction ? { ...player.lastAction, cards: [...(player.lastAction.cards || [])] } : null,
  }));
}

function serializeRoomGameState() {
  return {
    phase: state.phase,
    tableCards: dedupeCards(state.tableCards),
    drawPile: [...state.drawPile],
    pendingDrawCard: state.pendingDrawCard ? { ...state.pendingDrawCard } : null,
    currentPlayerUid: getCurrentPlayer()?.uid || getCurrentPlayer()?.id || null,
    playersPublic: serializeRoomPlayersPublic(),
    log: [...state.log],
    actionDisplay: state.actionDisplay ? { ...state.actionDisplay, cards: [...(state.actionDisplay.cards || [])] } : null,
    feedback: state.feedback ? { ...state.feedback } : null,
    lastFinishedResult: state.lastFinishedResult
      ? state.lastFinishedResult.map((item) => ({ ...item, redCards: [...item.redCards] }))
      : null,
    lastFinishedAt: state.lastFinishedAt || "",
  };
}

async function loadCurrentRoomHand(roomId) {
  if (!db || !state.authUser || !roomId) {
    return [];
  }

  const snapshot = await db.collection(FIRESTORE_COLLECTIONS.rooms).doc(roomId).collection("hands").doc(state.authUser.uid).get();
  const data = snapshot.exists ? snapshot.data() : {};
  return Array.isArray(data.cards) ? data.cards : [];
}

function getFriendPairId(uidA, uidB) {
  return [uidA, uidB].sort().join("__");
}

function isFriendWithUid(uid) {
  return state.socialFriends.some((friend) => friend.uid === uid);
}

async function refreshFriendsList() {
  if (!db || !state.authUser) {
    state.socialFriends = [];
    return;
  }

  const currentUid = state.authUser.uid;
  const [aSnapshot, bSnapshot] = await Promise.all([
    db.collection(FIRESTORE_COLLECTIONS.friendships).where("uidA", "==", currentUid).get(),
    db.collection(FIRESTORE_COLLECTIONS.friendships).where("uidB", "==", currentUid).get(),
  ]);

  const nextFriends = [];
  aSnapshot.forEach((doc) => {
    const data = doc.data();
    nextFriends.push({
      friendshipId: doc.id,
      uid: data.uidB,
      gameId: data.gameIdB,
      createdAt: data.createdAt || null,
    });
  });
  bSnapshot.forEach((doc) => {
    const data = doc.data();
    nextFriends.push({
      friendshipId: doc.id,
      uid: data.uidA,
      gameId: data.gameIdA,
      createdAt: data.createdAt || null,
    });
  });

  nextFriends.sort((a, b) => a.gameId.localeCompare(b.gameId, "zh-CN"));
  state.socialFriends = nextFriends;
}

async function refreshSocialData() {
  if (!db || !state.authUser) {
    resetSocialState();
    renderSocialPanel();
    return;
  }

  const currentUid = state.authUser.uid;
  const [friendRequestsSnap, roomInvitesSnap, roomsSnap] = await Promise.all([
    db.collection(FIRESTORE_COLLECTIONS.friendRequests)
      .where("toUid", "==", currentUid)
      .where("status", "==", "pending")
      .get(),
    db.collection(FIRESTORE_COLLECTIONS.roomInvites)
      .where("toUid", "==", currentUid)
      .where("status", "==", "pending")
      .get(),
    db.collection(FIRESTORE_COLLECTIONS.rooms)
      .where("memberUids", "array-contains", currentUid)
      .get(),
  ]);

  state.socialFriendRequests = friendRequestsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  state.socialRoomInvites = roomInvitesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const activeRoom = roomsSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((room) => room.status === "waiting" || room.status === "playing")
    .sort((a, b) => {
      const aTime = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
      const bTime = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
      return bTime - aTime;
    })[0] || null;

  let normalizedActiveRoom = activeRoom;
  if (activeRoom) {
    try {
      const outgoingInvitesSnap = await db.collection(FIRESTORE_COLLECTIONS.roomInvites)
        .where("roomId", "==", activeRoom.id)
        .where("fromUid", "==", currentUid)
        .where("status", "==", "pending")
        .get();

      const pendingInviteUids = outgoingInvitesSnap.docs.map((doc) => doc.data()?.toUid).filter(Boolean);
      normalizedActiveRoom = {
        ...activeRoom,
        invitedUids: pendingInviteUids,
      };
    } catch (error) {
      normalizedActiveRoom = activeRoom;
    }
  }

  state.socialActiveRoom = normalizedActiveRoom;
  await refreshFriendsList();
  if (normalizedActiveRoom?.status === "playing" && normalizedActiveRoom.gameState) {
    const localHand = await loadCurrentRoomHand(normalizedActiveRoom.id);
    applyMultiplayerRoomState(normalizedActiveRoom, localHand);
  } else if (!normalizedActiveRoom && state.multiplayer.active) {
    clearMultiplayerState();
  }
  renderSocialPanel();
}

function startSocialSync() {
  if (!db || !state.authUser) {
    return;
  }

  clearSocialListeners();
  const currentUid = state.authUser.uid;
  const listenerConfigs = [
    db.collection(FIRESTORE_COLLECTIONS.friendRequests)
      .where("toUid", "==", currentUid)
      .where("status", "==", "pending"),
    db.collection(FIRESTORE_COLLECTIONS.roomInvites)
      .where("toUid", "==", currentUid)
      .where("status", "==", "pending"),
    db.collection(FIRESTORE_COLLECTIONS.rooms)
      .where("memberUids", "array-contains", currentUid),
  ];

  listenerConfigs.forEach((query) => {
    const unsubscribe = query.onSnapshot(async () => {
      await refreshSocialData();
    }, (error) => {
      setSocialStatus(`同步好友/房间失败：${formatAuthError(error)}`);
    });
    state.socialUnsubs.push(unsubscribe);
  });

  refreshSocialData();
}

async function handleSocialSearch() {
  if (!db || !state.authUser) {
    setSocialStatus("请先登录账号，再搜索好友。");
    return;
  }

  const keyword = normalizePlayerId(ui.socialSearchInput?.value || "");
  if (!keyword) {
    setSocialStatus("先输入想搜索的游戏 ID。");
    return;
  }

  state.socialBusy = true;
  setSocialStatus(`正在搜索 ${keyword} ...`);

  try {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.gameIds).doc(keyword.toLowerCase()).get();
    if (!snapshot.exists) {
      state.socialSearchResult = { type: "empty", keyword };
      setSocialStatus("没有找到这个游戏 ID。");
      return;
    }

    const data = snapshot.data();
    const targetUid = data?.uid || "";
    const gameId = data?.gameId || keyword;
    const isSelf = targetUid === state.authUser.uid;
    const isFriend = isFriendWithUid(targetUid);
    const alreadyRequested = state.socialFriendRequests.some((item) => item.fromUid === targetUid)
      || state.socialRoomInvites.some((item) => item.fromUid === targetUid);

    state.socialSearchResult = {
      type: "found",
      uid: targetUid,
      gameId,
      isSelf,
      isFriend,
      alreadyRequested,
    };
    setSocialStatus(isSelf ? "这是你自己的游戏 ID。" : `已找到 ${gameId}。`);
  } catch (error) {
    setSocialStatus(`搜索失败：${formatAuthError(error)}`);
  } finally {
    state.socialBusy = false;
    renderSocialPanel();
  }
}

async function handleSendFriendRequest(targetUid, targetGameId) {
  if (!db || !state.authUser || !state.currentPlayerId) {
    setSocialStatus("先登录并确认自己的游戏 ID，再发送好友申请。");
    return;
  }
  if (targetUid === state.authUser.uid) {
    setSocialStatus("不能给自己发送好友申请。");
    return;
  }
  if (isFriendWithUid(targetUid)) {
    setSocialStatus("你们已经是好友了。");
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    const existing = await db.collection(FIRESTORE_COLLECTIONS.friendRequests)
      .where("fromUid", "==", state.authUser.uid)
      .where("toUid", "==", targetUid)
      .where("status", "==", "pending")
      .get();
    if (!existing.empty) {
      setSocialStatus("好友申请已经发出，等对方处理即可。");
      return;
    }

    await db.collection(FIRESTORE_COLLECTIONS.friendRequests).add({
      fromUid: state.authUser.uid,
      fromGameId: state.currentPlayerId,
      toUid: targetUid,
      toGameId: targetGameId,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    state.socialSearchResult = null;
    if (ui.socialSearchInput) {
      ui.socialSearchInput.value = "";
    }
    setSocialStatus(`已向 ${targetGameId} 发出好友申请。`);
  } catch (error) {
    setSocialStatus(`发送好友申请失败：${formatAuthError(error)}`);
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

async function handleRespondFriendRequest(requestId, accept) {
  if (!db || !state.authUser) {
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    const requestRef = db.collection(FIRESTORE_COLLECTIONS.friendRequests).doc(requestId);
    const requestSnap = await requestRef.get();
    if (!requestSnap.exists) {
      setSocialStatus("这条好友申请已经不存在了。");
      return;
    }

    const data = requestSnap.data();
    if (!accept) {
      await requestRef.set({
        status: "rejected",
        respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      setSocialStatus(`已拒绝 ${data.fromGameId} 的好友申请。`);
      return;
    }

    const pairId = getFriendPairId(data.fromUid, data.toUid);
    await db.runTransaction(async (transaction) => {
      const friendshipRef = db.collection(FIRESTORE_COLLECTIONS.friendships).doc(pairId);
      transaction.set(friendshipRef, {
        uidA: data.fromUid,
        gameIdA: data.fromGameId,
        uidB: data.toUid,
        gameIdB: data.toGameId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(requestRef, {
        status: "accepted",
        respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    setSocialStatus(`已和 ${data.fromGameId} 成为好友。`);
  } catch (error) {
    setSocialStatus(`处理好友申请失败：${formatAuthError(error)}`);
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

async function handleCreateRoom(mode) {
  if (!db || !state.authUser || !state.currentPlayerId) {
    setSocialStatus("先登录并绑定游戏 ID，再创建房间。");
    return;
  }
  if (state.socialActiveRoom && state.socialActiveRoom.status === "waiting") {
    setSocialStatus("你已经在一个等待中的房间里了。");
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    await db.collection(FIRESTORE_COLLECTIONS.rooms).add({
      mode: Number(mode),
      status: "waiting",
      hostUid: state.authUser.uid,
      hostGameId: state.currentPlayerId,
      memberUids: [state.authUser.uid],
      members: [
        {
          uid: state.authUser.uid,
          gameId: state.currentPlayerId,
          joinedAt: Date.now(),
        },
      ],
      invitedUids: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setSocialStatus(`已创建 ${mode} 人房，去邀请好友吧。`);
  } catch (error) {
    setSocialStatus(`创建房间失败：${formatAuthError(error)}`);
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

async function handleStartRoomMatch() {
  if (!db || !state.authUser || !state.currentPlayerId) {
    setSocialStatus("先登录并绑定游戏 ID，再开始联机对局。");
    return;
  }

  const room = state.socialActiveRoom;
  if (!room || room.status !== "waiting") {
    setSocialStatus("当前没有等待中的房间。");
    return;
  }
  if (room.hostUid !== state.authUser.uid) {
    setSocialStatus("只有房主可以开始联机对局。");
    return;
  }

  const members = Array.isArray(room.members) ? [...room.members] : [];
  if (members.length !== Number(room.mode || 2)) {
    setSocialStatus(`人数还没到齐，需要 ${room.mode} 人才能开始。`);
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    const config = GAME_CONFIG[Number(room.mode || 2)];
    const deck = shuffle(createDeck());
    const orderedMembers = members
      .slice()
      .sort((a, b) => Number(a.joinedAt || 0) - Number(b.joinedAt || 0) || String(a.gameId || "").localeCompare(String(b.gameId || ""), "zh-CN"));

    const players = orderedMembers.map((member) => ({
      uid: member.uid,
      id: member.uid,
      name: member.gameId,
      isHuman: member.uid === state.authUser.uid,
      hand: deck.splice(0, config.hand),
      captured: [],
      lastAction: null,
      diceTrail: [],
    }));

    const tableCards = deck.splice(0, config.table);
    const drawPile = deck.splice(0, config.draw);
    const gameState = {
      phase: "human-turn",
      tableCards,
      drawPile,
      pendingDrawCard: null,
      currentPlayerUid: orderedMembers[0].uid,
      playersPublic: players.map((player) => ({
        uid: player.uid,
        name: player.name,
        handCount: player.hand.length,
        captured: [],
        lastAction: null,
      })),
      log: [
        {
          id: `room-start-${Date.now()}`,
          message: `${room.mode} 人联机房开始对局。`,
        },
      ],
      actionDisplay: null,
      feedback: {
        message: `${orderedMembers[0].gameId} 先手，联机对局开始。`,
        type: "info",
      },
      lastFinishedResult: null,
      lastFinishedAt: "",
    };

    const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id);
    const batch = db.batch();
    batch.set(roomRef, {
      status: "playing",
      invitedUids: [],
      gameState,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    players.forEach((player) => {
      batch.set(roomRef.collection("hands").doc(player.uid), {
        cards: [...player.hand],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();

    const localPlayer = players.find((player) => player.uid === state.authUser.uid);
    applyMultiplayerRoomState({
      ...room,
      status: "playing",
      gameState,
    }, localPlayer ? localPlayer.hand : []);
    setSocialStatus("联机对局已开始。");
  } catch (error) {
    setSocialStatus(`开始联机失败：${formatAuthError(error)}`);
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

async function handleInviteFriend(friendUid, friendGameId) {
  if (!db || !state.authUser || !state.currentPlayerId) {
    setSocialStatus("先登录并绑定游戏 ID，再邀请好友。");
    return;
  }

  const room = state.socialActiveRoom;
  if (!room || room.status !== "waiting") {
    setSocialStatus("请先创建一个等待中的房间。");
    return;
  }
  if (room.hostUid !== state.authUser.uid) {
    setSocialStatus("只有房主可以继续邀请好友。");
    return;
  }
  if ((room.memberUids || []).includes(friendUid)) {
    setSocialStatus(`${friendGameId} 已经在房间里了。`);
    return;
  }
  if ((room.invitedUids || []).includes(friendUid)) {
    setSocialStatus(`已经邀请过 ${friendGameId} 了。`);
    return;
  }
  if ((room.memberUids || []).length >= Number(room.mode || 2)) {
    setSocialStatus("房间人数已经满了。");
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    await db.collection(FIRESTORE_COLLECTIONS.roomInvites).add({
      roomId: room.id,
      mode: Number(room.mode || 2),
      fromUid: state.authUser.uid,
      fromGameId: state.currentPlayerId,
      toUid: friendUid,
      toGameId: friendGameId,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id).set({
      invitedUids: firebase.firestore.FieldValue.arrayUnion(friendUid),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    setSocialStatus(`已邀请 ${friendGameId} 进入 ${room.mode} 人房。`);
  } catch (error) {
    setSocialStatus(`发送房间邀请失败：${formatAuthError(error)}`);
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

async function handleRespondRoomInvite(inviteId, accept) {
  if (!db || !state.authUser || !state.currentPlayerId) {
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    const inviteRef = db.collection(FIRESTORE_COLLECTIONS.roomInvites).doc(inviteId);
    await db.runTransaction(async (transaction) => {
      const inviteSnap = await transaction.get(inviteRef);
      if (!inviteSnap.exists) {
        throw new Error("INVITE_MISSING");
      }
      const invite = inviteSnap.data();
      if (!accept) {
        transaction.set(inviteRef, {
          status: "rejected",
          respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
      }

      const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(invite.roomId);
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists) {
        throw new Error("ROOM_MISSING");
      }
      const room = roomSnap.data();
      const memberUids = Array.isArray(room.memberUids) ? [...room.memberUids] : [];
      const members = Array.isArray(room.members) ? [...room.members] : [];
      if (room.status !== "waiting") {
        throw new Error("ROOM_CLOSED");
      }
      if (!memberUids.includes(state.authUser.uid)) {
        if (memberUids.length >= Number(room.mode || 2)) {
          throw new Error("ROOM_FULL");
        }
        memberUids.push(state.authUser.uid);
        members.push({
          uid: state.authUser.uid,
          gameId: state.currentPlayerId,
          joinedAt: Date.now(),
        });
      }

      transaction.set(roomRef, {
        memberUids,
        members,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(inviteRef, {
        status: "accepted",
        respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    setSocialStatus(accept ? "已加入好友房间。" : "已拒绝房间邀请。");
  } catch (error) {
    const message = error?.message === "ROOM_FULL"
      ? "这个房间已经满了。"
      : error?.message === "ROOM_CLOSED"
        ? "这个房间已经不能加入了。"
        : error?.message === "ROOM_MISSING"
          ? "房间已经不存在了。"
          : `处理房间邀请失败：${formatAuthError(error)}`;
    setSocialStatus(message);
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

async function handleLeaveRoom() {
  if (!db || !state.authUser || !state.socialActiveRoom) {
    return;
  }

  const room = state.socialActiveRoom;
  state.socialBusy = true;
  renderSocialPanel();
  try {
    await db.runTransaction(async (transaction) => {
      const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id);
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists) {
        return;
      }
      const data = roomSnap.data();
      const memberUids = (data.memberUids || []).filter((uid) => uid !== state.authUser.uid);
      const members = (data.members || []).filter((member) => member.uid !== state.authUser.uid);

      if (!memberUids.length || data.hostUid === state.authUser.uid) {
        transaction.set(roomRef, {
          status: "closed",
          memberUids,
          members,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
      }

      transaction.set(roomRef, {
        memberUids,
        members,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    setSocialStatus(room.hostUid === state.authUser.uid ? "已关闭房间。" : "已离开房间。");
  } catch (error) {
    setSocialStatus(`离开房间失败：${formatAuthError(error)}`);
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

function isLocalSeatPlayer(player) {
  if (!player) {
    return false;
  }
  if (state.multiplayer?.active && player.uid && state.authUser?.uid) {
    return player.uid === state.authUser.uid;
  }
  return Boolean(player.isHuman);
}

function isRemoteSeatPlayer(player) {
  if (!player) {
    return false;
  }
  if (state.multiplayer?.active && player.uid && state.authUser?.uid) {
    return player.uid !== state.authUser.uid;
  }
  return Boolean(player.isRemote);
}

function getPlayerRoleLabel(player) {
  if (!player) {
    return "";
  }
  if (isLocalSeatPlayer(player)) {
    return "你";
  }
  if (isRemoteSeatPlayer(player)) {
    return "好友";
  }
  return "电脑";
}

function getPlayerDisplayName(player, includeRole = true) {
  if (!player) {
    return "玩家";
  }
  if (!includeRole) {
    return player.name || "玩家";
  }
  return `${player.name || "玩家"}（${getPlayerRoleLabel(player)}）`;
}

function getCardIdentity(card) {
  if (!card) {
    return "";
  }
  if (card.suit && card.rank) {
    return [
      card.suit,
      card.rank,
      card.playValue ?? "",
      card.scoreValue ?? "",
    ].join("|");
  }
  if (card.id) {
    return `id:${card.id}`;
  }
  return [
    card.suit || "",
    card.rank || "",
    card.playValue ?? "",
    card.scoreValue ?? "",
  ].join("|");
}

function dedupeCards(cards) {
  const seen = new Set();
  const unique = [];
  (cards || []).forEach((card) => {
    if (!card) {
      return;
    }
    const key = getCardIdentity(card);
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push(card);
  });
  return unique;
}

function appendTableCards(cards) {
  const nextCards = Array.isArray(cards) ? cards : [cards];
  state.tableCards = dedupeCards([...state.tableCards, ...nextCards]);
}

function captureHandCard(player, sourceCard, targets, resolution, fromHuman) {
  const cardIndex = player.hand.findIndex((card) => card.id === sourceCard.id);
  if (cardIndex === -1) {
    setFeedback("没找到这张手牌，已重置当前选择。", "error");
    clearSelection();
    return;
  }

  const playedCard = player.hand.splice(cardIndex, 1)[0];
  removeTableCards(targets);
  player.captured.push(playedCard, ...targets);

  if (player.uid === state.authUser?.uid) {
    state.multiplayer.localHand = [...player.hand];
  }

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
    setFeedback("没找到这张手牌，已重置当前选择。", "error");
    clearSelection();
    return;
  }

  const discardedCard = player.hand.splice(cardIndex, 1)[0];
  state.tableCards.push(discardedCard);

  if (player.uid === state.authUser?.uid) {
    state.multiplayer.localHand = [...player.hand];
  }

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

function applyMultiplayerRoomState(room, localHand = state.multiplayer.localHand) {
  const gameState = room?.gameState;
  if (!room || !gameState || !Array.isArray(gameState.playersPublic)) {
    clearMultiplayerState();
    return;
  }

  const members = Array.isArray(room.members) ? room.members : [];
  const players = gameState.playersPublic.map((playerPublic) => {
    const member = members.find((item) => item.uid === playerPublic.uid);
    const isLocal = playerPublic.uid === state.authUser?.uid;
    return {
      id: playerPublic.uid,
      uid: playerPublic.uid,
      name: playerPublic.name || member?.gameId || "玩家",
      isHuman: isLocal,
      isRemote: !isLocal,
      hand: isLocal ? [...localHand] : createHiddenHand(Number(playerPublic.handCount || 0), playerPublic.uid),
      captured: Array.isArray(playerPublic.captured) ? [...playerPublic.captured] : [],
      lastAction: playerPublic.lastAction || null,
      diceTrail: [],
    };
  });

  state.multiplayer.active = true;
  state.multiplayer.roomId = room.id;
  state.multiplayer.localHand = [...localHand];
  state.players = players;
  state.tableCards = dedupeCards(gameState.tableCards);
  state.drawPile = Array.isArray(gameState.drawPile) ? [...gameState.drawPile] : [];
  state.pendingDrawCard = gameState.pendingDrawCard || null;
  state.log = Array.isArray(gameState.log) ? [...gameState.log] : [];
  state.actionDisplay = gameState.actionDisplay || null;
  state.feedback = gameState.feedback || null;
  state.lastFinishedResult = Array.isArray(gameState.lastFinishedResult) ? [...gameState.lastFinishedResult] : null;
  state.lastFinishedAt = gameState.lastFinishedAt || "";
  state.currentPlayerIndex = Math.max(0, players.findIndex((player) => player.uid === gameState.currentPlayerUid));
  state.settings.playerCount = Number(room.mode || state.settings.playerCount || 2);

  const currentPlayer = players[state.currentPlayerIndex];
  const syncedPhase = gameState.phase || "remote-turn";
  const sharedPhase = new Set(["dice-rolling", "dice-result", "opening-deal", "game-over"]);
  if (sharedPhase.has(syncedPhase)) {
    state.phase = syncedPhase;
  } else if (currentPlayer?.uid === state.authUser?.uid) {
    state.phase = "human-turn";
  } else {
    state.phase = "remote-turn";
  }

  ui.heroSection.classList.add("hidden");
  ui.setupPanel.classList.add("hidden");
  ui.historyPanel.classList.add("hidden");
  ui.gameLayout.classList.remove("hidden");
  render();
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

function createEmptyModeStats() {
  return {
    rounds: 0,
    wins: 0,
    totalScore: 0,
    bestScore: 0,
    lastScore: 0,
  };
}

function normalizeModeStats(data = {}) {
  return {
    rounds: Number(data.rounds || 0),
    wins: Number(data.wins || 0),
    totalScore: Number(data.totalScore || 0),
    bestScore: Number(data.bestScore || 0),
    lastScore: Number(data.lastScore || 0),
  };
}

function buildStatsByMode(data = {}) {
  const source = data.statsByMode || {};
  const legacyFallback = normalizeModeStats(data);
  return {
    "2": source["2"] ? normalizeModeStats(source["2"]) : legacyFallback,
    "3": source["3"] ? normalizeModeStats(source["3"]) : createEmptyModeStats(),
    "4": source["4"] ? normalizeModeStats(source["4"]) : createEmptyModeStats(),
  };
}

function getModeStats(profile, mode = state.leaderboardMode) {
  return profile?.statsByMode?.[String(mode)] || createEmptyModeStats();
}

function getTotalRoundsFromProfile(profile) {
  return LEADERBOARD_MODES.reduce((sum, mode) => sum + Number(getModeStats(profile, mode).rounds || 0), 0);
}

function getSortedPlayerStats(mode = state.leaderboardMode) {
  return Object.values(state.playerStats)
    .sort((a, b) => {
      const aStats = getModeStats(a, mode);
      const bStats = getModeStats(b, mode);
      return bStats.bestScore - aStats.bestScore
        || bStats.totalScore - aStats.totalScore
        || bStats.wins - aStats.wins
        || bStats.rounds - aStats.rounds
        || a.id.localeCompare(b.id, "zh-CN");
    });
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
    statsByMode: {
      "2": createEmptyModeStats(),
      "3": createEmptyModeStats(),
      "4": createEmptyModeStats(),
    },
  };
}

function profileFromData(uid, data = {}) {
  return {
    ...getPlayerProfileDefaults(data.gameId || "", uid),
    statsByMode: buildStatsByMode(data),
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
        startSocialSync();
      } else {
        clearSocialListeners();
        resetSocialState();
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
    state.gameIdEditable = getTotalRoundsFromProfile(profile) === 0;
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
      const canReplace = getTotalRoundsFromProfile(profile) === 0;
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
      const existingProfile = profileFromData(currentProfile.id, existingData);
      const canReplace = !previousGameId || getTotalRoundsFromProfile(existingProfile) === 0;
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
        statsByMode: {
          "2": createEmptyModeStats(),
          "3": createEmptyModeStats(),
          "4": createEmptyModeStats(),
        },
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
      state.gameIdEditable = getTotalRoundsFromProfile(createdProfile) === 0;
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
    pushLog(`${index + 1} 号位：${player.name}${player.isHuman ? "（你）" : player.isRemote ? "（好友）" : "（电脑）"}`);
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
    pushLog(`${index + 1} 号位：${player.name}${player.isHuman ? "（你）" : player.isRemote ? "（好友）" : "（电脑）"}`);
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
      text: `${firstPlayer.name}${firstPlayer.isHuman ? "（你）" : firstPlayer.isRemote ? "（好友）" : "（电脑）"} 先手`,
      cards: [],
      tone: "collect",
    });
    setFeedback(`摇骰子结束，${firstPlayer.name}${firstPlayer.isHuman ? "（你）" : firstPlayer.isRemote ? "（好友）" : "（电脑）"} 先手。`, "info");
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
      appendTableCards(card);
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

function isLocalTurnPlayable() {
  const currentPlayer = getCurrentPlayer();
  return Boolean(
    isLocalSeatPlayer(currentPlayer)
    && (
      state.phase === "human-turn"
      || (isMultiplayerActive() && currentPlayer.uid === state.authUser?.uid)
    )
  );
}

function beginCurrentTurn() {
  clearAiTimer();
  clearFocusedTargets();
  clearSelection(false);

  const player = getCurrentPlayer();
  if (!player) {
    return;
  }

  if (isLocalSeatPlayer(player)) {
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
  if (!player || isLocalSeatPlayer(player) || state.phase === "game-over") {
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
  if (!player || !isLocalSeatPlayer(player) || !isLocalTurnPlayable()) {
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
  if (!player || !isLocalSeatPlayer(player) || !isLocalTurnPlayable()) {
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
  appendTableCards(discardedCard);
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
  appendTableCards(drawCard);
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
    setFeedback(isMultiplayerActive() ? "轮到你了，你的操作会实时同步给房间里的其他玩家。" : "轮到你了，先选一张手牌，再决定钓牌还是弃到台面。", "info");
    render();
    return;
  }

  if (isMultiplayerActive()) {
    state.phase = "remote-turn";
    setFeedback(`${player.name} 正在操作，等对方出牌后会自动同步到你的桌面。`, "info");
    render();
    return;
  }

  state.phase = "ai-turn";
  setFeedback(`${player.name} 正在思考出牌...`, "info");
  render();
  scheduleAiStep(runAiTurn, 900);
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
      text: `摸到 ${cardLabel(state.pendingDrawCard)}，可以立刻补枪`,
      cards: [state.pendingDrawCard],
    });
    updateLastAction(player, `摸到 ${cardLabel(state.pendingDrawCard)}`, [state.pendingDrawCard]);
    setFeedback(`你摸到了 ${cardLabel(state.pendingDrawCard)}，现在可以继续补枪。`, "info");
    render();
    if (isMultiplayerActive()) {
      syncMultiplayerRoomState().catch((error) => {
        state.authStatusMessage = `联机同步失败：${formatAuthError(error)}`;
        renderAuthControls();
      });
    }
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

  if (isMultiplayerActive()) {
    advanceTurn();
    syncMultiplayerRoomState().catch((error) => {
      state.authStatusMessage = `联机同步失败：${formatAuthError(error)}`;
      renderAuthControls();
    });
    render();
    return;
  }

  if (!player.isHuman) {
    scheduleAiStep(advanceTurn, 1600);
    render();
    return;
  }

  advanceTurn();
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
  const isHumanWin = Boolean(humanResult) && result.every((item) => item.name === "鐜╁ 1" || humanResult.score > item.score);
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

  const bestScore = result[0]?.score || 0;
  const winners = result.filter((item) => item.score === bestScore).map((item) => item.name);
  const isHumanWin = Boolean(humanResult) && result.every((item) => item.name === "玩家 1" || humanResult.score > item.score);
  const winnerText = winners.length > 1 ? `${winners.join("、")} 并列第一` : `${winners[0] || "无人"} 获胜`;

  setFeedback(`结算完成，${winnerText}。`, "info");
  pushLog(`游戏结束，${winnerText}。`);
  showOverlay("本局结束", "本局结束", `${winnerText}。点击按钮查看完整结算榜单。`, "查看结果");
  if (humanResult && state.authUser && state.currentPlayerId) {
    syncRoundResultToCloud(humanResult, isHumanWin);
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
    const modeKey = String(state.settings.playerCount || 2);

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(profileRef);
      const currentData = snapshot.exists ? snapshot.data() : {};
      const statsByMode = buildStatsByMode(currentData);
      const currentModeStats = getModeStats({ statsByMode }, modeKey);
      const nextProfile = {
        uid: state.authUser.uid,
        gameId: state.currentPlayerId,
        gameIdNormalized: state.currentPlayerId.toLowerCase(),
        statsByMode: {
          ...statsByMode,
          [modeKey]: {
            rounds: Number(currentModeStats.rounds || 0) + 1,
            wins: Number(currentModeStats.wins || 0) + (isWin ? 1 : 0),
            totalScore: Number(currentModeStats.totalScore || 0) + humanResult.score,
            bestScore: Math.max(Number(currentModeStats.bestScore || 0), humanResult.score),
            lastScore: humanResult.score,
          },
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (!snapshot.exists) {
        nextProfile.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }

      transaction.set(profileRef, nextProfile, { merge: true });
      transaction.set(resultRef, {
        uid: state.authUser.uid,
        gameId: state.currentPlayerId,
        playerCount: Number(modeKey),
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

function finishGame() {
  clearAiTimer();
  state.phase = "game-over";
  const result = getRankedPlayers();
  const humanResult = result.find((item) => item.name === "玩家 1" || item.name === state.currentPlayerId || item.name === getCurrentPlayer()?.name);
  state.lastFinishedResult = result.map((item) => ({
    ...item,
    redCards: [...item.redCards],
  }));
  state.lastFinishedAt = new Date().toLocaleString("zh-CN", {
    hour12: false,
  });

  const bestScore = result[0]?.score || 0;
  const winners = result.filter((item) => item.score === bestScore).map((item) => item.name);
  const localName = state.players.find((player) => player.uid === state.authUser?.uid)?.name || "玩家 1";
  const localResult = result.find((item) => item.name === localName) || humanResult;
  const isHumanWin = Boolean(localResult) && result.every((item) => item.name === localName || localResult.score > item.score);
  const winnerText = winners.length > 1 ? `${winners.join("、")} 并列第一` : `${winners[0] || "无人"} 获胜`;

  setFeedback(`结算完成，${winnerText}。`, "info");
  pushLog(`游戏结束，${winnerText}。`);
  showOverlay("本局结束", "本局结束", `${winnerText}。点击按钮查看完整结算榜单。`, "查看结果");
  if (localResult && state.authUser && state.currentPlayerId) {
    syncRoundResultToCloud(localResult, isHumanWin);
  }
  if (isMultiplayerActive()) {
    syncMultiplayerRoomState().catch((error) => {
      state.authStatusMessage = `联机同步失败：${formatAuthError(error)}`;
      renderAuthControls();
    });
  }
  render();
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
  if (!player || !player.isHuman || !isLocalTurnPlayable() || state.pendingDrawCard) {
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
  if (!player || !player.isHuman || !isLocalTurnPlayable()) {
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

function renderPlayerStatsDashboard() {
  const mode = String(state.leaderboardMode || "2");
  const currentProfile = state.currentPlayerId && state.playerStats[state.currentPlayerId]
    ? state.playerStats[state.currentPlayerId]
    : null;
  const currentModeStats = currentProfile ? getModeStats(currentProfile, mode) : createEmptyModeStats();
  const sorted = getSortedPlayerStats(mode);

  [ui.leaderboardMode2, ui.leaderboardMode3, ui.leaderboardMode4].forEach((button) => {
    if (button) {
      button.classList.toggle("active", button.dataset.mode === mode);
    }
  });
  if (ui.refreshLeaderboard) {
    ui.refreshLeaderboard.disabled = state.leaderboardRefreshing;
    ui.refreshLeaderboard.textContent = state.leaderboardRefreshing ? "刷新中..." : "刷新排行";
  }

  const playerSignature = currentProfile
    ? `${currentProfile.id}:${mode}:${currentModeStats.rounds}:${currentModeStats.wins}:${currentModeStats.totalScore}:${currentModeStats.bestScore}:${currentModeStats.lastScore}:${ui.playerIdHint.textContent}:${state.leaderboardRefreshing}`
    : `empty:${mode}:${ui.playerIdHint.textContent}:${state.leaderboardRefreshing}`;
  if (state.renderCache.playerStats !== playerSignature) {
    state.renderCache.playerStats = playerSignature;
    if (!currentProfile) {
      ui.playerStatsCard.innerHTML = `
        <p>当前还没有选定游戏 ID。</p>
        <p>输入一个新的 ID 后开始游戏，成绩会分别记入 2 / 3 / 4 人模式排行榜。</p>
      `;
    } else {
      ui.playerStatsCard.innerHTML = `
        <p>当前 ID：${currentProfile.id}</p>
        <p>${mode} 人模式 · 累计积分：${currentModeStats.totalScore} 分 · 局数：${currentModeStats.rounds} 局</p>
        <p>胜场：${currentModeStats.wins} 局 · 单局最高：${currentModeStats.bestScore} 分 · 上一局：${currentModeStats.lastScore} 分</p>
      `;
    }
  }

  const leaderboardSignature = [
    mode,
    state.leaderboardRefreshing ? "refreshing" : "idle",
    ...sorted.map((item) => {
      const stats = getModeStats(item, mode);
      return `${item.id}:${stats.bestScore}:${stats.totalScore}:${stats.wins}:${stats.rounds}`;
    }),
  ].join("|");
  if (state.renderCache.leaderboard === leaderboardSignature) {
    return;
  }
  state.renderCache.leaderboard = leaderboardSignature;

  ui.leaderboardList.innerHTML = "";
  if (!sorted.length) {
    ui.leaderboardList.appendChild(createEmptyState("这个模式下还没有人打完过一局，先开始一局试试吧。"));
    return;
  }

  sorted.forEach((item, index) => {
    const stats = getModeStats(item, mode);
    const article = document.createElement("article");
    article.className = `leaderboard-item${item.id === state.currentPlayerId ? " active" : ""}`;
    article.innerHTML = `
      <div class="leaderboard-rank">#${index + 1}</div>
      <div class="leaderboard-main">
        <h3>${item.id}</h3>
        <p>${mode} 人模式 · 单局最高 ${stats.bestScore} · 胜场 ${stats.wins} · 局数 ${stats.rounds}</p>
      </div>
      <div class="leaderboard-side">
        <strong>${stats.bestScore}</strong>
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
  renderSocialPanel();

  if (state.phase === "setup") {
    updateGameLayoutScale();
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

  const humanPlayer = state.players.find((player) => isLocalSeatPlayer(player)) || null;
  const humanDiceSignature = humanPlayer && state.diceAnimation
    ? `${state.diceAnimation.stage}:${state.diceAnimation.faces[humanPlayer.id] || 1}`
    : "no-dice";
  const humanSummarySignature = humanPlayer
    ? `${humanPlayer.hand.length}|${getRedScore(humanPlayer.captured)}|${humanDiceSignature}|${state.currentPlayerId}`
    : "missing";
  if (state.renderCache.humanSummary !== humanSummarySignature) {
    state.renderCache.humanSummary = humanSummarySignature;
    ui.humanSummary.innerHTML = humanPlayer
      ? `
        <p>身份：你${state.currentPlayerId ? ` · ID：${state.currentPlayerId}` : ""}</p>
        <p>剩余手牌：${humanPlayer.hand.length} 张</p>
        <p>已赢红牌：${getRedScore(humanPlayer.captured)} 分</p>
        ${renderDiceWidget(humanPlayer)}
      `
      : `
        <p>身份：你${state.currentPlayerId ? ` · ID：${state.currentPlayerId}` : ""}</p>
        <p>剩余手牌：0 张</p>
        <p>已赢红牌：0 分</p>
      `;
  }

  const canUseControls = isLocalTurnPlayable();
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
  updateGameLayoutScale();
}

function updateGameLayoutScale() {
  if (!ui.gameLayout || !ui.playStage) {
    return;
  }

  if (state.phase === "setup") {
    ui.playStage.style.zoom = "";
    return;
  }

  if (window.innerWidth <= 1100) {
    ui.playStage.style.zoom = "";
    return;
  }

  const previousZoom = ui.playStage.style.zoom;
  ui.playStage.style.zoom = "1";

  const layoutWidth = Math.max(ui.playStage.scrollWidth, ui.playStage.offsetWidth, 1);
  const layoutHeight = Math.max(ui.playStage.scrollHeight, ui.playStage.offsetHeight, 1);
  const availableWidth = Math.max(window.innerWidth - 32, 1);
  const topOffset = ui.gameLayout.getBoundingClientRect().top;
  const availableHeight = Math.max(window.innerHeight - topOffset - 12, 1);

  const widthScale = availableWidth / layoutWidth;
  const heightScale = availableHeight / layoutHeight;
  const scale = Math.max(0.62, Math.min(1, widthScale, heightScale));

  if (!Number.isFinite(scale) || scale >= 0.995) {
    ui.playStage.style.zoom = "";
    return;
  }

  ui.playStage.style.zoom = scale.toFixed(3);

  if (previousZoom !== ui.playStage.style.zoom) {
    ui.playStage.style.setProperty("--auto-scale", ui.playStage.style.zoom);
  }
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
  const signature = `${state.drawPile.length}|${state.pendingDrawCard?.id || "none"}|${isLocalSeatPlayer(getCurrentPlayer()) ? "human" : "ai"}`;
  if (state.renderCache.drawPile === signature) {
    return;
  }
  state.renderCache.drawPile = signature;

  ui.drawPileCount.textContent = `${state.drawPile.length} 张`;
  ui.drawPileVisual.classList.toggle("empty", state.drawPile.length === 0);
}

function renderDrawPreview() {
  if (!state.pendingDrawCard || !isLocalSeatPlayer(getCurrentPlayer())) {
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
    bottom: state.players.find((player) => isLocalSeatPlayer(player)) || null,
  };

  const opponents = state.players.filter((player) => !isLocalSeatPlayer(player));
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
        <h3>${getPlayerDisplayName(player)}</h3>
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
  const playableIds = isLocalTurnPlayable() ? getPlayableTargetIds(selectedSourceCard) : new Set();
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
      disabled: !isLocalTurnPlayable(),
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
      disabled: !isLocalTurnPlayable() || getCurrentPlayer()?.id !== humanPlayer.id || Boolean(state.pendingDrawCard),
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

function getPlayerRoleLabel(player) {
  if (!player) {
    return "";
  }
  if (isLocalSeatPlayer(player)) {
    return "你";
  }
  if (isRemoteSeatPlayer(player)) {
    return "好友";
  }
  return "电脑";
}

function getPlayerDisplayName(player, includeRole = true) {
  if (!player) {
    return "玩家";
  }
  if (!includeRole) {
    return player.name || "玩家";
  }
  return `${player.name || "玩家"}（${getPlayerRoleLabel(player)}）`;
}

function getStatusText() {
  const currentPlayer = getCurrentPlayer();

  if (state.phase === "dice-rolling") {
    return "摇骰子中";
  }
  if (state.phase === "dice-result") {
    return "摇骰子结果";
  }
  if (state.phase === "opening-deal") {
    return state.openingStage === "reveal-table" ? "正在翻开公共牌" : "正在发手牌";
  }
  if (state.phase === "game-over") {
    const top = getRankedPlayers()[0];
    if (!top) {
      return "本局结束";
    }
    const topPlayer = state.players.find((player) => player.name === top.name);
    return `${getPlayerDisplayName(topPlayer || { name: top.name })} 暂列第一，红牌 ${top.score} 分`;
  }
  if (isMultiplayerActive()) {
    if (currentPlayer?.uid === state.authUser?.uid) {
      return state.pendingDrawCard ? "当前轮到你补枪" : "当前轮到你出牌";
    }
    return `当前轮到 ${getPlayerDisplayName(currentPlayer)} 出牌`;
  }
  if (state.phase === "ai-turn" || state.phase === "remote-turn") {
    return `${getPlayerDisplayName(currentPlayer)} 正在行动`;
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
    return `${getPlayerDisplayName(currentPlayer)} 拿到先手，马上开始。`;
  }

  if (state.phase === "opening-deal") {
    return state.openingStage === "reveal-table"
      ? "手牌已经发完，正在逐张翻开桌面公共牌。"
      : "骰子结束后，正在依次把手牌发给所有玩家。";
  }

  if (isMultiplayerActive()) {
    if (currentPlayer?.uid === state.authUser?.uid) {
      if (state.pendingDrawCard) {
        return `你摸到了 ${cardLabel(state.pendingDrawCard)}，现在可以继续补枪。`;
      }
      return "现在轮到你出牌。先选手牌，再决定钓牌还是弃到台面。";
    }
    return `${getPlayerDisplayName(currentPlayer)} 的动作会直接同步到你的桌面。`;
  }

  if (!isLocalSeatPlayer(currentPlayer)) {
    return `${getPlayerDisplayName(currentPlayer)} 的动作会直接展示在牌桌中央。`;
  }

  if (state.pendingDrawCard) {
    return `你摸到了 ${cardLabel(state.pendingDrawCard)}，现在可以继续补枪。`;
  }

  return "现在由你出牌。先选手牌，再决定钓牌还是弃到台面。";
}

function renderSeatResults(seats) {
  if (!ui.seatResultLayer) {
    return;
  }

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
        <h3>${getPlayerDisplayName(player)}</h3>
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
  if (code === "permission-denied") {
    return "数据库权限拦住了这次操作，请更新 Firestore 规则。";
  }
  return error?.message || "出现了一点问题，请稍后再试。";
}

async function handleRespondRoomInvite(inviteId, accept) {
  if (!db || !state.authUser || !state.currentPlayerId) {
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    const inviteRef = db.collection(FIRESTORE_COLLECTIONS.roomInvites).doc(inviteId);
    await db.runTransaction(async (transaction) => {
      const inviteSnap = await transaction.get(inviteRef);
      if (!inviteSnap.exists) {
        throw new Error("INVITE_MISSING");
      }
      const invite = inviteSnap.data();
      if (!accept) {
        transaction.set(inviteRef, {
          status: "rejected",
          respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
      }

      const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(invite.roomId);
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists) {
        throw new Error("ROOM_MISSING");
      }
      const room = roomSnap.data();
      const memberUids = Array.isArray(room.memberUids) ? [...room.memberUids] : [];
      const members = Array.isArray(room.members) ? [...room.members] : [];
      if (room.status !== "waiting") {
        throw new Error("ROOM_CLOSED");
      }
      if (!memberUids.includes(state.authUser.uid)) {
        if (memberUids.length >= Number(room.mode || 2)) {
          throw new Error("ROOM_FULL");
        }
        memberUids.push(state.authUser.uid);
        members.push({
          uid: state.authUser.uid,
          gameId: state.currentPlayerId,
          joinedAt: Date.now(),
        });
      }

      transaction.set(roomRef, {
        memberUids,
        members,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(inviteRef, {
        status: "accepted",
        respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    setSocialStatus(accept ? "已加入好友房间。" : "已拒绝房间邀请。", "success");
  } catch (error) {
    const permissionBlocked = error?.code === "permission-denied";
    const message = error?.message === "ROOM_FULL"
      ? "这个房间已经满了，没法再加入。"
      : error?.message === "ROOM_CLOSED"
        ? "这个房间已经不是等待状态了，不能再加入。"
        : error?.message === "ROOM_MISSING"
          ? "这个房间已经不存在了。"
          : permissionBlocked
            ? "加入失败：不是你还在别的房间里，而是 Firebase 规则还没允许被邀请的人把自己加入房间，所以数据库把这一步拦住了。"
            : `处理房间邀请失败：${formatAuthError(error)}`;
    setSocialStatus(message, "error");
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

async function getRestartTargetRoom() {
  if (state.socialActiveRoom?.id) {
    return state.socialActiveRoom;
  }

  if (!db || !state.authUser || !state.multiplayer.roomId) {
    return null;
  }

  try {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.rooms).doc(state.multiplayer.roomId).get();
    if (!snapshot.exists) {
      return null;
    }
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    setSocialStatus(`获取联机房间信息失败：${formatAuthError(error)}`, "error");
    return null;
  }
}

async function handleRestartRequest() {
  const room = await getRestartTargetRoom();
  const isRoomMember = Boolean(
    room &&
    Array.isArray(room.memberUids) &&
    state.authUser?.uid &&
    room.memberUids.includes(state.authUser.uid)
  );

  if (isRoomMember && room.status !== "closed") {
    if (room.hostUid !== state.authUser?.uid) {
      setSocialStatus("联机房的下一局需要房主来开始，请等待房主点击“重新开始”。", "info");
      return;
    }
    await launchRoomMatch(room, true);
    return;
  }

  await startGame(state.settings.playerCount, state.settings.useDice);
}

async function launchRoomMatch(room, isRematch = false) {
  const config = GAME_CONFIG[Number(room.mode || 2)];
  const deck = shuffle(createDeck());
  const members = Array.isArray(room.members) ? [...room.members] : [];
  const orderedMembers = members
    .slice()
    .sort((a, b) =>
      Number(a.joinedAt?.seconds || a.joinedAt || 0) - Number(b.joinedAt?.seconds || b.joinedAt || 0)
      || String(a.gameId || "").localeCompare(String(b.gameId || ""), "zh-CN")
    );

  const players = orderedMembers.map((member) => ({
    uid: member.uid,
    id: member.uid,
    name: member.gameId,
    isHuman: member.uid === state.authUser?.uid,
    hand: deck.splice(0, config.hand),
    captured: [],
    lastAction: null,
    diceTrail: [],
  }));

  const tableCards = deck.splice(0, config.table);
  const drawPile = deck.splice(0, config.draw);
  const firstUid = orderedMembers[0]?.uid || null;
  const firstName = orderedMembers[0]?.gameId || "房主";
  const gameState = {
    phase: "human-turn",
    tableCards,
    drawPile,
    pendingDrawCard: null,
    currentPlayerUid: firstUid,
    playersPublic: players.map((player) => ({
      uid: player.uid,
      name: player.name,
      handCount: player.hand.length,
      captured: [],
      lastAction: null,
    })),
    log: [
      {
        id: `room-start-${Date.now()}`,
        message: isRematch ? `${room.mode} 人联机房开始下一局。` : `${room.mode} 人联机房开始对局。`,
      },
    ],
    actionDisplay: null,
    feedback: {
      message: isRematch ? `${firstName} 先手，新一局开始。` : `${firstName} 先手，联机对局开始。`,
      type: "info",
    },
    lastFinishedResult: null,
    lastFinishedAt: "",
  };

  const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id);
  const batch = db.batch();
  batch.set(roomRef, {
    status: "playing",
    invitedUids: [],
    memberUids: orderedMembers.map((member) => member.uid),
    members: orderedMembers.map((member) => ({
      uid: member.uid,
      gameId: member.gameId,
      joinedAt: member.joinedAt || null,
    })),
    gameState,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  players.forEach((player) => {
    batch.set(roomRef.collection("hands").doc(player.uid), {
      cards: [...player.hand],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  await batch.commit();

  const localPlayer = players.find((player) => player.uid === state.authUser?.uid);
  const nextRoom = {
    ...room,
    status: "playing",
    memberUids: orderedMembers.map((member) => member.uid),
    members: orderedMembers.map((member) => ({
      uid: member.uid,
      gameId: member.gameId,
      joinedAt: member.joinedAt || Date.now(),
    })),
    gameState,
  };
  state.socialActiveRoom = nextRoom;
  applyMultiplayerRoomState(nextRoom, localPlayer ? localPlayer.hand : []);
  setSocialStatus(isRematch ? "联机房已重新开始下一局。" : "联机对局已开始。", "success");
}

async function handleStartRoomMatch() {
  if (!db || !state.authUser || !state.currentPlayerId) {
    setSocialStatus("先登录并绑定游戏 ID，再开始联机对局。", "error");
    return;
  }

  const room = state.socialActiveRoom;
  if (!room || room.status !== "waiting") {
    setSocialStatus("当前没有等待中的房间。", "error");
    return;
  }
  if (room.hostUid !== state.authUser.uid) {
    setSocialStatus("只有房主可以开始联机对局。", "error");
    return;
  }

  const members = Array.isArray(room.members) ? [...room.members] : [];
  if (members.length !== Number(room.mode || 2)) {
    setSocialStatus(`人数还没到齐，需要 ${room.mode} 人才能开始。`, "error");
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    await launchRoomMatch(room, false);
  } catch (error) {
    setSocialStatus(`开始联机失败：${formatAuthError(error)}`, "error");
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
  }
}

function renderSeat(container, player) {
  const key = container.id;
  const playerRole = getPlayerRoleLabel(player);
  const signature = !player
    ? "empty"
    : [
        player.id,
        player.name,
        player.hand.length,
        getRedScore(player.captured),
        player.id === getCurrentPlayer()?.id ? "active" : "idle",
        player.lastAction?.stamp || 0,
        player.lastAction?.text || "",
        player.lastAction?.cards?.map((card) => card.id).join(",") || "",
        playerRole,
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
      <h3>${getPlayerDisplayName(player)}</h3>
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

function renderSocialPanel() {
  if (!ui.socialPanel || !ui.socialStatus || !ui.socialSearchResult || !ui.socialFriendRequests || !ui.socialFriends || !ui.socialRoomInvites || !ui.socialRoomCard) {
    return;
  }

  const signedIn = Boolean(state.authUser);
  const room = state.socialActiveRoom;
  const signature = JSON.stringify({
    signedIn,
    currentPlayerId: state.currentPlayerId,
    socialBusy: state.socialBusy,
    socialStatusMessage: state.socialStatusMessage,
    socialStatusTone: state.socialStatusTone,
    socialSearchResult: state.socialSearchResult,
    socialFriendRequests: state.socialFriendRequests.map((item) => [item.id, item.fromGameId, item.toGameId]),
    socialFriends: state.socialFriends.map((item) => [item.uid, item.gameId]),
    socialRoomInvites: state.socialRoomInvites.map((item) => [item.id, item.fromGameId, item.mode]),
    socialActiveRoom: room
      ? {
          id: room.id,
          mode: room.mode,
          status: room.status,
          hostUid: room.hostUid,
          memberUids: room.memberUids,
          invitedUids: room.invitedUids,
          members: (room.members || []).map((member) => [member.uid, member.gameId]),
        }
      : null,
  });

  if (state.renderCache.social === signature) {
    return;
  }
  state.renderCache.social = signature;

  ui.socialPanel.classList.toggle("is-disabled", !signedIn);
  ui.socialSearchInput.disabled = !signedIn || state.socialBusy;
  ui.socialSearchButton.disabled = !signedIn || state.socialBusy;
  ui.socialStatus.className = `social-status is-${state.socialStatusTone || "info"}`;
  ui.socialStatus.textContent = state.socialStatusMessage || (signedIn
    ? "现在可以搜索好友、处理邀请、创建房间。"
    : "登录后可以搜索好友并创建房间。");

  ui.socialSearchResult.innerHTML = "";
  if (state.socialSearchResult?.type === "found") {
    const result = state.socialSearchResult;
    const card = document.createElement("article");
    card.className = "social-item";
    card.innerHTML = `
      <div>
        <strong>${result.gameId}</strong>
        <p>${result.isSelf ? "这是你自己的游戏 ID。" : result.isFriend ? "已经是你的好友了。" : "可以发送好友申请。"}</p>
      </div>
    `;
    const action = document.createElement("button");
    action.className = "ghost-btn";
    action.type = "button";
    action.textContent = result.isSelf ? "本人" : result.isFriend ? "已是好友" : "添加好友";
    action.disabled = result.isSelf || result.isFriend || state.socialBusy;
    if (!action.disabled) {
      action.addEventListener("click", () => handleSendFriendRequest(result.uid, result.gameId));
    }
    card.appendChild(action);
    ui.socialSearchResult.appendChild(card);
  }

  ui.socialRoomCard.innerHTML = "";
  if (!signedIn) {
    ui.socialRoomCard.appendChild(createEmptyState("登录后可以创建好友房间。"));
  } else if (!room) {
    const wrap = document.createElement("div");
    wrap.className = "social-room-inner";
    wrap.innerHTML = `
      <div>
        <strong>还没有等待中的房间</strong>
        <p>先创建一个 2 / 3 / 4 人房，再邀请好友加入。</p>
      </div>
    `;
    const actions = document.createElement("div");
    actions.className = "social-inline-actions";
    ["2", "3", "4"].forEach((mode) => {
      const button = document.createElement("button");
      button.className = "ghost-btn";
      button.type = "button";
      button.textContent = `创建${mode}人房`;
      button.disabled = state.socialBusy || !state.currentPlayerId;
      button.addEventListener("click", () => handleCreateRoom(mode));
      actions.appendChild(button);
    });
    wrap.appendChild(actions);
    ui.socialRoomCard.appendChild(wrap);
  } else {
    const members = Array.isArray(room.members) ? room.members : [];
    const targetCount = Number(room.mode || 2);
    const slotsLeft = Math.max(0, targetCount - members.length);
    const memberText = members.map((member) => member.gameId).join("、");
    const roomStatusText = room.status === "playing"
      ? "联机对局进行中"
      : slotsLeft > 0
        ? `等待中，还差 ${slotsLeft} 人`
        : "人数已满，可以开始联机";
    const card = document.createElement("div");
    card.className = "social-room-inner";
    card.innerHTML = `
      <div>
        <strong>${room.mode} 人房 · ${room.hostUid === state.authUser.uid ? "你是房主" : "好友房间"}</strong>
        <p>房间状态：${roomStatusText}</p>
        <p>当前成员：${memberText || "暂无"}</p>
      </div>
    `;
    const button = document.createElement("button");
    button.className = "ghost-btn";
    button.type = "button";
    button.textContent = room.hostUid === state.authUser.uid ? "关闭房间" : "离开房间";
    button.disabled = state.socialBusy;
    button.addEventListener("click", handleLeaveRoom);
    card.appendChild(button);
    const startButton = room.status === "waiting" && room.hostUid === state.authUser.uid && members.length === targetCount
      ? document.createElement("button")
      : null;
    if (startButton) {
      startButton.className = "ghost-btn";
      startButton.type = "button";
      startButton.textContent = "开始联机";
      startButton.disabled = state.socialBusy;
      startButton.addEventListener("click", handleStartRoomMatch);
      card.insertBefore(startButton, card.lastChild);
    }
    ui.socialRoomCard.appendChild(card);
  }

  ui.socialFriendRequests.innerHTML = "";
  if (!state.socialFriendRequests.length) {
    ui.socialFriendRequests.appendChild(createEmptyState("还没有新的好友申请。"));
  } else {
    state.socialFriendRequests.forEach((item) => {
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>想加你为好友</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = "通过";
      accept.disabled = state.socialBusy;
      accept.addEventListener("click", () => handleRespondFriendRequest(item.id, true));
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => handleRespondFriendRequest(item.id, false));
      actions.append(accept, reject);
      card.appendChild(actions);
      ui.socialFriendRequests.appendChild(card);
    });
  }

  ui.socialRoomInvites.innerHTML = "";
  if (!state.socialRoomInvites.length) {
    ui.socialRoomInvites.appendChild(createEmptyState("还没有新的房间邀请。"));
  } else {
    state.socialRoomInvites.forEach((item) => {
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>邀请你进入 ${item.mode} 人房</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = room ? "先离开当前房间" : "加入";
      accept.disabled = state.socialBusy;
      accept.addEventListener("click", () => {
        if (room) {
          setSocialStatus("你当前还在一个房间里，先点上面的“关闭房间”或“离开房间”，再来加入这个邀请。", "error");
          return;
        }
        handleRespondRoomInvite(item.id, true);
      });
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => handleRespondRoomInvite(item.id, false));
      actions.append(accept, reject);
      card.appendChild(actions);
      ui.socialRoomInvites.appendChild(card);
    });
  }

  ui.socialFriends.innerHTML = "";
  if (!state.socialFriends.length) {
    ui.socialFriends.appendChild(createEmptyState("还没有好友，先去搜索一个游戏 ID 吧。"));
  } else {
    state.socialFriends.forEach((friend) => {
      const card = document.createElement("article");
      card.className = "social-item";
      const memberUids = room?.memberUids || [];
      const invitedUids = room?.invitedUids || [];
      const roomMode = room?.mode || "";
      let inviteText = "先创建房间";
      let inviteDisabled = true;

      if (room) {
        if (room.hostUid !== state.authUser.uid) {
          inviteText = "仅房主可邀请";
        } else if (memberUids.includes(friend.uid)) {
          inviteText = "已在房间";
        } else if (invitedUids.includes(friend.uid)) {
          inviteText = "已邀请";
        } else if (memberUids.length >= Number(room.mode || 2)) {
          inviteText = "房间已满";
        } else {
          inviteText = "邀请进房";
          inviteDisabled = false;
        }
      }

      card.innerHTML = `<div><strong>${friend.gameId}</strong><p>${room ? `可邀请进入 ${roomMode} 人房` : "先创建房间再邀请"}</p></div>`;
      const invite = document.createElement("button");
      invite.className = "ghost-btn";
      invite.type = "button";
      invite.textContent = inviteText;
      invite.disabled = state.socialBusy || inviteDisabled;
      if (!invite.disabled) {
        invite.addEventListener("click", () => handleInviteFriend(friend.uid, friend.gameId));
      }
      card.appendChild(invite);
      ui.socialFriends.appendChild(card);
    });
  }
}
