# 하루점 작업 1단계 인수인계

2026-11-26. 후속 AI는 이 문서와 QA-REPORT를 먼저 읽고 `git status`/원격 HEAD를 확인한다.

## 기준과 범위

- 저장소: https://github.com/Surviveyeomi/harujeom
- 작업 브랜치: feat/final-development
- 브랜치 URL: https://github.com/Surviveyeomi/harujeom/tree/feat/final-development
- v0.1 기준: a8e76d637330fc8d8ebb77a2370323da01e32a15 (기존 annotated v0.1 보존)
- 시작 기준: 2303a0d24b342107dd3646a7f9d63349506984ff. 원격 main의 README 수정2건을 feature에 fast-forward하여 보존.
- main병합/PR/v1.0태그/Release/공개배포/최종PDF·DOCX·PPTX 제작은 수행하지 않는다.
- 최종 HEAD와 push 성공 여부는 실제 push 뒤 완료 응답에서 별도 전달한다. 이 문서 안에 자기 커밋 해시를 예측하여 쓰지 않는다.

## 주요 커밋

| 해시 | 내용 |
|---|---|
| c6e81a9 | 수정 전14개 테스트·기획대조·점수fixture |
| ca22c2e | 프로필/저장 개선,문장 데이터 분리·확대 |
| ca406b8 | 단일HTML빌드,22개 추가테스트,모바일 넘침·오타 수정 |
| 7c51172 | 최종 색상 대비·폼 상태 정리,아티팩트검사,저장제한fixture,36개 결과 |

이후 문서·캡처 커밋은 `git log --oneline`에서 확인한다. 기록 재작성/force push 금지.

## 구현 상태 및 핵심 파일

- src/fortune.js: 기존 계산 v0.1 유지,날짜형식/지원상한 검증. 숫자 회귀fixture10개 일치.
- src/messages.js: 문장 규칙1.0. 분야60(4×3×5),총운15,추세15,주의20=총110. 정규화 양력생일/시간과 채널 해시+일련일수 modulo5. 무작위·서비스 AI API 없음.
- src/profile.js: 필수값 파싱,storage getter/쓰기/삭제 오류 대응,갱신조건. 키 harujeom.profile.v1 유지.
- src/app.js: 개인/예시 분리,선택저장 기본OFF,정보 수정/삭제,실패 안내,자정30초폴링·visibilitychange. 갱신 시 기존 안내/스크롤 유지.
- dist/index.html/style.css: 원래 아이보리·세이지 구성 유지,버튼/폰트/대비/키보드 포커스 개선. 오늘 강조,3일+내일? (미래 계산 없음).
- scripts/build.mjs: CSS/JS/라이브러리 데이터/MIT를 단일 HTML에 삽입. 공개 dist/harujeom.html. 제출사본은 `npm run build -- --submission submission/my-final.html`처럼 인자 지정. 실제 학교 파일은 로컬 submission/에 있으며 개인정보 파일명을 공개 문서에 기록하지 않는다.
- scripts/check-artifact.mjs: 외부 실행 의존성,MIT,선택적 제출사본 동일성,주요 색상5쌍 검사.
- scripts/browser-fixture.mjs: ignored dist/qa-storage.html 생성. localStorage 차단 sandbox 테스트용이며 공개 실행파일이 아니다.
- tests/fortune.test.js 원문14개,tests/final.test.js 추가22개,tests/fixtures/v01-scores.json.

## 검증 및 산출물

- `npm test`:36 PASS/0 FAIL. 원문 test-results.txt. 최초확장35/1 실패와 수정 과정도 보존.
- IAB:6너비×2화면12조건 가로넘침0,입력/윤달/저장/수정/예시/삭제/제한저장소 확인.
- Chrome:정상입력/저장복원/키보드Enter·Tab·Escape/삭제 확인. 각 확인 시 error/warn 수집0.
- KASI2024 달력자료 표본:음력초하루12개·일진·입춘시각 일치. 전체 연도 검증은 아님.
- 공개/제출HTML 바이트동일,121641 bytes. SHA-256 및 대비값은 docs/validation/stage1/artifact-check.txt.
- file:// 직접실행:도구 정책 차단으로 NOT TESTED. 오프라인/다른폴더실행도 NOT TESTED. HTTP실행과 정적 의존성 검사를 실제 오프라인 성공으로 바꾸어 기록하지 않는다.
- 증빙:QA-REPORT.md,AI-DEVELOPMENT-LOG.md,CHANGELOG.md,README.md,test-results.txt,screenshots/,docs/validation/stage1/,manual-test-checklist.md.

## 실제 문제와 해결

- 장식 원 가상요소가 모바일 입력에서 6~22px 넘침: 위치와 여백을 조정해 최종 12조건 PASS.
- 필수 연도 조사 오타: 문구 수정 후 재검증.
- esbuild ASCII escape로 문자열 검사 실패: UTF-8 설정, assertion 유지, 36/0으로 재검증.
- sandbox의 allow-forms 누락: fixture 수정 후 저장 차단 상태에서 72점 확인.
- viewport가 다른 탭에 적용된 632px 측정: 통과 근거에서 제외하고 새 탭에서 요청 너비 일치를 확인한 뒤 재캡처.

## 남은 확인 및 다음 단계

확인한 범위에서 미해결 앱 기능 오류는 발견하지 못했다. 미검증 항목은 결함 없음의 증거가 아니다.

P0 후속: 사용자가 제출용 파일을 직접 더블클릭하고, 인터넷 차단 및 다른 폴더·PC에서 실행해야 한다. 도구 정책으로 여기서는 완료하지 못했다. manual-test-checklist.md에 절차를 남겼다.

P1 후속: Firefox/별도 WebKit, 실제 iPhone/Android, 실제 자정 갱신, 사용자 평가. P2 후속: 전체 스크린리더/확대 검사, 코드 서식 정리. IAB 엔진은 미확인이므로 별도 WebKit 테스트로 세지 않는다.

작업 2단계는 이 증빙으로 보고서·발표자료 초안을 작성할 수 있다. 제출 확정 전 직접 실행 확인과 작성자의 코드·규칙 이해 확인이 필요하다. 실제 하지 않은 검증, 학생 직접 작성, 사용자 피드백을 창작하지 않는다. 공개 배포와 main 병합은 후속 사용자 지시에 따른다.

## 공개 범위

학교 원본 문서, 개인 파일명, 제출 HTML은 공개 대상이 아니다. submission/, node_modules/, 캐시와 자격증명은 제외한다. 공개 기록은 noreply 작성자 정보를 유지한다. 기존 개인 기록 백업은 별도 원본 저장소와 로컬 백업에 보존되어 있으며 수정하지 않았다. 과거 .openai/hosting.json은 기존 추적 메타데이터로 남아 있고 새 프리뷰 배포는 하지 않았다.
