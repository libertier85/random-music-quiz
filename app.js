const YEAR_START = 1990;
const YEAR_END = 2026;
const APP_VERSION = "0.8.2";
const APP_BUILD = "quiz-results";
const RECENT_MONTHS = 6;
const SPOTIFY_SEARCH_BATCH_SIZE = 2;
const SPOTIFY_REQUEST_TIMEOUT_MS = 8_000;
const SPOTIFY_MAX_QUERY_COUNT = 6;
const SPOTIFY_MAX_RELAXED_QUERY_COUNT = 4;
const SPOTIFY_ARTIST_FILTER_LIMIT = 120;
const SPOTIFY_ARTIST_GENRE_LOOKUP_LIMIT = 0;
const SPOTIFY_AUDIO_FEATURE_LOOKUP_LIMIT = 0;
const SPOTIFY_RATE_LIMIT_RETRY_COUNT = 1;
const SPOTIFY_DEFAULT_RATE_LIMIT_SECONDS = 300;
const SPOTIFY_SEARCH_LIMIT = 10;
const KOREA_TOP_PLAYLIST_IDS = [
  "37i9dQZF1DX9tPFwDMOaN1", // Recent K-pop / regularly updated Spotify playlist
  "37i9dQZF1DWT9uTRZAYj0c", // Hot Hits Korea Top 100
  "37i9dQZEVXbNxXF4SkHj9F", // Top 50 - South Korea
];
const QUIZ_PLAYLISTS = [
  {
    id: "0C5dTANYJbiVOY5yALyUgy",
    name: "랜덤퀴즈 신곡",
  },
  {
    id: "2hGCc3iEBj1KwS8gEoNHKZ",
    name: "랜덤퀴즈 Top100",
  },
];
const KOREA_TOP_FALLBACK_PLAYLIST_QUERIES = [
  "실시간 멜론차트 TOP 100",
  "Melon Charts Top 100",
  "Korea Top 100",
  "Hot Hits Korea",
  "Top 50 South Korea",
];
const KOREA_TOP_FALLBACK_PLAYLIST_LIMIT = 4;
const KOREA_TOP_SEARCH_FALLBACK_QUERY_COUNT = 10;
const RECENT_QUEUE_HISTORY_LIMIT = 40;
const SPOTIFY_CLIENT_ID_KEY = "randomMusicQuiz.spotifyClientId";
const SPOTIFY_TOKEN_KEY = "randomMusicQuiz.spotifyToken";
const SPOTIFY_RATE_LIMIT_UNTIL_KEY = "randomMusicQuiz.spotifyRateLimitedUntil";
const SPOTIFY_VERIFIER_KEY = "randomMusicQuiz.spotifyVerifier";
const SPOTIFY_RETURN_URL_KEY = "randomMusicQuiz.spotifyReturnUrl";
const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
];

const isDebugMode = new URLSearchParams(window.location.search).get("debug") === "1";
const allYears = Array.from(
  { length: YEAR_END - YEAR_START + 1 },
  (_, index) => YEAR_START + index,
);

const filterGroups = {
  country: ["korea", "japan", "western", "global"],
  chart: ["korea-top100", "shorts-challenge"],
  style: [
    "dance",
    "ballad",
    "rock",
    "hiphop",
    "rnb",
    "electronic",
    "trot",
    "indie",
    "ost",
    "anime",
  ],
  artist: ["girl-group", "boy-group", "female-solo", "male-solo", "band", "mixed-duo"],
};

const categoryLabels = {
  korea: "한국",
  japan: "일본",
  western: "영미권",
  global: "글로벌",
  "korea-top100": "한국 Top 100",
  "shorts-challenge": "쇼츠/챌린지",
  dance: "댄스",
  ballad: "발라드",
  rock: "락",
  hiphop: "힙합/랩",
  rnb: "R&B",
  electronic: "일렉트로닉",
  trot: "트로트",
  indie: "인디",
  ost: "OST",
  anime: "애니송",
  "girl-group": "걸그룹",
  "boy-group": "보이그룹",
  "female-solo": "여성 솔로",
  "male-solo": "남성 솔로",
  band: "밴드",
  "mixed-duo": "혼성/듀오",
};

const knownKoreanArtistAliases = {
  "girl-group": [
    "aespa",
    "baby monster",
    "babymonster",
    "blackpink",
    "illit",
    "itzy",
    "ive",
    "kiss of life",
    "le sserafim",
    "newjeans",
    "nmixx",
    "red velvet",
    "stayc",
    "twice",
    "(g)i-dle",
    "여자아이들",
    "뉴진스",
    "르세라핌",
    "아이브",
    "에스파",
    "트와이스",
    "블랙핑크",
  ],
  "boy-group": [
    "ateez",
    "bigbang",
    "bts",
    "enhypen",
    "exo",
    "nct",
    "nct 127",
    "nct dream",
    "riize",
    "seventeen",
    "shinee",
    "stray kids",
    "tomorrow x together",
    "treasure",
    "txt",
    "tws",
    "zerobaseone",
    "zb1",
    "방탄소년단",
    "세븐틴",
    "스트레이 키즈",
  ],
  "female-solo": [
    "ailee",
    "bibi",
    "chung ha",
    "chungha",
    "heize",
    "hwasa",
    "iu",
    "jennie",
    "jisoo",
    "joy",
    "kim sejeong",
    "kwon eunbi",
    "lee chaeyeon",
    "leehi",
    "lisa",
    "nayeon",
    "rosé",
    "rose",
    "seulgi",
    "somi",
    "sunmi",
    "taeyeon",
    "wendy",
    "yena",
    "younha",
    "yuqi",
    "권은비",
    "김세정",
    "나연",
    "로제",
    "비비",
    "선미",
    "아이유",
    "예나",
    "이하이",
    "제니",
    "지수",
    "청하",
    "태연",
    "화사",
  ],
  "male-solo": [
    "10cm",
    "baekhyun",
    "be'o",
    "b.i",
    "big naughty",
    "crush",
    "d.o.",
    "dean",
    "g-dragon",
    "j-hope",
    "jay park",
    "jimin",
    "jin",
    "jungkook",
    "jung kook",
    "kang daniel",
    "kai",
    "key",
    "lee mujin",
    "lim young woong",
    "loco",
    "paul kim",
    "rm",
    "roy kim",
    "suga",
    "taemin",
    "taeyang",
    "v",
    "woodz",
    "zico",
    "강다니엘",
    "뷔",
    "정국",
    "지민",
    "지코",
    "진",
    "태민",
  ],
  band: [
    "day6",
    "lucy",
    "n.flying",
    "nell",
    "qwer",
    "the rose",
    "xdinary heroes",
    "데이식스",
    "루시",
  ],
  "mixed-duo": ["akmu", "bol4", "busker busker", "악뮤", "볼빨간사춘기"],
};

const knownKoreanDanceSoloAliases = [
  "chung ha",
  "chungha",
  "g-dragon",
  "jennie",
  "jimin",
  "jung kook",
  "jungkook",
  "kai",
  "lisa",
  "somi",
  "sunmi",
  "taemin",
];

const knownKoreanArtistNames = new Set(Object.values(knownKoreanArtistAliases).flat());

const appVersionLabel = document.querySelector("#app-version");
const form = document.querySelector("#quiz-settings");
const quizStartButton = form.querySelector("button[type='submit']");
const durationInput = document.querySelector("#play-duration");
const breakInput = document.querySelector("#break-seconds");
const songCountInput = document.querySelector("#song-count");
const spotifyClientIdInput = document.querySelector("#spotify-client-id");
const saveSpotifyClientButton = document.querySelector("#save-spotify-client");
const connectSpotifyButton = document.querySelector("#connect-spotify");
const retrySpotifyPlayerButton = document.querySelector("#retry-spotify-player");
const diagnoseSpotifyButton = document.querySelector("#diagnose-spotify");
const disconnectSpotifyButton = document.querySelector("#disconnect-spotify");
const spotifyStatus = document.querySelector("#spotify-status");
const playlistChoiceInputs = document.querySelectorAll("input[name='quizPlaylist']");
const yearStartInput = document.querySelector("#year-start");
const yearEndInput = document.querySelector("#year-end");
const yearRangePanel = document.querySelector("#year-range-panel");
const yearDirectPanel = document.querySelector("#year-direct-panel");
const yearDirectGrid = document.querySelector("#year-direct-grid");
const yearSummary = document.querySelector("#year-summary");
const roundLabel = document.querySelector("#round-label");
const timerLabel = document.querySelector("#timer-label");
const modeLabel = document.querySelector("#mode-label");
const questionLabel = document.querySelector("#question-label");
const answerLabel = document.querySelector("#answer-label");
const toggleAnswerButton = document.querySelector("#toggle-answer");
const togglePlaybackButton = document.querySelector("#toggle-playback");
const nextSongButton = document.querySelector("#next-song");
const quizResults = document.querySelector("#quiz-results");
const quizResultsCount = document.querySelector("#quiz-results-count");
const quizResultList = document.querySelector("#quiz-result-list");
const harnessLog = document.querySelector("#harness-log");
const runCategoryQaButton = document.querySelector("#run-category-qa");
const playerPanel = document.querySelector(".player-panel");
const sourceStatus = document.querySelector("#source-status");

document.body.classList.toggle("show-debug", isDebugMode);
if (appVersionLabel) {
  appVersionLabel.textContent = `v${APP_VERSION} · ${APP_BUILD}`;
}

const state = {
  queue: [],
  currentIndex: -1,
  settings: {
    playFrom: "highlight",
    selectedCategories: ["korea", "dance"],
    dateFilter: createRecentDateFilter(RECENT_MONTHS),
    playDuration: 30,
    breakSeconds: 5,
    songCount: 5,
  },
  timerId: null,
  remainingSeconds: 0,
  currentStartSecond: 0,
  currentPlaySeconds: 0,
  playedTracks: [],
  reviewTrack: null,
  phase: "idle",
  isPaused: false,
  spotify: {
    player: null,
    deviceId: "",
    sdkReady: false,
    connecting: false,
    readyTimeoutId: null,
    hasEverBeenReady: false,
    lastError: "",
    token: readStoredSpotifyToken(),
    resolvedTracks: new Map(),
    artistGenres: new Map(),
    audioFeatures: new Map(),
    searchResults: new Map(),
    unavailablePlaylists: new Set(),
    rateLimitedUntil: readStoredSpotifyRateLimitedUntil(),
    rateLimitIsExact: false,
    rateLimitTimerId: null,
  },
  recentTrackKeys: [],
  yearPreset: {
    recentMonths: RECENT_MONTHS,
  },
};

initializeYearControls();
initializeSpotifyControls();
bindEvents();
updateActionButtons();
startSpotifyCooldownIfNeeded();
completeSpotifyLoginIfNeeded().then(() => {
  refreshSpotifyUi();
  initializeSpotifyPlayerIfPossible();
});

function bindEvents() {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    state.settings = readSettings();
    quizStartButton.disabled = true;
    quizStartButton.textContent = "후보 검색 중";
    clearTimer();
    state.isPaused = false;
    state.phase = "idle";
    state.currentIndex = -1;
    await stopActiveAudio();
    resetQuizResults();
    playerPanel.classList.remove("is-playing");
    updatePlaybackToggleButton();

    try {
      const ready = await prepareSpotifyForQuiz();

      if (!ready) {
        return;
      }

      state.queue = await buildSpotifyQueue(state.settings);

      if (state.queue.length === 0) {
        handleEmptyQueue();
        return;
      }

      state.currentIndex = -1;
      state.isPaused = false;
      appendHarnessLog(`퀴즈 시작: ${describePlayFrom(state.settings.playFrom)} 모드`);
      appendHarnessLog(`연도: ${describeDateFilter(state.settings.dateFilter)}`);
      appendHarnessLog(`카테고리: ${describeCategories(state.settings.selectedCategories)}`);
      await playNextTrack();
    } catch (error) {
      handleQuizStartError(error);
    } finally {
      if (!startSpotifyCooldownIfNeeded()) {
        quizStartButton.disabled = false;
        quizStartButton.textContent = "퀴즈 시작";
      }
    }
  });

  toggleAnswerButton.addEventListener("click", () => {
    if (!canShowAnswer()) {
      return;
    }

    answerLabel.classList.toggle("hidden");
    toggleAnswerButton.textContent = answerLabel.classList.contains("hidden")
      ? "정답 보기"
      : "정답 숨기기";
  });

  togglePlaybackButton.addEventListener("click", async () => {
    if (!canTogglePlayback()) {
      return;
    }

    if (state.isPaused) {
      await resumePlayback();
      return;
    }

    await pausePlayback();
  });

  nextSongButton.addEventListener("click", async () => {
    if (!canMoveNext()) {
      return;
    }

    clearTimer();
    state.isPaused = false;
    await stopActiveAudio();
    startBreakThenNext();
  });

  if (runCategoryQaButton) {
    runCategoryQaButton.addEventListener("click", async () => {
      await runCategoryQualityAudit();
    });
  }

  quizResultList.addEventListener("click", async (event) => {
    const resultButton =
      event.target instanceof Element ? event.target.closest("[data-result-index]") : null;

    if (!resultButton) {
      return;
    }

    const track = state.playedTracks[Number(resultButton.dataset.resultIndex)];

    if (!track) {
      return;
    }

    await playFullResultTrack(track, resultButton);
  });

  document.querySelectorAll("input[name='playFrom']").forEach((input) => {
    input.addEventListener("change", () => {
      const playFrom = document.querySelector("input[name='playFrom']:checked").value;
      modeLabel.textContent = `${describePlayFrom(playFrom)}부터 재생`;
    });
  });

  document.querySelectorAll("input[name='yearMode']").forEach((input) => {
    input.addEventListener("change", updateYearMode);
  });

  document.querySelectorAll(".year-presets button").forEach((button) => {
    button.addEventListener("click", () => {
      const recentMonths = Number(button.dataset.recentMonths || 0);

      if (recentMonths > 0) {
        setYearMode("range");
        state.yearPreset.recentMonths = recentMonths;
        setRecentRange(recentMonths);
        updateYearSummary();
        return;
      }

      const start = Number(button.dataset.yearStart);
      const end = Number(button.dataset.yearEnd);
      setYearMode("range");
      state.yearPreset.recentMonths = null;
      setYearRange(start, end);
      setDirectYears(yearsBetween(start, end));
      updateYearSummary();
    });
  });

  [yearStartInput, yearEndInput].forEach((select) => {
    select.addEventListener("change", () => {
      normalizeYearRange();
      state.yearPreset.recentMonths = null;
      updateYearSummary();
    });
  });
}

function initializeSpotifyControls() {
  spotifyClientIdInput.value = getSpotifyClientId();
  refreshSpotifyUi();

  saveSpotifyClientButton.addEventListener("click", async () => {
    const previousClientId = getSpotifyClientId();
    const clientId = spotifyClientIdInput.value.trim();

    if (!clientId) {
      localStorage.removeItem(SPOTIFY_CLIENT_ID_KEY);
      localStorage.removeItem(SPOTIFY_TOKEN_KEY);
      state.spotify.token = null;
      state.spotify.deviceId = "";
      await resetSpotifyPlayer();
      refreshSpotifyUi();
      setSpotifyStatus("Client ID가 비어 있습니다.");
      return;
    }

    if (previousClientId && previousClientId !== clientId) {
      localStorage.removeItem(SPOTIFY_TOKEN_KEY);
      state.spotify.token = null;
      state.spotify.deviceId = "";
      await resetSpotifyPlayer();
    }

    localStorage.setItem(SPOTIFY_CLIENT_ID_KEY, clientId);
    refreshSpotifyUi();
    setSpotifyStatus("Client ID를 저장했습니다. 이제 Spotify 로그인을 누르세요.");
  });

  connectSpotifyButton.addEventListener("click", () => {
    startSpotifyLogin();
  });

  retrySpotifyPlayerButton.addEventListener("click", async () => {
    await resetSpotifyPlayer();
    await initializeSpotifyPlayerIfPossible();
    refreshSpotifyUi();
  });

  diagnoseSpotifyButton.addEventListener("click", async () => {
    await diagnoseSpotifyConnection();
  });

  disconnectSpotifyButton.addEventListener("click", async () => {
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
    state.spotify.token = null;
    state.spotify.deviceId = "";
    await state.spotify.player?.disconnect();
    state.spotify.player = null;
    refreshSpotifyUi();
    updateIdleSourceStatus();
  });
}

function readSettings() {
  const playFrom = document.querySelector("input[name='playFrom']:checked").value;
  const rawDuration = durationInput.value;
  const yearMode = document.querySelector("input[name='yearMode']:checked").value;

  return {
    playFrom,
    playlistId: getSelectedPlaylistId(),
    playlistName: getSelectedPlaylistName(),
    selectedCategories: getSelectedCategories(),
    dateFilter: getDateFilter(yearMode),
    playDuration: rawDuration === "full" ? "full" : Number(rawDuration),
    breakSeconds: Number(breakInput.value),
    songCount: Number(songCountInput.value),
  };
}

function getSelectedPlaylistId() {
  return document.querySelector("input[name='quizPlaylist']:checked")?.value || QUIZ_PLAYLISTS[0].id;
}

function getSelectedPlaylistName() {
  const playlistId = getSelectedPlaylistId();
  return QUIZ_PLAYLISTS.find((playlist) => playlist.id === playlistId)?.name || "선택한 플레이리스트";
}

function getSelectedCategories() {
  return [...document.querySelectorAll("input[name='category']:checked")].map(
    (input) => input.value,
  );
}

function getDateFilter(yearMode) {
  if (yearMode === "direct") {
    const years = [...document.querySelectorAll("input[name='directYear']:checked")]
      .map((input) => Number(input.value))
      .sort((a, b) => a - b);

    return createYearDateFilter(years);
  }

  if (state.yearPreset.recentMonths) {
    return createRecentDateFilter(state.yearPreset.recentMonths);
  }

  return createYearDateFilter(yearsBetween(Number(yearStartInput.value), Number(yearEndInput.value)));
}

async function buildSpotifyQueue(settings) {
  sourceStatus.textContent = `${settings.playlistName}에서 랜덤 후보 곡을 불러오는 중입니다.`;
  appendHarnessLog(`플레이리스트 후보 불러오기: ${settings.playlistName}`);

  const targetCandidateCount = Math.max(settings.songCount * 3, settings.songCount + 3);
  const candidates = settings.playlistId
    ? await fetchOwnedPlaylistCandidates(settings.playlistId, settings.playlistName)
    : await fetchSpotifyCandidates(
        settings.selectedCategories,
        settings.dateFilter,
        targetCandidateCount,
      );
  const shuffled = shuffleList(candidates);

  if (shuffled.length === 0) {
    return [];
  }

  const queue = selectDiverseQueue(shuffled, settings.songCount, new Set(state.recentTrackKeys));
  rememberRecentQueue(queue);
  const artistCount = new Set(queue.map(getPrimaryArtistKeyFromTrack).filter(Boolean)).size;
  const shortageMessage =
    queue.length < settings.songCount ? ` 요청한 ${settings.songCount}곡 중 ${queue.length}곡만 재생합니다.` : "";

  appendHarnessLog(`${settings.playlistName} 후보 ${candidates.length}곡 중 ${queue.length}곡 선택, 가수 ${artistCount}명`);
  sourceStatus.textContent = `${settings.playlistName} 후보 ${candidates.length}곡을 불러왔습니다.${shortageMessage} 첫 곡을 준비합니다.`;
  return queue;
}

function selectDiverseQueue(tracks, targetCount, avoidTrackKeys = new Set()) {
  const selectedKeys = new Set();
  const preferredTracks = tracks.filter((track) => !avoidTrackKeys.has(getTrackDedupeKey(track)));
  const fallbackTracks = tracks.filter((track) => avoidTrackKeys.has(getTrackDedupeKey(track)));
  const selected = selectDiverseTracks(preferredTracks, targetCount, selectedKeys);

  if (selected.length < targetCount) {
    selected.push(
      ...selectDiverseTracks(fallbackTracks, targetCount - selected.length, selectedKeys),
    );
  }

  return selected;
}

function selectDiverseTracks(tracks, targetCount, selectedKeys = new Set()) {
  const byArtist = new Map();

  tracks.forEach((track) => {
    const trackKey = getTrackDedupeKey(track);

    if (!trackKey || selectedKeys.has(trackKey)) {
      return;
    }

    const artistKey = getPrimaryArtistKeyFromTrack(track) || `unknown-${byArtist.size}`;

    if (!byArtist.has(artistKey)) {
      byArtist.set(artistKey, []);
    }

    byArtist.get(artistKey).push(track);
  });

  const buckets = shuffleList([...byArtist.values()].map((bucket) => shuffleList(bucket)));
  const selected = [];
  let madeProgress = true;

  while (selected.length < targetCount && madeProgress) {
    madeProgress = false;

    for (const bucket of buckets) {
      if (selected.length >= targetCount) {
        break;
      }

      const track = bucket.shift();

      if (track) {
        selected.push(track);
        selectedKeys.add(getTrackDedupeKey(track));
        madeProgress = true;
      }
    }
  }

  return selected;
}

function getTrackDedupeKey(track) {
  const artistKey = getPrimaryArtistKeyFromTrack(track);
  const titleKey = normalizeTrackTitle(track.title || "");

  return titleKey && artistKey ? `${titleKey}::${artistKey}` : "";
}

function rememberRecentQueue(queue) {
  const newKeys = queue.map(getTrackDedupeKey).filter(Boolean);

  state.recentTrackKeys = [
    ...newKeys,
    ...state.recentTrackKeys.filter((key) => !newKeys.includes(key)),
  ].slice(0, RECENT_QUEUE_HISTORY_LIMIT);
}

async function fetchOwnedPlaylistCandidates(playlistId, playlistName) {
  const token = await getSpotifyAccessToken();
  const items = await fetchPlaylistTrackItems(playlistId, token);
  appendHarnessLog(`${playlistName} 원본 ${items.length}곡 조회`);
  const playableItems = mergeSpotifyItems(items)
    .filter((item) => item.is_playable !== false)
    .filter((item) => !isLikelyAlternateVersion(item));

  appendHarnessLog(`${playlistName}에서 재생 가능한 후보 ${playableItems.length}곡 확보`);
  return playableItems.map((item) => spotifyItemToQuizTrack(item, [playlistName]));
}

async function fetchPlaylistTrackItems(playlistId, token) {
  const items = [];

  for (let offset = 0; offset < 500; offset += 100) {
    const params = new URLSearchParams({
      market: "KR",
      limit: "100",
      offset: String(offset),
    });
    const data = await spotifyApiFetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/items?${params}`,
      { token },
    );

    data.items
      ?.map((item) => item.track || item.item)
      .filter(Boolean)
      .forEach((item) => {
        items.push(item);
      });

    if (!data.next) {
      break;
    }
  }

  return items;
}

function getPrimaryArtistKeyFromTrack(track) {
  return normalizeArtistName((track.artist || "").split(",")[0] || "");
}

function shuffleList(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function handleQuizStartError(error) {
  const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
  clearTimer();
  state.phase = "idle";
  state.isPaused = false;
  state.currentIndex = -1;
  playerPanel.classList.remove("is-playing");
  roundLabel.textContent = "대기 중";
  timerLabel.textContent = "00:00";
  questionLabel.textContent = isSpotifyRateLimitMessage(message)
    ? "Spotify가 잠시 쉬라고 합니다"
    : "Spotify 검색에 문제가 생겼습니다";
  answerLabel.classList.add("hidden");
  sourceStatus.textContent = isSpotifyRateLimitMessage(message)
    ? message
    : `Spotify 검색 오류: ${message}`;
  updatePlaybackToggleButton();
  appendHarnessLog(`시작 오류: ${message}`);
}

function handleEmptyQueue() {
  clearTimer();
  state.phase = "idle";
  state.isPaused = false;
  state.currentIndex = -1;
  playerPanel.classList.remove("is-playing");
  roundLabel.textContent = "대기 중";
  timerLabel.textContent = "00:00";
  questionLabel.textContent = "조건에 맞는 곡이 없습니다";
  answerLabel.classList.add("hidden");
  sourceStatus.textContent =
    "Spotify에서 선택한 조건에 맞는 곡을 찾지 못했습니다. 연도나 카테고리를 넓혀주세요.";
  updatePlaybackToggleButton();
  appendHarnessLog(
    `빈 결과: ${describeCategories(state.settings.selectedCategories)} / ${describeDateFilter(
      state.settings.dateFilter,
    )}`,
  );
}

async function playNextTrack() {
  state.currentIndex += 1;

  if (state.currentIndex >= state.queue.length) {
    finishQuiz();
    return;
  }

  const track = state.queue[state.currentIndex];
  const startSecond = getStartSecond(track, state.settings.playFrom);
  const playSeconds = getPlaySeconds(track, startSecond, state.settings.playDuration);

  state.phase = "playing";
  state.isPaused = false;
  state.remainingSeconds = playSeconds;
  state.currentStartSecond = startSecond;
  state.currentPlaySeconds = playSeconds;
  playerPanel.classList.add("is-playing");
  answerLabel.classList.add("hidden");
  toggleAnswerButton.textContent = "정답 보기";
  roundLabel.textContent = `${state.currentIndex + 1} / ${state.queue.length} 곡`;
  modeLabel.textContent = `${describePlayFrom(state.settings.playFrom)}부터 재생`;
  questionLabel.textContent = "이 노래는 무엇일까요?";
  answerLabel.textContent = `${track.title} - ${track.artist}`;
  recordPlayedTrack(track);
  updatePlaybackToggleButton();
  appendHarnessLog(
    `${track.title} (${track.year}): ${formatTime(startSecond)}부터 ${formatTime(playSeconds)} 재생`,
  );

  try {
    await startActiveAudio(track, startSecond);
    tick();
  } catch (error) {
    clearTimer();
    state.phase = "idle";
    state.isPaused = false;
    playerPanel.classList.remove("is-playing");
    updatePlaybackToggleButton();
    sourceStatus.textContent = error.message;
    appendHarnessLog(`재생 오류: ${error.message}`);
  }
}

function getStartSecond(track, playFrom) {
  return playFrom === "highlight" ? track.highlightStart : 0;
}

function getPlaySeconds(track, startSecond, playDuration) {
  const remainingTrackSeconds = Math.max(track.durationSeconds - startSecond, 1);
  return playDuration === "full"
    ? remainingTrackSeconds
    : Math.min(playDuration, remainingTrackSeconds);
}

async function startBreakThenNext() {
  await stopActiveAudio();

  if (state.currentIndex >= state.queue.length - 1) {
    finishQuiz();
    return;
  }

  state.phase = "break";
  state.isPaused = false;
  state.remainingSeconds = state.settings.breakSeconds;
  playerPanel.classList.remove("is-playing");
  questionLabel.textContent = "잠깐 쉬는 중";
  answerLabel.classList.add("hidden");
  roundLabel.textContent = "다음 곡 준비";
  sourceStatus.textContent = "곡 사이 쉬는 시간입니다.";
  updatePlaybackToggleButton();
  appendHarnessLog(`${state.settings.breakSeconds}초 쉬고 다음 곡`);
  tick();
}

function tick() {
  timerLabel.textContent = formatTime(state.remainingSeconds);
  clearTimer();

  if (state.isPaused) {
    return;
  }

  if (state.remainingSeconds <= 0) {
    if (state.phase === "playing") {
      startBreakThenNext();
      return;
    }

    if (state.phase === "break") {
      playNextTrack();
      return;
    }

    if (state.phase === "reviewing") {
      finishResultPlayback();
      return;
    }
  }

  state.timerId = window.setTimeout(() => {
    state.remainingSeconds -= 1;
    tick();
  }, 1000);
}

async function finishQuiz() {
  clearTimer();
  await stopActiveAudio();
  state.phase = "finished";
  state.isPaused = false;
  state.reviewTrack = null;
  playerPanel.classList.remove("is-playing");
  playerPanel.classList.add("has-results");
  roundLabel.textContent = "완료";
  timerLabel.textContent = "00:00";
  questionLabel.textContent = "퀴즈가 끝났어요";
  modeLabel.textContent = "정답 모아보기";
  sourceStatus.textContent = `${state.playedTracks.length}곡을 들었습니다. 노래를 누르면 처음부터 전곡 재생합니다.`;
  answerLabel.classList.add("hidden");
  clearActiveResultButton();
  renderQuizResults();
  updatePlaybackToggleButton();
  appendHarnessLog("퀴즈 종료");
}

function recordPlayedTrack(track) {
  const trackKey = getTrackDedupeKey(track) || `${track.title}::${track.artist}`;

  if (state.playedTracks.some((playedTrack) => playedTrack.resultKey === trackKey)) {
    return;
  }

  state.playedTracks.push({
    ...track,
    resultKey: trackKey,
  });
}

function resetQuizResults() {
  state.playedTracks = [];
  state.reviewTrack = null;
  quizResults.hidden = true;
  quizResultList.replaceChildren();
  quizResultsCount.textContent = "0곡";
  playerPanel.classList.remove("has-results");
  clearActiveResultButton();
}

function renderQuizResults() {
  quizResultList.replaceChildren(
    ...state.playedTracks.map((track, index) => createQuizResultItem(track, index)),
  );
  quizResultsCount.textContent = `${state.playedTracks.length}곡`;
  quizResults.hidden = state.playedTracks.length === 0;
}

function createQuizResultItem(track, index) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  const number = document.createElement("span");
  const main = document.createElement("span");
  const title = document.createElement("strong");
  const artist = document.createElement("span");
  const meta = document.createElement("span");

  button.type = "button";
  button.className = "result-track-button";
  button.dataset.resultIndex = String(index);
  button.setAttribute("aria-label", `${track.title} - ${track.artist} 전체 재생`);
  number.className = "result-number";
  number.textContent = String(index + 1).padStart(2, "0");
  main.className = "result-track-main";
  title.className = "result-title";
  title.textContent = track.title;
  artist.className = "result-artist";
  artist.textContent = track.artist;
  meta.className = "result-meta";
  meta.textContent = `${track.year} · ${formatTime(track.durationSeconds)}`;

  main.append(title, artist);
  button.append(number, main, meta);
  item.append(button);

  return item;
}

async function playFullResultTrack(track, resultButton) {
  clearTimer();
  await stopActiveAudio();

  state.phase = "reviewing";
  state.isPaused = false;
  state.reviewTrack = track;
  state.currentStartSecond = 0;
  state.currentPlaySeconds = track.durationSeconds;
  state.remainingSeconds = track.durationSeconds;

  playerPanel.classList.add("is-playing", "has-results");
  roundLabel.textContent = "전체 듣기";
  timerLabel.textContent = formatTime(state.remainingSeconds);
  modeLabel.textContent = "처음부터 전곡 재생";
  questionLabel.textContent = "전체 재생 중";
  answerLabel.textContent = `${track.title} - ${track.artist}`;
  answerLabel.classList.remove("hidden");
  setActiveResultButton(resultButton);
  updatePlaybackToggleButton();

  try {
    sourceStatus.textContent = `${track.title} 전체 재생을 시작합니다.`;
    await startActiveAudio(track, 0);
    sourceStatus.textContent = `${track.title} 전체 재생 중입니다.`;
    appendHarnessLog(`전체 듣기: ${track.title} - ${track.artist}`);
    tick();
  } catch (error) {
    clearTimer();
    state.phase = "finished";
    state.isPaused = false;
    state.reviewTrack = null;
    playerPanel.classList.remove("is-playing");
    sourceStatus.textContent = error.message;
    clearActiveResultButton();
    updatePlaybackToggleButton();
    appendHarnessLog(`전체 듣기 오류: ${error.message}`);
  }
}

async function finishResultPlayback() {
  clearTimer();
  await stopActiveAudio();
  state.phase = "finished";
  state.isPaused = false;
  state.reviewTrack = null;
  playerPanel.classList.remove("is-playing");
  roundLabel.textContent = "완료";
  timerLabel.textContent = "00:00";
  modeLabel.textContent = "정답 모아보기";
  questionLabel.textContent = "퀴즈가 끝났어요";
  answerLabel.classList.add("hidden");
  sourceStatus.textContent = "전체 듣기를 마쳤습니다. 다른 노래를 눌러 계속 들을 수 있습니다.";
  clearActiveResultButton();
  updatePlaybackToggleButton();
}

function setActiveResultButton(resultButton) {
  clearActiveResultButton();
  resultButton.classList.add("is-active");
}

function clearActiveResultButton() {
  quizResultList.querySelectorAll(".is-active").forEach((button) => {
    button.classList.remove("is-active");
  });
}

function clearTimer() {
  if (state.timerId) {
    window.clearTimeout(state.timerId);
    state.timerId = null;
  }
}

function canTogglePlayback() {
  return state.phase === "playing" || state.phase === "break" || state.phase === "reviewing";
}

async function pausePlayback() {
  clearTimer();
  state.isPaused = true;
  playerPanel.classList.remove("is-playing");

  if (state.phase === "playing" || state.phase === "reviewing") {
    await pauseActiveAudio();
    sourceStatus.textContent =
      state.phase === "reviewing" ? "전체 듣기를 일시정지했습니다." : "일시정지 중입니다.";
  } else {
    sourceStatus.textContent = "곡 사이 쉬는 시간이 일시정지되었습니다.";
  }

  appendHarnessLog("일시정지");
  updatePlaybackToggleButton();
}

async function resumePlayback() {
  state.isPaused = false;

  if (state.phase === "playing" || state.phase === "reviewing") {
    const track = state.phase === "reviewing" ? state.reviewTrack : state.queue[state.currentIndex];

    if (!track) {
      state.phase = "finished";
      updatePlaybackToggleButton();
      return;
    }

    const elapsedSeconds = state.currentPlaySeconds - state.remainingSeconds;
    await resumeActiveAudio(track, state.currentStartSecond + elapsedSeconds);
    playerPanel.classList.add("is-playing");
    sourceStatus.textContent =
      state.phase === "reviewing"
        ? `${track.title} 전체 재생 중입니다.`
        : "Spotify로 실제 음원 재생 중입니다.";
  } else {
    sourceStatus.textContent = "곡 사이 쉬는 시간입니다.";
  }

  appendHarnessLog("다시 시작");
  updatePlaybackToggleButton();
  tick();
}

function updatePlaybackToggleButton() {
  togglePlaybackButton.disabled = !canTogglePlayback();
  togglePlaybackButton.textContent = state.isPaused ? "시작" : "일시정지";

  if (!canTogglePlayback()) {
    togglePlaybackButton.textContent = "시작";
  }

  updateActionButtons();
}

function updateActionButtons() {
  toggleAnswerButton.disabled = !canShowAnswer();
  nextSongButton.disabled = !canMoveNext();
}

function canShowAnswer() {
  return (
    state.currentIndex >= 0 &&
    state.currentIndex < state.queue.length &&
    (state.phase === "playing" || state.phase === "break")
  );
}

function canMoveNext() {
  return (
    state.currentIndex >= 0 &&
    state.currentIndex < state.queue.length &&
    (state.phase === "playing" || state.phase === "break")
  );
}

async function startActiveAudio(track, startSecond) {
  await startSpotifyTrack(track, startSecond);
  sourceStatus.textContent = "Spotify로 실제 음원 재생 중입니다.";
  setSpotifyStatus("Spotify 재생 중입니다.");
}

async function pauseActiveAudio() {
  await safelyPauseSpotifyPlayer("일시정지");
}

async function resumeActiveAudio(track, startSecond) {
  await state.spotify.player?.resume();
  await state.spotify.player?.seek(Math.max(0, Math.floor(startSecond * 1000)));
}

async function stopActiveAudio() {
  await safelyPauseSpotifyPlayer("정지");
}

async function safelyPauseSpotifyPlayer(actionLabel) {
  try {
    await state.spotify.player?.pause();
  } catch (error) {
    if (isIgnorableSpotifyNoListError(error.message)) {
      appendHarnessLog(`Spotify ${actionLabel} 경고 무시: ${error.message}`);
      return;
    }

    appendHarnessLog(`Spotify ${actionLabel} 오류: ${error.message}`);
  }
}

function isIgnorableSpotifyNoListError(message) {
  return /no list was loaded|cannot perform operation/i.test(message || "");
}

function updateIdleSourceStatus() {
  if (state.phase !== "idle" && state.phase !== "finished") {
    return;
  }

  sourceStatus.textContent = "Spotify 로그인 후 퀴즈를 시작하세요.";
}

function initializeYearControls() {
  allYears.forEach((year) => {
    yearStartInput.append(createYearOption(year));
    yearEndInput.append(createYearOption(year));
    yearDirectGrid.append(createYearChip(year));
  });

  setRecentRange(RECENT_MONTHS);
  state.yearPreset.recentMonths = RECENT_MONTHS;
  setDirectYears(createRecentDateFilter(RECENT_MONTHS).years);
  updateYearMode();
}

function createYearOption(year) {
  const option = document.createElement("option");
  option.value = String(year);
  option.textContent = String(year);
  return option;
}

function createYearChip(year) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  const text = document.createElement("span");

  input.type = "checkbox";
  input.name = "directYear";
  input.value = String(year);
  input.addEventListener("change", updateYearSummary);
  text.textContent = String(year);
  label.append(input, text);

  return label;
}

function updateYearMode() {
  const yearMode = document.querySelector("input[name='yearMode']:checked").value;
  yearRangePanel.hidden = yearMode !== "range";
  yearDirectPanel.hidden = yearMode !== "direct";

  if (yearMode === "direct") {
    state.yearPreset.recentMonths = null;
  }

  updateYearSummary();
}

function setYearMode(mode) {
  const modeInput = document.querySelector(`input[name='yearMode'][value='${mode}']`);
  modeInput.checked = true;
  updateYearMode();
}

function setYearRange(start, end) {
  yearStartInput.value = String(start);
  yearEndInput.value = String(end);
}

function setRecentRange(months) {
  const dateFilter = createRecentDateFilter(months);
  setYearRange(dateFilter.startYear, dateFilter.endYear);
  setDirectYears(dateFilter.years);
}

function setDirectYears(years) {
  const selected = new Set(years.map(Number));
  document.querySelectorAll("input[name='directYear']").forEach((input) => {
    input.checked = selected.has(Number(input.value));
  });
}

function normalizeYearRange() {
  const start = Number(yearStartInput.value);
  const end = Number(yearEndInput.value);

  if (start <= end) {
    return;
  }

  setYearRange(end, start);
}

function updateYearSummary() {
  const yearMode = document.querySelector("input[name='yearMode']:checked").value;
  const dateFilter = getDateFilter(yearMode);
  yearSummary.textContent = describeDateFilter(dateFilter);
}

function createRecentDateFilter(months) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - months);

  return {
    mode: "recent",
    months,
    startDate,
    endDate,
    startYear: startDate.getFullYear(),
    endYear: endDate.getFullYear(),
    years: yearsBetween(startDate.getFullYear(), endDate.getFullYear()),
  };
}

function createYearDateFilter(years) {
  const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

  if (uniqueYears.length === 0) {
    return {
      mode: "all",
      years: [],
    };
  }

  return {
    mode: "years",
    years: uniqueYears,
    startYear: uniqueYears[0],
    endYear: uniqueYears[uniqueYears.length - 1],
  };
}

function yearsBetween(start, end) {
  const from = Math.max(Math.min(start, end), YEAR_START);
  const to = Math.min(Math.max(start, end), YEAR_END);

  return allYears.filter((year) => year >= from && year <= to);
}

async function prepareSpotifyForQuiz() {
  if (!getSpotifyClientId()) {
    setSpotifyStatus("Client ID를 입력하고 저장한 뒤 Spotify 로그인을 해주세요.");
    sourceStatus.textContent = "Spotify Client ID가 필요합니다.";
    return false;
  }

  if (!state.spotify.token) {
    setSpotifyStatus("Spotify 로그인이 필요합니다.");
    sourceStatus.textContent = "Spotify 로그인을 먼저 해주세요.";
    return false;
  }

  try {
    await getSpotifyAccessToken();
    await initializeSpotifyPlayerIfPossible();
  } catch (error) {
    setSpotifyStatus(error.message);
    sourceStatus.textContent = error.message;
    return false;
  }

  if (!state.spotify.deviceId) {
    if (state.spotify.lastError) {
      setSpotifyStatus(state.spotify.lastError);
      sourceStatus.textContent = state.spotify.lastError;
      return false;
    }

    setSpotifyStatus("Spotify 플레이어를 준비 중입니다. 잠시 후 다시 시작해보세요.");
    sourceStatus.textContent = "Spotify 플레이어 준비 중입니다.";
    return false;
  }

  await state.spotify.player?.activateElement?.();
  return true;
}

async function startSpotifyTrack(track, startSecond) {
  const spotifyTrack = await resolveSpotifyTrack(track);
  const token = await getSpotifyAccessToken();
  const positionMs = Math.max(0, Math.floor(startSecond * 1000));

  await spotifyApiFetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    token,
    body: JSON.stringify({
      device_ids: [state.spotify.deviceId],
      play: false,
    }),
  });
  await delay(250);
  await spotifyApiFetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(state.spotify.deviceId)}`,
    {
      method: "PUT",
      token,
      body: JSON.stringify({
        uris: [spotifyTrack.uri],
        position_ms: positionMs,
      }),
    },
  );
}

async function resolveSpotifyTrack(track) {
  if (track.spotifyUri) {
    return {
      uri: track.spotifyUri,
      name: track.title,
      id: track.spotifyId,
    };
  }

  const cacheKey = `${track.title}::${track.artist}`;

  if (state.spotify.resolvedTracks.has(cacheKey)) {
    return state.spotify.resolvedTracks.get(cacheKey);
  }

  const token = await getSpotifyAccessToken();
  const exactQuery = `track:"${track.title}" artist:"${track.artist}"`;
  const fallbackQuery = `${track.title} ${track.artist}`;
  const exactResult = await searchSpotifyTrack(exactQuery, token);
  const spotifyTrack = exactResult || (await searchSpotifyTrack(fallbackQuery, token));

  if (!spotifyTrack) {
    throw new Error(`Spotify에서 "${track.title}" 곡을 찾지 못했습니다.`);
  }

  state.spotify.resolvedTracks.set(cacheKey, spotifyTrack);
  appendHarnessLog(`Spotify 매칭: ${track.title} -> ${spotifyTrack.name}`);
  return spotifyTrack;
}

async function fetchSpotifyCandidates(selectedCategories, dateFilter, targetCount, options = {}) {
  const token = await getSpotifyAccessToken();
  const playlistItems = selectedCategories.includes("korea-top100")
    ? await fetchKoreaTopPlaylistItems(token, dateFilter)
    : [];
  const shouldUseKoreaTopSearchFallback =
    selectedCategories.includes("korea-top100") && playlistItems.length === 0;
  const searchDateFilter = shouldUseKoreaTopSearchFallback
    ? getKoreaTopPlaylistDateFilter(dateFilter)
    : dateFilter;
  const queries = shouldUseKoreaTopSearchFallback
    ? buildKoreaTopSearchFallbackQueries(selectedCategories, searchDateFilter)
    : buildSpotifyCandidateQueries(selectedCategories, searchDateFilter);
  const items = await fetchSpotifyCandidateItems(queries, token, searchDateFilter, targetCount);
  let filteredItems = await filterSpotifyCandidateItems(
    mergeSpotifyItems(playlistItems, items),
    selectedCategories,
    token,
  );

  if (filteredItems.length < targetCount) {
    appendHarnessLog("정밀 검색 후보 부족, 완화 검색 시작");
    const relaxedQueries = shouldUseKoreaTopSearchFallback
      ? buildKoreaTopSearchFallbackQueries(selectedCategories, searchDateFilter, true)
      : buildSpotifyRelaxedCandidateQueries(selectedCategories, searchDateFilter);
    const relaxedItems = await fetchSpotifyCandidateItems(
      relaxedQueries,
      token,
      searchDateFilter,
      targetCount,
    );
    const relaxedFilteredItems = await filterSpotifyCandidateItems(
      relaxedItems,
      selectedCategories,
      token,
    );
    filteredItems = mergeSpotifyItems(filteredItems, relaxedFilteredItems);
  }

  const selectedItems = filteredItems.slice(0, Math.max(targetCount * 2, targetCount));

  if (options.rawItems) {
    return selectedItems;
  }

  return selectedItems.map((item) => spotifyItemToQuizTrack(item, selectedCategories));
}

async function fetchKoreaTopPlaylistItems(token, dateFilter) {
  const items = [];
  const playlistDateFilter = getKoreaTopPlaylistDateFilter(dateFilter);

  for (const playlistId of KOREA_TOP_PLAYLIST_IDS) {
    if (state.spotify.unavailablePlaylists.has(playlistId)) {
      continue;
    }

    for (const offset of [0]) {
      try {
        const params = new URLSearchParams({
          market: "KR",
          limit: "50",
          offset: String(offset),
          fields:
            "items(track(id,name,uri,is_playable,duration_ms,album(name,release_date),artists(id,name)))",
        });
        const data = await spotifyApiFetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks?${params}`,
          { token },
        );

        data.items
          ?.map((item) => item.track)
          .filter(Boolean)
          .filter((item) => item.is_playable !== false)
          .filter((item) => matchesSpotifyResultDate(item, playlistDateFilter))
          .forEach((item) => {
            items.push(item);
          });
      } catch (error) {
        appendHarnessLog(`한국 Top 100 플레이리스트 조회 실패: ${error.message}`);

        if (/403|Forbidden|권한/.test(error.message)) {
          state.spotify.unavailablePlaylists.add(playlistId);
        }
      }
    }
  }

  if (items.length === 0) {
    items.push(...(await fetchKoreaTopFallbackPlaylistItems(token, playlistDateFilter)));
  }

  if (items.length > 0) {
    appendHarnessLog(`한국 Top 100 후보 ${items.length}곡 확보`);
  }

  return mergeSpotifyItems(items);
}

function getKoreaTopPlaylistDateFilter(dateFilter) {
  if (dateFilter.mode === "recent") {
    return createYearDateFilter(yearsBetween(YEAR_START, YEAR_END));
  }

  return dateFilter;
}

async function fetchKoreaTopFallbackPlaylistItems(token, dateFilter) {
  const playlistIds = await searchKoreaTopFallbackPlaylistIds(token);
  const items = [];

  for (const playlistId of playlistIds) {
    if (state.spotify.unavailablePlaylists.has(playlistId)) {
      continue;
    }

    try {
      const params = new URLSearchParams({
        market: "KR",
        limit: "50",
        offset: "0",
        fields:
          "items(track(id,name,uri,is_playable,duration_ms,album(name,release_date),artists(id,name)))",
      });
      const data = await spotifyApiFetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?${params}`,
        { token },
      );

      data.items
        ?.map((item) => item.track)
        .filter(Boolean)
        .filter((item) => item.is_playable !== false)
        .filter((item) => matchesSpotifyResultDate(item, dateFilter))
        .forEach((item) => {
          items.push(item);
        });
    } catch (error) {
      appendHarnessLog(`대체 Top 100 플레이리스트 조회 실패: ${error.message}`);

      if (/403|Forbidden|권한/.test(error.message)) {
        state.spotify.unavailablePlaylists.add(playlistId);
      }
    }

    if (items.length >= 50) {
      break;
    }
  }

  if (items.length > 0) {
    appendHarnessLog(`대체 Top 100 후보 ${items.length}곡 확보`);
  }

  return mergeSpotifyItems(items);
}

async function searchKoreaTopFallbackPlaylistIds(token) {
  const byId = new Map();

  for (const query of KOREA_TOP_FALLBACK_PLAYLIST_QUERIES) {
    try {
      const params = new URLSearchParams({
        q: query,
        type: "playlist",
        market: "KR",
        limit: "5",
      });
      const data = await spotifyApiFetch(`https://api.spotify.com/v1/search?${params}`, {
        token,
      });

      (data.playlists?.items || [])
        .filter(isUsefulKoreaTopPlaylist)
        .forEach((playlist) => {
          byId.set(playlist.id, playlist);
        });
    } catch (error) {
      appendHarnessLog(`대체 Top 100 검색 실패: ${query} / ${error.message}`);
    }

    if (byId.size >= KOREA_TOP_FALLBACK_PLAYLIST_LIMIT) {
      break;
    }
  }

  return [...byId.keys()].slice(0, KOREA_TOP_FALLBACK_PLAYLIST_LIMIT);
}

function isUsefulKoreaTopPlaylist(playlist) {
  if (!playlist?.id) {
    return false;
  }

  const text = `${playlist.name || ""} ${playlist.description || ""} ${
    playlist.owner?.display_name || ""
  }`.toLowerCase();
  const looksLikeKoreaChart =
    /korea|korean|south korea|melon|한국|국내|멜론|차트|실시간/.test(text) &&
    /top\s*100|top\s*50|chart|charts|hot hits|차트|인기/.test(text);
  const looksLikeNoise = /piano|sleep|study|lofi|workout|cover|karaoke|instrumental/.test(text);

  return looksLikeKoreaChart && !looksLikeNoise;
}

function mergeSpotifyItems(...itemGroups) {
  const byKey = new Map();

  itemGroups.flat().forEach((item) => {
    const key = getSpotifyItemDedupeKey(item);

    if (key && !byKey.has(key)) {
      byKey.set(key, item);
    }
  });

  return [...byKey.values()];
}

function getSpotifyItemDedupeKey(item) {
  if (!item?.id) {
    return "";
  }

  const artistName = item.artists?.[0]?.name || "";
  return `${normalizeTrackTitle(item.name)}::${normalizeArtistName(artistName)}`;
}

function normalizeTrackTitle(title) {
  return title
    .toLowerCase()
    .replace(/\([^)]*(remaster|sped|slowed|instrumental|karaoke|live|mix|version|edit)[^)]*\)/g, "")
    .replace(/\[[^\]]*(remaster|sped|slowed|instrumental|karaoke|live|mix|version|edit)[^\]]*\]/g, "")
    .replace(/\s+-\s+.*\b(remaster|sped|slowed|instrumental|karaoke|live|mix|remix|version|edit)\b.*$/g, "")
    .replace(/[^a-z0-9\uac00-\ud7a3]+/g, " ")
    .trim();
}

async function fetchSpotifyCandidateItems(queries, token, dateFilter, targetCount) {
  const rawById = new Map();
  const failures = [];
  const stopRawCount = Math.max(targetCount * 6, 30);

  for (let index = 0; index < queries.length; index += SPOTIFY_SEARCH_BATCH_SIZE) {
    const batch = queries.slice(index, index + SPOTIFY_SEARCH_BATCH_SIZE);
    const searchedCount = Math.min(index + batch.length, queries.length);
    sourceStatus.textContent = `Spotify 후보 검색 중입니다. (${searchedCount}/${queries.length})`;

    const results = await Promise.allSettled(
      batch.map((query) =>
        searchSpotifyTracks(query, token, SPOTIFY_SEARCH_LIMIT).then((items) => ({
          query,
          items,
        })),
      ),
    );

    results.forEach((result, resultIndex) => {
      const query = batch[resultIndex];

      if (result.status === "rejected") {
        failures.push(result.reason);
        appendHarnessLog(`검색 실패: ${query}`);
        return;
      }

      result.value.items
        .filter((item) => item.is_playable !== false)
        .filter((item) => matchesSpotifyResultDate(item, dateFilter))
        .forEach((item) => {
          rawById.set(item.id, item);
        });
    });

    if (rawById.size >= stopRawCount) {
      appendHarnessLog(`빠른 검색 충분: ${rawById.size}곡 확보`);
      break;
    }
  }

  if (rawById.size === 0 && failures.length === queries.length) {
    const firstFailure = failures[0] instanceof Error ? failures[0].message : "네트워크 오류";
    throw new Error(`Spotify 후보 검색 요청이 실패했습니다. ${firstFailure}`);
  }

  appendHarnessLog(`Spotify 날짜 필터 통과 후보 ${rawById.size}곡`);
  return [...rawById.values()];
}

async function filterSpotifyCandidateItems(items, selectedCategories, token) {
  if (items.length === 0) {
    return [];
  }

  const limitedItems = items.slice(0, SPOTIFY_ARTIST_FILTER_LIMIT);
  const artistGenreMap = await buildArtistGenreMap(limitedItems, selectedCategories, token);
  const trackFeatureMap = await buildTrackFeatureMap(limitedItems, selectedCategories, token);

  return limitedItems.filter((item) =>
    matchesSpotifyResultCategories(item, selectedCategories, artistGenreMap, trackFeatureMap),
  );
}

async function buildArtistGenreMap(items, selectedCategories, token) {
  const artistGenreMap = new Map();

  if (!shouldLookupArtistGenres(selectedCategories)) {
    return artistGenreMap;
  }

  const artistIds = [
    ...new Set(
      items
        .flatMap((item) => item.artists || [])
        .map((artist) => artist.id)
        .filter(Boolean),
    ),
  ].slice(0, SPOTIFY_ARTIST_GENRE_LOOKUP_LIMIT);

  for (let index = 0; index < artistIds.length; index += SPOTIFY_SEARCH_BATCH_SIZE) {
    const batch = artistIds.slice(index, index + SPOTIFY_SEARCH_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (artistId) => ({
        artistId,
        genres: await fetchSpotifyArtistGenres(artistId, token),
      })),
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        artistGenreMap.set(result.value.artistId, result.value.genres);
      }
    });

    if (index + SPOTIFY_SEARCH_BATCH_SIZE < artistIds.length) {
      await delay(250);
    }
  }

  return artistGenreMap;
}

function shouldLookupArtistGenres(selectedCategories) {
  return (
    SPOTIFY_ARTIST_GENRE_LOOKUP_LIMIT > 0 &&
    selectedCategories.some(
      (category) =>
        filterGroups.style.includes(category) ||
        category === "japan" ||
        category === "western" ||
        category === "korea",
    )
  );
}

async function fetchSpotifyArtistGenres(artistId, token) {
  if (state.spotify.artistGenres.has(artistId)) {
    return state.spotify.artistGenres.get(artistId);
  }

  try {
    const data = await spotifyApiFetch(
      `https://api.spotify.com/v1/artists/${encodeURIComponent(artistId)}`,
      { token },
    );
    const genres = (data.genres || []).map((genre) => genre.toLowerCase());
    state.spotify.artistGenres.set(artistId, genres);
    return genres;
  } catch {
    state.spotify.artistGenres.set(artistId, []);
    return [];
  }
}

async function buildTrackFeatureMap(items, selectedCategories, token) {
  const trackFeatureMap = new Map();

  if (!shouldLookupTrackFeatures(selectedCategories)) {
    return trackFeatureMap;
  }

  const trackIds = [...new Set(items.map((item) => item.id).filter(Boolean))].slice(
    0,
    SPOTIFY_AUDIO_FEATURE_LOOKUP_LIMIT,
  );

  for (let index = 0; index < trackIds.length; index += SPOTIFY_SEARCH_BATCH_SIZE) {
    const batch = trackIds.slice(index, index + SPOTIFY_SEARCH_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (trackId) => ({
        trackId,
        features: await fetchSpotifyTrackAudioFeatures(trackId, token),
      })),
    );

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value.features) {
        trackFeatureMap.set(result.value.trackId, result.value.features);
      }
    });

    if (index + SPOTIFY_SEARCH_BATCH_SIZE < trackIds.length) {
      await delay(250);
    }
  }

  return trackFeatureMap;
}

function shouldLookupTrackFeatures(selectedCategories) {
  return (
    SPOTIFY_AUDIO_FEATURE_LOOKUP_LIMIT > 0 &&
    selectedCategories.some((category) => category === "dance" || category === "ballad")
  );
}

async function fetchSpotifyTrackAudioFeatures(trackId, token) {
  if (state.spotify.audioFeatures.has(trackId)) {
    return state.spotify.audioFeatures.get(trackId);
  }

  try {
    const features = await spotifyApiFetch(
      `https://api.spotify.com/v1/audio-features/${encodeURIComponent(trackId)}`,
      { token },
    );
    state.spotify.audioFeatures.set(trackId, features);
    return features;
  } catch {
    state.spotify.audioFeatures.set(trackId, null);
    return null;
  }
}

function buildSpotifyCandidateQueries(selectedCategories, dateFilter) {
  const countries = selectedCategories.filter((category) => filterGroups.country.includes(category));
  const charts = selectedCategories.filter((category) => filterGroups.chart.includes(category));
  const styles = selectedCategories.filter((category) => filterGroups.style.includes(category));
  const artistTypes = selectedCategories.filter((category) => filterGroups.artist.includes(category));
  const countryTerms = takeUniqueTerms(
    countries.length > 0 ? countries.flatMap(getSpotifyCountryTerms) : ["pop"],
    3,
  );
  const chartTerms = takeUniqueTerms(charts.flatMap(getSpotifyChartTerms), 3);
  const styleTerms = takeUniqueTerms(
    styles.length > 0 ? styles.flatMap(getSpotifyStyleTerms) : [""],
    3,
  );
  const artistTerms = takeUniqueTerms(
    shuffleList(artistTypes.flatMap((category) => getSpotifyArtistTerms(category, styles))),
    8,
  );
  const yearTerms = getSpotifyYearTerms(dateFilter);
  const baseTerms = [];
  const shouldUseBroadArtistSearch = !styles.some(
    (style) => style === "dance" || style === "electronic",
  );

  artistTerms.forEach((artistTerm) => {
    baseTerms.push([artistTerm, countryTerms[0], styleTerms[0]].filter(Boolean).join(" "));
    baseTerms.push([artistTerm, styleTerms[0]].filter(Boolean).join(" "));

    if (shouldUseBroadArtistSearch) {
      baseTerms.push(artistTerm);
    }
  });

  countryTerms.forEach((countryTerm) => {
    if (styles.length === 0) {
      baseTerms.push(countryTerm);
      return;
    }

    styleTerms.forEach((styleTerm) => {
      baseTerms.push([countryTerm, styleTerm].filter(Boolean).join(" "));
    });
  });

  chartTerms.forEach((chartTerm) => {
    baseTerms.push(chartTerm);
    countryTerms.slice(0, 2).forEach((countryTerm) => {
      baseTerms.push([countryTerm, chartTerm].filter(Boolean).join(" "));
    });
  });

  if (countries.length === 0 && styles.length > 0) {
    styleTerms.forEach((styleTerm) => {
      baseTerms.push(styleTerm);
    });
  }

  if (baseTerms.length === 0) {
    baseTerms.push("pop");
  }

  return appendSpotifyYearTerms(baseTerms, yearTerms).slice(0, SPOTIFY_MAX_QUERY_COUNT);
}

function buildSpotifyRelaxedCandidateQueries(selectedCategories, dateFilter) {
  const countries = selectedCategories.filter((category) => filterGroups.country.includes(category));
  const charts = selectedCategories.filter((category) => filterGroups.chart.includes(category));
  const styles = selectedCategories.filter((category) => filterGroups.style.includes(category));
  const artistTypes = selectedCategories.filter((category) => filterGroups.artist.includes(category));
  const countryTerms = takeUniqueTerms(
    countries.length > 0 ? countries.flatMap(getSpotifyCountryTerms) : ["pop"],
    2,
  );
  const chartTerms = takeUniqueTerms(charts.flatMap(getSpotifyChartTerms), 2);
  const styleTerms = takeUniqueTerms(
    styles.flatMap(getSpotifyStyleTerms),
    2,
  );
  const artistTerms = takeUniqueTerms(
    shuffleList(artistTypes.flatMap((category) => getSpotifyArtistTerms(category, styles))),
    4,
  );
  const baseTerms = [
    ...countryTerms,
    ...countryTerms.flatMap((countryTerm) =>
      [...chartTerms, ...styleTerms].map((term) =>
        [countryTerm, term].filter(Boolean).join(" "),
      ),
    ),
    ...chartTerms,
    ...styleTerms,
    ...artistTerms.map(formatSpotifyArtistTerm),
    "top hits",
  ];

  return appendSpotifyYearTerms(baseTerms, getSpotifyYearTerms(dateFilter)).slice(
    0,
    SPOTIFY_MAX_RELAXED_QUERY_COUNT,
  );
}

function buildKoreaTopSearchFallbackQueries(selectedCategories, dateFilter, relaxed = false) {
  const styles = selectedCategories.filter((category) => filterGroups.style.includes(category));
  const artistTypes = selectedCategories.filter((category) => filterGroups.artist.includes(category));
  const fallbackArtistPool =
    artistTypes.length > 0
      ? artistTypes.flatMap((category) => getKoreaTopFallbackArtistTerms(category))
      : getKoreaTopGeneralFallbackArtistTerms();
  const artistTerms = takeUniqueTerms(
    shuffleList(fallbackArtistPool),
    relaxed ? 6 : KOREA_TOP_SEARCH_FALLBACK_QUERY_COUNT,
  );
  const baseTerms = [];
  const wantsDance = styles.includes("dance") || styles.includes("electronic");

  artistTerms.forEach((artistTerm) => {
    baseTerms.push(formatSpotifyArtistTerm(artistTerm));
  });

  if (artistTerms.length === 0) {
    baseTerms.push(
      "genre:k-pop",
      "k-pop top hits",
      wantsDance ? "k-pop hits" : "korean pop hits",
      "popular k-pop",
    );
  }

  if (relaxed) {
    baseTerms.push(
      ...artistTypes.map((category) => getSpotifyArtistTerms(category, styles)).flat(),
      "k-pop",
      "korean pop",
    );
  }

  return appendSpotifyYearTerms(baseTerms, getSpotifyYearTerms(dateFilter)).slice(
    0,
    relaxed ? SPOTIFY_MAX_RELAXED_QUERY_COUNT : KOREA_TOP_SEARCH_FALLBACK_QUERY_COUNT,
  );
}

function getKoreaTopGeneralFallbackArtistTerms() {
  return [
    ...getKoreaTopFallbackArtistTerms("girl-group").slice(0, 8),
    ...getKoreaTopFallbackArtistTerms("boy-group").slice(0, 8),
    "JENNIE",
    "LISA",
    "CHUNG HA",
    "SOMI",
    "SUNMI",
    "JUNG KOOK",
    "Jimin",
    "G-DRAGON",
    "ZICO",
    "TAEMIN",
  ];
}

function getKoreaTopFallbackArtistTerms(category) {
  return {
    "girl-group": [
      "aespa",
      "IVE",
      "LE SSERAFIM",
      "NewJeans",
      "ILLIT",
      "NMIXX",
      "BABYMONSTER",
      "KISS OF LIFE",
      "(G)I-DLE",
      "TWICE",
      "BLACKPINK",
      "ITZY",
    ],
    "boy-group": [
      "BTS",
      "SEVENTEEN",
      "Stray Kids",
      "NCT DREAM",
      "NCT 127",
      "RIIZE",
      "ENHYPEN",
      "TOMORROW X TOGETHER",
      "TWS",
      "BOYNEXTDOOR",
      "ATEEZ",
      "ZEROBASEONE",
    ],
    "female-solo": ["JENNIE", "LISA", "IU", "TAEYEON", "BIBI", "CHUNG HA", "SOMI", "SUNMI"],
    "male-solo": ["JUNG KOOK", "Jimin", "G-DRAGON", "ZICO", "TAEMIN", "KAI"],
    band: ["DAY6", "QWER", "LUCY", "N.Flying"],
    "mixed-duo": ["AKMU", "BOL4"],
  }[category] || [];
}

function takeUniqueTerms(terms, count) {
  return [...new Set(terms.filter(Boolean))].slice(0, count);
}

function appendSpotifyYearTerms(baseTerms, yearTerms) {
  const queries = [];

  baseTerms.forEach((baseTerm) => {
    yearTerms.forEach((yearTerm) => {
      const query = [baseTerm, yearTerm].filter(Boolean).join(" ").trim();

      if (query) {
        queries.push(query);
      }
    });
  });

  return [...new Set(queries)];
}

function getSpotifyCountryTerms(category) {
  return {
    korea: ["genre:k-pop", "k-pop", "korean pop", "kpop"],
    japan: ["genre:j-pop", "j-pop", "japanese pop"],
    western: ["pop", "us pop", "uk pop"],
    global: ["global pop", "viral pop", "top hits"],
  }[category];
}

function getSpotifyChartTerms(category) {
  return {
    "korea-top100": [
      "Hot Hits Korea",
      "Top 50 South Korea",
      "Top Songs South Korea",
      "korea top 100",
    ],
    "shorts-challenge": ["viral korea", "tiktok korea", "shorts challenge", "viral k-pop"],
  }[category];
}

function getSpotifyStyleTerms(category) {
  return {
    dance: ["dance pop", "dance", "upbeat"],
    ballad: ["ballad", "korean ballad"],
    rock: ["rock", "band"],
    hiphop: ["hip hop", "rap"],
    rnb: ["r&b", "rnb", "soul"],
    electronic: ["electronic", "edm"],
    trot: ["trot"],
    indie: ["indie"],
    ost: ["ost soundtrack", "original soundtrack", "drama ost"],
    anime: ["anime", "anisong", "anime song"],
  }[category];
}

function getSpotifyArtistTerms(category, styles = []) {
  const wantsDance = styles.includes("dance") || styles.includes("electronic");
  const wantsBallad = styles.includes("ballad") || styles.includes("ost");

  if (category === "female-solo" && wantsDance) {
    return ["JENNIE", "LISA", "CHUNG HA", "SOMI", "SUNMI", "HWASA", "YENA", "female solo"];
  }

  if (category === "female-solo" && wantsBallad) {
    return ["IU", "TAEYEON", "YOUNHA", "HEIZE", "BIBI", "WENDY", "female solo"];
  }

  if (category === "male-solo" && wantsDance) {
    return ["JUNG KOOK", "BTS Jimin", "TAEMIN", "KAI", "G-DRAGON", "male solo"];
  }

  if (category === "male-solo" && wantsBallad) {
    return ["PAUL KIM", "ROY KIM", "LEE MUJIN", "male solo"];
  }

  return {
    "girl-group": ["aespa", "IVE", "LE SSERAFIM", "NewJeans", "girl group"],
    "boy-group": ["BTS", "SEVENTEEN", "Stray Kids", "NCT", "boy group"],
    "female-solo": [
      "IU",
      "TAEYEON",
      "JENNIE",
      "BIBI",
      "YENA",
      "CHUNG HA",
      "SUNMI",
      "HWASA",
      "WENDY",
      "YOUNHA",
      "female solo",
    ],
    "male-solo": ["JUNG KOOK", "BTS Jimin", "ZICO", "G-DRAGON", "male solo"],
    band: ["DAY6", "QWER", "LUCY", "band"],
    "mixed-duo": ["AKMU", "BOL4", "duo", "mixed group"],
  }[category];
}

function formatSpotifyArtistTerm(term) {
  const genericTerms = new Set([
    "girl group",
    "boy group",
    "boy band",
    "female solo",
    "male solo",
    "band",
    "duo",
    "mixed group",
  ]);

  if (genericTerms.has(term.toLowerCase())) {
    return term;
  }

  return `artist:"${term}"`;
}

function getSpotifyYearTerms(dateFilter) {
  if (dateFilter.mode === "all") {
    return [""];
  }

  return compactYearsToRanges(dateFilter.years).map(([start, end]) =>
    start === end ? `year:${start}` : `year:${start}-${end}`,
  );
}

function compactYearsToRanges(years) {
  const sortedYears = [...new Set(years)].sort((a, b) => a - b);
  const ranges = [];
  let start = sortedYears[0];
  let previous = sortedYears[0];

  sortedYears.slice(1).forEach((year) => {
    if (year === previous + 1) {
      previous = year;
      return;
    }

    ranges.push([start, previous]);
    start = year;
    previous = year;
  });

  if (start !== undefined) {
    ranges.push([start, previous]);
  }

  return ranges;
}

function matchesSpotifyResultDate(item, dateFilter) {
  if (dateFilter.mode === "all") {
    return true;
  }

  const releaseDate = parseSpotifyReleaseDate(item.album?.release_date);

  if (!releaseDate) {
    return false;
  }

  if (dateFilter.mode === "years") {
    return dateFilter.years.includes(releaseDate.getFullYear());
  }

  return releaseDate >= dateFilter.startDate && releaseDate <= dateFilter.endDate;
}

function matchesSpotifyResultCategories(
  item,
  selectedCategories,
  artistGenreMap,
  trackFeatureMap = new Map(),
) {
  if (selectedCategories.length === 0) {
    return true;
  }

  if (isLikelyAlternateVersion(item)) {
    return false;
  }

  return Object.entries(filterGroups).every(([groupName, groupTags]) => {
    const selectedInGroup = selectedCategories.filter((category) => groupTags.includes(category));

    if (selectedInGroup.length === 0) {
      return true;
    }

    return selectedInGroup.some((category) =>
      groupName === "country"
        ? matchesSpotifyCountryCategory(item, category, artistGenreMap)
        : groupName === "chart"
          ? true
          : groupName === "style"
            ? matchesSpotifyStyleCategory(item, category, artistGenreMap, trackFeatureMap)
            : matchesSpotifyArtistCategory(item, category, artistGenreMap),
    );
  });
}

function isLikelyAlternateVersion(item) {
  const text = `${item.name || ""} ${item.album?.name || ""}`.toLowerCase();

  return /\b(remix|instrumental|karaoke|sped up|slowed|live|remaster|remastered|version|edit)\b/.test(
    text,
  );
}

function matchesSpotifyCountryCategory(item, category, artistGenreMap) {
  const genres = getSpotifyItemArtistGenres(item, artistGenreMap);
  const searchableText = getSpotifyItemSearchableText(item);

  if (category === "korea") {
    if (hasKnownKoreanArtist(item) || hasHangul(searchableText)) {
      return true;
    }

    return genres.some(
      (genre) =>
        genre.includes("k-pop") ||
        genre.includes("korean") ||
        genre.includes("k-rap") ||
        genre.includes("k-r&b"),
    );
  }

  if (category === "japan") {
    return genres.some(
      (genre) =>
        genre.includes("j-pop") ||
        genre.includes("japanese") ||
        genre.includes("anime") ||
        genre.includes("otacore"),
    );
  }

  if (category === "western") {
    return !genres.some(
      (genre) =>
        genre.includes("k-pop") ||
        genre.includes("korean") ||
        genre.includes("j-pop") ||
        genre.includes("japanese") ||
        genre.includes("c-pop") ||
        genre.includes("mandopop") ||
        genre.includes("chinese"),
    );
  }

  return true;
}

function matchesSpotifyStyleCategory(item, category, artistGenreMap, trackFeatureMap) {
  const genres = getSpotifyItemArtistGenres(item, artistGenreMap);
  const titleAndAlbum = `${item.name} ${item.album?.name || ""}`.toLowerCase();
  const audioFeatures = trackFeatureMap.get(item.id);

  if (category === "challenge") {
    return true;
  }

  if (category === "dance" && /\b(slow|sad|ballad|acoustic|piano)\b/.test(titleAndAlbum)) {
    return false;
  }

  if (category === "ballad" && /\b(remix|club|edm|dance mix|sped up)\b/.test(titleAndAlbum)) {
    return false;
  }

  if (category === "dance" && audioFeatures) {
    return (
      audioFeatures.danceability >= 0.58 &&
      audioFeatures.energy >= 0.42 &&
      audioFeatures.acousticness <= 0.82
    );
  }

  if (
    category === "ballad" &&
    audioFeatures &&
    audioFeatures.danceability >= 0.68 &&
    audioFeatures.energy >= 0.78
  ) {
    return false;
  }

  if (genres.length === 0) {
    return category === "dance" ? hasKnownDancePrimaryArtist(item) : true;
  }

  if (category === "dance") {
    return genres.some(
      (genre) =>
        genre.includes("dance") ||
        genre.includes("edm") ||
        genre.includes("electro") ||
        genre.includes("k-pop"),
    );
  }

  if (category === "ballad") {
    return (
      genres.some(
        (genre) =>
          genre.includes("ballad") ||
          genre.includes("k-pop") ||
          genre.includes("korean") ||
          genre.includes("pop") ||
          genre.includes("r&b"),
      ) || titleAndAlbum.includes("ballad")
    );
  }

  if (category === "rock") {
    return genres.some((genre) => genre.includes("rock") || genre.includes("band"));
  }

  if (category === "hiphop") {
    return genres.some(
      (genre) => genre.includes("hip hop") || genre.includes("rap") || genre.includes("k-rap"),
    );
  }

  if (category === "rnb") {
    return genres.some(
      (genre) => genre.includes("r&b") || genre.includes("rnb") || genre.includes("soul"),
    );
  }

  if (category === "electronic") {
    return genres.some(
      (genre) =>
        genre.includes("electronic") ||
        genre.includes("edm") ||
        genre.includes("house") ||
        genre.includes("techno"),
    );
  }

  if (category === "trot") {
    return genres.some((genre) => genre.includes("trot"));
  }

  if (category === "indie") {
    return genres.some((genre) => genre.includes("indie"));
  }

  if (category === "ost") {
    return (
      genres.some((genre) => genre.includes("soundtrack")) ||
      titleAndAlbum.includes("ost") ||
      titleAndAlbum.includes("soundtrack")
    );
  }

  if (category === "anime") {
    return (
      genres.some((genre) => genre.includes("anime") || genre.includes("otacore")) ||
      titleAndAlbum.includes("anime")
    );
  }

  return true;
}

function matchesSpotifyArtistCategory(item, category, artistGenreMap) {
  const genres = getSpotifyItemArtistGenres(item, artistGenreMap);

  if (knownKoreanArtistAliases[category]) {
    return hasKnownArtistType(item, category);
  }

  if (category === "girl-group") {
    return genres.some((genre) => genre.includes("girl group"));
  }

  if (category === "boy-group") {
    return genres.some((genre) => genre.includes("boy group") || genre.includes("boy band"));
  }

  if (category === "band") {
    return genres.some((genre) => genre.includes("band") || genre.includes("rock"));
  }

  return true;
}

function getSpotifyItemArtistGenres(item, artistGenreMap) {
  return item.artists.flatMap((artist) => artistGenreMap.get(artist.id) || []);
}

function getSpotifyItemSearchableText(item) {
  return `${item.name || ""} ${item.album?.name || ""} ${item.artists
    .map((artist) => artist.name)
    .join(" ")}`;
}

function hasHangul(text) {
  return /[가-힣]/.test(text);
}

function normalizeArtistName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKnownKoreanArtist(item) {
  return item.artists.some((artist) => {
    const normalized = normalizeArtistName(artist.name);
    return [...knownKoreanArtistNames].some((knownName) =>
      matchesKnownArtistAlias(normalized, knownName, artist.name),
    );
  });
}

function hasKnownArtistType(item, category) {
  const aliases = knownKoreanArtistAliases[category] || [];

  return item.artists.slice(0, 1).some((artist) => {
    const normalized = normalizeArtistName(artist.name);
    return aliases.some((alias) => matchesKnownArtistAlias(normalized, alias, artist.name));
  });
}

function hasKnownDancePrimaryArtist(item) {
  return item.artists.slice(0, 1).some((artist) => {
    const normalized = normalizeArtistName(artist.name);

    return (
      hasKnownArtistType(item, "girl-group") ||
      hasKnownArtistType(item, "boy-group") ||
      knownKoreanDanceSoloAliases.some((alias) =>
        matchesKnownArtistAlias(normalized, alias, artist.name),
      )
    );
  });
}

function matchesKnownArtistAlias(normalizedArtistName, alias, originalArtistName = "") {
  const normalizedAlias = normalizeArtistName(alias);

  if (!normalizedAlias) {
    return false;
  }

  if (normalizedAlias === "lisa" && originalArtistName === "LiSA") {
    return false;
  }

  if (normalizedAlias.length <= 3 || !normalizedAlias.includes(" ")) {
    return normalizedArtistName === normalizedAlias;
  }

  return (
    normalizedArtistName === normalizedAlias ||
    ` ${normalizedArtistName} `.includes(` ${normalizedAlias} `)
  );
}

function spotifyItemToQuizTrack(item, selectedCategories) {
  const releaseDate = parseSpotifyReleaseDate(item.album?.release_date);
  const releaseYear = releaseDate?.getFullYear() || new Date().getFullYear();
  const durationSeconds = Math.max(1, Math.round(item.duration_ms / 1000));

  return {
    title: item.name,
    artist: item.artists.map((artist) => artist.name).join(", "),
    tags: selectedCategories,
    year: releaseYear,
    releaseDate: item.album?.release_date || `${releaseYear}-01-01`,
    durationSeconds,
    highlightStart: estimateHighlightStart(durationSeconds),
    spotifyId: item.id,
    spotifyUri: item.uri,
  };
}

function estimateHighlightStart(durationSeconds) {
  if (durationSeconds <= 70) {
    return 0;
  }

  return Math.min(Math.max(Math.floor(durationSeconds * 0.38), 35), durationSeconds - 30);
}

function parseSpotifyReleaseDate(releaseDate) {
  if (!releaseDate) {
    return null;
  }

  if (/^\d{4}$/.test(releaseDate)) {
    return new Date(`${releaseDate}-01-01T00:00:00`);
  }

  if (/^\d{4}-\d{2}$/.test(releaseDate)) {
    return new Date(`${releaseDate}-01T00:00:00`);
  }

  return new Date(`${releaseDate}T00:00:00`);
}

async function searchSpotifyTrack(query, token) {
  const items = await searchSpotifyTracks(query, token, 5);

  return items.find((item) => item.is_playable !== false) || null;
}

async function searchSpotifyTracks(query, token, limit) {
  const safeLimit = Math.min(Math.max(Number(limit) || SPOTIFY_SEARCH_LIMIT, 1), SPOTIFY_SEARCH_LIMIT);
  const cacheKey = `${query}::${safeLimit}`;

  if (state.spotify.searchResults.has(cacheKey)) {
    return state.spotify.searchResults.get(cacheKey);
  }

  const params = new URLSearchParams({
    q: query,
    type: "track",
    market: "KR",
    limit: String(safeLimit),
  });
  const data = await spotifyApiFetch(`https://api.spotify.com/v1/search?${params}`, {
    token,
  });

  const items = data.tracks?.items || [];
  state.spotify.searchResults.set(cacheKey, items);
  return items;
}

async function spotifyApiFetch(url, options = {}) {
  const token = options.token || (await getSpotifyAccessToken());
  let response;
  const cooldownSeconds = getSpotifyCooldownRemainingSeconds();

  if (cooldownSeconds > 0) {
    throw new Error(formatSpotifyRateLimitMessage(cooldownSeconds));
  }

  for (let attempt = 0; attempt <= SPOTIFY_RATE_LIMIT_RETRY_COUNT; attempt += 1) {
    response = await fetchWithTimeout(url, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body,
    });

    if (response.status !== 429 || attempt === SPOTIFY_RATE_LIMIT_RETRY_COUNT) {
      break;
    }

    const retryAfter = getRetryAfterInfo(response);
    setSpotifyRateLimitCooldown(retryAfter.seconds, retryAfter.isExact);
    appendHarnessLog(`Spotify 요청 제한: ${retryAfter.seconds}초 후 재시도`);
    await delay(Math.min(retryAfter.seconds, 8) * 1000);
  }

  if (response.status === 204) {
    return null;
  }

  if (response.status === 429) {
    const retryAfter = getRetryAfterInfo(response);
    setSpotifyRateLimitCooldown(retryAfter.seconds, retryAfter.isExact);
    throw new Error(formatSpotifyRateLimitMessage(retryAfter.seconds, retryAfter.isExact));
  }

  if (!response.ok) {
    const message = await readResponseError(response);
    throw new Error(formatSpotifyApiError(response.status, message, url));
  }

  return response.json();
}

function formatSpotifyApiError(status, message, url) {
  if (status === 429) {
    return formatSpotifyRateLimitMessage(SPOTIFY_DEFAULT_RATE_LIMIT_SECONDS);
  }

  if (status === 403) {
    return getSpotifyForbiddenMessage(url, message);
  }

  return `Spotify 요청 실패: ${message}`;
}

function getRetryAfterInfo(response) {
  const retryAfterSeconds = Number(response.headers.get("Retry-After"));

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return {
      seconds: Math.ceil(retryAfterSeconds),
      isExact: true,
    };
  }

  return {
    seconds: SPOTIFY_DEFAULT_RATE_LIMIT_SECONDS,
    isExact: false,
  };
}

function getSpotifyCooldownRemainingSeconds() {
  return Math.max(0, Math.ceil((state.spotify.rateLimitedUntil - Date.now()) / 1000));
}

function setSpotifyRateLimitCooldown(seconds, isExact = false) {
  state.spotify.rateLimitedUntil = Date.now() + seconds * 1000;
  state.spotify.rateLimitIsExact = isExact;
  sessionStorage.setItem(SPOTIFY_RATE_LIMIT_UNTIL_KEY, String(state.spotify.rateLimitedUntil));
}

function startSpotifyCooldownIfNeeded() {
  if (getSpotifyCooldownRemainingSeconds() <= 0) {
    return false;
  }

  startSpotifyRateLimitCountdown();
  return true;
}

function startSpotifyRateLimitCountdown() {
  window.clearInterval(state.spotify.rateLimitTimerId);

  const updateCountdown = () => {
    const remainingSeconds = getSpotifyCooldownRemainingSeconds();

    if (remainingSeconds <= 0) {
      window.clearInterval(state.spotify.rateLimitTimerId);
      state.spotify.rateLimitTimerId = null;
      state.spotify.rateLimitedUntil = 0;
      state.spotify.rateLimitIsExact = false;
      sessionStorage.removeItem(SPOTIFY_RATE_LIMIT_UNTIL_KEY);

      if (state.phase === "idle") {
        quizStartButton.disabled = false;
        quizStartButton.textContent = "퀴즈 시작";
        sourceStatus.textContent = "이제 다시 퀴즈를 시작할 수 있습니다.";
        questionLabel.textContent = "설정을 고르고 퀴즈를 시작하세요";
      }

      return;
    }

    quizStartButton.disabled = true;
    quizStartButton.textContent = `${remainingSeconds}초 대기`;
    sourceStatus.textContent = formatSpotifyRateLimitMessage(
      remainingSeconds,
      state.spotify.rateLimitIsExact,
    );
  };

  updateCountdown();
  state.spotify.rateLimitTimerId = window.setInterval(updateCountdown, 1000);
}

function formatSpotifyRateLimitMessage(seconds, isExact = false) {
  if (isExact) {
    return `Spotify가 잠시 검색 요청을 제한했습니다. Spotify가 알려준 대기 시간은 ${seconds}초입니다.`;
  }

  return `Spotify가 정확한 해제 시간을 브라우저에 알려주지 않았습니다. ${Math.ceil(
    seconds / 60,
  )}분 정도 아무 요청도 하지 말고 기다린 뒤 다시 시도해주세요.`;
}

function isSpotifyRateLimitMessage(message) {
  return message.includes("검색 요청을 제한") || message.includes("429");
}

function getSpotifyForbiddenMessage(url, message) {
  const endpoint = new URL(url).pathname;

  if (endpoint === "/v1/search") {
    return [
      "Spotify 검색 권한이 거절되었습니다.",
      "Dashboard에서 앱 소유자 계정이 Premium인지 확인하고, 현재 로그인한 Spotify 계정을 앱의 Users and Access에 추가해 주세요.",
      "새 Development Mode 앱은 2026년 2월 이후 제한이 강화되어 앱 소유자 Premium과 등록된 테스트 사용자가 필요합니다.",
      `원문: ${message}`,
    ].join(" ");
  }

  return `Spotify 권한이 거절되었습니다. Dashboard의 앱 설정, Premium 상태, Users and Access 등록을 확인해 주세요. 원문: ${message}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = SPOTIFY_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Spotify 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function readResponseError(response) {
  try {
    const data = await response.json();
    return (
      data.error_description ||
      data.error?.message ||
      data.error ||
      `${response.status} ${response.statusText}`
    );
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

async function initializeSpotifyPlayerIfPossible() {
  if (!state.spotify.token || state.spotify.player || state.spotify.connecting) {
    return;
  }

  state.spotify.connecting = true;
  state.spotify.lastError = "";
  setSpotifyStatus("Spotify 플레이어 준비 중...");

  try {
    await loadSpotifySdk();
    const token = await getSpotifyAccessToken();
    state.spotify.player = new Spotify.Player({
      name: "랜덤 플레이 뮤직 퀴즈",
      getOAuthToken: async (callback) => {
        callback(await getSpotifyAccessToken());
      },
      volume: 0.8,
    });

    state.spotify.player.addListener("ready", ({ device_id }) => {
      clearSpotifyReadyTimeout();
      state.spotify.connecting = false;
      state.spotify.hasEverBeenReady = true;
      state.spotify.lastError = "";
      state.spotify.deviceId = device_id;
      setSpotifyStatus("Spotify 연결 완료. 퀴즈를 시작할 수 있습니다.");
      refreshSpotifyUi();
    });

    state.spotify.player.addListener("not_ready", () => {
      if (state.spotify.hasEverBeenReady) {
        clearSpotifyReadyTimeout();
      }

      state.spotify.deviceId = "";

      if (state.spotify.hasEverBeenReady) {
        setSpotifyStatus("Spotify 플레이어 연결이 끊겼습니다.");
        refreshSpotifyUi();
      } else {
        setSpotifyStatus("Spotify 플레이어 준비 중입니다. 계속 오래 걸리면 다시 준비를 눌러주세요.");
      }
    });

    state.spotify.player.addListener("initialization_error", ({ message }) => {
      clearSpotifyReadyTimeout();
      setSpotifyError(`초기화 오류: ${message}. 일반 Chrome 또는 Edge에서 다시 열어보세요.`);
    });
    state.spotify.player.addListener("authentication_error", ({ message }) => {
      clearSpotifyReadyTimeout();
      setSpotifyError(`인증 오류: ${message}. 다시 로그인해 주세요.`);
    });
    state.spotify.player.addListener("account_error", ({ message }) => {
      clearSpotifyReadyTimeout();
      setSpotifyError(`계정 오류: ${message}. Spotify Premium 계정이 필요합니다.`);
    });
    state.spotify.player.addListener("playback_error", ({ message }) => {
      if (isIgnorableSpotifyNoListError(message)) {
        appendHarnessLog(`Spotify 재생 경고 무시: ${message}`);
        return;
      }

      setSpotifyStatus(`재생 오류: ${message}`);
    });

    scheduleSpotifyReadyTimeout();
    await state.spotify.player.connect();
    appendHarnessLog("Spotify SDK 연결 요청 완료");
    setSpotifyStatus(token ? "Spotify 플레이어 연결 대기 중..." : "Spotify 토큰이 필요합니다.");
  } catch (error) {
    setSpotifyError(error.message);
    appendHarnessLog(`Spotify 플레이어 준비 실패: ${error.message}`);
  } finally {
    state.spotify.connecting = false;
    refreshSpotifyUi();
  }
}

function scheduleSpotifyReadyTimeout() {
  clearSpotifyReadyTimeout();
  state.spotify.readyTimeoutId = window.setTimeout(() => {
    if (state.spotify.deviceId) {
      return;
    }

    state.spotify.connecting = false;
    connectSpotifyButton.hidden = true;
    retrySpotifyPlayerButton.hidden = false;
    disconnectSpotifyButton.hidden = false;
    setSpotifyError(
      "Spotify 플레이어 준비 시간이 너무 깁니다. Premium 계정인지 확인하고 Chrome 또는 Edge에서 다시 시도해 주세요.",
    );

    sourceStatus.textContent = "Spotify 플레이어가 아직 준비되지 않았습니다.";

    appendHarnessLog("Spotify ready 이벤트 시간 초과");
  }, 15_000);
}

function clearSpotifyReadyTimeout() {
  if (state.spotify.readyTimeoutId) {
    window.clearTimeout(state.spotify.readyTimeoutId);
    state.spotify.readyTimeoutId = null;
  }
}

function loadSpotifySdk() {
  if (window.Spotify) {
    state.spotify.sdkReady = true;
    return Promise.resolve();
  }

  if (state.spotify.sdkPromise) {
    return state.spotify.sdkPromise;
  }

  state.spotify.sdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector("script[src='https://sdk.scdn.co/spotify-player.js']");
    let timeoutId = null;

    window.onSpotifyWebPlaybackSDKReady = () => {
      window.clearTimeout(timeoutId);
      state.spotify.sdkReady = true;
      resolve();
    };

    if (existingScript && !window.Spotify) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      state.spotify.sdkPromise = null;
      reject(new Error("Spotify SDK를 불러오지 못했습니다. 네트워크나 브라우저를 확인해 주세요."));
    };
    document.body.append(script);

    timeoutId = window.setTimeout(() => {
      state.spotify.sdkPromise = null;
      script.remove();
      reject(
        new Error(
          "Spotify 플레이어 준비 시간이 너무 깁니다. 일반 Chrome 또는 Edge에서 다시 열어보세요.",
        ),
      );
    }, 12_000);
  });

  return state.spotify.sdkPromise;
}

async function startSpotifyLogin() {
  const clientId = spotifyClientIdInput.value.trim();

  if (!clientId) {
    setSpotifyStatus("Spotify Client ID를 먼저 입력하세요.");
    return;
  }

  localStorage.setItem(SPOTIFY_CLIENT_ID_KEY, clientId);
  const verifier = generateRandomString(64);
  const challenge = await createCodeChallenge(verifier);
  const stateValue = generateRandomString(24);
  sessionStorage.setItem(SPOTIFY_VERIFIER_KEY, verifier);
  sessionStorage.setItem(SPOTIFY_RETURN_URL_KEY, window.location.href);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SPOTIFY_SCOPES.join(" "),
    redirect_uri: getSpotifyRedirectUri(),
    state: stateValue,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

async function completeSpotifyLoginIfNeeded() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const error = params.get("error");

  if (error) {
    setSpotifyStatus(`Spotify 로그인 실패: ${error}`);
    window.history.replaceState({}, document.title, getStoredReturnUrlWithoutAuthParams());
    return;
  }

  if (!code) {
    return;
  }

  const verifier = sessionStorage.getItem(SPOTIFY_VERIFIER_KEY);
  const clientId = getSpotifyClientId();

  if (!verifier || !clientId) {
    setSpotifyStatus("Spotify 로그인 정보를 찾지 못했습니다. 다시 로그인해 주세요.");
    window.history.replaceState({}, document.title, getStoredReturnUrlWithoutAuthParams());
    return;
  }

  setSpotifyStatus("Spotify 로그인 처리 중...");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: getSpotifyRedirectUri(),
    code_verifier: verifier,
  });

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      throw new Error(await readResponseError(response));
    }

    const token = await response.json();
    storeSpotifyToken(token);
    state.spotify.token = readStoredSpotifyToken();
    sessionStorage.removeItem(SPOTIFY_VERIFIER_KEY);
    setSpotifyStatus("Spotify 로그인 완료. 플레이어를 준비합니다.");
  } catch (loginError) {
    setSpotifyStatus(`Spotify 로그인 처리 실패: ${loginError.message}`);
  } finally {
    window.history.replaceState({}, document.title, getStoredReturnUrlWithoutAuthParams());
    sessionStorage.removeItem(SPOTIFY_RETURN_URL_KEY);
  }
}

async function getSpotifyAccessToken() {
  const token = state.spotify.token || readStoredSpotifyToken();

  if (!token) {
    throw new Error("Spotify 로그인이 필요합니다.");
  }

  if (Date.now() < token.expiresAt - 60_000) {
    return token.accessToken;
  }

  if (!token.refreshToken) {
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
    state.spotify.token = null;
    throw new Error("Spotify 세션이 만료되었습니다. 다시 로그인해 주세요.");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
    client_id: getSpotifyClientId(),
  });
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
    state.spotify.token = null;
    throw new Error("Spotify 세션 갱신에 실패했습니다. 다시 로그인해 주세요.");
  }

  const refreshed = await response.json();
  storeSpotifyToken({
    ...refreshed,
    refresh_token: refreshed.refresh_token || token.refreshToken,
  });
  state.spotify.token = readStoredSpotifyToken();
  return state.spotify.token.accessToken;
}

function storeSpotifyToken(token) {
  localStorage.setItem(
    SPOTIFY_TOKEN_KEY,
    JSON.stringify({
      accessToken: token.access_token,
      refreshToken: token.refresh_token || "",
      expiresAt: Date.now() + token.expires_in * 1000,
    }),
  );
}

function readStoredSpotifyToken() {
  try {
    const token = JSON.parse(localStorage.getItem(SPOTIFY_TOKEN_KEY));
    return token?.accessToken ? token : null;
  } catch {
    return null;
  }
}

function readStoredSpotifyRateLimitedUntil() {
  const storedUntil = Number(sessionStorage.getItem(SPOTIFY_RATE_LIMIT_UNTIL_KEY));
  return Number.isFinite(storedUntil) ? storedUntil : 0;
}

function getSpotifyClientId() {
  return localStorage.getItem(SPOTIFY_CLIENT_ID_KEY) || "";
}

function getSpotifyRedirectUri() {
  const pathname = window.location.pathname.endsWith("/")
    ? `${window.location.pathname}index.html`
    : window.location.pathname;
  return `${window.location.origin}${pathname}`;
}

function getStoredReturnUrlWithoutAuthParams() {
  const storedUrl = sessionStorage.getItem(SPOTIFY_RETURN_URL_KEY);

  if (storedUrl) {
    return storedUrl;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  return `${url.pathname}${url.search}${url.hash}`;
}

function refreshSpotifyUi() {
  const hasClientId = Boolean(getSpotifyClientId());
  const hasToken = Boolean(state.spotify.token);
  spotifyClientIdInput.value = getSpotifyClientId();
  connectSpotifyButton.hidden = hasToken;
  retrySpotifyPlayerButton.hidden = !hasToken;
  diagnoseSpotifyButton.hidden = !hasToken;
  disconnectSpotifyButton.hidden = !hasToken;

  if (!hasClientId) {
    setSpotifyStatus("Spotify Client ID를 입력하고 저장하세요.");
    return;
  }

  if (!hasToken) {
    setSpotifyStatus("Spotify 로그인 전입니다.");
    return;
  }

  if (state.spotify.lastError) {
    setSpotifyStatus(state.spotify.lastError);
    return;
  }

  if (state.spotify.deviceId) {
    setSpotifyStatus("Spotify 연결 완료. 퀴즈를 시작할 수 있습니다.");
  } else {
    setSpotifyStatus("Spotify 로그인 완료. 플레이어를 준비 중입니다.");
  }
}

function setSpotifyStatus(message) {
  spotifyStatus.textContent = message;
}

function setSpotifyError(message) {
  state.spotify.lastError = message;
  setSpotifyStatus(message);
  sourceStatus.textContent = message;
}

async function diagnoseSpotifyConnection() {
  diagnoseSpotifyButton.disabled = true;
  diagnoseSpotifyButton.textContent = "진단 중";
  setSpotifyStatus("Spotify 연결을 진단하는 중입니다...");

  try {
    const token = await getSpotifyAccessToken();
    const checks = [];

    try {
      await spotifyApiFetch("https://api.spotify.com/v1/me", { token });
      checks.push("프로필 OK");
    } catch (error) {
      checks.push(`프로필 실패: ${error.message}`);
    }

    try {
      await searchSpotifyTracks("test", token, 1);
      checks.push("검색 OK");
    } catch (error) {
      checks.push(`검색 실패: ${error.message}`);
    }

    const message = checks.join(" / ");
    setSpotifyStatus(message);
    sourceStatus.textContent = message;
    appendHarnessLog(`Spotify 진단: ${message}`);
  } catch (error) {
    const message = `Spotify 진단 실패: ${error.message}`;
    setSpotifyStatus(message);
    sourceStatus.textContent = message;
  } finally {
    diagnoseSpotifyButton.disabled = false;
    diagnoseSpotifyButton.textContent = "연결 진단";
  }
}

async function resetSpotifyPlayer() {
  state.spotify.connecting = false;
  state.spotify.deviceId = "";
  state.spotify.sdkPromise = null;
  state.spotify.hasEverBeenReady = false;
  state.spotify.lastError = "";
  clearSpotifyReadyTimeout();

  try {
    await state.spotify.player?.disconnect();
  } catch (error) {
    appendHarnessLog(`Spotify 연결 해제 오류: ${error.message}`);
  }

  state.spotify.player = null;
  document.querySelector("script[src='https://sdk.scdn.co/spotify-player.js']")?.remove();
  delete window.Spotify;
  window.onSpotifyWebPlaybackSDKReady = undefined;
  setSpotifyStatus("Spotify 플레이어를 다시 준비합니다...");
}

function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return [...values].map((value) => possible[value % possible.length]).join("");
}

async function createCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function runCategoryQualityAudit() {
  if (!runCategoryQaButton) {
    return;
  }

  runCategoryQaButton.disabled = true;
  harnessLog.dataset.categoryQaResult = "";
  sourceStatus.textContent = "카테고리 QA를 실행 중입니다.";
  appendHarnessLog("카테고리 QA 시작");

  try {
    const token = await getSpotifyAccessToken();
    const testCases = getCategoryQaCases();
    const results = [];

    for (const testCase of testCases) {
      sourceStatus.textContent = `카테고리 QA 실행 중: ${testCase.name}`;
      const items = await fetchSpotifyCandidates(
        testCase.categories,
        testCase.dateFilter,
        testCase.targetCount,
        { rawItems: true },
      );
      const validation = await validateCategoryQaCase(testCase, items, token);
      const result = {
        name: testCase.name,
        count: items.length,
        passed: validation.passed,
        duplicateCount: validation.duplicates.length,
        mismatchCount: validation.mismatches.length,
        samples: summarizeSpotifyItems(items),
        issues: [...validation.duplicates, ...validation.mismatches].slice(0, 4),
      };
      results.push(result);
      appendHarnessLog(formatCategoryQaResult(result));
    }

    const failedCount = results.filter((result) => !result.passed).length;
    const summary = {
      passed: failedCount === 0,
      failedCount,
      total: results.length,
      results,
    };

    harnessLog.dataset.categoryQaResult = JSON.stringify(summary);
    sourceStatus.textContent =
      failedCount === 0
        ? `카테고리 QA 통과: ${results.length}개 조건에서 중복/불일치 없음`
        : `카테고리 QA 확인 필요: ${results.length}개 중 ${failedCount}개 조건에서 이슈 발견`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    harnessLog.dataset.categoryQaResult = JSON.stringify({
      passed: false,
      failedCount: 1,
      total: 0,
      error: message,
    });
    sourceStatus.textContent = `카테고리 QA 오류: ${message}`;
    appendHarnessLog(`카테고리 QA 오류: ${message}`);
  } finally {
    runCategoryQaButton.disabled = false;
  }
}

function getCategoryQaCases() {
  const currentYears = createYearDateFilter(yearsBetween(2020, YEAR_END));
  const allYearsFilter = createYearDateFilter(yearsBetween(YEAR_START, YEAR_END));

  return [
    {
      name: "한국 댄스 여성 솔로",
      categories: ["korea", "dance", "female-solo"],
      dateFilter: currentYears,
      targetCount: 4,
      minimumCount: 1,
    },
    {
      name: "한국 댄스 남성 솔로",
      categories: ["korea", "dance", "male-solo"],
      dateFilter: currentYears,
      targetCount: 4,
      minimumCount: 1,
    },
    {
      name: "한국 발라드 여성 솔로",
      categories: ["korea", "ballad", "female-solo"],
      dateFilter: currentYears,
      targetCount: 4,
      minimumCount: 1,
    },
    {
      name: "한국 Top 100",
      categories: ["korea-top100"],
      dateFilter: allYearsFilter,
      targetCount: 5,
      minimumCount: 3,
    },
  ];
}

async function validateCategoryQaCase(testCase, items, token) {
  const artistGenreMap = await buildArtistGenreMap(items, testCase.categories, token);
  const trackFeatureMap = await buildTrackFeatureMap(items, testCase.categories, token);
  const duplicates = collectDuplicateSpotifyItems(items);
  const mismatches = [];

  if (items.length < testCase.minimumCount) {
    mismatches.push(`${testCase.name}: 후보 부족 (${items.length}/${testCase.minimumCount})`);
  }

  items.forEach((item) => {
    if (
      !matchesSpotifyResultCategories(
        item,
        testCase.categories,
        artistGenreMap,
        trackFeatureMap,
      )
    ) {
      mismatches.push(`필터 불일치: ${formatSpotifyItemForLog(item)}`);
      return;
    }

    const artistCategory = testCase.categories.find((category) =>
      filterGroups.artist.includes(category),
    );

    if (artistCategory && !hasKnownArtistType(item, artistCategory)) {
      mismatches.push(`아티스트 유형 불일치: ${formatSpotifyItemForLog(item)}`);
    }
  });

  return {
    passed: duplicates.length === 0 && mismatches.length === 0,
    duplicates,
    mismatches,
  };
}

function collectDuplicateSpotifyItems(items) {
  const seen = new Map();
  const duplicates = [];

  items.forEach((item) => {
    const key = getSpotifyItemDedupeKey(item);

    if (!key) {
      return;
    }

    if (seen.has(key)) {
      duplicates.push(`중복 후보: ${formatSpotifyItemForLog(item)}`);
      return;
    }

    seen.set(key, item);
  });

  return duplicates;
}

function summarizeSpotifyItems(items) {
  return items.slice(0, 5).map(formatSpotifyItemForLog);
}

function formatSpotifyItemForLog(item) {
  const artists = item.artists?.map((artist) => artist.name).join(", ") || "Unknown";
  const releaseDate = item.album?.release_date || "unknown";
  return `${item.name} - ${artists} (${releaseDate})`;
}

function formatCategoryQaResult(result) {
  const status = result.passed ? "PASS" : "FAIL";
  const samples = result.samples.length > 0 ? ` / 예: ${result.samples.join(" | ")}` : "";
  const issues = result.issues.length > 0 ? ` / 이슈: ${result.issues.join(" | ")}` : "";
  return `${status} ${result.name}: 후보 ${result.count}곡, 중복 ${result.duplicateCount}, 불일치 ${result.mismatchCount}${samples}${issues}`;
}

if (isDebugMode) {
  window.__musicQuizDebug = {
    appVersion: APP_VERSION,
    appBuild: APP_BUILD,
    spotifySearchLimit: SPOTIFY_SEARCH_LIMIT,
    buildSpotifyCandidateQueries,
    buildSpotifyRelaxedCandidateQueries,
    createRecentDateFilter,
    createYearDateFilter,
    matchesSpotifyResultCategories,
    runCategoryQualityAudit,
  };
}

function describePlayFrom(playFrom) {
  return playFrom === "highlight" ? "하이라이트" : "처음";
}

function describeCategories(selectedCategories) {
  if (selectedCategories.length === 0) {
    return "전체";
  }

  return selectedCategories.map((category) => categoryLabels[category] || category).join(", ");
}

function describeDateFilter(dateFilter) {
  if (dateFilter.mode === "all") {
    return "전체 연도";
  }

  if (dateFilter.mode === "recent") {
    return `최근 ${dateFilter.months}개월`;
  }

  const sortedYears = [...dateFilter.years].sort((a, b) => a - b);
  const isRange =
    sortedYears.length === sortedYears[sortedYears.length - 1] - sortedYears[0] + 1;

  if (isRange) {
    return `${sortedYears[0]}년부터 ${sortedYears[sortedYears.length - 1]}년까지`;
  }

  return sortedYears.map((year) => `${year}`).join(", ");
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function appendHarnessLog(message) {
  const item = document.createElement("li");
  item.textContent = message;
  harnessLog.prepend(item);
}
