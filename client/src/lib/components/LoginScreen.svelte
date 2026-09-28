<script lang="ts">
  import { onMount } from 'svelte'
  import { getDefaultServerUrl } from '../utils/networkUtils'
  import AnnouncementsPanel from './AnnouncementsPanel.svelte'

  const GSI_SRC = 'https://accounts.google.com/gsi/client'

  interface Props {
    onLogin: (
      serverUrl: string,
      googleIdToken: string
    ) => Promise<{ ok: boolean; message?: string }>
    kickedMessage?: string
  }

  let { onLogin, kickedMessage }: Props = $props()

  let isConnecting = $state(false)
  let errorMessage = $state('')
  let buttonContainer = $state<HTMLDivElement | null>(null)

  function loadGsiScript(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${GSI_SRC}"]`)
      if (existing) {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', () =>
          reject(new Error('Failed to load Google Sign-In'))
        )
        return
      }
      const script = document.createElement('script')
      script.src = GSI_SRC
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google Sign-In'))
      document.head.appendChild(script)
    })
  }

  async function handleCredential(response: GoogleCredentialResponse) {
    errorMessage = ''
    isConnecting = true

    try {
      const result = await onLogin(getDefaultServerUrl(), response.credential)
      if (!result.ok) {
        errorMessage = result.message ?? 'Authentication failed'
      }
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : 'Authentication failed'
    } finally {
      isConnecting = false
    }
  }

  onMount(async () => {
    let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    if (!clientId || clientId === '' || clientId === '__GOOGLE_CLIENT_ID__') {
      clientId = '487922619083-hlaqeerv2s2kv2ka8vlfamn23sh4mdjc.apps.googleusercontent.com'
    }

    try {
      await loadGsiScript()
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : String(e)
      return
    }

    const googleId = window.google?.accounts?.id
    if (!googleId || !buttonContainer) {
      errorMessage = 'Google Sign-In failed to initialize'
      return
    }

    googleId.initialize({
      client_id: clientId,
      callback: (response) => void handleCredential(response),
      auto_select: true,
      itp_support: true,
      use_fedcm_for_prompt: true,
    })
    googleId.prompt()
    googleId.renderButton(buttonContainer, {
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: 280,
    })
  })
</script>

<div class="login-root">
  <div class="aurora-bg"></div>
  <div class="dot-overlay"></div>

  <nav class="top-nav">
    <div class="nav-inner">
      <div class="brand">
        <span class="brand-name">HAHAO<b>GAMES</b></span>
      </div>
      <div class="nav-right">
        <a
          class="nav-link"
          href="https://hahaogames.com"
          target="_blank"
          rel="noopener noreferrer"
        >홈페이지</a>
        <a
          class="nav-link"
          href="https://github.com/softkid/OpenMMO"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  </nav>

  <div class="hero-content">
    <div class="hero-tags">
      <span class="pill"><i class="dot purple"></i>3D MMORPG</span>
      <span class="pill"><i class="dot blue"></i>WebGL / WebGPU</span>
      <span class="pill"><i class="dot green"></i>설치 없이 플레이</span>
    </div>

    <h1 class="hero-title">
      <span class="title-line-1">HAHAO</span>
      <span class="title-line-2 grad-ring-text">WORLD</span>
    </h1>

    <p class="hero-lede">경계 없는 웹 오픈월드 MMORPG — 브라우저에서 바로 입장하는 새로운 모험의 시작</p>

    <div class="login-card glass">
      {#if kickedMessage}
        <div class="alert alert-warn">{kickedMessage}</div>
      {/if}

      {#if errorMessage}
        <div class="alert alert-error">{errorMessage}</div>
      {/if}

      <div class="google-signin" class:connecting={isConnecting}>
        <div bind:this={buttonContainer}></div>
        {#if isConnecting}
          <div class="connecting-label">
            <span class="spinner"></span>
            서버에 접속하는 중입니다...
          </div>
        {/if}
      </div>
    </div>

    <div class="features-grid">
      <div class="feature-card glass">
        <div class="feature-icon-wrap" style="--accent: #8a2bf9;">⚔️</div>
        <h3 class="feature-title">실시간 3D 오픈월드</h3>
        <p class="feature-desc">브라우저만으로 즉시 입장하는 광활한 3D 대륙</p>
      </div>
      <div class="feature-card glass">
        <div class="feature-icon-wrap" style="--accent: #0480e5;">🤖</div>
        <h3 class="feature-title">AI 에이전트 시스템</h3>
        <p class="feature-desc">지능형 가디언 에이전트와 자율 파밍</p>
      </div>
      <div class="feature-card glass">
        <div class="feature-icon-wrap" style="--accent: #3cb521;">🛡️</div>
        <h3 class="feature-title">노파괴 인챈트</h3>
        <p class="feature-desc">스트레스 제로 보전 인챈트 및 거래</p>
      </div>
      <div class="feature-card glass">
        <div class="feature-icon-wrap" style="--accent: #fc3033;">🏰</div>
        <h3 class="feature-title">실시간 레이드</h3>
        <p class="feature-desc">보스 소탕과 협동 파티 플레이</p>
      </div>
    </div>

    <AnnouncementsPanel />

    <footer class="login-footer">
      <p>© 2026 <a href="https://hahaogames.com" target="_blank" rel="noopener noreferrer">HAHAOGAMES</a>. Core Engine Powered by <a href="https://github.com/softkid/OpenMMO" target="_blank" rel="noopener noreferrer">OpenMMO</a></p>
    </footer>
  </div>
</div>

<style>
  .login-root {
    position: fixed;
    inset: 0;
    box-sizing: border-box;
    width: 100%;
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    padding: 80px 24px 40px;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #07060d;
    -webkit-overflow-scrolling: touch;
    font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', -apple-system, sans-serif;
  }

  .aurora-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(60% 45% at 18% -5%, rgba(138, 43, 249, 0.28), transparent 60%),
      radial-gradient(50% 40% at 100% 10%, rgba(4, 128, 229, 0.22), transparent 60%),
      radial-gradient(45% 35% at 85% 90%, rgba(252, 48, 51, 0.14), transparent 60%),
      radial-gradient(40% 30% at 5% 85%, rgba(60, 181, 33, 0.12), transparent 60%),
      #07060d;
  }

  .dot-overlay {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: 26px 26px;
    mask-image: radial-gradient(80% 60% at 50% 0%, black, transparent 90%);
  }

  .top-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 200;
    padding: 14px 24px;
  }

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px 10px 18px;
    border-radius: 999px;
    background: rgba(10, 8, 18, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.09);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 17px;
    letter-spacing: 0.01em;
    color: #f6f4fb;
  }

  .brand-name b {
    font-weight: 400;
    color: #c7c2da;
    margin-left: 4px;
    font-size: 13px;
    letter-spacing: 0.18em;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .nav-link {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #c7c2da;
    padding: 8px 14px;
    border-radius: 999px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s ease, background 0.2s ease;
  }

  .nav-link:hover {
    color: #f6f4fb;
    background: rgba(255, 255, 255, 0.08);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 920px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 28px;
    margin: auto 0;
  }

  .hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    justify-content: center;
  }

  .pill {
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 12.5px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.045);
    color: #c7c2da;
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: 0.02em;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.purple { background: #8a2bf9; box-shadow: 0 0 10px #8a2bf9; }
  .dot.blue { background: #0480e5; box-shadow: 0 0 10px #0480e5; }
  .dot.green { background: #3cb521; box-shadow: 0 0 10px #3cb521; }

  .hero-title {
    margin: 0;
    font-family: 'Space Grotesk', 'Cinzel', serif;
    font-size: clamp(52px, 10vw, 110px);
    line-height: 0.96;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #f6f4fb;
  }

  .title-line-1 {
    display: block;
  }

  .title-line-2 {
    display: block;
    margin-top: -4px;
  }

  .grad-ring-text {
    background: conic-gradient(from 180deg, #fc3033, #fda908, #3cb521, #0480e5, #8a2bf9, #fc3033);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .hero-lede {
    margin: 0;
    font-size: clamp(15px, 2vw, 18px);
    color: #c7c2da;
    max-width: 560px;
    line-height: 1.6;
  }

  .glass {
    background: rgba(255, 255, 255, 0.045);
    border: 1px solid rgba(255, 255, 255, 0.09);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .login-card {
    box-sizing: border-box;
    width: min(420px, 100%);
    padding: 32px 28px;
    border-radius: 22px;
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }

  .login-card:hover {
    border-color: rgba(138, 43, 249, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 16px 48px -12px rgba(138, 43, 249, 0.2);
  }

  .google-signin {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    min-height: 44px;
  }

  .google-signin.connecting {
    pointer-events: none;
    opacity: 0.6;
  }

  .connecting-label {
    color: #c7c2da;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(138, 43, 249, 0.3);
    border-top-color: #8a2bf9;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .alert {
    margin-bottom: 16px;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    text-align: center;
  }

  .alert-warn {
    background: rgba(253, 169, 8, 0.12);
    border: 1px solid rgba(253, 169, 8, 0.4);
    color: #fda908;
  }

  .alert-error {
    background: rgba(252, 48, 51, 0.12);
    border: 1px solid rgba(252, 48, 51, 0.4);
    color: #fc3033;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 14px;
    width: 100%;
  }

  .feature-card {
    padding: 20px 16px;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: transform 0.35s cubic-bezier(0.16, 0.8, 0.3, 1), border-color 0.35s ease, box-shadow 0.35s ease;
  }

  .feature-card:hover {
    transform: translateY(-6px);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 18px 44px -14px rgba(0, 0, 0, 0.5);
  }

  .feature-icon-wrap {
    font-size: 28px;
    margin-bottom: 10px;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 20px -6px var(--accent, #8a2bf9);
  }

  .feature-title {
    margin: 0 0 6px 0;
    color: #f6f4fb;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 600;
  }

  .feature-desc {
    margin: 0;
    color: #8b84a6;
    font-size: 12.5px;
    line-height: 1.5;
  }

  .login-footer {
    margin-top: 8px;
    color: #8b84a6;
    font-size: 12px;
    text-align: center;
  }

  .login-footer a {
    color: #c7c2da;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .login-footer a:hover {
    color: #8a2bf9;
  }

  @media (max-width: 600px) {
    .login-root {
      padding-top: 70px;
    }

    .hero-title {
      font-size: 48px;
    }

    .features-grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .feature-card {
      padding: 14px 10px;
    }

    .feature-icon-wrap {
      width: 42px;
      height: 42px;
      font-size: 22px;
    }

    .feature-title {
      font-size: 13px;
    }

    .feature-desc {
      font-size: 11px;
    }

    .nav-link:first-child {
      display: none;
    }
  }
</style>
