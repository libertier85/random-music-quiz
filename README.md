# 랜덤 플레이 뮤직 퀴즈

차 안에서 아이와 노래 맞히기 퀴즈를 하기 위한 Spotify 기반 웹앱입니다.

## 실행

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:4173/index.html
```

Spotify 실제 재생은 Codex in-app browser보다 일반 Chrome 또는 Edge에서 테스트하는 편이 안정적입니다.

## Spotify 설정

Spotify Developer Dashboard에서 앱을 만들고 Redirect URI에 아래 주소를 등록합니다.

```text
http://127.0.0.1:4173/index.html
http://127.0.0.1:4173/
https://libertier85.github.io/random-music-quiz/index.html
https://libertier85.github.io/random-music-quiz/
```

앱 화면의 Spotify Client ID 칸에 Client ID를 붙여넣고 저장한 뒤 Spotify 로그인을 진행합니다.
앱 화면의 "현재 Redirect URI"에 표시되는 값을 Dashboard에 그대로 추가하면 가장 안전합니다.
Client Secret은 사용하지 않습니다.

## 집 밖에서 사용

아래 GitHub Pages 주소를 Chrome 또는 Edge에서 엽니다.

```text
https://libertier85.github.io/random-music-quiz/index.html
```

Spotify Developer Dashboard의 Redirect URI에 위 주소가 등록되어 있어야 로그인할 수 있습니다.
퀴즈가 끝나면 들었던 노래 목록이 표시되고, 노래를 누르면 처음부터 전곡을 들을 수 있습니다.

## 로컬 검증

```powershell
node --check app.js
node qa-smoke.mjs
```

`qa-smoke.mjs`는 앱 버전 표시, 스크립트 캐시 버전, Spotify 검색 limit, 필수 UI 요소를 확인합니다.

## 현재 버전

`v0.8.3 · redirect-helper`
