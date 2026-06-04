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
const LAST_AUTH_EMAIL_STORAGE_KEY = "redpoint-last-auth-email";
const REMEMBER_AUTH_EMAIL_STORAGE_KEY = "redpoint-remember-auth-email";
const BEGINNER_GUIDE_STORAGE_KEY = "redpoint-beginner-guide-seen-v1";
const INITIAL_BEANS = 2000;
const ROOM_TICKETS = {
  2: 100,
  3: 200,
  4: 300,
};
const BEANS_BENEFITS = {
  dailyAmount: 300,
  adAmount: 80,
  adDailyLimit: 5,
};
const SOCIAL_REFRESH_INTERVAL_MS = 10000;
const ROOM_INVITE_REJECT_REASONS = [
  "我现在没空",
  "欢乐豆不够",
  "等下一局",
  "先不玩了",
];

let firebaseApp = null;
let auth = null;
let db = null;
let socialSideResizeObserver = null;
let socialRefreshInFlight = null;
let socialRefreshRequested = false;

const ui = {
  heroSection: document.getElementById("hero-section"),
  heroToggle: document.getElementById("hero-toggle"),
  entryAccount: document.getElementById("entry-account"),
  entryGameId: document.getElementById("entry-game-id"),
  entryLogout: document.getElementById("entry-logout"),
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
  lobbyModeCard: document.getElementById("lobby-mode-card"),
  lobbyModeSolo: document.getElementById("lobby-mode-solo"),
  lobbyModeFriends: document.getElementById("lobby-mode-friends"),
  lobbySoloOptions: document.getElementById("lobby-solo-options"),
  lobbyFriendOptions: document.getElementById("lobby-friend-options"),
  lobbyFriendRoomCard: document.getElementById("lobby-friend-room-card"),
  lobbyRoomSideActions: document.getElementById("lobby-room-side-actions"),
  authEmail: document.getElementById("auth-email"),
  authPassword: document.getElementById("auth-password"),
  authRemember: document.getElementById("auth-remember"),
  authEmailEntry: document.getElementById("auth-email-entry"),
  authGoogle: document.getElementById("auth-google"),
  authLogin: document.getElementById("auth-login"),
  authRegister: document.getElementById("auth-register"),
  authFormCancel: document.getElementById("auth-form-cancel"),
  authLogout: document.getElementById("auth-logout"),
  lobbyAccountId: document.getElementById("lobby-account-id"),
  authStatus: document.getElementById("auth-status"),
  currentBeansBalance: document.getElementById("current-beans-balance"),
  rechargeBeans: document.getElementById("recharge-beans"),
  beansModal: document.getElementById("beans-modal"),
  beansBackdrop: document.getElementById("beans-backdrop"),
  beansClose: document.getElementById("beans-close"),
  beansModalBalance: document.getElementById("beans-modal-balance"),
  beansDailyStatus: document.getElementById("beans-daily-status"),
  beansDailyClaim: document.getElementById("beans-daily-claim"),
  beansAdStatus: document.getElementById("beans-ad-status"),
  beansAdClaim: document.getElementById("beans-ad-claim"),
  beansRechargeStatus: document.getElementById("beans-recharge-status"),
  beansRechargePay: document.getElementById("beans-recharge-pay"),
  roomInviteModal: document.getElementById("room-invite-modal"),
  roomInviteBackdrop: document.getElementById("room-invite-backdrop"),
  roomInviteClose: document.getElementById("room-invite-close"),
  roomInviteTitle: document.getElementById("room-invite-title"),
  roomInviteCopy: document.getElementById("room-invite-copy"),
  roomInviteMeta: document.getElementById("room-invite-meta"),
  roomInviteAccept: document.getElementById("room-invite-accept"),
  roomInviteIgnore: document.getElementById("room-invite-ignore"),
  roomInviteRejectToggle: document.getElementById("room-invite-reject-toggle"),
  roomInviteRejectPanel: document.getElementById("room-invite-reject-panel"),
  roomInviteRejectReasons: document.getElementById("room-invite-reject-reasons"),
  roomInviteRejectText: document.getElementById("room-invite-reject-text"),
  roomInviteRejectConfirm: document.getElementById("room-invite-reject-confirm"),
  playerId: document.getElementById("player-id"),
  playerIdHint: document.getElementById("player-id-hint"),
  playerIdSelect: document.getElementById("player-id-select"),
  entryStartCard: document.getElementById("entry-start-card"),
  entryStartGame: document.getElementById("entry-start-game"),
  startGame: document.getElementById("start-game"),
  viewLastResult: document.getElementById("view-last-result"),
  restartGame: document.getElementById("restart-game"),
  restartRound: document.getElementById("restart-round"),
  backToSetup: document.getElementById("back-to-setup"),
  returnToRoom: document.getElementById("return-to-room"),
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
  controlHint: document.getElementById("control-hint"),
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
  leaderboardPrev: null,
  leaderboardNext: null,
  leaderboardPageInfo: null,
  leaderboardToggle: null,
  socialPanel: null,
  socialStatus: null,
  socialSearchInput: null,
  socialSearchButton: null,
  socialSearchResult: null,
  socialLeftStack: null,
  socialFriendRequests: null,
  socialFriends: null,
  socialFriendsPane: null,
  socialRoomInvites: null,
  socialRoomCard: null,
  socialSideColumn: null,
  socialSideFriendsTab: null,
  socialSideLeaderboardTab: null,
  socialLeaderboardPane: null,
  socialLeaderboardCompact: null,
  socialLeaderboardRefresh: null,
  socialLeaderboardMode2: null,
  socialLeaderboardMode3: null,
  socialLeaderboardMode4: null,
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
  currentBeans: 0,
  currentBeansBenefits: null,
  beansBenefitBusy: false,
  beansAwardBusy: false,
  beginnerGuideSeen: false,
  authUser: null,
  authBusy: false,
  authReady: false,
  authSessionConfirmed: false,
  authFormOpen: false,
  authEntryActive: false,
  authStatusMessage: "正在连接 Firebase...",
  playerIdHintMessage: "",
  leaderboardLoaded: false,
  leaderboardMode: "2",
  leaderboardPage: 1,
  leaderboardRefreshing: false,
  leaderboardOpen: false,
  playerStatsOpen: false,
  lobbyPlayMode: "solo",
  socialSideView: "friends",
  hasBoundGameId: false,
  gameIdEditable: true,
  socialBusy: false,
  socialStatusMessage: "",
  socialStatusTone: "info",
  socialSearchResult: null,
  socialFriendRequests: [],
  socialFriends: [],
  socialRoomInvites: [],
  socialOutgoingRoomInvites: [],
  ignoredRoomInviteIds: new Set(),
  activeRoomInviteId: "",
  roomInviteRejectPanelOpen: false,
  socialActiveRoom: null,
  socialUnsubs: [],
  socialRefreshTimer: null,
  socialLastRefreshAt: 0,
  multiplayer: {
    active: false,
    roomId: "",
    localHand: [],
    syncQueue: Promise.resolve(),
    openingToken: "",
    openingInProgress: false,
  },
  layoutMetrics: {
    stableWidth: 0,
    stableHeight: 0,
    viewportKey: "",
    phaseBucket: "",
  },
  beansRound: null,
  pendingBeansAward: null,
  overlayAction: "",
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
  rulesOpen: false,
  heroIntroOpen: false,
  settings: {
    playerCount: 2,
    useDice: true,
  },
};

function init() {
  restoreRememberedAuthEmail();
  document.addEventListener("visibilitychange", handleVisibilitySocialRefresh);
  window.addEventListener("focus", handleWindowSocialRefresh);
  ui.heroToggle?.addEventListener("click", toggleHeroIntro);
  ui.rulesTriggers.forEach((button) => button.addEventListener("click", openRulesModal));
  ui.rulesBackdrop.addEventListener("click", closeRulesModal);
  ui.rulesClose.addEventListener("click", closeRulesModal);
  ui.rulesAck.addEventListener("click", closeRulesModal);
  ui.authEmailEntry?.addEventListener("click", handleOpenEmailAuthForm);
  ui.authGoogle?.addEventListener("click", handleAuthGoogleLogin);
  ui.authLogin.addEventListener("click", handleAuthLogin);
  ui.authRegister.addEventListener("click", handleAuthRegister);
  ui.authFormCancel?.addEventListener("click", handleCloseEmailAuthForm);
  ui.authLogout.addEventListener("click", handleAuthLogout);
  ui.entryLogout?.addEventListener("click", handleAuthLogout);
  ui.lobbyAccountId?.addEventListener("click", togglePlayerStatsPopover);
  ui.lobbyAccountId?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      togglePlayerStatsPopover(event);
    }
  });
  ui.authEmail.addEventListener("input", handleAuthEmailInput);
  ui.authRemember?.addEventListener("change", handleAuthRememberChange);
  ui.rechargeBeans?.addEventListener("click", handleRechargeBeans);
  ui.beansBackdrop?.addEventListener("click", closeBeansModal);
  ui.beansClose?.addEventListener("click", closeBeansModal);
  ui.beansDailyClaim?.addEventListener("click", () => handleClaimBeansBenefit("daily"));
  ui.beansAdClaim?.addEventListener("click", () => handleClaimBeansBenefit("ad"));
  ui.roomInviteBackdrop?.addEventListener("click", handleIgnoreActiveRoomInvite);
  ui.roomInviteClose?.addEventListener("click", handleIgnoreActiveRoomInvite);
  ui.roomInviteIgnore?.addEventListener("click", handleIgnoreActiveRoomInvite);
  ui.roomInviteAccept?.addEventListener("click", handleAcceptActiveRoomInvite);
  ui.roomInviteRejectToggle?.addEventListener("click", toggleRoomInviteRejectPanel);
  ui.roomInviteRejectConfirm?.addEventListener("click", handleRejectActiveRoomInvite);
  ui.playerId.addEventListener("input", handlePlayerIdInput);
  ui.playerCount.addEventListener("change", renderAuthControls);
  ui.lobbyModeSolo?.addEventListener("click", () => setLobbyPlayMode("solo"));
  ui.lobbyModeFriends?.addEventListener("click", () => setLobbyPlayMode("friends"));
  ui.entryStartGame?.addEventListener("click", handleEntryStartGame);
  ui.startGame.addEventListener("click", handleStartGameButton);
  ui.viewLastResult.addEventListener("click", handleViewLastResult);
  ui.restartGame.addEventListener("click", handleRestartRequest);
  ui.restartRound.addEventListener("click", handleRestartRequest);
  ui.backToSetup.addEventListener("click", handleBackToSetup);
  ui.returnToRoom?.addEventListener("click", handleReturnToActiveRoom);
  ui.overlayButton.addEventListener("click", handleOverlayButton);
  ui.confirmAction.addEventListener("click", handleConfirmAction);
  ui.discardAction.addEventListener("click", handleDiscardAction);
  ui.clearSelection.addEventListener("click", clearSelection);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("click", handleDocumentClick);
  window.addEventListener("resize", updateGameLayoutScale);
  window.addEventListener("resize", () => requestAnimationFrame(syncLandscapeActionPanel));
  window.addEventListener("resize", syncSocialSideHeight);

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
  renderHeroIntro();
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
  const leaderboardHead = document.querySelector(".leaderboard-block .compact-head");
  if (leaderboardHead && !document.getElementById("leaderboard-toggle")) {
    const toggle = document.createElement("button");
    toggle.id = "leaderboard-toggle";
    toggle.className = "ghost-btn leaderboard-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "查看排行";
    leaderboardHead.appendChild(toggle);
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

  if (!document.getElementById("leaderboard-pagination")) {
    const pagination = document.createElement("div");
    pagination.className = "leaderboard-pagination";
    pagination.id = "leaderboard-pagination";
    pagination.innerHTML = `
      <button id="leaderboard-prev" class="ghost-btn leaderboard-page-btn" type="button">上一页</button>
      <span id="leaderboard-page-info" class="leaderboard-page-info">第 1 / 1 页</span>
      <button id="leaderboard-next" class="ghost-btn leaderboard-page-btn" type="button">下一页</button>
    `;
    ui.leaderboardList.insertAdjacentElement("afterend", pagination);
  }

  ui.leaderboardMode2 = document.getElementById("leaderboard-mode-2");
  ui.leaderboardMode3 = document.getElementById("leaderboard-mode-3");
  ui.leaderboardMode4 = document.getElementById("leaderboard-mode-4");
  ui.refreshLeaderboard = document.getElementById("refresh-leaderboard");
  ui.leaderboardPrev = document.getElementById("leaderboard-prev");
  ui.leaderboardNext = document.getElementById("leaderboard-next");
  ui.leaderboardPageInfo = document.getElementById("leaderboard-page-info");
  ui.leaderboardToggle = document.getElementById("leaderboard-toggle");

  [ui.leaderboardMode2, ui.leaderboardMode3, ui.leaderboardMode4].forEach((button) => {
    if (button && !button.dataset.bound) {
      button.dataset.bound = "1";
      button.addEventListener("click", () => {
        state.leaderboardMode = button.dataset.mode || "2";
        state.leaderboardPage = 1;
        renderPlayerStatsDashboard();
      });
    }
  });

  if (ui.refreshLeaderboard && !ui.refreshLeaderboard.dataset.bound) {
    ui.refreshLeaderboard.dataset.bound = "1";
    ui.refreshLeaderboard.addEventListener("click", refreshLeaderboardNow);
  }

  if (ui.leaderboardToggle && !ui.leaderboardToggle.dataset.bound) {
    ui.leaderboardToggle.dataset.bound = "1";
    ui.leaderboardToggle.addEventListener("click", () => {
      state.leaderboardOpen = !state.leaderboardOpen;
      state.renderCache.leaderboard = "";
      renderPlayerStatsDashboard();
    });
  }

  if (ui.leaderboardPrev && !ui.leaderboardPrev.dataset.bound) {
    ui.leaderboardPrev.dataset.bound = "1";
    ui.leaderboardPrev.addEventListener("click", () => {
      state.leaderboardPage = Math.max(1, state.leaderboardPage - 1);
      renderPlayerStatsDashboard();
    });
  }

  if (ui.leaderboardNext && !ui.leaderboardNext.dataset.bound) {
    ui.leaderboardNext.dataset.bound = "1";
    ui.leaderboardNext.addEventListener("click", () => {
      state.leaderboardPage += 1;
      renderPlayerStatsDashboard();
    });
  }
}

async function refreshLeaderboardNow() {
  state.leaderboardRefreshing = true;
  renderPlayerStatsDashboard();
  renderSocialPanel();
  await loadLeaderboard();
  if (state.authUser) {
    await loadCurrentUserProfile();
  }
  state.leaderboardRefreshing = false;
  renderPlayerStatsDashboard();
  renderAuthControls();
  renderSocialPanel();
}

function ensureSocialPanel() {
  if (document.getElementById("social-panel")) {
    bindSocialPanelRefs();
    placePlayerStatsCardInSocialPanel();
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
    <div class="panel-head compact-head social-panel-head">
      <h2>好友与邀请</h2>
      <p>搜索游戏 ID、添加好友，并邀请好友进入 2 / 3 / 4 人等待房间。</p>
    </div>
    <div class="social-layout">
      <div class="social-left-stack">
        <div class="social-search-area">
          <div class="social-search-row">
            <input id="social-search-id" type="text" maxlength="20" placeholder="搜索游戏 ID">
            <button id="social-search-btn" class="ghost-btn" type="button">搜索</button>
          </div>
          <p id="social-status" class="social-status">登录后可以搜索好友并创建房间。</p>
          <div id="social-search-result" class="social-card-list"></div>
        </div>
        <div class="social-inbox-row">
          <div class="social-column">
            <h3>好友申请</h3>
            <div id="social-friend-requests" class="social-card-list social-scroll-list social-request-list"></div>
          </div>
          <div class="social-column">
            <h3>房间邀请</h3>
            <div id="social-room-invites" class="social-card-list social-scroll-list social-room-invite-list"></div>
          </div>
        </div>
        <div id="social-room-card" class="social-room-card"></div>
      </div>
      <div class="social-column social-side-column">
        <div class="social-side-tabs" role="tablist" aria-label="好友与排行榜">
          <button id="social-side-friends-tab" class="social-side-tab active" type="button">好友列表</button>
          <button id="social-side-leaderboard-tab" class="social-side-tab" type="button">排行榜</button>
        </div>
        <div id="social-friends-pane" class="social-side-pane">
          <div id="social-friends" class="social-card-list social-friends-list"></div>
        </div>
        <div id="social-leaderboard-pane" class="social-side-pane hidden">
          <div class="social-leaderboard-head">
            <div class="leaderboard-tabs social-leaderboard-tabs" role="tablist" aria-label="排行榜模式">
              <button id="social-leaderboard-mode-2" class="leaderboard-tab active" type="button" data-mode="2">2人榜</button>
              <button id="social-leaderboard-mode-3" class="leaderboard-tab" type="button" data-mode="3">3人榜</button>
              <button id="social-leaderboard-mode-4" class="leaderboard-tab" type="button" data-mode="4">4人榜</button>
            </div>
            <button id="social-leaderboard-refresh" class="ghost-btn leaderboard-refresh" type="button">刷新</button>
          </div>
          <div id="social-leaderboard-compact" class="social-leaderboard-compact"></div>
        </div>
      </div>
    </div>
  `;

  anchor.insertBefore(panel, ui.playerStatsCard);
  bindSocialPanelRefs();
  placePlayerStatsCardInSocialPanel();
}

function bindSocialPanelRefs() {
  ui.socialPanel = document.getElementById("social-panel");
  ui.socialStatus = document.getElementById("social-status");
  ui.socialSearchInput = document.getElementById("social-search-id");
  ui.socialSearchButton = document.getElementById("social-search-btn");
  ui.socialSearchResult = document.getElementById("social-search-result");
  ui.socialLeftStack = document.querySelector(".social-left-stack");
  ui.socialFriendRequests = document.getElementById("social-friend-requests");
  ui.socialFriends = document.getElementById("social-friends");
  ui.socialFriendsPane = document.getElementById("social-friends-pane");
  ui.socialRoomInvites = document.getElementById("social-room-invites");
  ui.socialRoomCard = document.getElementById("social-room-card");
  ui.socialSideColumn = document.querySelector(".social-side-column");
  ui.socialSideFriendsTab = document.getElementById("social-side-friends-tab");
  ui.socialSideLeaderboardTab = document.getElementById("social-side-leaderboard-tab");
  ui.socialLeaderboardPane = document.getElementById("social-leaderboard-pane");
  ui.socialLeaderboardCompact = document.getElementById("social-leaderboard-compact");
  ui.socialLeaderboardRefresh = document.getElementById("social-leaderboard-refresh");
  ui.socialLeaderboardMode2 = document.getElementById("social-leaderboard-mode-2");
  ui.socialLeaderboardMode3 = document.getElementById("social-leaderboard-mode-3");
  ui.socialLeaderboardMode4 = document.getElementById("social-leaderboard-mode-4");

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
  if (ui.socialSideFriendsTab && !ui.socialSideFriendsTab.dataset.bound) {
    ui.socialSideFriendsTab.dataset.bound = "1";
    ui.socialSideFriendsTab.addEventListener("click", () => {
      state.socialSideView = "friends";
      state.renderCache.social = "";
      renderSocialPanel();
    });
  }
  if (ui.socialSideLeaderboardTab && !ui.socialSideLeaderboardTab.dataset.bound) {
    ui.socialSideLeaderboardTab.dataset.bound = "1";
    ui.socialSideLeaderboardTab.addEventListener("click", () => {
      state.socialSideView = "leaderboard";
      state.renderCache.social = "";
      renderSocialPanel();
    });
  }
  if (ui.socialLeaderboardRefresh && !ui.socialLeaderboardRefresh.dataset.bound) {
    ui.socialLeaderboardRefresh.dataset.bound = "1";
    ui.socialLeaderboardRefresh.addEventListener("click", refreshLeaderboardNow);
  }
  [ui.socialLeaderboardMode2, ui.socialLeaderboardMode3, ui.socialLeaderboardMode4].forEach((button) => {
    if (button && !button.dataset.bound) {
      button.dataset.bound = "1";
      button.addEventListener("click", () => {
        state.leaderboardMode = button.dataset.mode || "2";
        state.leaderboardPage = 1;
        state.renderCache.social = "";
        renderPlayerStatsDashboard();
        renderSocialPanel();
      });
    }
  });
  setupSocialSideHeightSync();
}

function setupSocialSideHeightSync() {
  if (!ui.socialLeftStack || !ui.socialSideColumn) {
    return;
  }

  if ("ResizeObserver" in window) {
    if (!socialSideResizeObserver) {
      socialSideResizeObserver = new ResizeObserver(() => syncSocialSideHeight());
    }
    socialSideResizeObserver.disconnect();
    socialSideResizeObserver.observe(ui.socialLeftStack);
  }

  syncSocialSideHeight();
}

function syncSocialSideHeight() {
  if (!ui.socialLeftStack || !ui.socialSideColumn) {
    return;
  }

  if (window.matchMedia("(max-width: 900px)").matches) {
    ui.socialSideColumn.style.removeProperty("--social-side-height");
    return;
  }

  const leftHeight = Math.ceil(ui.socialLeftStack.getBoundingClientRect().height);
  if (leftHeight > 0) {
    ui.socialSideColumn.style.setProperty("--social-side-height", `${leftHeight}px`);
  }
}

function placePlayerStatsCardInSocialPanel() {
  const statsHost = ui.playerId?.closest("label");
  if (!statsHost || !ui.playerStatsCard || ui.playerStatsCard.parentElement === statsHost) {
    return;
  }
  statsHost.classList.add("player-id-card");
  statsHost.appendChild(ui.playerStatsCard);
}

function setSocialStatus(message, tone = "info") {
  state.socialStatusMessage = message;
  state.socialStatusTone = tone;
  renderSocialPanel();
}

async function refundCurrentUserClosedRoomTicket(room) {
  if (!db || !state.authUser || !room?.id || room.status !== "closed") {
    return 0;
  }

  const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id);
  const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
  let refundedAmount = 0;
  let nextBeans = state.currentBeans;
  const beansRound = room.beansRound || room.gameState?.beansRound || null;
  const paidUids = Array.isArray(beansRound?.paidUids) ? [...beansRound.paidUids] : [];
  const refundedUids = Array.isArray(beansRound?.refundedUids) ? [...beansRound.refundedUids] : [];
  if (!paidUids.includes(state.authUser.uid) || refundedUids.includes(state.authUser.uid)) {
    return 0;
  }

  const ticket = Number(beansRound?.ticket || room.ticket || getTicketCost(room.mode));
  if (!ticket) {
    return 0;
  }

  refundedAmount = ticket;
  nextBeans = normalizeBeans(state.currentBeans, INITIAL_BEANS) + ticket;
  const nextRound = {
    ...beansRound,
    ticket,
    paidUids: paidUids.filter((uid) => uid !== state.authUser.uid),
    refundedUids: [...refundedUids, state.authUser.uid],
  };
  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  const leavingMember = (room.members || []).find((member) => member.uid === state.authUser.uid) || null;

  batch.set(profileRef, {
    uid: state.authUser.uid,
    beans: firebase.firestore.FieldValue.increment(ticket),
    lastBeansAwardReason: "closed-room-ticket-refund",
    updatedAt: timestamp,
    createdAt: timestamp,
  }, { merge: true });

  const roomPatch = {
    beansRound: nextRound,
    updatedAt: timestamp,
    memberUids: firebase.firestore.FieldValue.arrayRemove(state.authUser.uid),
  };
  if (leavingMember) {
    roomPatch.members = firebase.firestore.FieldValue.arrayRemove(leavingMember);
  }
  if (room.gameState) {
    roomPatch.gameState = { ...room.gameState, beansRound: nextRound };
  }
  batch.set(roomRef, roomPatch, { merge: true });
  await batch.commit();

  if (refundedAmount > 0) {
    state.currentBeans = nextBeans;
  }
  return refundedAmount;
}

function resetSocialState() {
  state.socialSearchResult = null;
  state.socialFriendRequests = [];
  state.socialFriends = [];
  state.socialRoomInvites = [];
  state.socialOutgoingRoomInvites = [];
  state.ignoredRoomInviteIds = new Set();
  state.activeRoomInviteId = "";
  state.roomInviteRejectPanelOpen = false;
  state.socialActiveRoom = null;
  state.socialBusy = false;
  state.socialStatusTone = "info";
  clearMultiplayerState();
}

function clearSocialListeners() {
  stopSocialRefreshLoop();
  state.socialUnsubs.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch (error) {
      // ignore listener cleanup errors
    }
  });
  state.socialUnsubs = [];
}

function stopSocialRefreshLoop() {
  if (state.socialRefreshTimer) {
    clearInterval(state.socialRefreshTimer);
    state.socialRefreshTimer = null;
  }
}

function startSocialRefreshLoop() {
  stopSocialRefreshLoop();
  if (!db || !state.authUser) {
    return;
  }

  state.socialRefreshTimer = setInterval(() => {
    if (!state.authUser || document.hidden) {
      return;
    }
    const staleFor = Date.now() - Number(state.socialLastRefreshAt || 0);
    if (staleFor < SOCIAL_REFRESH_INTERVAL_MS - 1500) {
      return;
    }
    refreshSocialData().catch(() => {});
  }, SOCIAL_REFRESH_INTERVAL_MS);
}

function handleVisibilitySocialRefresh() {
  if (!document.hidden && state.authUser) {
    refreshSocialData().catch(() => {});
  }
}

function handleWindowSocialRefresh() {
  if (state.authUser) {
    refreshSocialData().catch(() => {});
  }
}

function clearMultiplayerState() {
  state.multiplayer = {
    active: false,
    roomId: "",
    localHand: [],
    syncQueue: Promise.resolve(),
    openingToken: "",
    openingInProgress: false,
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
  const normalizedRoundPlan = normalizeRoundPlan(state.roundPlan);
  return {
    phase: state.phase,
    tableCards: dedupeCards(state.tableCards),
    drawPile: [...state.drawPile],
    pendingDrawCard: state.pendingDrawCard ? { ...state.pendingDrawCard } : null,
    currentPlayerUid: getCurrentPlayer()?.uid || getCurrentPlayer()?.id || null,
    playersPublic: serializeRoomPlayersPublic(),
    diceSummary: state.diceSummary.map((item) => ({
      ...item,
      rolls: [...(item.rolls || [])],
    })),
    diceAnimation: state.diceAnimation
      ? {
          stage: state.diceAnimation.stage,
          faces: { ...state.diceAnimation.faces },
        }
      : null,
    roundPlan: normalizedRoundPlan
      ? {
          playerHands: Object.fromEntries(
            Object.entries(normalizedRoundPlan.playerHands).map(([playerId, cards]) => [playerId, [...cards]]),
          ),
          tableCards: [...normalizedRoundPlan.tableCards],
          drawPile: [...normalizedRoundPlan.drawPile],
        }
      : null,
    openingStage: state.openingStage || null,
    openingToken: state.multiplayer.openingToken || "",
    log: [...state.log],
    actionDisplay: state.actionDisplay ? { ...state.actionDisplay, cards: [...(state.actionDisplay.cards || [])] } : null,
    feedback: state.feedback ? { ...state.feedback } : null,
    beansRound: state.beansRound ? { ...state.beansRound } : null,
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

async function syncMultiplayerRoomState() {
  if (!isMultiplayerActive() || !db || !state.authUser) {
    return;
  }

  const roomId = state.multiplayer.roomId || state.socialActiveRoom?.id;
  if (!roomId) {
    return;
  }

  const nextGameState = serializeRoomGameState();
  const localPlayer = state.players.find((player) => player.uid === state.authUser.uid);
  const nextLocalHand = localPlayer ? [...localPlayer.hand] : [];
  const syncTask = async () => {
    const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(roomId);
    const batch = db.batch();
    batch.set(roomRef, {
      status: "playing",
      gameState: nextGameState,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    batch.set(roomRef.collection("hands").doc(state.authUser.uid), {
      cards: nextLocalHand,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await batch.commit();

    state.multiplayer.roomId = roomId;
    state.multiplayer.localHand = nextLocalHand;
    if (state.socialActiveRoom?.id === roomId) {
      state.socialActiveRoom = {
        ...state.socialActiveRoom,
        status: "playing",
        gameState: nextGameState,
      };
    }
  };

  state.multiplayer.syncQueue = (state.multiplayer.syncQueue || Promise.resolve())
    .catch(() => {})
    .then(syncTask);
  return state.multiplayer.syncQueue;
}

function getFriendPairId(uidA, uidB) {
  return [uidA, uidB].sort().join("__");
}

function isFriendWithUid(uid) {
  return state.socialFriends.some((friend) => friend.uid === uid);
}

function getFirestoreTimeMillis(value) {
  if (!value) {
    return 0;
  }
  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }
  if (typeof value.seconds === "number") {
    return value.seconds * 1000 + Math.floor(Number(value.nanoseconds || 0) / 1000000);
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getInviteCreatedTime(invite) {
  return Number(invite?.createdAtMs || 0) || getFirestoreTimeMillis(invite?.createdAt);
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

function isRoomOpenForInvite(room, currentUid) {
  if (!room || room.status !== "waiting") {
    return false;
  }

  const memberUids = Array.isArray(room.memberUids) ? room.memberUids : [];
  if (memberUids.includes(currentUid)) {
    return false;
  }

  const targetCount = Number(room.mode || 2);
  return memberUids.length < targetCount;
}

async function filterOpenRoomInvites(invites, currentUid) {
  if (!db || !Array.isArray(invites) || !invites.length) {
    return [];
  }

  const roomIds = [...new Set(invites.map((invite) => invite.roomId).filter(Boolean))];
  if (!roomIds.length) {
    return [];
  }

  const roomEntries = await Promise.all(roomIds.map(async (roomId) => {
    try {
      const roomSnap = await db.collection(FIRESTORE_COLLECTIONS.rooms).doc(roomId).get();
      return [roomId, roomSnap.exists ? { id: roomSnap.id, ...roomSnap.data() } : null];
    } catch (error) {
      return [roomId, null];
    }
  }));
  const roomsById = new Map(roomEntries);

  return invites.filter((invite) => isRoomOpenForInvite(roomsById.get(invite.roomId), currentUid));
}

async function refreshSocialData() {
  if (socialRefreshInFlight) {
    socialRefreshRequested = true;
    return socialRefreshInFlight;
  }

  socialRefreshInFlight = (async () => {
    do {
      socialRefreshRequested = false;
      if (!db || !state.authUser) {
        resetSocialState();
        renderSocialPanel();
        renderRoomInviteModal();
        state.socialLastRefreshAt = Date.now();
        continue;
      }

      const currentUid = state.authUser.uid;
      const [friendRequestsSnap, roomInvitesSnap, outgoingRoomInvitesSnap, roomsSnap] = await Promise.all([
        db.collection(FIRESTORE_COLLECTIONS.friendRequests)
          .where("toUid", "==", currentUid)
          .where("status", "==", "pending")
          .get(),
        db.collection(FIRESTORE_COLLECTIONS.roomInvites)
          .where("toUid", "==", currentUid)
          .where("status", "==", "pending")
          .get(),
        db.collection(FIRESTORE_COLLECTIONS.roomInvites)
          .where("fromUid", "==", currentUid)
          .get(),
        db.collection(FIRESTORE_COLLECTIONS.rooms)
          .where("memberUids", "array-contains", currentUid)
          .get(),
      ]);

      state.socialFriendRequests = friendRequestsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const pendingRoomInvites = roomInvitesSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => getInviteCreatedTime(b) - getInviteCreatedTime(a));
      state.socialRoomInvites = await filterOpenRoomInvites(pendingRoomInvites, currentUid);
      state.socialOutgoingRoomInvites = outgoingRoomInvitesSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => getInviteCreatedTime(b) - getInviteCreatedTime(a));

      const memberRooms = roomsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      let refundedClosedRoomTicket = 0;
      for (const room of memberRooms.filter((item) => item.status === "closed")) {
        refundedClosedRoomTicket += await refundCurrentUserClosedRoomTicket(room);
      }
      if (refundedClosedRoomTicket > 0) {
        await loadCurrentUserProfile();
        state.socialStatusMessage = `已退回关闭房间门票 ${formatBeans(refundedClosedRoomTicket)}。`;
        state.socialStatusTone = "success";
      }

      const activeRoom = memberRooms
        .filter((room) => room.status === "waiting" || room.status === "playing")
        .sort((a, b) => {
          const aTime = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const bTime = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return bTime - aTime;
        })[0] || null;

      let normalizedActiveRoom = activeRoom;
      if (activeRoom) {
        try {
          const pendingInviteUids = state.socialOutgoingRoomInvites
            .filter((invite) => invite.roomId === activeRoom.id && invite.status === "pending")
            .map((invite) => invite.toUid)
            .filter(Boolean);
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
      if (normalizedActiveRoom?.status === "playing" && normalizedActiveRoom.gameState && canAutoResumePlayingRoom()) {
        if (!(await ensureBeansPaidForRoom(normalizedActiveRoom))) {
          renderSocialPanel();
          renderRoomInviteModal();
          state.socialLastRefreshAt = Date.now();
          continue;
        }
        const localHand = await loadCurrentRoomHand(normalizedActiveRoom.id);
        applyMultiplayerRoomState(normalizedActiveRoom, localHand);
      } else if (!normalizedActiveRoom && state.multiplayer.active) {
        clearMultiplayerState();
      }
      renderSocialPanel();
      renderRoomInviteModal();
      state.socialLastRefreshAt = Date.now();
    } while (socialRefreshRequested);
  })();

  try {
    await socialRefreshInFlight;
  } finally {
    socialRefreshInFlight = null;
  }
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
    db.collection(FIRESTORE_COLLECTIONS.roomInvites)
      .where("fromUid", "==", currentUid),
    db.collection(FIRESTORE_COLLECTIONS.rooms)
      .where("memberUids", "array-contains", currentUid),
  ];

  listenerConfigs.forEach((query) => {
    const unsubscribe = query.onSnapshot(() => {
      refreshSocialData().catch((error) => {
        setSocialStatus(`同步好友/房间失败：${formatAuthError(error)}`);
      });
    }, (error) => {
      setSocialStatus(`同步好友/房间失败：${formatAuthError(error)}`);
    });
    state.socialUnsubs.push(unsubscribe);
  });

  startSocialRefreshLoop();
  refreshSocialData().catch((error) => {
    setSocialStatus(`同步好友/房间失败：${formatAuthError(error)}`);
  });
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

  if (!(await prepareCurrentPlayerProfile())) {
    return;
  }
  const beansRound = await debitBeansForTicket(mode, Number(mode), "");
  if (!beansRound) {
    render();
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    await db.collection(FIRESTORE_COLLECTIONS.rooms).add({
      mode: Number(mode),
      ticket: beansRound.ticket,
      pot: beansRound.pot,
      beansRound: {
        ...beansRound,
        paidUids: [state.authUser.uid],
      },
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
    setSocialStatus(`已创建 ${mode} 人房，已扣门票 ${formatBeans(beansRound.ticket)}。`);
  } catch (error) {
    await awardBeansToCurrentUser(beansRound.ticket, "room-create-rollback");
    setSocialStatus(`创建房间失败：${formatAuthError(error)}`);
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
      ticket: Number(room.ticket || getTicketCost(room.mode)),
      fromUid: state.authUser.uid,
      fromGameId: state.currentPlayerId,
      toUid: friendUid,
      toGameId: friendGameId,
      status: "pending",
      createdAtMs: Date.now(),
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

async function handleLeaveRoom() {
  if (!db || !state.authUser || !state.socialActiveRoom) {
    return;
  }

  const room = state.socialActiveRoom;
  let refundedAmount = 0;
  let nextBeans = state.currentBeans;
  state.socialBusy = true;
  renderSocialPanel();
  try {
    const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id);
    const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();
    const beansRound = room.beansRound || room.gameState?.beansRound || null;
    const paidUids = Array.isArray(beansRound?.paidUids) ? [...beansRound.paidUids] : [];
    const refundedUids = Array.isArray(beansRound?.refundedUids) ? [...beansRound.refundedUids] : [];
    const shouldRefund = room.status === "waiting"
      && paidUids.includes(state.authUser.uid)
      && !refundedUids.includes(state.authUser.uid);
    let nextRound = beansRound;

    if (shouldRefund) {
      const ticket = Number(beansRound?.ticket || room.ticket || getTicketCost(room.mode));
      if (ticket > 0) {
        refundedAmount = ticket;
        nextBeans = normalizeBeans(state.currentBeans, INITIAL_BEANS) + ticket;
        nextRound = {
          ...beansRound,
          ticket,
          paidUids: paidUids.filter((uid) => uid !== state.authUser.uid),
          refundedUids: [...refundedUids, state.authUser.uid],
        };
        batch.set(profileRef, {
          uid: state.authUser.uid,
          beans: firebase.firestore.FieldValue.increment(ticket),
          lastBeansAwardReason: room.hostUid === state.authUser.uid ? "room-close-ticket-refund" : "room-leave-ticket-refund",
          updatedAt: timestamp,
          createdAt: timestamp,
        }, { merge: true });
      }
    }

    const roomPatch = {
      updatedAt: timestamp,
    };
    if (nextRound && nextRound !== beansRound) {
      roomPatch.beansRound = nextRound;
      if (room.gameState) {
        roomPatch.gameState = { ...room.gameState, beansRound: nextRound };
      }
    }

    const currentMemberCount = Array.isArray(room.memberUids) ? room.memberUids.length : 0;
    const closingRoom = room.hostUid === state.authUser.uid || currentMemberCount <= 1;
    if (closingRoom) {
      roomPatch.status = "closed";
    } else {
      roomPatch.memberUids = firebase.firestore.FieldValue.arrayRemove(state.authUser.uid);
      const leavingMember = (room.members || []).find((member) => member.uid === state.authUser.uid) || null;
      if (leavingMember) {
        roomPatch.members = firebase.firestore.FieldValue.arrayRemove(leavingMember);
      }
    }

    batch.set(roomRef, roomPatch, { merge: true });
    await batch.commit();
    if (refundedAmount > 0) {
      state.currentBeans = nextBeans;
      await loadCurrentUserProfile();
    }
    const refundText = refundedAmount > 0 ? `，已退回门票 ${formatBeans(refundedAmount)}` : "";
    setSocialStatus(room.hostUid === state.authUser.uid ? `已关闭房间${refundText}。` : `已离开房间${refundText}。`);
  } catch (error) {
    const extra = error?.code === "permission-denied" ? " 当前更像是 Firestore 规则拦住了这次写入。" : "";
    setSocialStatus(`离开房间失败：${formatAuthError(error)}${extra}`);
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

function getCardIdentity(card) {
  if (!card) {
    return "";
  }
  if (card.id) {
    return `id:${card.id}`;
  }
  if (card.suit && card.rank) {
    return [
      card.suit,
      card.rank,
      card.playValue ?? "",
      card.scoreValue ?? "",
    ].join("|");
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

function takeUniqueCards(cards, usedKeys = new Set()) {
  const unique = [];
  (cards || []).forEach((card) => {
    if (!card) {
      return;
    }
    const key = getCardIdentity(card);
    if (!key || usedKeys.has(key)) {
      return;
    }
    usedKeys.add(key);
    unique.push(card);
  });
  return unique;
}

function normalizeRoundPlan(roundPlan) {
  if (!roundPlan) {
    return null;
  }

  const usedKeys = new Set();
  const playerHands = Object.fromEntries(
    Object.entries(roundPlan.playerHands || {}).map(([playerId, cards]) => [
      playerId,
      takeUniqueCards(cards, usedKeys),
    ]),
  );

  return {
    playerHands,
    tableCards: takeUniqueCards(roundPlan.tableCards, usedKeys),
    drawPile: takeUniqueCards(roundPlan.drawPile, usedKeys),
  };
}

function normalizeAppliedCardState(players, gameState) {
  const usedKeys = new Set();
  const normalizedPlayers = players.map((player) => ({
    ...player,
    captured: takeUniqueCards(player.captured),
  }));

  normalizedPlayers.forEach((player) => {
    player.captured = takeUniqueCards(player.captured, usedKeys);
  });

  const pendingDrawCard = takeUniqueCards(
    gameState.pendingDrawCard ? [gameState.pendingDrawCard] : [],
    usedKeys,
  )[0] || null;
  const tableCards = takeUniqueCards(gameState.tableCards, usedKeys);
  const drawPile = takeUniqueCards(gameState.drawPile, usedKeys);

  normalizedPlayers.forEach((player) => {
    player.hand = takeUniqueCards(player.hand, usedKeys);
  });

  return {
    players: normalizedPlayers,
    tableCards,
    drawPile,
    pendingDrawCard,
  };
}

function appendTableCards(cards) {
  const nextCards = Array.isArray(cards) ? cards : [cards];
  state.tableCards = dedupeCards([...state.tableCards, ...nextCards]);
}

function resolveLocalMultiplayerHand(playerPublic, loadedLocalHand, currentPlayerUid = "", phase = state.phase) {
  const expectedCount = Number(playerPublic?.handCount || 0);
  const currentLocalPlayer = state.players.find((player) => player.uid === state.authUser?.uid);
  const currentLocalHand = Array.isArray(currentLocalPlayer?.hand) ? currentLocalPlayer.hand : null;
  const cachedLocalHand = Array.isArray(state.multiplayer?.localHand) ? state.multiplayer.localHand : null;
  const openingPhase = new Set(["dice-rolling", "dice-result", "opening-deal"]);

  if (playerPublic?.uid === state.authUser?.uid && openingPhase.has(phase)) {
    const animatedHand = [currentLocalHand, cachedLocalHand]
      .filter((cards) => Array.isArray(cards))
      .sort((a, b) => b.length - a.length)[0];
    if (animatedHand?.length) {
      return [...animatedHand];
    }
    if (expectedCount === 0) {
      return [];
    }
  }

  if (
    playerPublic?.uid === state.authUser?.uid
    && currentPlayerUid === state.authUser?.uid
    && state.pendingDrawCard
  ) {
    const optimisticHand = [currentLocalHand, cachedLocalHand]
      .filter((cards) => Array.isArray(cards))
      .sort((a, b) => a.length - b.length)[0];

    if (optimisticHand) {
      return [...optimisticHand];
    }
  }

  const candidates = [
    Array.isArray(loadedLocalHand) ? loadedLocalHand : null,
    currentLocalHand,
    cachedLocalHand,
  ];

  const matchingHand = candidates.find((cards) => Array.isArray(cards) && cards.length === expectedCount);
  if (matchingHand) {
    return [...matchingHand];
  }

  if (playerPublic?.uid === state.authUser?.uid && currentPlayerUid === state.authUser?.uid) {
    const optimisticHand = [currentLocalHand, cachedLocalHand]
      .filter((cards) => Array.isArray(cards))
      .sort((a, b) => a.length - b.length)[0];

    if (optimisticHand && optimisticHand.length < expectedCount) {
      return [...optimisticHand];
    }
  }

  return Array.isArray(loadedLocalHand) ? [...loadedLocalHand] : [];
}

function applyMultiplayerRoomState(room, localHand = state.multiplayer.localHand) {
  const gameState = room?.gameState;
  if (!room || !gameState || !Array.isArray(gameState.playersPublic)) {
    clearMultiplayerState();
    return;
  }

  const sameOpeningReplay = Boolean(
    state.multiplayer.active
    && state.multiplayer.openingInProgress
    && gameState.openingToken
    && gameState.openingToken === state.multiplayer.openingToken
    && (gameState.phase === "dice-rolling" || gameState.phase === "dice-result" || gameState.phase === "opening-deal")
  );
  if (sameOpeningReplay) {
    return;
  }

  const members = Array.isArray(room.members) ? room.members : [];
  const players = gameState.playersPublic.map((playerPublic) => {
    const member = members.find((item) => item.uid === playerPublic.uid);
    const isLocal = playerPublic.uid === state.authUser?.uid;
    const resolvedHand = isLocal
      ? resolveLocalMultiplayerHand(playerPublic, localHand, gameState.currentPlayerUid, gameState.phase)
      : createHiddenHand(Number(playerPublic.handCount || 0), playerPublic.uid);
    return {
      id: playerPublic.uid,
      uid: playerPublic.uid,
      name: playerPublic.name || member?.gameId || "玩家",
      isHuman: isLocal,
      isRemote: !isLocal,
      hand: resolvedHand,
      captured: Array.isArray(playerPublic.captured) ? [...playerPublic.captured] : [],
      lastAction: playerPublic.lastAction || null,
      diceTrail: [],
    };
  });
  const normalizedCardState = normalizeAppliedCardState(players, gameState);
  const normalizedRoundPlan = normalizeRoundPlan(gameState.roundPlan);

  state.multiplayer.active = true;
  state.multiplayer.roomId = room.id;
  state.multiplayer.localHand = [...(normalizedCardState.players.find((player) => player.uid === state.authUser?.uid)?.hand || [])];
  state.multiplayer.openingToken = gameState.openingToken || "";
  state.players = normalizedCardState.players;
  state.tableCards = normalizedCardState.tableCards;
  state.drawPile = normalizedCardState.drawPile;
  state.pendingDrawCard = normalizedCardState.pendingDrawCard;
  state.log = Array.isArray(gameState.log) ? [...gameState.log] : [];
  state.actionDisplay = gameState.actionDisplay || null;
  state.feedback = gameState.feedback || null;
    state.beansRound = gameState.beansRound
    ? { ...gameState.beansRound }
    : (room.beansRound ? { ...room.beansRound } : null);
  if (state.beansRound?.awarded && state.pendingBeansAward?.roundId === state.beansRound.id) {
    state.pendingBeansAward = null;
  }
  state.lastFinishedResult = Array.isArray(gameState.lastFinishedResult) ? [...gameState.lastFinishedResult] : null;
  state.lastFinishedAt = gameState.lastFinishedAt || "";
  state.currentPlayerIndex = Math.max(0, players.findIndex((player) => player.uid === gameState.currentPlayerUid));
  state.settings.playerCount = Number(room.mode || state.settings.playerCount || 2);
  state.diceSummary = Array.isArray(gameState.diceSummary)
    ? gameState.diceSummary.map((item) => ({
        ...item,
        rolls: Array.isArray(item.rolls) ? [...item.rolls] : [],
      }))
    : [];
  state.roundPlan = normalizedRoundPlan
    ? {
        playerHands: Object.fromEntries(
          Object.entries(normalizedRoundPlan.playerHands).map(([playerId, cards]) => [playerId, [...cards]]),
        ),
        tableCards: [...normalizedRoundPlan.tableCards],
        drawPile: [...normalizedRoundPlan.drawPile],
      }
    : null;
  state.openingStage = gameState.openingStage || null;

  const preserveLocalDiceReplay = Boolean(
    state.multiplayer.openingInProgress
    && state.diceAnimation
    && state.diceAnimation.stage === "rolling"
    && (gameState.phase === "dice-result" || gameState.phase === "opening-deal")
  );
  if (preserveLocalDiceReplay) {
    // Keep the local rolling animation until the replay timer advances to the final result.
  } else if (gameState.diceAnimation?.faces) {
    state.diceAnimation = {
      stage: gameState.diceAnimation.stage || "rolling",
      faces: { ...gameState.diceAnimation.faces },
    };
  } else {
    state.diceAnimation = null;
  }

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

  const shouldReplayOpening = Boolean(
    gameState.openingToken
    && state.multiplayer.openingToken === gameState.openingToken
    && !state.multiplayer.openingInProgress
    && (syncedPhase === "dice-rolling" || syncedPhase === "dice-result" || syncedPhase === "opening-deal")
  );
  if (shouldReplayOpening) {
    state.multiplayer.openingInProgress = true;
    if (syncedPhase === "dice-rolling" || syncedPhase === "dice-result") {
      startRemoteDiceReplay(gameState.diceAnimation?.faces || {});
    } else {
      startOpeningSequence();
    }
  } else if (syncedPhase === "human-turn" || syncedPhase === "remote-turn" || syncedPhase === "game-over") {
    state.multiplayer.openingInProgress = false;
  }

  if (state.phase === "game-over" && Array.isArray(state.lastFinishedResult)) {
    maybeSettleBeansAward(state.lastFinishedResult);
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

function toggleHeroIntro() {
  state.heroIntroOpen = !state.heroIntroOpen;
  renderHeroIntro();
}

function renderHeroIntro() {
  const isOpen = Boolean(state.heroIntroOpen);
  ui.heroSection?.classList.toggle("is-open", isOpen);
  if (ui.heroToggle) {
    ui.heroToggle.textContent = isOpen ? "收起简介" : "玩法简介";
    ui.heroToggle.setAttribute("aria-expanded", String(isOpen));
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

function normalizeBeans(value, fallback = INITIAL_BEANS) {
  const beans = Number(value);
  return Number.isFinite(beans) ? Math.max(0, Math.floor(beans)) : fallback;
}

function getTicketCost(mode = state.settings.playerCount || 2) {
  return ROOM_TICKETS[Number(mode)] || ROOM_TICKETS[2];
}

function formatBeans(value) {
  return `${normalizeBeans(value, 0).toLocaleString("zh-CN")} 欢乐豆`;
}

function formatBeanAmount(value) {
  const normalized = normalizeBeans(value, 0);
  if (normalized >= 10000) {
    const compact = normalized / 10000;
    const text = compact >= 10 || Number.isInteger(compact)
      ? Math.round(compact).toLocaleString("zh-CN")
      : compact.toFixed(1);
    return `${text}万`;
  }
  return normalized.toLocaleString("zh-CN");
}

function getProfileBeans(profile) {
  return normalizeBeans(profile?.beans, INITIAL_BEANS);
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeBeansBenefits(data = {}) {
  return {
    dailyClaimDate: typeof data.dailyClaimDate === "string" ? data.dailyClaimDate : "",
    adClaimDate: typeof data.adClaimDate === "string" ? data.adClaimDate : "",
    adsWatchedToday: Math.max(0, Math.floor(Number(data.adsWatchedToday || 0))),
    totalDailyClaims: Math.max(0, Math.floor(Number(data.totalDailyClaims || 0))),
    totalAdsWatched: Math.max(0, Math.floor(Number(data.totalAdsWatched || 0))),
  };
}

function getCurrentBeansBenefits() {
  return normalizeBeansBenefits(state.currentBeansBenefits || {});
}

function getTodayAdClaimCount(benefits = getCurrentBeansBenefits()) {
  return benefits.adClaimDate === getLocalDateKey()
    ? Math.max(0, Number(benefits.adsWatchedToday || 0))
    : 0;
}

function createBeansRound(mode, playerCount, roomId = "", roundId = "") {
  const ticket = getTicketCost(mode);
  return {
    id: roundId || `${roomId || "local"}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    roomId,
    mode: Number(mode || 2),
    ticket,
    playerCount: Number(playerCount || mode || 2),
    pot: ticket * Number(playerCount || mode || 2),
    paid: true,
    awarded: false,
  };
}

function getLocalPlayerName() {
  return state.players.find((player) => player.uid === state.authUser?.uid)?.name
    || state.currentPlayerId
    || "玩家 1";
}

function getSingleWinner(result) {
  if (!Array.isArray(result) || !result.length) {
    return null;
  }
  const bestScore = result[0].score;
  const winners = result.filter((item) => item.score === bestScore);
  return winners.length === 1 ? winners[0] : null;
}

function findPlayerForResult(resultItem) {
  return state.players.find((player) => (
    (resultItem?.uid && player.uid === resultItem.uid)
    || (resultItem?.id && player.id === resultItem.id)
    || player.name === resultItem?.name
  )) || null;
}

function getSettlementRoleLabels(player) {
  const labels = [];
  if (player && isLocalSeatPlayer(player)) {
    labels.push("你");
  }
  if (player?.uid && state.socialActiveRoom?.hostUid === player.uid) {
    labels.push("房主");
  }
  if (player && isRemoteSeatPlayer(player)) {
    labels.push("好友");
  }
  if (!labels.length) {
    labels.push("电脑");
  }
  return labels;
}

function isSameResultPlayer(a, b) {
  return Boolean(
    a && b && (
      (a.uid && b.uid && a.uid === b.uid)
      || (a.id && b.id && a.id === b.id)
      || a.name === b.name
    )
  );
}

function getBeansSettlementRows(result = getRankedPlayers()) {
  const round = state.beansRound;
  const ticket = Number(round?.ticket || 0);
  const pot = Number(round?.pot || 0);
  const awardedAmount = Number(round?.awardedAmount || 0);
  const paidUids = Array.isArray(round?.paidUids) ? round.paidUids : [];
  const winner = getSingleWinner(result);

  return result.map((item, index) => {
    const player = findPlayerForResult(item);
    const paidTicket = Boolean(round && ticket > 0 && (
      !paidUids.length
      || (item.uid && paidUids.includes(item.uid))
      || (player?.uid && paidUids.includes(player.uid))
    ));
    const ticketCost = paidTicket ? ticket : 0;
    const isWinner = Boolean(winner && isSameResultPlayer(item, winner));
    const grossAward = isWinner && winner ? (awardedAmount > 0 ? awardedAmount : pot) : 0;
    const adBonus = Math.max(0, grossAward - pot);
    const delta = round ? grossAward - ticketCost : 0;
    const detail = round
      ? isWinner
        ? `奖池 +${formatBeans(pot)}${adBonus > 0 ? ` · 广告翻倍 +${formatBeans(adBonus)}` : ""} · 门票 -${formatBeans(ticketCost)}`
        : `门票 -${formatBeans(ticketCost)}`
      : "单机练习局不涉及欢乐豆";

    return {
      ...item,
      rank: index + 1,
      player,
      roleLabels: getSettlementRoleLabels(player),
      isWinner,
      delta,
      detail,
      tone: delta > 0 ? "win" : delta < 0 ? "loss" : "even",
    };
  });
}

function formatBeansDelta(delta) {
  if (delta > 0) {
    return `赢 ${formatBeans(delta)}`;
  }
  if (delta < 0) {
    return `输 ${formatBeans(Math.abs(delta))}`;
  }
  return "不输不赢";
}

function getPendingBeansAward(result) {
  const round = state.beansRound;
  if (!round || round.awarded || !round.pot) {
    return null;
  }

  const winner = getSingleWinner(result);
  if (!winner || winner.name !== getLocalPlayerName()) {
    return null;
  }

  return {
    roundId: round.id,
    amount: Number(round.pot || 0),
    winnerName: winner.name,
  };
}

function maybeSettleBeansAward(result) {
  const award = getPendingBeansAward(result);
  if (!award) {
    return false;
  }

  if (state.pendingBeansAward?.roundId === award.roundId) {
    return true;
  }

  state.pendingBeansAward = award;
  setFeedback(`你赢得本局奖池 ${formatBeans(award.amount)}，可以直接领取或看广告翻倍。`, "info");
  return true;
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

function getPlayerProfileDefaults(playerId = "", uid = "") {
  return {
    id: playerId,
    uid,
    beans: INITIAL_BEANS,
    beansBenefits: normalizeBeansBenefits(),
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
    beans: normalizeBeans(data.beans, INITIAL_BEANS),
    beansBenefits: normalizeBeansBenefits(data.beansBenefits),
    statsByMode: buildStatsByMode(data),
  };
}

function upsertPlayerProfile(profile) {
  if (!profile?.id) {
    return;
  }

  if (profile.uid && profile.uid === state.authUser?.uid) {
    state.currentBeans = getProfileBeans(profile);
    state.currentBeansBenefits = normalizeBeansBenefits(profile.beansBenefits);
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
  return "输入你想使用的游戏 ID，点击“创建 ID，进入大厅”后会检查唯一性并绑定。";
}

function needsInitialPlayerIdSetup() {
  return Boolean(state.authUser && !state.hasBoundGameId);
}

function renderPlayerIdHint() {
  if (!ui.playerIdHint) {
    return;
  }

  const defaultHint = getDefaultPlayerIdHint();
  const hasCustomHint = Boolean(state.playerIdHintMessage && state.playerIdHintMessage !== defaultHint);
  const canOpenStats = !hasCustomHint && state.authUser && state.hasBoundGameId && state.currentPlayerId;

  if (!canOpenStats) {
    state.playerStatsOpen = false;
    ui.playerIdHint.textContent = state.playerIdHintMessage || defaultHint;
    return;
  }

  const idHtml = escapeHtml(state.currentPlayerId);
  if (state.gameIdEditable) {
    ui.playerIdHint.innerHTML = `当前账号暂时绑定了 ID：<button class="player-id-details-toggle" type="button" aria-expanded="${state.playerStatsOpen}">${idHtml}</button>。因为还没产生正式战绩，你现在仍然可以改成别的 ID。`;
  } else {
    ui.playerIdHint.innerHTML = `当前账号已绑定唯一 ID：<button class="player-id-details-toggle" type="button" aria-expanded="${state.playerStatsOpen}">${idHtml}</button>`;
  }

  const toggle = ui.playerIdHint.querySelector(".player-id-details-toggle");
  toggle?.addEventListener("click", togglePlayerStatsPopover);
}

function togglePlayerStatsPopover(event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (!state.authUser || !state.hasBoundGameId || !state.currentPlayerId) {
    return;
  }
  state.playerStatsOpen = !state.playerStatsOpen;
  renderAuthControls();
  renderPlayerStatsDashboard();
}

function closePlayerStatsPopover() {
  if (!state.playerStatsOpen) {
    return;
  }
  state.playerStatsOpen = false;
  renderAuthControls();
  renderPlayerStatsDashboard();
}

function isAuthEntryViewActive() {
  return state.phase === "setup" && Boolean(state.authUser) && state.authEntryActive;
}

function isLoginEntryViewActive() {
  return state.phase === "setup" && (!state.authUser || state.authEntryActive);
}

function canShowLobbyInviteModal() {
  return state.phase === "setup"
    && Boolean(state.authUser)
    && !state.authEntryActive
    && !needsInitialPlayerIdSetup();
}

function canAutoResumePlayingRoom() {
  return Boolean(
    state.authUser
    && state.multiplayer.active
    && state.phase !== "setup"
  );
}

function handleOpenEmailAuthForm() {
  state.authFormOpen = true;
  state.authStatusMessage = ui.authEmail.value.trim()
    ? "已填入上次使用的邮箱，请输入密码后登录。"
    : "请输入邮箱和密码登录账号。";
  renderAuthControls();
  render();
  setTimeout(() => {
    if (!ui.authEmail?.value) {
      ui.authEmail?.focus();
    } else {
      ui.authPassword?.focus();
    }
  }, 0);
}

function handleCloseEmailAuthForm() {
  if (state.authBusy) {
    return;
  }
  state.authFormOpen = false;
  state.authStatusMessage = state.authReady
    ? "请选择邮箱或 Google 账号登录。"
    : "正在连接 Firebase...";
  renderAuthControls();
  render();
}

async function handleEntryStartGame() {
  if (!state.authUser) {
    handleOpenEmailAuthForm();
    return;
  }
  state.authEntryActive = false;
  state.authFormOpen = false;
  state.authStatusMessage = needsInitialPlayerIdSetup()
    ? "先创建游戏 ID，之后就可以进入大厅。"
    : "已进入游戏大厅，可以开始单机或好友房。";
  renderAuthControls();
  render();
  await refreshSocialData();
}

function setLobbyPlayMode(mode) {
  const nextMode = mode === "friends" ? "friends" : "solo";
  if (state.lobbyPlayMode === nextMode) {
    return;
  }
  state.lobbyPlayMode = nextMode;
  renderAuthControls();
  renderLobbyModeControls();
}

function renderLobbyModeControls() {
  if (!ui.lobbyModeCard) {
    return;
  }

  const friendsMode = state.lobbyPlayMode === "friends";
  ui.lobbyModeCard.classList.toggle("is-solo-mode", !friendsMode);
  ui.lobbyModeCard.classList.toggle("is-friends-mode", friendsMode);
  ui.lobbyModeSolo?.classList.toggle("active", !friendsMode);
  ui.lobbyModeFriends?.classList.toggle("active", friendsMode);
  ui.lobbyModeSolo?.setAttribute("aria-selected", String(!friendsMode));
  ui.lobbyModeFriends?.setAttribute("aria-selected", String(friendsMode));
  renderLobbyFriendRoomCard();
}

function renderLobbyFriendRoomCard() {
  if (!ui.lobbyFriendRoomCard) {
    return;
  }

  const signedIn = Boolean(state.authUser);
  const room = state.socialActiveRoom;
  ui.lobbyFriendRoomCard.innerHTML = "";
  if (ui.lobbyRoomSideActions) {
    ui.lobbyRoomSideActions.innerHTML = "";
    ui.lobbyRoomSideActions.classList.add("hidden");
  }

  if (!signedIn) {
    ui.lobbyFriendRoomCard.appendChild(createEmptyState("登录后可以创建好友房。"));
    return;
  }

  if (!room) {
    const wrap = document.createElement("div");
    wrap.className = "social-room-inner social-room-create lobby-room-inner";
    wrap.innerHTML = `
      <div>
        <strong>还没有等待中的房间</strong>
        <p>先创建一个 2 / 3 / 4 人房，再邀请好友加入。创建时会扣除对应门票。</p>
      </div>
    `;
    const actions = document.createElement("div");
    actions.className = "social-inline-actions";
    ["2", "3", "4"].forEach((mode) => {
      const button = document.createElement("button");
      button.className = "ghost-btn";
      button.type = "button";
      button.textContent = `创建${mode}人房`;
      button.title = `门票 ${formatBeans(getTicketCost(mode))}`;
      button.disabled = state.socialBusy || !state.currentPlayerId || state.currentBeans < getTicketCost(mode);
      button.addEventListener("click", () => handleCreateRoom(mode));
      actions.appendChild(button);
    });
    wrap.appendChild(actions);
    ui.lobbyFriendRoomCard.appendChild(wrap);
    return;
  }

  const members = Array.isArray(room.members) ? room.members : [];
  const targetCount = Number(room.mode || 2);
  const slotsLeft = Math.max(0, targetCount - members.length);
  const memberText = members.map((member) => member.gameId).join("、") || "暂无";
  const roomStatusText = room.status === "playing"
    ? "联机对局进行中"
    : slotsLeft > 0
      ? `等待中，还差 ${slotsLeft} 人`
      : "人数已满，可以开始联机";
  const card = document.createElement("div");
  card.className = "social-room-inner social-room-active lobby-room-inner";
  card.innerHTML = `
    <div class="social-room-details">
      <strong>${room.mode} 人房 · ${room.hostUid === state.authUser.uid ? "你是房主" : "好友房间"}</strong>
      <p>${roomStatusText}</p>
      <p>当前成员：${escapeHtml(memberText)}</p>
    </div>
  `;
  const actions = document.createElement("div");
  actions.className = "social-inline-actions lobby-room-side-actions-inner";

  if (room.status === "playing") {
    const resumeButton = document.createElement("button");
    resumeButton.className = "ghost-btn";
    resumeButton.type = "button";
    resumeButton.textContent = "返回对局";
    resumeButton.disabled = state.socialBusy;
    resumeButton.addEventListener("click", handleReturnToActiveRoom);
    actions.appendChild(resumeButton);
  }

  if (room.status === "waiting" && room.hostUid === state.authUser.uid && members.length === targetCount) {
    const startButton = document.createElement("button");
    startButton.className = "ghost-btn";
    startButton.type = "button";
    startButton.textContent = "开始联机";
    startButton.disabled = state.socialBusy;
    startButton.addEventListener("click", handleStartRoomMatch);
    actions.appendChild(startButton);
  }

  const leaveButton = document.createElement("button");
  leaveButton.className = "ghost-btn";
  leaveButton.type = "button";
  leaveButton.textContent = room.hostUid === state.authUser.uid ? "关闭房间" : "离开房间";
  leaveButton.disabled = state.socialBusy;
  leaveButton.addEventListener("click", handleLeaveRoom);
  actions.appendChild(leaveButton);

  ui.lobbyFriendRoomCard.appendChild(card);
  if (ui.lobbyRoomSideActions && actions.childElementCount) {
    ui.lobbyRoomSideActions.appendChild(actions);
    ui.lobbyRoomSideActions.classList.remove("hidden");
  }
}

function handleDocumentClick(event) {
  if (!state.playerStatsOpen) {
    return;
  }
  const target = event.target;
  if (target?.closest?.(".player-id-details-toggle") || ui.playerStatsCard?.contains(target)) {
    return;
  }
  closePlayerStatsPopover();
}

function renderAuthControls() {
  const signedIn = Boolean(state.authUser);
  const authEntryMode = isAuthEntryViewActive();
  const needsIdSetup = needsInitialPlayerIdSetup();
  const lobbyMode = signedIn && !needsIdSetup && !authEntryMode;
  const lockedId = signedIn && state.hasBoundGameId && !state.gameIdEditable;
  const shownBeans = signedIn ? state.currentBeans : 0;
  const setupTitle = ui.setupPanel?.querySelector(".panel-head h2");
  const setupCopy = ui.setupPanel?.querySelector(".panel-head p");

  ui.setupPanel?.classList.toggle("is-login-mode", !signedIn);
  ui.setupPanel?.classList.toggle("is-auth-form-open", !signedIn && state.authFormOpen);
  ui.setupPanel?.classList.toggle("is-entry-mode", authEntryMode);
  ui.setupPanel?.classList.toggle("is-id-setup-mode", !authEntryMode && needsIdSetup);
  ui.setupPanel?.classList.toggle("is-lobby-mode", lobbyMode);
  if (setupTitle) {
    setupTitle.textContent = authEntryMode
      ? "账号已登录"
      : needsIdSetup
      ? "创建游戏 ID"
      : signedIn
        ? "游戏大厅"
        : "登录钓红点";
  }
  if (setupCopy) {
    setupCopy.textContent = authEntryMode
      ? "点击开始游戏后进入大厅；如果还没有 ID，会先创建唯一游戏 ID。"
      : needsIdSetup
      ? "这是朋友搜索、邀请和排行榜展示用的名字；创建后进入大厅。"
      : signedIn
        ? "可开始单机或好友联机"
        : "选择邮箱或 Google 账号登录，进入后再开始游戏。";
  }

  ui.authEmail.disabled = state.authBusy || signedIn;
  ui.authPassword.disabled = state.authBusy || signedIn;
  if (ui.authEmailEntry) {
    ui.authEmailEntry.disabled = state.authBusy || signedIn || !auth;
    ui.authEmailEntry.classList.toggle("hidden", signedIn || state.authFormOpen);
  }
  if (ui.authGoogle) {
    ui.authGoogle.disabled = state.authBusy || signedIn || !auth;
    ui.authGoogle.classList.toggle("hidden", signedIn || state.authFormOpen);
  }
  ui.authLogin.disabled = state.authBusy || signedIn || !auth;
  ui.authRegister.disabled = state.authBusy || signedIn || !auth;
  if (ui.authFormCancel) {
    ui.authFormCancel.disabled = state.authBusy;
  }
  ui.authLogout.disabled = state.authBusy || !signedIn;
  ui.authLogin.classList.toggle("hidden", signedIn);
  ui.authRegister.classList.toggle("hidden", signedIn);
  ui.authLogout.classList.toggle("hidden", !signedIn);
  if (ui.entryStartCard) {
    ui.entryStartCard.classList.toggle("hidden", !authEntryMode);
  }
  if (ui.entryStartGame) {
    ui.entryStartGame.disabled = state.authBusy || !signedIn || !state.authReady;
  }
  if (ui.entryGameId) {
    const entryId = state.currentPlayerId || (state.hasBoundGameId ? "读取中" : "未创建 ID");
    ui.entryGameId.textContent = `ID: ${entryId}`;
  }
  if (ui.lobbyAccountId) {
    const lobbyId = state.currentPlayerId || (state.hasBoundGameId ? "读取中" : "未创建 ID");
    ui.lobbyAccountId.textContent = signedIn ? `ID: ${lobbyId}` : "ID: 未登录";
    const canOpenLobbyStats = signedIn && state.hasBoundGameId && state.currentPlayerId;
    ui.lobbyAccountId.classList.toggle("is-clickable", Boolean(canOpenLobbyStats));
    ui.lobbyAccountId.setAttribute("aria-expanded", String(state.playerStatsOpen));
    ui.lobbyAccountId.setAttribute("role", canOpenLobbyStats ? "button" : "text");
    ui.lobbyAccountId.tabIndex = canOpenLobbyStats ? 0 : -1;
  }
  if (ui.entryLogout) {
    ui.entryLogout.disabled = state.authBusy || !signedIn;
  }
  if (ui.currentBeansBalance) {
    ui.currentBeansBalance.textContent = signedIn ? formatBeanAmount(shownBeans) : "--";
  }
  if (ui.rechargeBeans) {
    ui.rechargeBeans.disabled = state.authBusy || state.beansBenefitBusy || !signedIn;
    ui.rechargeBeans.title = signedIn ? "打开欢乐豆中心" : "登录后打开欢乐豆中心";
  }
  ui.startGame.textContent = needsIdSetup ? "创建 ID，进入大厅" : "开始游戏";
  if (!needsIdSetup && state.lobbyPlayMode === "friends") {
    ui.startGame.textContent = "好友联机";
  }
  ui.startGame.disabled = state.authBusy || !signedIn || !state.authReady;
  ui.playerId.disabled = state.authBusy || !signedIn || lockedId;
  ui.authStatus.textContent = state.authStatusMessage;
  ui.playerId.value = state.currentPlayerId || ui.playerId.value;
  renderPlayerIdHint();
  renderBeansCenter();
  renderLobbyModeControls();
}

function handleRechargeBeans() {
  if (!state.authUser) {
    state.authStatusMessage = "请先登录账号，再充值欢乐豆。";
    renderAuthControls();
    return;
  }

  openBeansModal();
}

function openBeansModal() {
  if (!ui.beansModal) {
    state.authStatusMessage = "欢乐豆中心暂时无法打开，请刷新页面后再试。";
    renderAuthControls();
    return;
  }

  ui.beansModal.classList.remove("hidden");
  ui.beansModal.setAttribute("aria-hidden", "false");
  renderBeansCenter();
}

function closeBeansModal() {
  if (!ui.beansModal) {
    return;
  }

  ui.beansModal.classList.add("hidden");
  ui.beansModal.setAttribute("aria-hidden", "true");
}

function renderBeansCenter() {
  if (!ui.beansModalBalance) {
    return;
  }

  const signedIn = Boolean(state.authUser);
  const todayKey = getLocalDateKey();
  const benefits = getCurrentBeansBenefits();
  const dailyClaimed = benefits.dailyClaimDate === todayKey;
  const adCount = getTodayAdClaimCount(benefits);
  const adLeft = Math.max(0, BEANS_BENEFITS.adDailyLimit - adCount);
  const busy = state.authBusy || state.beansBenefitBusy;

  ui.beansModalBalance.textContent = signedIn ? formatBeanAmount(state.currentBeans) : "登录后显示";
  if (ui.beansDailyStatus) {
    ui.beansDailyStatus.textContent = signedIn
      ? dailyClaimed
        ? "今日福利已领取，明天可以再来。"
        : `今日可领取 ${formatBeans(BEANS_BENEFITS.dailyAmount)}。`
      : "登录后可以领取每日福利。";
  }
  if (ui.beansDailyClaim) {
    ui.beansDailyClaim.disabled = busy || !signedIn || dailyClaimed;
    ui.beansDailyClaim.textContent = dailyClaimed ? "今日已领" : `领取 ${formatBeans(BEANS_BENEFITS.dailyAmount)}`;
  }
  if (ui.beansAdStatus) {
    ui.beansAdStatus.textContent = signedIn
      ? adLeft > 0
        ? `今日还可看 ${adLeft} 次，每次奖励 ${formatBeans(BEANS_BENEFITS.adAmount)}。`
        : "今日广告奖励次数已用完。"
      : "登录后可以观看广告领取奖励。";
  }
  if (ui.beansAdClaim) {
    ui.beansAdClaim.disabled = busy || !signedIn || adLeft <= 0;
    ui.beansAdClaim.textContent = adLeft > 0 ? "模拟观看广告" : "今日已达上限";
  }
  if (ui.beansRechargeStatus) {
    ui.beansRechargeStatus.textContent = "真实充值需要支付回调和服务端校验，当前版本先保留入口，不从客户端直接入账。";
  }
  if (ui.beansRechargePay) {
    ui.beansRechargePay.disabled = true;
    ui.beansRechargePay.textContent = "支付待接入";
  }
}

async function handleClaimBeansBenefit(kind) {
  if (!db || !state.authUser) {
    state.authStatusMessage = "请先登录账号，再领取欢乐豆。";
    renderAuthControls();
    return;
  }

  const todayKey = getLocalDateKey();
  const isDaily = kind === "daily";
  const amount = isDaily ? BEANS_BENEFITS.dailyAmount : BEANS_BENEFITS.adAmount;
  const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
  let nextBeans = state.currentBeans;
  let nextBenefits = getCurrentBeansBenefits();

  state.beansBenefitBusy = true;
  renderBeansCenter();

  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(profileRef);
      const data = snapshot.exists ? snapshot.data() : {};
      const currentBenefits = normalizeBeansBenefits(data.beansBenefits);
      const currentBeans = normalizeBeans(data.beans, INITIAL_BEANS);
      const hasStoredBeans = Number.isFinite(Number(data.beans));
      const updatedBenefits = { ...currentBenefits };

      if (isDaily) {
        if (updatedBenefits.dailyClaimDate === todayKey) {
          throw new Error("DAILY_ALREADY_CLAIMED");
        }
        updatedBenefits.dailyClaimDate = todayKey;
        updatedBenefits.totalDailyClaims = Number(updatedBenefits.totalDailyClaims || 0) + 1;
      } else {
        const watchedToday = updatedBenefits.adClaimDate === todayKey
          ? Number(updatedBenefits.adsWatchedToday || 0)
          : 0;
        if (watchedToday >= BEANS_BENEFITS.adDailyLimit) {
          throw new Error("AD_LIMIT_REACHED");
        }
        updatedBenefits.adClaimDate = todayKey;
        updatedBenefits.adsWatchedToday = watchedToday + 1;
        updatedBenefits.totalAdsWatched = Number(updatedBenefits.totalAdsWatched || 0) + 1;
      }

      nextBeans = currentBeans + amount;
      nextBenefits = updatedBenefits;
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      transaction.set(profileRef, {
        uid: state.authUser.uid,
        beans: hasStoredBeans ? firebase.firestore.FieldValue.increment(amount) : nextBeans,
        beansBenefits: updatedBenefits,
        lastBeansAwardReason: isDaily ? "daily-benefit" : "ad-benefit",
        updatedAt: timestamp,
        ...(snapshot.exists ? {} : { createdAt: timestamp }),
      }, { merge: true });
    });

    state.currentBeans = nextBeans;
    state.currentBeansBenefits = nextBenefits;
    state.authStatusMessage = isDaily
      ? `每日福利已到账：+${formatBeans(amount)}。`
      : `广告奖励已到账：+${formatBeans(amount)}。`;
    await loadCurrentUserProfile();
    await loadLeaderboard();
  } catch (error) {
    if (error?.message === "DAILY_ALREADY_CLAIMED") {
      state.authStatusMessage = "今日每日福利已经领取过了。";
    } else if (error?.message === "AD_LIMIT_REACHED") {
      state.authStatusMessage = "今日广告奖励次数已经用完。";
    } else {
      state.authStatusMessage = `欢乐豆领取失败：${formatAuthError(error)}`;
    }
  } finally {
    state.beansBenefitBusy = false;
    renderAuthControls();
    render();
    renderBeansCenter();
  }
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
    if (auth.setPersistence && firebase.auth?.Auth?.Persistence?.NONE) {
      await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
    }
    state.authStatusMessage = ui.authEmail.value.trim()
      ? "已填入上次使用的邮箱，点击邮箱登录后输入密码。"
      : "请选择邮箱或 Google 账号登录。";
    renderAuthControls();
    render();

    await loadLeaderboard();

    auth.onAuthStateChanged(async (user) => {
      state.authReady = true;

      if (user) {
        if (!state.authSessionConfirmed) {
          rememberAuthEmail(user.email || ui.authEmail.value.trim());
          if (!ui.authEmail.value && user.email && ui.authRemember?.checked !== false) {
            ui.authEmail.value = user.email;
          }
          state.authUser = null;
          state.authStatusMessage = "已填入上次使用的邮箱，点击邮箱登录后输入密码。";
          renderAuthControls();
          render();
          auth.signOut().catch(() => {});
          return;
        }

        const wasSignedIn = Boolean(state.authUser);
        state.authUser = user;
        state.authFormOpen = false;
        state.authEntryActive = wasSignedIn ? state.authEntryActive : true;
        rememberAuthEmail(user.email || ui.authEmail.value.trim());
        state.authStatusMessage = `已登录：${maskEmail(user.email)}，点击开始游戏进入大厅。`;
        await loadCurrentUserProfile();
        startSocialSync();
      } else {
        state.authUser = null;
        state.authEntryActive = false;
        state.authFormOpen = false;
        clearSocialListeners();
        resetSocialState();
        state.currentPlayerId = "";
        state.currentBeans = 0;
        state.currentBeansBenefits = null;
        state.beansBenefitBusy = false;
        state.ignoredRoomInviteIds = new Set();
        state.activeRoomInviteId = "";
        state.roomInviteRejectPanelOpen = false;
        state.beansRound = null;
        state.hasBoundGameId = false;
        state.gameIdEditable = true;
        state.playerIdHintMessage = "先登录或注册账号，再创建全局唯一的游戏 ID。";
        ui.playerId.value = "";
        state.authStatusMessage = ui.authEmail.value.trim()
          ? "已填入上次使用的邮箱，点击邮箱登录后输入密码。"
          : "还没有登录账号。";
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

function restoreRememberedAuthEmail() {
  try {
    const rememberEmail = localStorage.getItem(REMEMBER_AUTH_EMAIL_STORAGE_KEY) !== "0";
    if (ui.authRemember) {
      ui.authRemember.checked = rememberEmail;
    }
    if (!rememberEmail) {
      return;
    }
    const email = localStorage.getItem(LAST_AUTH_EMAIL_STORAGE_KEY);
    if (email && !ui.authEmail.value) {
      ui.authEmail.value = email;
    }
  } catch (error) {
    // Ignore private-mode storage failures; browser password managers can still autofill.
  }
}

function rememberAuthEmail(email) {
  const normalizedEmail = String(email || "").trim();
  if (!normalizedEmail || ui.authRemember?.checked === false) {
    return;
  }

  try {
    localStorage.setItem(REMEMBER_AUTH_EMAIL_STORAGE_KEY, "1");
    localStorage.setItem(LAST_AUTH_EMAIL_STORAGE_KEY, normalizedEmail);
  } catch (error) {
    // Do not block login if local storage is unavailable.
  }
}

function handleAuthEmailInput() {
  rememberAuthEmail(ui.authEmail.value);
}

function handleAuthRememberChange() {
  try {
    if (ui.authRemember?.checked) {
      localStorage.setItem(REMEMBER_AUTH_EMAIL_STORAGE_KEY, "1");
      rememberAuthEmail(ui.authEmail.value);
    } else {
      localStorage.setItem(REMEMBER_AUTH_EMAIL_STORAGE_KEY, "0");
      localStorage.removeItem(LAST_AUTH_EMAIL_STORAGE_KEY);
    }
  } catch (error) {
    // The checkbox still works for this page even if persistence is unavailable.
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
    state.authFormOpen = true;
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
  state.authSessionConfirmed = true;
  state.authStatusMessage = "正在登录账号...";
  rememberAuthEmail(email);
  renderAuthControls();
  render();

  try {
    await auth.signInWithEmailAndPassword(email, password);
    state.authFormOpen = false;
  } catch (error) {
    state.authSessionConfirmed = false;
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
  state.authSessionConfirmed = true;
  state.authStatusMessage = "正在注册账号...";
  rememberAuthEmail(email);
  renderAuthControls();
  render();

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    state.authFormOpen = false;
  } catch (error) {
    state.authSessionConfirmed = false;
    state.authStatusMessage = formatAuthError(error);
  } finally {
    state.authBusy = false;
    renderAuthControls();
    render();
  }
}

async function handleAuthGoogleLogin() {
  if (!auth || !window.firebase?.auth?.GoogleAuthProvider) {
    state.authStatusMessage = "Google 登录暂时不可用，请稍后刷新再试。";
    renderAuthControls();
    render();
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters?.({ prompt: "select_account" });

  state.authBusy = true;
  state.authSessionConfirmed = true;
  state.authFormOpen = false;
  state.authStatusMessage = "正在打开 Google 登录...";
  renderAuthControls();
  render();

  try {
    await auth.signInWithPopup(provider);
  } catch (error) {
    state.authSessionConfirmed = false;
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
  state.authEntryActive = false;
  state.authFormOpen = false;
  state.authStatusMessage = "正在退出登录...";
  renderAuthControls();
  render();

  try {
    await auth.signOut();
    state.authSessionConfirmed = false;
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
    let snapshot;
    try {
      snapshot = await db.collection(FIRESTORE_COLLECTIONS.profiles).get({ source: "server" });
    } catch (error) {
      snapshot = await db.collection(FIRESTORE_COLLECTIONS.profiles).get();
    }
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
    let snapshot;
    try {
      snapshot = await db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid).get({ source: "server" });
    } catch (error) {
      snapshot = await db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid).get();
    }
    if (!snapshot.exists) {
      state.currentPlayerId = normalizePlayerId(ui.playerId.value || "");
      state.currentBeans = INITIAL_BEANS;
      state.currentBeansBenefits = normalizeBeansBenefits();
      state.hasBoundGameId = false;
      state.gameIdEditable = true;
      state.playerIdHintMessage = getDefaultPlayerIdHint();
      return null;
    }

      const profile = profileFromData(snapshot.id, snapshot.data());
      state.currentPlayerId = profile.id;
      state.currentBeans = getProfileBeans(profile);
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
    state.playerIdHintMessage = "请输入你想创建的游戏 ID。";
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
        beans: normalizeBeans(existingData?.beans, INITIAL_BEANS),
        beansBenefits: normalizeBeansBenefits(existingData?.beansBenefits),
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
      state.currentBeans = getProfileBeans(createdProfile);
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

async function debitBeansForTicket(mode, playerCount, roomId = "", roundId = "") {
  if (!db || !state.authUser) {
    state.authStatusMessage = "请先登录账号，再进入需要门票的对局。";
    renderAuthControls();
    return null;
  }

  const ticket = getTicketCost(mode);
  const pot = ticket * Number(playerCount || mode || 2);
  const targetRoundId = roundId || `${roomId || "local"}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
  let nextBeans = state.currentBeans;
  let alreadyPaid = false;

  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(profileRef);
      const currentData = snapshot.exists ? snapshot.data() : {};
      const currentBeans = normalizeBeans(currentData.beans, INITIAL_BEANS);
      if (currentData.lastBeanRoundPaid === targetRoundId) {
        alreadyPaid = true;
        nextBeans = currentBeans;
        return;
      }
      if (currentBeans < ticket) {
        throw new Error("NOT_ENOUGH_BEANS");
      }
      nextBeans = currentBeans - ticket;
      transaction.set(profileRef, {
        beans: nextBeans,
        lastBeanRoundPaid: targetRoundId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    state.currentBeans = nextBeans;
    return {
      ...createBeansRound(mode, playerCount, roomId, targetRoundId),
      ticket,
      pot,
      paid: true,
      alreadyPaid,
    };
  } catch (error) {
    const message = error?.message === "NOT_ENOUGH_BEANS"
      ? `欢乐豆不足，${Number(mode)} 人模式需要 ${formatBeans(ticket)} 门票。`
      : `扣除门票失败：${formatAuthError(error)}`;
    if (roomId) {
      setSocialStatus(message, "error");
    } else {
      state.authStatusMessage = message;
      renderAuthControls();
    }
    return null;
  }
}

async function awardBeansToCurrentUser(amount, reason = "win", roundId = "") {
  if (!db || !state.authUser || amount <= 0) {
    return "failed";
  }

  const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
  let nextBeans = state.currentBeans;
  let alreadyAwarded = false;
  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(profileRef);
      const currentData = snapshot.exists ? snapshot.data() : {};
      const currentBeans = normalizeBeans(currentData.beans, INITIAL_BEANS);
      if (roundId && currentData.lastBeanRoundAwarded === roundId) {
        alreadyAwarded = true;
        nextBeans = currentBeans;
        return;
      }
      nextBeans = currentBeans + amount;
      transaction.set(profileRef, {
        beans: firebase.firestore.FieldValue.increment(amount),
        lastBeanRoundAwarded: roundId || currentData.lastBeanRoundAwarded || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastBeansAwardReason: reason,
      }, { merge: true });
    });
    state.currentBeans = nextBeans;
    return alreadyAwarded ? "already" : "awarded";
  } catch (error) {
    state.authStatusMessage = `欢乐豆派奖失败：${formatAuthError(error)}`;
    renderAuthControls();
    return "failed";
  }
}

async function settleBeansForFinishedRound(result) {
  return claimBeansForFinishedRound(result, 1);
}

async function claimBeansForFinishedRound(result, multiplier = 1) {
  const round = state.beansRound;
  if (!round || round.awarded) {
    return Boolean(round?.awarded);
  }

  const winner = getSingleWinner(result);
  if (!winner) {
    round.awarded = true;
    pushLog("本局并列第一，欢乐豆奖池暂不派奖。");
    return;
  }

  const isLocalWinner = winner.name === getLocalPlayerName();
  if (!isLocalWinner) {
    pushLog(`${winner.name} 赢得本局奖池 ${formatBeans(round.pot)}。`);
    return;
  }

  const awardMultiplier = Math.max(1, Math.floor(Number(multiplier) || 1));
  const baseAmount = Number(round.pot || 0);
  const awardAmount = baseAmount * awardMultiplier;
  const awardReason = awardMultiplier > 1 ? "round-win-ad-double" : "round-win";
  const awardResult = await awardBeansToCurrentUser(awardAmount, awardReason, round.id);
  if (awardResult === "failed") {
    return false;
  }
  const effectiveAwardAmount = awardResult === "already" ? baseAmount : awardAmount;
  const effectiveAwardMultiplier = awardResult === "already" ? 1 : awardMultiplier;

  round.awarded = true;
  round.awardedUid = state.authUser.uid;
  round.awardedGameId = state.currentPlayerId;
  round.awardedAmount = effectiveAwardAmount;
  round.awardMultiplier = effectiveAwardMultiplier;
  if (awardResult === "awarded") {
    const extraText = effectiveAwardMultiplier > 1 ? "，广告翻倍" : "";
    pushLog(`你赢得本局奖池${extraText}，已领取 ${formatBeans(effectiveAwardAmount)}。`);
  } else {
    pushLog(`本局奖池 ${formatBeans(round.pot)} 已领取过。`);
  }

  if (isMultiplayerActive() && state.socialActiveRoom?.id) {
    const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(state.socialActiveRoom.id);
    const awardedRound = {
      ...round,
      awarded: true,
      awardedUid: state.authUser.uid,
      awardedGameId: state.currentPlayerId,
      awardedAmount: effectiveAwardAmount,
      awardMultiplier: effectiveAwardMultiplier,
    };
    state.socialActiveRoom = {
      ...state.socialActiveRoom,
      beansRound: awardedRound,
      gameState: {
        ...(state.socialActiveRoom.gameState || {}),
        beansRound: awardedRound,
      },
      beansAward: {
        winnerUid: state.authUser.uid,
        winnerGameId: state.currentPlayerId,
        amount: effectiveAwardAmount,
        basePot: baseAmount,
        multiplier: effectiveAwardMultiplier,
      },
    };
    await roomRef.set({
      beansRound: awardedRound,
      gameState: {
        beansRound: awardedRound,
      },
      beansAward: {
        winnerUid: state.authUser.uid,
        winnerGameId: state.currentPlayerId,
        amount: effectiveAwardAmount,
        basePot: baseAmount,
        multiplier: effectiveAwardMultiplier,
        awardedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }).catch(() => {});
  }

  return awardResult;
}

async function handleClaimRoundBeans(multiplier = 1) {
  if (state.beansAwardBusy) {
    return;
  }

  const result = state.lastFinishedResult || getRankedPlayers();
  const award = getPendingBeansAward(result);
  if (!award) {
    setFeedback("本局没有可领取的欢乐豆奖励，或奖励已经领取过。", "error");
    render();
    return;
  }

  const awardMultiplier = Math.max(1, Math.floor(Number(multiplier) || 1));
  state.pendingBeansAward = award;
  state.beansAwardBusy = true;
  setFeedback(awardMultiplier > 1 ? "正在模拟观看广告，完成后奖励翻倍到账。" : "正在领取本局欢乐豆奖励。", "info");
  render();

  try {
    const settled = await claimBeansForFinishedRound(result, awardMultiplier);
    state.beansAwardBusy = false;
    if (settled) {
      const actualAmount = Number(state.beansRound?.awardedAmount || award.amount * awardMultiplier);
      const amountText = formatBeans(actualAmount);
      state.pendingBeansAward = null;
      await loadCurrentUserProfile();
      await loadLeaderboard();
      const alreadyText = settled === "already" ? "本局奖池之前已经领取过。" : "";
      setFeedback(alreadyText || (actualAmount > award.amount ? `广告翻倍奖励已到账：${amountText}。` : `奖励已到账：${amountText}。`), "info");
      renderAuthControls();
      render();
    } else {
      setFeedback(state.authStatusMessage || "奖励暂未到账，请稍后再试。", "error");
      render();
    }
  } catch (error) {
    state.beansAwardBusy = false;
    state.authStatusMessage = `欢乐豆领取失败：${formatAuthError(error)}`;
    setFeedback(state.authStatusMessage, "error");
    renderAuthControls();
    render();
  }
}

async function ensureBeansPaidForRoom(room) {
  if (!db || !state.authUser || !room?.id) {
    return true;
  }

  const beansRound = room.gameState?.beansRound || room.beansRound;
  if (!beansRound?.id) {
    return true;
  }

  const paidUids = Array.isArray(beansRound.paidUids) ? beansRound.paidUids : [];
  if (paidUids.includes(state.authUser.uid)) {
    state.beansRound = { ...beansRound };
    return true;
  }

  const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id);
  const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
  const ticket = Number(beansRound.ticket || room.ticket || getTicketCost(room.mode));
  let nextBeans = state.currentBeans;

  try {
    await db.runTransaction(async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      const profileSnap = await transaction.get(profileRef);
      if (!roomSnap.exists) {
        throw new Error("ROOM_MISSING");
      }
      const liveRoom = roomSnap.data();
      const liveRound = liveRoom.gameState?.beansRound || liveRoom.beansRound || beansRound;
      const livePaidUids = Array.isArray(liveRound.paidUids) ? [...liveRound.paidUids] : [];
      if (livePaidUids.includes(state.authUser.uid)) {
        nextBeans = normalizeBeans(profileSnap.exists ? profileSnap.data()?.beans : undefined, INITIAL_BEANS);
        return;
      }

      const profileData = profileSnap.exists ? profileSnap.data() : {};
      const currentBeans = normalizeBeans(profileData.beans, INITIAL_BEANS);
      if (profileData.lastBeanRoundPaid !== liveRound.id) {
        if (currentBeans < ticket) {
          throw new Error("NOT_ENOUGH_BEANS");
        }
        nextBeans = currentBeans - ticket;
        transaction.set(profileRef, {
          beans: nextBeans,
          lastBeanRoundPaid: liveRound.id,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } else {
        nextBeans = currentBeans;
      }

      livePaidUids.push(state.authUser.uid);
      const nextRound = {
        ...liveRound,
        ticket,
        pot: Number(liveRound.pot || ticket * Number(liveRoom.mode || 2)),
        paidUids: livePaidUids,
      };
      transaction.set(roomRef, {
        beansRound: nextRound,
        gameState: {
          ...(liveRoom.gameState || {}),
          beansRound: nextRound,
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      state.beansRound = nextRound;
    });

    state.currentBeans = nextBeans;
    return true;
  } catch (error) {
    const message = error?.message === "NOT_ENOUGH_BEANS"
      ? `欢乐豆不足，当前联机房需要 ${formatBeans(ticket)} 门票。`
      : `联机门票扣除失败：${formatAuthError(error)}`;
    setSocialStatus(message, "error");
    return false;
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

async function handleReturnToActiveRoom() {
  if (!db || !state.authUser) {
    setSocialStatus("请先登录账号，再返回联机对局。", "error");
    return;
  }

  let room = state.socialActiveRoom;
  if (!room?.id) {
    room = await getRestartTargetRoom();
  }

  if (!room?.id) {
    setSocialStatus("当前没有可返回的联机房间。", "info");
    return;
  }

  state.socialBusy = true;
  renderSocialPanel();
  try {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id).get();
    if (!snapshot.exists) {
      setSocialStatus("这个联机房间已经不存在了。", "error");
      return;
    }

    const liveRoom = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    if (liveRoom.status !== "playing" || !liveRoom.gameState) {
      state.socialActiveRoom = liveRoom;
      setSocialStatus("当前房间还没有进行中的对局。", "info");
      await refreshSocialData();
      return;
    }

    if (!(await ensureBeansPaidForRoom(liveRoom))) {
      return;
    }
    const localHand = await loadCurrentRoomHand(liveRoom.id);
    state.socialActiveRoom = liveRoom;
    applyMultiplayerRoomState(liveRoom, localHand);
    setSocialStatus("已返回当前联机对局。", "success");
  } catch (error) {
    setSocialStatus(`返回联机对局失败：${formatAuthError(error)}`, "error");
  } finally {
    state.socialBusy = false;
    renderSocialPanel();
  }
}

function handleViewLastResult() {
  if (!state.lastFinishedResult) {
    return;
  }
  ui.historyPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleStartGameButton() {
  if (needsInitialPlayerIdSetup()) {
    const created = await prepareCurrentPlayerProfile();
    if (created) {
      state.authStatusMessage = "游戏 ID 已创建，可以进入大厅开始游戏或邀请好友。";
      renderAuthControls();
      render();
    }
    return;
  }

  if (state.lobbyPlayMode === "friends") {
    const room = state.socialActiveRoom;
    const members = Array.isArray(room?.members) ? room.members : [];
    const targetCount = Number(room?.mode || 2);
    if (room?.status === "waiting" && room.hostUid === state.authUser?.uid && members.length === targetCount) {
      await handleStartRoomMatch();
      return;
    }
    setSocialStatus("先创建好友房并等好友到齐，再开始好友联机。", "info");
    state.socialSideView = "friends";
    renderSocialPanel();
    renderLobbyModeControls();
    return;
  }

  await startGame(Number(ui.playerCount.value), ui.useDice.checked);
}

function updateReturnToRoomButton() {
  if (!ui.returnToRoom) {
    return;
  }

  const showButton = Boolean(
    state.authUser
    && state.socialActiveRoom?.id
    && state.socialActiveRoom?.status === "playing",
  );

  ui.returnToRoom.classList.toggle("hidden", !showButton);
  ui.returnToRoom.disabled = !showButton || state.socialBusy;
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

  const roundPlan = normalizeRoundPlan({
    playerHands: Object.fromEntries(orderedPlayers.map((player) => [player.id, [...player.hand]])),
    tableCards: deck.splice(0, config.table),
    drawPile: deck.splice(0, config.draw),
  });

  return {
    players: orderedPlayers,
    tableCards: [...roundPlan.tableCards],
    drawPile: [...roundPlan.drawPile],
    setupLog,
  };
}

function startGameRound(playerCount, useDice) {
  clearAllRoundTimers();
  const roundPlan = buildRoundPlan(playerCount, useDice);
  const normalizedRoundPlan = normalizeRoundPlan({
    playerHands: Object.fromEntries(roundPlan.players.map((player) => [player.id, [...player.hand]])),
    tableCards: roundPlan.tableCards,
    drawPile: roundPlan.drawPile,
  });

  state.phase = useDice ? "dice-rolling" : "opening-deal";
  state.players = roundPlan.players.map((player) => ({
    ...player,
    hand: [],
    captured: [],
    lastAction: null,
  }));
  state.roundPlan = normalizedRoundPlan;
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
  if (state.beansRound) {
    pushLog(`本局门票 ${formatBeans(state.beansRound.ticket)}，奖池 ${formatBeans(state.beansRound.pot)}。`);
  }

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
  state.beansRound = null;
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

function startRemoteDiceReplay(finalFaces) {
  clearDiceTimers();
  const resolvedFinalFaces = Object.keys(finalFaces || {}).length
    ? { ...finalFaces }
    : Object.fromEntries(
        state.diceSummary.map((item) => [item.id, item.finalRoll]),
      );

  const rollingFaces = {};
  state.players.forEach((player) => {
    rollingFaces[player.id] = randomDice();
  });

  state.phase = "dice-rolling";
  state.diceAnimation = {
    stage: "rolling",
    faces: rollingFaces,
  };
  render();

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
    state.phase = "dice-result";
    state.diceAnimation = {
      stage: "result",
      faces: resolvedFinalFaces,
    };
    render();

    state.diceResultTimeout = setTimeout(() => {
      state.diceAnimation = null;
      startOpeningSequence();
    }, 2200);
  }, 3200);
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
    if (isMultiplayerActive()) {
      const localPlayer = state.players.find((player) => player.uid === state.authUser?.uid);
      state.multiplayer.localHand = [...(localPlayer?.hand || [])];
    }
    setFeedback("发牌完成，准备进入首回合。", "info");
    render();
    beginCurrentTurn();
    if (isMultiplayerActive()) {
      state.multiplayer.openingInProgress = false;
      syncMultiplayerRoomState().catch((error) => {
        state.authStatusMessage = `鑱旀満鍚屾澶辫触锛?{formatAuthError(error)}`;
        renderAuthControls();
      });
    }
  }, elapsed + 120);
}

async function handleOverlayButton() {
  if (state.overlayAction === "claim-beans") {
    await handleClaimRoundBeans(1);
    hideOverlay();
    return;
  }

  if (state.phase === "game-over") {
    hideOverlay();
    return;
  }
}

function showOverlay(tag, title, copy, buttonText = "继续", detailsHtml = "", action = "") {
  state.overlayAction = action;
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
    setFeedback("未找到这张手牌，已重置选择。", "error");
    clearSelection();
    return;
  }

  const discardedCard = player.hand.splice(cardIndex, 1)[0];
  appendTableCards(discardedCard);
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
    setFeedback(getHumanTurnStartMessage(), "info");
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
    const playableCount = getPlayableTargetIds(state.pendingDrawCard).size;
    const drawLabel = cardLabel(state.pendingDrawCard);
    setActionDisplay({
      playerId: player.id,
      playerName: player.name,
      text: playableCount
        ? `摸到 ${drawLabel}，可以立刻补枪`
        : `摸到 ${drawLabel}，暂无可补目标`,
      cards: [state.pendingDrawCard],
    });
    updateLastAction(player, `摸到 ${drawLabel}`, [state.pendingDrawCard]);
    setFeedback(
      playableCount
        ? `你摸到了 ${drawLabel}，现在可以继续补枪。`
        : `你摸到了 ${drawLabel}，暂时没有可补目标，可以让摸牌落台。`,
      "info",
    );
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

async function finishGame() {
  clearAiTimer();
  hideOverlay();
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
  if (localResult && state.authUser && state.currentPlayerId) {
    syncRoundResultToCloud(localResult, isHumanWin);
  }
  const settleAward = () => {
    maybeSettleBeansAward(result);
  };
  if (isMultiplayerActive()) {
    syncMultiplayerRoomState().catch((error) => {
      state.authStatusMessage = `联机同步失败：${formatAuthError(error)}`;
      renderAuthControls();
    }).finally(() => {
      settleAward();
      render();
    });
  } else {
    settleAward();
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

function hasSeenBeginnerGuide() {
  if (state.beginnerGuideSeen) {
    return true;
  }
  try {
    state.beginnerGuideSeen = localStorage.getItem(BEGINNER_GUIDE_STORAGE_KEY) === "1";
  } catch (error) {
    // Private-mode storage can fail; fall back to session state.
  }
  return state.beginnerGuideSeen;
}

function markBeginnerGuideSeen() {
  state.beginnerGuideSeen = true;
  try {
    localStorage.setItem(BEGINNER_GUIDE_STORAGE_KEY, "1");
  } catch (error) {
    // Ignore storage failures; the current session still records the guide.
  }
}

function getHumanTurnStartMessage() {
  if (!hasSeenBeginnerGuide()) {
    markBeginnerGuideSeen();
    return "新手提示：先选一张手牌；选中后能钓的公共牌会亮起，其他公共牌会变淡。不想钓时可以弃到台面。";
  }

  return isMultiplayerActive()
    ? "轮到你了，你的操作会实时同步给房间里的其他玩家。"
    : "轮到你了，先选一张手牌，再决定钓牌还是弃到台面。";
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
      id: player.id,
      uid: player.uid || "",
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
  const mode = String(state.leaderboardMode || "2");
  const leaderboardOpen = Boolean(state.leaderboardOpen);
  const savedProfile = state.currentPlayerId && state.playerStats[state.currentPlayerId]
    ? state.playerStats[state.currentPlayerId]
    : null;
  const currentProfile = savedProfile || (state.currentPlayerId
    ? {
        id: state.currentPlayerId,
        beans: state.currentBeans,
        statsByMode: {
          "2": createEmptyModeStats(),
          "3": createEmptyModeStats(),
          "4": createEmptyModeStats(),
        },
      }
    : null);
  const currentModeStats = currentProfile ? getModeStats(currentProfile, mode) : createEmptyModeStats();
  ui.playerStatsCard?.classList.toggle("hidden", !state.playerStatsOpen || !currentProfile);
  const sorted = getSortedPlayerStats(mode);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  state.leaderboardPage = Math.min(Math.max(1, state.leaderboardPage || 1), totalPages);
  const pageStart = (state.leaderboardPage - 1) * pageSize;
  const pagedItems = sorted.slice(pageStart, pageStart + pageSize);

  [ui.leaderboardMode2, ui.leaderboardMode3, ui.leaderboardMode4].forEach((button) => {
    if (button) {
      button.classList.toggle("active", button.dataset.mode === mode);
    }
  });
  if (ui.refreshLeaderboard) {
    ui.refreshLeaderboard.disabled = state.leaderboardRefreshing;
    ui.refreshLeaderboard.textContent = state.leaderboardRefreshing ? "刷新中..." : "刷新排行";
  }

  if (ui.leaderboardPrev) {
    ui.leaderboardPrev.disabled = state.leaderboardRefreshing || state.leaderboardPage <= 1;
  }
  if (ui.leaderboardNext) {
    ui.leaderboardNext.disabled = state.leaderboardRefreshing || state.leaderboardPage >= totalPages;
  }
  if (ui.leaderboardPageInfo) {
    ui.leaderboardPageInfo.textContent = `第 ${state.leaderboardPage} / ${totalPages} 页`;
  }
  if (ui.leaderboardToggle) {
    ui.leaderboardToggle.textContent = leaderboardOpen ? "收起排行" : "查看排行";
    ui.leaderboardToggle.setAttribute("aria-expanded", String(leaderboardOpen));
  }

  const leaderboardBlock = document.querySelector(".leaderboard-block");
  const leaderboardToolbar = document.getElementById("leaderboard-toolbar");
  const leaderboardPagination = document.getElementById("leaderboard-pagination");
  leaderboardBlock?.classList.toggle("is-collapsed", !leaderboardOpen);
  leaderboardToolbar?.classList.toggle("hidden", !leaderboardOpen);
  ui.leaderboardList?.classList.toggle("hidden", !leaderboardOpen);
  leaderboardPagination?.classList.toggle("hidden", !leaderboardOpen);

  const playerSignature = currentProfile
    ? `${currentProfile.id}:${mode}:${currentProfile.beans}:${currentModeStats.rounds}:${currentModeStats.wins}:${currentModeStats.totalScore}:${currentModeStats.bestScore}:${currentModeStats.lastScore}:${ui.playerIdHint.textContent}:${state.leaderboardRefreshing}`
    : `empty:${mode}:${state.currentBeans}:${ui.playerIdHint.textContent}:${state.leaderboardRefreshing}`;
  if (state.renderCache.playerStats !== playerSignature) {
    state.renderCache.playerStats = playerSignature;
    if (!currentProfile) {
      ui.playerStatsCard.innerHTML = `
        <p>当前还没有选定游戏 ID。</p>
        <p>输入一个新的 ID 后开始游戏，成绩会分别记入 2 / 3 / 4 人模式排行榜。</p>
      `;
    } else {
      const modeStatsRows = LEADERBOARD_MODES.map((modeKey) => {
        const stats = getModeStats(currentProfile, modeKey);
        return `
          <div class="player-stats-mode-row">
            <strong>${modeKey} 人模式</strong>
            <span>累计 ${stats.totalScore} 分</span>
            <span>${stats.rounds} 局</span>
            <span>胜 ${stats.wins}</span>
            <span>最高 ${stats.bestScore}</span>
          </div>
        `;
      }).join("");
      ui.playerStatsCard.innerHTML = `
        <div class="player-stats-card__head">
          <strong>账号信息</strong>
          <button id="player-stats-close" class="player-stats-close" type="button" aria-label="关闭账号信息">×</button>
        </div>
        ${savedProfile ? "" : '<p class="player-stats-card__note">战绩同步中或暂未产生正式战绩，先显示当前账号信息。</p>'}
        <p>当前 ID：${escapeHtml(currentProfile.id)}</p>
        <div class="player-stats-modes">${modeStatsRows}</div>
        <p>当前榜单：${mode} 人模式 · 上一局：${currentModeStats.lastScore} 分</p>
      `;
      ui.playerStatsCard.querySelector("#player-stats-close")?.addEventListener("click", (event) => {
        event.stopPropagation();
        closePlayerStatsPopover();
      });
    }
  }

  if (!leaderboardOpen) {
    state.renderCache.leaderboard = "collapsed";
    return;
  }

  const leaderboardSignature = [
    leaderboardOpen ? "open" : "closed",
    mode,
    state.leaderboardPage,
    totalPages,
    state.leaderboardRefreshing ? "refreshing" : "idle",
    ...pagedItems.map((item) => {
      const stats = getModeStats(item, mode);
      return `${item.id}:${item.beans}:${stats.bestScore}:${stats.totalScore}:${stats.wins}:${stats.rounds}`;
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

  pagedItems.forEach((item, index) => {
    const stats = getModeStats(item, mode);
    const absoluteRank = pageStart + index + 1;
    const article = document.createElement("article");
    article.className = `leaderboard-item${item.id === state.currentPlayerId ? " active" : ""}`;
    article.innerHTML = `
      <div class="leaderboard-rank">#${absoluteRank}</div>
      <div class="leaderboard-main">
        <h3>${item.id}</h3>
        <p>${mode} 人模式 · 胜场 ${stats.wins} · 局数 ${stats.rounds}</p>
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
  updateReturnToRoomButton();
  renderRulesModal();
  renderSetupHistory();
  renderPlayerStatsDashboard();
  renderSocialPanel();
  renderRoomInviteModal();
  const loginEntryView = isLoginEntryViewActive();
  const authEntryView = isAuthEntryViewActive();
  document.body.classList.toggle("is-lobby-setup", state.phase === "setup" && Boolean(state.authUser) && !authEntryView);
  document.body.classList.toggle("is-login-view", loginEntryView);
  document.body.classList.toggle("is-auth-entry-view", authEntryView);
  document.body.classList.toggle("is-game-view", state.phase !== "setup");

  if (state.phase === "setup") {
    updateGameLayoutScale();
    ui.heroSection.classList.toggle("hidden", Boolean(state.authUser) && !authEntryView);
    ui.setupPanel.classList.remove("hidden");
    ui.historyPanel.classList.toggle("hidden", authEntryView || needsInitialPlayerIdSetup() || !state.lastFinishedResult);
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
  ui.currentPlayerTitle.textContent = state.phase === "game-over" ? "结算明细" : "你的手牌";
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

  const controlState = getTurnControlState(selectedSourceCard, selectedTableCards, evaluation);
  applyButtonState(ui.confirmAction, controlState.confirm);
  applyButtonState(ui.discardAction, controlState.discard);
  applyButtonState(ui.clearSelection, controlState.clear);
  if (ui.controlHint) {
    ui.controlHint.textContent = controlState.hint;
    ui.controlHint.classList.toggle("hidden", !controlState.hint);
  }

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
  requestAnimationFrame(syncLandscapeActionPanel);
}

function shouldUseCompactLandscapeGameLayout() {
  return window.matchMedia("(max-width: 960px) and (orientation: landscape) and (hover: none) and (pointer: coarse)").matches;
}

function shouldPinLandscapeActionPanel() {
  return document.body.classList.contains("is-game-view")
    && window.matchMedia("(max-width: 960px) and (orientation: landscape)").matches;
}

function setImportantStyle(element, property, value) {
  if (element) {
    element.style.setProperty(property, value, "important");
  }
}

function clearLandscapeActionPanelStyles() {
  const actionTargets = [
    ui.actionStage,
    ui.actionStage?.querySelector(".action-stage__meta"),
    ui.actionCards,
    ...Array.from(ui.actionCards?.querySelectorAll(".card-btn") || []),
  ];
  const properties = [
    "position",
    "left",
    "top",
    "right",
    "bottom",
    "z-index",
    "width",
    "height",
    "min-width",
    "min-height",
    "padding",
    "display",
    "grid-template-columns",
    "grid-template-rows",
    "grid-column",
    "grid-row",
    "align-items",
    "align-self",
    "justify-content",
    "justify-items",
    "justify-self",
    "column-gap",
    "gap",
    "overflow",
    "color",
    "opacity",
    "visibility",
    "transform",
    "pointer-events",
    "aspect-ratio",
    "border-radius",
  ];
  actionTargets.filter(Boolean).forEach((element) => {
    properties.forEach((property) => element.style.removeProperty(property));
  });
}

function syncLandscapeActionPanel() {
  if (!ui.actionStage) {
    return;
  }

  if (!shouldPinLandscapeActionPanel()) {
    clearLandscapeActionPanelStyles();
    return;
  }

  const metrics = document.querySelector(".selection-metrics");
  const actionMeta = ui.actionStage.querySelector(".action-stage__meta");
  if (!metrics || !actionMeta || !ui.actionCards) {
    return;
  }

  const metricsRect = metrics.getBoundingClientRect();
  if (!metricsRect.width || !metricsRect.height) {
    return;
  }

  const width = Math.round(metricsRect.width);
  const left = Math.round(metricsRect.left);
  const height = Math.min(118, Math.max(86, Math.round(metricsRect.height + 48)));
  const top = Math.max(4, Math.round(metricsRect.top - height - 8));

  setImportantStyle(ui.actionStage, "position", "fixed");
  setImportantStyle(ui.actionStage, "left", `${left}px`);
  setImportantStyle(ui.actionStage, "top", `${top}px`);
  setImportantStyle(ui.actionStage, "right", "auto");
  setImportantStyle(ui.actionStage, "bottom", "auto");
  setImportantStyle(ui.actionStage, "z-index", "999");
  setImportantStyle(ui.actionStage, "width", `${width}px`);
  setImportantStyle(ui.actionStage, "height", `${height}px`);
  setImportantStyle(ui.actionStage, "min-height", "0");
  setImportantStyle(ui.actionStage, "padding", "9px 10px");
  setImportantStyle(ui.actionStage, "display", "grid");
  setImportantStyle(ui.actionStage, "grid-template-columns", "minmax(0, 1fr) 48px");
  setImportantStyle(ui.actionStage, "grid-template-rows", "minmax(0, 1fr)");
  setImportantStyle(ui.actionStage, "align-items", "center");
  setImportantStyle(ui.actionStage, "column-gap", "8px");
  setImportantStyle(ui.actionStage, "overflow", "hidden");
  setImportantStyle(ui.actionStage, "color", "#fff8ec");
  setImportantStyle(ui.actionStage, "opacity", "1");
  setImportantStyle(ui.actionStage, "visibility", "visible");
  setImportantStyle(ui.actionStage, "transform", "none");
  setImportantStyle(ui.actionStage, "pointer-events", "auto");

  setImportantStyle(actionMeta, "grid-column", "1");
  setImportantStyle(actionMeta, "grid-row", "1");
  setImportantStyle(actionMeta, "display", "grid");
  setImportantStyle(actionMeta, "min-width", "0");
  setImportantStyle(actionMeta, "gap", "3px");
  setImportantStyle(actionMeta, "justify-items", "start");
  setImportantStyle(actionMeta, "align-self", "start");
  setImportantStyle(actionMeta, "color", "#fff8ec");
  setImportantStyle(actionMeta, "opacity", "1");
  setImportantStyle(actionMeta, "visibility", "visible");
  setImportantStyle(actionMeta, "transform", "none");

  setImportantStyle(ui.actionCards, "grid-column", "2");
  setImportantStyle(ui.actionCards, "grid-row", "1");
  setImportantStyle(ui.actionCards, "width", "48px");
  setImportantStyle(ui.actionCards, "min-width", "48px");
  setImportantStyle(ui.actionCards, "display", "flex");
  setImportantStyle(ui.actionCards, "justify-content", "center");
  setImportantStyle(ui.actionCards, "align-items", "center");
  setImportantStyle(ui.actionCards, "overflow", "hidden");
  setImportantStyle(ui.actionCards, "opacity", "1");
  setImportantStyle(ui.actionCards, "visibility", "visible");
  setImportantStyle(ui.actionCards, "transform", "none");

  Array.from(ui.actionCards.querySelectorAll(".card-btn")).forEach((card) => {
    setImportantStyle(card, "width", "40px");
    setImportantStyle(card, "min-width", "40px");
    setImportantStyle(card, "min-height", "auto");
    setImportantStyle(card, "aspect-ratio", "18 / 25");
    setImportantStyle(card, "padding", "4px");
    setImportantStyle(card, "border-radius", "9px");
  });
}

function updateGameLayoutScale() {
  if (!ui.gameLayout || !ui.playStage) {
    return;
  }

  if (state.phase === "setup") {
    state.layoutMetrics.stableWidth = 0;
    state.layoutMetrics.stableHeight = 0;
    state.layoutMetrics.viewportKey = "";
    state.layoutMetrics.phaseBucket = "";
    ui.playStage.style.zoom = "";
    return;
  }

  if (shouldUseCompactLandscapeGameLayout()) {
    state.layoutMetrics.stableWidth = 0;
    state.layoutMetrics.stableHeight = 0;
    state.layoutMetrics.viewportKey = "";
    state.layoutMetrics.phaseBucket = "";
    ui.playStage.style.zoom = "";
    return;
  }

  const previousZoom = ui.playStage.style.zoom;
  const previousScale = previousZoom ? Number(previousZoom) : 1;
  ui.playStage.style.zoom = "1";

  const layoutWidth = Math.max(ui.playStage.scrollWidth, ui.playStage.offsetWidth, 1);
  const layoutHeight = Math.max(ui.playStage.scrollHeight, ui.playStage.offsetHeight, 1);
  const availableWidth = Math.max(window.innerWidth - 32, 1);
  const topOffset = Math.max(ui.gameLayout.offsetTop || 0, ui.gameLayout.getBoundingClientRect().top, 0);
  const availableHeight = Math.max(window.innerHeight - topOffset - 12, 1);
  const phaseBucket = state.phase === "opening-deal" ? "opening" : "active";
  const viewportKey = [
    Math.round(availableWidth),
    Math.round(availableHeight),
    phaseBucket,
  ].join("|");
  const viewportChanged = state.layoutMetrics.viewportKey !== viewportKey;
  const phaseChanged = state.layoutMetrics.phaseBucket !== phaseBucket;

  if (viewportChanged || phaseChanged) {
    state.layoutMetrics.stableWidth = layoutWidth;
    state.layoutMetrics.stableHeight = layoutHeight;
    state.layoutMetrics.viewportKey = viewportKey;
    state.layoutMetrics.phaseBucket = phaseBucket;
  } else if (phaseBucket === "opening") {
    state.layoutMetrics.stableWidth = Math.max(state.layoutMetrics.stableWidth || 0, layoutWidth);
    state.layoutMetrics.stableHeight = Math.max(state.layoutMetrics.stableHeight || 0, layoutHeight);
  } else {
    state.layoutMetrics.stableWidth = Math.max(state.layoutMetrics.stableWidth || 0, layoutWidth);
  }

  const measuredWidth = Math.max(layoutWidth, state.layoutMetrics.stableWidth || 0, 1);
  const measuredHeight = Math.max(
    phaseBucket === "opening" ? layoutHeight : 0,
    state.layoutMetrics.stableHeight || 0,
    1,
  );

  const widthScale = availableWidth / measuredWidth;
  const heightScale = availableHeight / measuredHeight;
  const scale = Math.max(0.56, Math.min(1, widthScale, heightScale));
  const nextScale = Number.isFinite(scale) ? scale : 1;
  const scaleDelta = Math.abs(previousScale - nextScale);

  if (!Number.isFinite(nextScale)) {
    ui.playStage.style.zoom = previousZoom;
    return;
  }

  // Ignore tiny reflows caused by status text / action panel updates so the whole table doesn't "breathe".
  if (scaleDelta < 0.025) {
    ui.playStage.style.zoom = previousZoom;
    return;
  }

  if (nextScale >= 0.995) {
    ui.playStage.style.zoom = "";
    return;
  }

  ui.playStage.style.zoom = nextScale.toFixed(3);

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
  if (state.phase === "remote-turn") {
    return "好友正在操作，出牌后会自动同步到你的桌面。";
  }
  if (!isLocalTurnPlayable()) {
    return "还没轮到你，先观察桌面中央的最近动作。";
  }
  if (state.pendingDrawCard) {
    const playableCount = getPlayableTargetIds(state.pendingDrawCard).size;
    return playableCount
      ? `补枪阶段：${cardLabel(state.pendingDrawCard)} 已在手边，绿色亮起的是可补目标。`
      : `补枪阶段：${cardLabel(state.pendingDrawCard)} 暂时没有可钓目标，可以让摸牌落台。`;
  }

  const sourceCard = getSelectedSourceCard();
  if (!sourceCard) {
    return "轮到你了：先选一张手牌；公共牌会先保持原样，选牌后再提示可钓目标。";
  }

  const selectedTableCards = getSelectedTableCards();
  const evaluation = evaluateTableSelection(sourceCard, selectedTableCards);
  if (evaluation.ready) {
    return `${evaluation.helper}，可以点“${state.pendingDrawCard ? "尝试补枪" : "尝试钓牌"}”。`;
  }

  const playableCount = getPlayableTargetIds(sourceCard).size;
  if (!playableCount) {
    return `${cardLabel(sourceCard)} 这回合没有可钓公共牌，可以考虑弃到台面。`;
  }
  if (selectedTableCards.length) {
    return evaluation.helper || "继续选择亮起的公共牌，或清空后重选。";
  }
  return `${cardLabel(sourceCard)} 已选中：绿色亮起的是可钓目标，变淡的牌暂时不能钓。`;
}

function getTurnBlockReason() {
  if (state.phase === "game-over") {
    return "本局已经结束。";
  }
  if (state.phase === "opening-deal") {
    return "开局发牌中，等发牌完成后再操作。";
  }
  if (state.phase === "dice-rolling" || state.phase === "dice-result") {
    return "摇骰子阶段结束后才能操作。";
  }
  const currentPlayer = getCurrentPlayer();
  if (!isLocalSeatPlayer(currentPlayer)) {
    return `还没轮到你，当前是 ${getPlayerDisplayName(currentPlayer)}。`;
  }
  return "现在还不能操作。";
}

function getTurnControlState(sourceCard, selectedTableCards, evaluation) {
  if (!isLocalTurnPlayable()) {
    const reason = getTurnBlockReason();
    return {
      confirm: { disabled: true, reason },
      discard: { disabled: true, reason },
      clear: { disabled: true, reason },
      hint: reason,
    };
  }

  const hasSelection = Boolean(sourceCard || selectedTableCards.length);
  const sourceReason = state.pendingDrawCard ? "" : "请先选择一张手牌。";
  const confirmReason = !sourceCard
    ? sourceReason
    : selectedTableCards.length === 0
      ? "请选择亮起的公共牌；如果没有合适目标，可以弃到台面。"
      : !evaluation.ready
        ? (evaluation.helper || evaluation.message || "当前组合还不能结算。")
        : "";
  const discardReason = !sourceCard
    ? sourceReason
    : "";
  const clearReason = hasSelection ? "" : "当前还没有选择。";
  const hint = confirmReason || discardReason || (evaluation.ready ? "选择已满足，可以钓牌；也可以清空后改选。" : "");

  return {
    confirm: { disabled: Boolean(confirmReason), reason: confirmReason },
    discard: { disabled: Boolean(discardReason), reason: discardReason },
    clear: { disabled: !hasSelection, reason: clearReason },
    hint,
  };
}

function applyButtonState(button, stateConfig) {
  if (!button || !stateConfig) {
    return;
  }
  button.disabled = Boolean(stateConfig.disabled);
  if (stateConfig.reason) {
    button.title = stateConfig.reason;
    button.dataset.disabledReason = stateConfig.reason;
    button.setAttribute("aria-label", `${button.textContent}：${stateConfig.reason}`);
  } else {
    button.removeAttribute("title");
    delete button.dataset.disabledReason;
    button.removeAttribute("aria-label");
  }
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

  const localIndex = state.players.findIndex((player) => isLocalSeatPlayer(player));
  const opponents = localIndex === -1
    ? state.players.filter((player) => !isLocalSeatPlayer(player))
    : state.players
        .slice(localIndex + 1)
        .concat(state.players.slice(0, localIndex))
        .filter((player) => !isLocalSeatPlayer(player));
  if (state.players.length === 2) {
    seats.top = opponents[0] || null;
  } else if (state.players.length === 3) {
    seats["top-left"] = opponents[0] || null;
    seats["top-right"] = opponents[1] || null;
  } else if (state.players.length === 4) {
    seats["top-left"] = opponents[0] || null;
    seats.top = opponents[1] || null;
    seats["top-right"] = opponents[2] || null;
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
    selectedSourceCard?.id || "",
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
    const selected = state.selectedTable.has(card.id);
    const hasSource = Boolean(selectedSourceCard);
    const playable = playableIds.has(card.id);
    const unavailable = isLocalTurnPlayable() && hasSource && !playable && !selected;
    const unavailableReason = state.pendingDrawCard
      ? `这张公共牌不能和摸到的 ${cardLabel(selectedSourceCard)} 组成补枪。`
      : "这张公共牌不能和当前手牌组成钓牌。";
    const disabledReason = !isLocalTurnPlayable()
      ? getTurnBlockReason()
      : !hasSource
        ? "先选一张手牌，再点公共牌。"
        : unavailable
          ? unavailableReason
          : "";
    ui.tableCards.appendChild(createCardButton(card, {
      selected,
      focused: state.focusedTableIds.has(card.id),
      table: true,
      playable,
      dimmed: unavailable,
      onClick: () => toggleTableCard(card.id),
      disabled: !isLocalTurnPlayable() || !hasSource || unavailable,
      disabledReason,
      cardIndex: index,
      animate: shouldAnimate && !unavailable,
    }));
  });
}

function renderRoundSettlementSummary(result = state.lastFinishedResult || getRankedPlayers()) {
  const rows = getBeansSettlementRows(result);
  const round = state.beansRound;
  const winner = getSingleWinner(result);
  const pendingAward = getPendingBeansAward(result);
  const canClaimAward = Boolean(pendingAward && !round?.awarded);
  const title = round
    ? `本局门票 ${formatBeans(round.ticket || 0)} · 奖池 ${formatBeans(round.pot || 0)}`
    : "本局未消耗欢乐豆";
  const awardState = state.pendingBeansAward
    ? state.beansAwardBusy
      ? "奖励领取中..."
      : "等待你领取奖励"
    : round?.awarded
      ? round.awardMultiplier > 1
        ? "广告翻倍已领取"
        : "奖池已领取"
      : round
        ? winner
          ? "等待赢家领取"
          : "并列第一，暂未派奖"
        : "单机练习结算";

  const cardsHtml = rows.map((item) => {
    const name = escapeHtml(item.name);
    const roles = item.roleLabels.map(escapeHtml).join(" · ");
    const redCardText = item.redCards.length
      ? item.redCards.map((card) => `${cardSymbol(card)}${card.rank}`).join(" ")
      : "无红牌";
    const claimActions = canClaimAward && item.isWinner
      ? `
        <div class="settlement-card__actions">
          <button class="settlement-claim-btn settlement-claim-btn--primary" type="button" data-claim-multiplier="1"${state.beansAwardBusy ? " disabled" : ""}>
            <span>直接领取</span>
            <strong>${formatBeans(pendingAward.amount)}</strong>
          </button>
          <button class="settlement-claim-btn" type="button" data-claim-multiplier="2"${state.beansAwardBusy ? " disabled" : ""}>
            <span>看广告翻倍</span>
            <strong>${formatBeans(pendingAward.amount * 2)}</strong>
          </button>
        </div>
      `
      : "";
    return `
      <article class="settlement-card settlement-card--${item.tone}${item.isWinner ? " is-winner" : ""}">
        <div class="settlement-card__head">
          <span>第 ${item.rank} 名</span>
          ${item.isWinner ? "<strong>最高分</strong>" : ""}
        </div>
        <h3>${name}</h3>
        <p class="settlement-card__role">${roles}</p>
        <p class="settlement-card__score">${item.score} 分</p>
        <p class="settlement-card__beans">${formatBeansDelta(item.delta)}</p>
        <p class="settlement-card__detail">${escapeHtml(item.detail)}</p>
        <p class="settlement-card__meta">红牌 ${item.redCards.length} 张 · ${escapeHtml(redCardText)}</p>
        ${claimActions}
      </article>
    `;
  }).join("");

  ui.handCards.innerHTML = `
    <section class="round-settlement-summary">
      <div class="round-settlement-summary__head">
        <div>
          <h3>本局结算</h3>
          <p>${title}</p>
        </div>
        <span>${awardState}</span>
      </div>
      <div class="round-settlement-grid">
        ${cardsHtml}
      </div>
    </section>
  `;
  ui.handCards.querySelectorAll("[data-claim-multiplier]").forEach((button) => {
    button.addEventListener("click", () => handleClaimRoundBeans(button.dataset.claimMultiplier));
  });
}

function renderHumanHand(humanPlayer) {
  const signature = !humanPlayer
    ? `empty:${state.phase}:${state.lastFinishedResult?.length || 0}`
    : [
        state.phase,
        humanPlayer.hand.map((card) => card.id).join(","),
        state.selectedHandCardId || "",
        getCurrentPlayer()?.id || "",
        state.pendingDrawCard?.id || "",
        state.lastFinishedResult?.map((item) => `${item.name}:${item.score}:${item.captured}`).join(",") || "",
        state.beansRound ? `${state.beansRound.id}:${state.beansRound.awarded}:${state.beansRound.awardedAmount || 0}:${state.beansRound.awardMultiplier || 1}:${state.beansRound.pot}:${state.beansRound.ticket}` : "",
        state.pendingBeansAward?.roundId || "",
        state.beansAwardBusy ? "claiming" : "idle",
      ].join("|");

  if (state.renderCache.humanHand === signature) {
    return;
  }
  state.renderCache.humanHand = signature;

  ui.handCards.closest(".human-panel")?.classList.toggle("is-settlement", state.phase === "game-over");
  ui.handCards.innerHTML = "";
  ui.handCards.classList.toggle("settlement-grid", state.phase === "game-over");
  if (state.phase === "game-over") {
    renderRoundSettlementSummary();
    return;
  }

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
    const clickable = isLocalTurnPlayable() && getCurrentPlayer()?.id === humanPlayer.id && !state.pendingDrawCard;
    const disabledReason = state.pendingDrawCard
      ? "补枪阶段只能处理摸到的牌。"
      : !clickable
        ? getTurnBlockReason()
        : "";
    ui.handCards.appendChild(createCardButton(card, {
      selected: state.selectedHandCardId === card.id,
      hiddenZone: true,
      playable: clickable,
      dimmed: !clickable,
      onClick: () => selectHandCard(card.id),
      disabled: !clickable,
      disabledReason,
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
  const signature = "hidden";
  if (state.renderCache.results === signature) {
    return;
  }
  state.renderCache.results = signature;

  ui.resultPanel.classList.add("hidden");
  ui.resultGrid.innerHTML = "";
}

function getVisibleRoomInvite() {
  if (!state.authUser || !Array.isArray(state.socialRoomInvites) || !state.socialRoomInvites.length) {
    return null;
  }

  const activeInvite = state.activeRoomInviteId
    ? state.socialRoomInvites.find((item) => item.id === state.activeRoomInviteId)
    : null;
  if (activeInvite && !state.ignoredRoomInviteIds.has(activeInvite.id)) {
    return activeInvite;
  }

  return state.socialRoomInvites.find((item) => !state.ignoredRoomInviteIds.has(item.id)) || null;
}

function setRoomInviteRejectText(reason) {
  if (!ui.roomInviteRejectText) {
    return;
  }
  ui.roomInviteRejectText.value = reason;
  if (ui.roomInviteRejectReasons) {
    [...ui.roomInviteRejectReasons.querySelectorAll("button")].forEach((button) => {
      button.classList.toggle("active", button.dataset.reason === reason);
    });
  }
}

function renderRoomInviteRejectReasons() {
  if (!ui.roomInviteRejectReasons) {
    return;
  }

  ui.roomInviteRejectReasons.innerHTML = "";
  ROOM_INVITE_REJECT_REASONS.forEach((reason) => {
    const button = document.createElement("button");
    button.className = "room-invite-reason";
    button.type = "button";
    button.dataset.reason = reason;
    button.textContent = reason;
    button.addEventListener("click", () => setRoomInviteRejectText(reason));
    ui.roomInviteRejectReasons.appendChild(button);
  });
}

function renderRoomInviteModal() {
  if (!ui.roomInviteModal) {
    return;
  }

  if (!canShowLobbyInviteModal()) {
    ui.roomInviteModal.classList.add("hidden");
    ui.roomInviteModal.setAttribute("aria-hidden", "true");
    return;
  }

  const invite = getVisibleRoomInvite();
  if (!invite) {
    state.activeRoomInviteId = "";
    state.roomInviteRejectPanelOpen = false;
    ui.roomInviteModal.classList.add("hidden");
    ui.roomInviteModal.setAttribute("aria-hidden", "true");
    return;
  }

  const activeChanged = state.activeRoomInviteId !== invite.id;
  state.activeRoomInviteId = invite.id;
  if (activeChanged) {
    state.roomInviteRejectPanelOpen = false;
    if (ui.roomInviteRejectText) {
      ui.roomInviteRejectText.value = "";
    }
  }

  const ticket = Number(invite.ticket || getTicketCost(invite.mode));
  ui.roomInviteTitle.textContent = `${invite.fromGameId || "好友"} 邀请你组队`;
  ui.roomInviteCopy.textContent = `进入 ${invite.mode || 2} 人联机房，准备开始一局钓红点。`;
  ui.roomInviteMeta.innerHTML = `
    <span>${invite.mode || 2} 人房</span>
    <span>门票 ${formatBeans(ticket)}</span>
    <span>邀请人 ${invite.fromGameId || "好友"}</span>
  `;
  const blockedByRoom = Boolean(state.socialActiveRoom?.id);
  ui.roomInviteAccept.disabled = state.socialBusy || blockedByRoom || state.currentBeans < ticket;
  ui.roomInviteAccept.textContent = blockedByRoom
    ? "先离开当前房间"
    : state.currentBeans < ticket
      ? "欢乐豆不足"
      : "同意加入";
  ui.roomInviteIgnore.disabled = state.socialBusy;
  ui.roomInviteRejectToggle.disabled = state.socialBusy;
  ui.roomInviteRejectConfirm.disabled = state.socialBusy;
  ui.roomInviteRejectPanel.classList.toggle("hidden", !state.roomInviteRejectPanelOpen);
  if (activeChanged || !ui.roomInviteRejectReasons.children.length) {
    renderRoomInviteRejectReasons();
  }

  ui.roomInviteModal.classList.remove("hidden");
  ui.roomInviteModal.setAttribute("aria-hidden", "false");
}

function openRoomInviteModalForInvite(inviteId, showReject = false) {
  if (!inviteId) {
    return;
  }
  state.ignoredRoomInviteIds.delete(inviteId);
  state.activeRoomInviteId = inviteId;
  state.roomInviteRejectPanelOpen = Boolean(showReject);
  renderRoomInviteModal();
}

function toggleRoomInviteRejectPanel() {
  state.roomInviteRejectPanelOpen = !state.roomInviteRejectPanelOpen;
  renderRoomInviteModal();
  if (state.roomInviteRejectPanelOpen && ui.roomInviteRejectText) {
    ui.roomInviteRejectText.focus();
  }
}

function handleIgnoreActiveRoomInvite() {
  const invite = getVisibleRoomInvite();
  if (invite?.id) {
    state.ignoredRoomInviteIds.add(invite.id);
  }
  state.activeRoomInviteId = "";
  state.roomInviteRejectPanelOpen = false;
  renderRoomInviteModal();
}

async function handleAcceptActiveRoomInvite() {
  const invite = getVisibleRoomInvite();
  if (!invite?.id) {
    return;
  }
  await handleRespondRoomInvite(invite.id, true);
}

async function handleRejectActiveRoomInvite() {
  const invite = getVisibleRoomInvite();
  if (!invite?.id) {
    return;
  }
  const reason = normalizeRejectReason(ui.roomInviteRejectText?.value || "");
  await handleRespondRoomInvite(invite.id, false, reason);
}

function normalizeRejectReason(value) {
  return String(value || "").trim().slice(0, 60);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getOutgoingRoomInviteFeedbackHtml(room) {
  if (!room?.id || room.hostUid !== state.authUser?.uid) {
    return "";
  }

  const items = state.socialOutgoingRoomInvites
    .filter((invite) => invite.roomId === room.id && ["pending", "accepted", "rejected"].includes(invite.status))
    .sort((a, b) => getInviteCreatedTime(b) - getInviteCreatedTime(a));
  if (!items.length) {
    return "";
  }

  const itemHtml = items.map((invite) => {
    const name = escapeHtml(invite.toGameId || "好友");
    if (invite.status === "rejected") {
      const reason = escapeHtml(normalizeRejectReason(invite.rejectReason || ""));
      return `<li class="is-rejected"><strong>${name}</strong><span>已拒绝${reason ? `：${reason}` : ""}</span></li>`;
    }
    if (invite.status === "accepted") {
      return `<li class="is-accepted"><strong>${name}</strong><span>已加入房间</span></li>`;
    }
    return `<li><strong>${name}</strong><span>等待回复</span></li>`;
  }).join("");

  return `
    <div class="room-invite-feedback">
      <p>邀请反馈</p>
      <ul>${itemHtml}</ul>
    </div>
  `;
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
  if (options.dimmed) {
    classes.push("dimmed-card");
  }
  if (options.animate) {
    classes.push("new-card");
  }

  button.className = classes.join(" ");
  button.type = "button";
  button.disabled = Boolean(options.disabled);
  if (options.disabledReason) {
    button.title = options.disabledReason;
    button.setAttribute("aria-label", `${cardLabel(card)}：${options.disabledReason}`);
  }
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
    return "本局已经结束，桌面保留每个人的得分卡，下面显示欢乐豆输赢明细。";
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
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Google 登录窗口已关闭。";
  }
  if (code === "auth/popup-blocked") {
    return "浏览器拦截了 Google 登录弹窗，请允许弹窗后再试。";
  }
  if (code === "auth/operation-not-allowed") {
    return "Google 登录还没有在 Firebase 控制台启用。";
  }
  if (code === "permission-denied") {
    return "数据库权限拦住了这次操作，请更新 Firestore 规则。";
  }
  return error?.message || "出现了一点问题，请稍后再试。";
}

async function handleRespondRoomInvite(inviteId, accept, rejectReason = "") {
  if (!db || !state.authUser) {
    return;
  }
  if (accept && !state.currentPlayerId) {
    setSocialStatus("先绑定游戏 ID，再加入好友房间。", "error");
    return;
  }
  if (accept && state.socialActiveRoom?.id) {
    setSocialStatus("你当前还在一个房间里，先离开当前房间，再来加入这个邀请。", "error");
    return;
  }

  state.socialBusy = true;
  renderRoomInviteModal();
  renderSocialPanel();
  try {
    const inviteRef = db.collection(FIRESTORE_COLLECTIONS.roomInvites).doc(inviteId);
    const cleanRejectReason = normalizeRejectReason(rejectReason);
    await db.runTransaction(async (transaction) => {
      const inviteSnap = await transaction.get(inviteRef);
      if (!inviteSnap.exists) {
        throw new Error("INVITE_MISSING");
      }
      const invite = inviteSnap.data();
      if (!accept) {
        transaction.set(inviteRef, {
          status: "rejected",
          rejectReason: cleanRejectReason,
          rejectReasonQuick: ROOM_INVITE_REJECT_REASONS.includes(cleanRejectReason) ? cleanRejectReason : "",
          rejectedByUid: state.authUser.uid,
          rejectedByGameId: state.currentPlayerId || invite.toGameId || "",
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
      const ticket = Number(room.ticket || getTicketCost(room.mode));
      const beansRound = room.beansRound || createBeansRound(room.mode, room.mode, invite.roomId);
      const roundId = beansRound.id || invite.roomId;
      const paidUids = Array.isArray(beansRound.paidUids) ? [...beansRound.paidUids] : [];
      if (!memberUids.includes(state.authUser.uid)) {
        if (memberUids.length >= Number(room.mode || 2)) {
          throw new Error("ROOM_FULL");
        }
        const profileRef = db.collection(FIRESTORE_COLLECTIONS.profiles).doc(state.authUser.uid);
        const profileSnap = await transaction.get(profileRef);
        const profileData = profileSnap.exists ? profileSnap.data() : {};
        const currentBeans = normalizeBeans(profileData.beans, INITIAL_BEANS);
        if (profileData.lastBeanRoundPaid !== roundId) {
          if (currentBeans < ticket) {
            throw new Error("NOT_ENOUGH_BEANS");
          }
          transaction.set(profileRef, {
            beans: currentBeans - ticket,
            lastBeanRoundPaid: roundId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
        if (!paidUids.includes(state.authUser.uid)) {
          paidUids.push(state.authUser.uid);
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
        ticket,
        pot: Number(beansRound.pot || ticket * Number(room.mode || 2)),
        beansRound: {
          ...beansRound,
          ticket,
          pot: Number(beansRound.pot || ticket * Number(room.mode || 2)),
          paidUids,
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(inviteRef, {
        status: "accepted",
        respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    state.ignoredRoomInviteIds.delete(inviteId);
    state.activeRoomInviteId = "";
    state.roomInviteRejectPanelOpen = false;
    setSocialStatus(
      accept
        ? "已加入好友房间。"
        : cleanRejectReason
          ? `已拒绝房间邀请，并回复：${cleanRejectReason}`
          : "已拒绝房间邀请。",
      "success",
    );
    if (accept) {
      await loadCurrentUserProfile();
    }
  } catch (error) {
    const permissionBlocked = error?.code === "permission-denied";
    const message = error?.message === "ROOM_FULL"
      ? "这个房间已经满了，没法再加入。"
      : error?.message === "ROOM_CLOSED"
        ? "这个房间已经不是等待状态了，不能再加入。"
        : error?.message === "ROOM_MISSING"
          ? "这个房间已经不存在了。"
          : error?.message === "NOT_ENOUGH_BEANS"
            ? `欢乐豆不足，加入 ${state.socialRoomInvites.find((item) => item.id === inviteId)?.mode || ""} 人房需要门票。`
            : permissionBlocked
              ? "加入失败：不是你还在别的房间里，而是 Firebase 规则还没允许被邀请的人把自己加入房间，所以数据库把这一步拦住了。"
              : `处理房间邀请失败：${formatAuthError(error)}`;
    setSocialStatus(message, "error");
  } finally {
    state.socialBusy = false;
    await refreshSocialData();
    renderRoomInviteModal();
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
  const useDice = room.useDice ?? state.settings.useDice ?? true;
  const deck = shuffle(createDeck());
  const members = Array.isArray(room.members) ? [...room.members] : [];
  const orderedMembers = members
    .slice()
    .sort((a, b) =>
      Number(a.joinedAt?.seconds || a.joinedAt || 0) - Number(b.joinedAt?.seconds || b.joinedAt || 0)
      || String(a.gameId || "").localeCompare(String(b.gameId || ""), "zh-CN")
    );
  let beansRound = room.beansRound || null;
  if (isRematch || !beansRound?.id) {
    beansRound = await debitBeansForTicket(room.mode, orderedMembers.length || room.mode, room.id);
    if (!beansRound) {
      return;
    }
    beansRound = {
      ...beansRound,
      paidUids: [state.authUser.uid],
    };
  } else {
    const paymentReady = await ensureBeansPaidForRoom({
      id: room.id,
      ...room,
      beansRound,
    });
    if (!paymentReady) {
      return;
    }
    beansRound = state.beansRound || beansRound;
    beansRound = {
      ...beansRound,
      ticket: Number(beansRound.ticket || room.ticket || getTicketCost(room.mode)),
      pot: Number(beansRound.pot || getTicketCost(room.mode) * Number(room.mode || 2)),
      paidUids: Array.isArray(beansRound.paidUids) ? [...beansRound.paidUids] : [],
    };
  }

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

  let turnOrderedPlayers = players;
  const setupLog = [];
  if (useDice) {
    const diceResult = resolveTurnOrder(players);
    turnOrderedPlayers = diceResult.order.map((index) => players[index]);
    setupLog.push(...diceResult.notes);
  } else {
    setupLog.push("未启用摇骰子，按当前入房顺序开始。");
  }

  const tableCards = deck.splice(0, config.table);
  const drawPile = deck.splice(0, config.draw);
  const openingToken = `room-open-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const diceSummary = useDice
    ? turnOrderedPlayers.map((player, index) => ({
        id: player.id,
        name: player.name,
        order: index + 1,
        finalRoll: player.diceTrail.at(-1) || 0,
        rolls: [...player.diceTrail],
      }))
    : [];
  const diceAnimation = useDice
    ? {
        stage: "rolling",
        faces: Object.fromEntries(turnOrderedPlayers.map((player) => [player.id, randomDice()])),
      }
    : null;
  const roundPlan = normalizeRoundPlan({
    playerHands: Object.fromEntries(turnOrderedPlayers.map((player) => [player.id, [...player.hand]])),
    tableCards: [...tableCards],
    drawPile: [...drawPile],
  });
  const firstUid = orderedMembers[0]?.uid || null;
  const firstName = orderedMembers[0]?.gameId || "房主";
  const gameState = {
    phase: useDice ? "dice-rolling" : "opening-deal",
    tableCards: [],
    drawPile: [],
    pendingDrawCard: null,
    currentPlayerUid: turnOrderedPlayers[0]?.uid || firstUid,
    playersPublic: turnOrderedPlayers.map((player) => ({
      uid: player.uid,
      name: player.name,
      handCount: 0,
      captured: [],
      lastAction: null,
    })),
    diceSummary,
    diceAnimation,
    roundPlan,
    openingStage: useDice ? null : "deal-hands",
    openingToken,
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
    beansRound,
    lastFinishedResult: null,
    lastFinishedAt: "",
  };

  const roomRef = db.collection(FIRESTORE_COLLECTIONS.rooms).doc(room.id);
  const batch = db.batch();
  batch.set(roomRef, {
    status: "playing",
    invitedUids: [],
    useDice: Boolean(useDice),
    ticket: beansRound.ticket,
    pot: beansRound.pot,
    beansRound,
    memberUids: orderedMembers.map((member) => member.uid),
    members: orderedMembers.map((member) => ({
      uid: member.uid,
      gameId: member.gameId,
      joinedAt: member.joinedAt || null,
    })),
    gameState,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  turnOrderedPlayers.forEach((player) => {
    batch.set(roomRef.collection("hands").doc(player.uid), {
      cards: [...player.hand],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  await batch.commit();

  const localPlayer = turnOrderedPlayers.find((player) => player.uid === state.authUser?.uid);
  const nextRoom = {
    ...room,
    status: "playing",
    useDice: Boolean(useDice),
    ticket: beansRound.ticket,
    pot: beansRound.pot,
    beansRound,
    memberUids: orderedMembers.map((member) => member.uid),
    members: orderedMembers.map((member) => ({
      uid: member.uid,
      gameId: member.gameId,
      joinedAt: member.joinedAt || Date.now(),
    })),
    gameState,
  };
  state.socialActiveRoom = nextRoom;
  state.beansRound = beansRound;
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

function getCompactLeaderboardSignature() {
  const mode = String(state.leaderboardMode || "2");
  const sorted = getSortedPlayerStats(mode);
  return `${mode}:${sorted.map((item) => {
    const stats = getModeStats(item, mode);
    return `${item.id}:${stats.bestScore}:${stats.wins}:${stats.rounds}`;
  }).join(",")}`;
}

function renderSocialLeaderboardCompact() {
  if (!ui.socialLeaderboardCompact) {
    return;
  }

  const mode = String(state.leaderboardMode || "2");
  const sorted = getSortedPlayerStats(mode);
  const section = document.createElement("section");
  section.className = "social-mini-board";

  const list = document.createElement("div");
  list.className = "social-mini-board__list";
  ui.socialLeaderboardCompact.innerHTML = "";
  if (!sorted.length) {
    list.appendChild(createEmptyState("还没有完成对局。"));
  } else {
    sorted.forEach((item, index) => {
      const stats = getModeStats(item, mode);
      const row = document.createElement("article");
      row.className = `social-rank-item${item.id === state.currentPlayerId ? " active" : ""}`;
      row.innerHTML = `
        <div class="social-rank-index">#${index + 1}</div>
        <div class="social-rank-main">
          <strong>${escapeHtml(item.id)}</strong>
          <p>胜场 ${stats.wins} · 局数 ${stats.rounds}</p>
        </div>
        <div class="social-rank-score">
          <strong>${stats.bestScore}</strong>
          <span>单局最高</span>
        </div>
      `;
      list.appendChild(row);
    });
  }
  section.appendChild(list);
  ui.socialLeaderboardCompact.appendChild(section);
}

function renderSocialPanel() {
  if (!ui.socialPanel || !ui.socialStatus || !ui.socialSearchResult || !ui.socialFriendRequests || !ui.socialFriends ||
    !ui.socialFriendsPane || !ui.socialRoomInvites || !ui.socialRoomCard || !ui.socialSideFriendsTab ||
    !ui.socialSideLeaderboardTab || !ui.socialLeaderboardPane || !ui.socialLeaderboardCompact) {
    return;
  }

  const signedIn = Boolean(state.authUser);
  const room = state.socialActiveRoom;
  const sideView = state.socialSideView === "leaderboard" ? "leaderboard" : "friends";
  const signature = JSON.stringify({
    signedIn,
    sideView,
    currentPlayerId: state.currentPlayerId,
    currentBeans: state.currentBeans,
    leaderboardRefreshing: state.leaderboardRefreshing,
    leaderboardCompact: getCompactLeaderboardSignature(),
    socialBusy: state.socialBusy,
    socialStatusMessage: state.socialStatusMessage,
    socialStatusTone: state.socialStatusTone,
    socialSearchResult: state.socialSearchResult,
    socialFriendRequests: state.socialFriendRequests.map((item) => [item.id, item.fromGameId, item.toGameId]),
    socialFriends: state.socialFriends.map((item) => [item.uid, item.gameId]),
    socialRoomInvites: state.socialRoomInvites.map((item) => [item.id, item.fromGameId, item.mode]),
    socialOutgoingRoomInvites: state.socialOutgoingRoomInvites.map((item) => [
      item.id,
      item.roomId,
      item.toGameId,
      item.status,
      item.rejectReason,
    ]),
    socialActiveRoom: room
      ? {
          id: room.id,
          mode: room.mode,
          status: room.status,
          ticket: room.ticket,
          pot: room.pot,
          beansRound: room.beansRound
            ? {
                id: room.beansRound.id,
                ticket: room.beansRound.ticket,
                pot: room.beansRound.pot,
                paidUids: room.beansRound.paidUids,
              }
            : null,
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
  ui.socialSideFriendsTab.classList.toggle("active", sideView === "friends");
  ui.socialSideLeaderboardTab.classList.toggle("active", sideView === "leaderboard");
  ui.socialSideFriendsTab.setAttribute("aria-selected", String(sideView === "friends"));
  ui.socialSideLeaderboardTab.setAttribute("aria-selected", String(sideView === "leaderboard"));
  ui.socialFriendsPane.classList.toggle("hidden", sideView !== "friends");
  ui.socialLeaderboardPane.classList.toggle("hidden", sideView !== "leaderboard");
  [ui.socialLeaderboardMode2, ui.socialLeaderboardMode3, ui.socialLeaderboardMode4].forEach((button) => {
    if (button) {
      button.classList.toggle("active", button.dataset.mode === String(state.leaderboardMode || "2"));
    }
  });
  if (ui.socialLeaderboardRefresh) {
    ui.socialLeaderboardRefresh.disabled = state.leaderboardRefreshing;
    ui.socialLeaderboardRefresh.textContent = state.leaderboardRefreshing ? "刷新中" : "刷新";
  }
  renderSocialLeaderboardCompact();

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
    wrap.className = "social-room-inner social-room-create";
    wrap.innerHTML = `
      <div>
        <strong>还没有等待中的房间</strong>
        <p>先创建一个 2 / 3 / 4 人房，再邀请好友加入。创建时会扣除对应门票。</p>
      </div>
    `;
    const actions = document.createElement("div");
    actions.className = "social-inline-actions";
    ["2", "3", "4"].forEach((mode) => {
      const button = document.createElement("button");
      button.className = "ghost-btn";
      button.type = "button";
      button.textContent = `创建${mode}人房 · ${formatBeans(getTicketCost(mode))}`;
      button.disabled = state.socialBusy || !state.currentPlayerId || state.currentBeans < getTicketCost(mode);
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
    const roomTicket = Number(room.ticket || room.beansRound?.ticket || getTicketCost(room.mode));
    const roomPot = Number(room.pot || room.beansRound?.pot || roomTicket * targetCount);
    const outgoingFeedbackHtml = getOutgoingRoomInviteFeedbackHtml(room);
    const card = document.createElement("div");
    card.className = "social-room-inner social-room-active";
    card.innerHTML = `
      <div class="social-room-details">
        <strong>${room.mode} 人房 · ${room.hostUid === state.authUser.uid ? "你是房主" : "好友房间"}</strong>
        <p>房间状态：${roomStatusText}</p>
        <p>门票：${formatBeans(roomTicket)} · 奖池：${formatBeans(roomPot)}</p>
        <p>当前成员：${memberText || "暂无"}</p>
      </div>
      <div class="social-room-feedback-slot">${outgoingFeedbackHtml}</div>
    `;
    const actions = document.createElement("div");
    actions.className = "social-inline-actions";

    if (room.status === "playing") {
      const resumeButton = document.createElement("button");
      resumeButton.className = "ghost-btn";
      resumeButton.type = "button";
      resumeButton.textContent = "返回对局";
      resumeButton.disabled = state.socialBusy;
      resumeButton.addEventListener("click", handleReturnToActiveRoom);
      actions.appendChild(resumeButton);
    }

    const button = document.createElement("button");
    button.className = "ghost-btn";
    button.type = "button";
    button.textContent = room.hostUid === state.authUser.uid ? "关闭房间" : "离开房间";
    button.disabled = state.socialBusy;
    button.addEventListener("click", handleLeaveRoom);
    actions.appendChild(button);
    const startButton = room.status === "waiting" && room.hostUid === state.authUser.uid && members.length === targetCount
      ? document.createElement("button")
      : null;
    if (startButton) {
      startButton.className = "ghost-btn";
      startButton.type = "button";
      startButton.textContent = "开始联机";
      startButton.disabled = state.socialBusy;
      startButton.addEventListener("click", handleStartRoomMatch);
      actions.prepend(startButton);
    }
    card.appendChild(actions);
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
      const inviteTicket = Number(item.ticket || getTicketCost(item.mode));
      const card = document.createElement("article");
      card.className = "social-item";
      card.innerHTML = `<div><strong>${item.fromGameId}</strong><p>邀请你进入 ${item.mode} 人房 · 门票 ${formatBeans(inviteTicket)}</p></div>`;
      const actions = document.createElement("div");
      actions.className = "social-inline-actions";
      const accept = document.createElement("button");
      accept.className = "ghost-btn";
      accept.type = "button";
      accept.textContent = room ? "先离开当前房间" : "查看邀请";
      accept.disabled = state.socialBusy || (!room && state.currentBeans < inviteTicket);
      accept.addEventListener("click", () => {
        if (room) {
          setSocialStatus("你当前还在一个房间里，先点上面的“关闭房间”或“离开房间”，再来加入这个邀请。", "error");
          return;
        }
        openRoomInviteModalForInvite(item.id, false);
      });
      const reject = document.createElement("button");
      reject.className = "ghost-btn";
      reject.type = "button";
      reject.textContent = "拒绝并回复";
      reject.disabled = state.socialBusy;
      reject.addEventListener("click", () => openRoomInviteModalForInvite(item.id, true));
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
  renderLobbyModeControls();
  requestAnimationFrame(syncSocialSideHeight);
}
