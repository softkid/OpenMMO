# Cloudflare Pages & Tunnel Setup Guide

이 가이드는 로컬에서 실행하는 OpenMMO 백엔드 서버를 **Cloudflare Tunnel**로 노출시키고, 프론트엔드를 **Cloudflare Pages**로 배포하여 연동하는 가이드입니다.

---

## 1. 프론트엔드 배포 (Cloudflare Pages)

### Cloudflare Pages 프로젝트 설정
1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인 후 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git** 클릭.
2. `softkid/OpenMMO` 리포지토리를 선택.
3. 빌드 설정:
   - **Framework preset**: `Vite` (또는 `None`)
   - **Root directory**: `client`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **환경 변수 (Environment Variables)** 설정:
   - `VITE_SERVER_URL`: `wss://<your-tunnel-domain>/ws` (예: `wss://api.yourdomain.com/ws`)
   - `VITE_API_URL`: `https://<your-tunnel-domain>` (예: `https://api.yourdomain.com`)
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID (필요시)

---

## 2. 백엔드 설정 (Cloudflare Tunneling)

로컬에서 실행되는 OpenMMO 게임 서버 (웹소켓: `10006`, HTTP API: `10007`)를 외부에 안전하게 노출하기 위해 Cloudflare Tunnel을 연결합니다.

### Step 1: `cloudflared` CLI 설치 및 로그인
```bash
# cloudflared 설치 후 로그인
cloudflared tunnel login
```

### Step 2: 터널 생성 및 라우팅
```bash
# 터널 생성 (예: openmmo-tunnel)
cloudflared tunnel create openmmo-tunnel

# 도메인 CNAME 레코드 연결
cloudflared tunnel route dns openmmo-tunnel api.yourdomain.com
```

### Step 3: Cloudflare Config 작성 (`~/.cloudflared/config.yml`)
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /path/to/<TUNNEL_ID>.json

ingress:
  # 웹소켓 엔드포인트
  - hostname: api.yourdomain.com
    path: /ws
    service: ws://localhost:10006
  # REST API 엔드포인트
  - hostname: api.yourdomain.com
    service: http://localhost:10007
  - service: http_status:404
```

### Step 4: 터널 실행 및 게임 서버 가동
```bash
# 1. 터널 실행
cloudflared tunnel run openmmo-tunnel

# 2. OpenMMO 백엔드 서버 가동 (로컬)
docker compose up server
# 또는 cargo run --bin server
```

---

## 3. 연동 확인
- Cloudflare Pages URL (예: `https://openmmo.pages.dev`)에 접속합니다.
- 접속 시 Cloudflare Tunnel (`wss://api.yourdomain.com/ws`)을 통해 로컬 백엔드 서버와 정상 연결되는지 확인합니다.
