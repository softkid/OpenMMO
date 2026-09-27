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
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    if (!clientId) {
      errorMessage = 'VITE_GOOGLE_CLIENT_ID is not configured'
      return
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

<div class="login-container">
  <header class="top-header">
    <div class="brand-logo">
      <span class="brand-tag">HAHAOGAMES</span>
      <span class="brand-divider">/</span>
      <span class="brand-sub">MMORPG</span>
    </div>
    <a
      class="github-link"
      href="https://github.com/softkid/OpenMMO"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub repository"
    >
      <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
      <span>GitHub Repo</span>
    </a>
  </header>

  <div class="login-wrapper">
    <div class="hero-branding">
      <div class="hero-badge">✨ HAHAOGAMES ORIGINAL PROJECT</div>
      <h1 class="main-title">HAHAO WORLD</h1>
      <p class="tagline">경계 없는 3D 웹 오픈월드 MMORPG – 새로운 모험의 시작</p>
    </div>

    <div class="login-panel">
      {#if kickedMessage}
        <div class="kicked-message">{kickedMessage}</div>
      {/if}

      {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
      {/if}

      <div class="google-signin" class:connecting={isConnecting}>
        <div bind:this={buttonContainer}></div>
        {#if isConnecting}
          <div class="connecting-label">서버에 접속하는 중입니다...</div>
        {/if}
      </div>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚔️</div>
        <h3 class="feature-title">실시간 WebGL 3D 오픈월드</h3>
        <p class="feature-desc">클라이언트 설치 없이 웹 브라우저로 즉시 입장하는 광활한 3D 대륙과 전투</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🤖</div>
        <h3 class="feature-title">AI 에이전트 자율 방치 시스템</h3>
        <p class="feature-desc">지능형 스마트 가디언 에이전트와 동행하며 탐험하는 자율 파밍 시스템</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🛡️</div>
        <h3 class="feature-title">노파괴 자원 인챈트 & 거래소</h3>
        <p class="feature-desc">장비 파괴 없는 스트레스 제로 보전 인챈트 및 유저 간 이코노미</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🏰</div>
        <h3 class="feature-title">실시간 레이드 & 커뮤니티</h3>
        <p class="feature-desc">세계관 속 보스 몬스터 소탕과 협동 파티 플레이 시스템</p>
      </div>
    </div>

    <AnnouncementsPanel />

    <footer class="login-footer">
      <p>© 2026 HAHAOGAMES. Core Engine Powered by <a href="https://github.com/softkid/OpenMMO" target="_blank" rel="noopener noreferrer">OpenMMO Architecture</a></p>
    </footer>
  </div>
</div>

<style>
  .login-container {
    position: fixed;
    inset: 0;
    box-sizing: border-box;
    width: 100%;
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    padding: 70px 20px 40px 20px;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 45%, #020617 100%);
    -webkit-overflow-scrolling: touch;
    font-family: 'Noto Sans KR', 'Outfit', -apple-system, sans-serif;
  }

  .top-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 10;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  .brand-tag {
    color: #fbbf24;
    font-family: 'Cinzel', serif;
    font-size: 16px;
    text-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
  }

  .brand-divider {
    color: #475569;
    font-size: 14px;
  }

  .brand-sub {
    color: #94a3b8;
    font-size: 13px;
    letter-spacing: 2px;
  }

  .github-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .github-link:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    border-color: #fbbf24;
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.2);
  }

  .login-wrapper {
    width: min(900px, 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    margin: auto 0;
  }

  .hero-branding {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.4);
    color: #c084fc;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    margin-bottom: 12px;
    text-shadow: 0 0 8px rgba(192, 132, 252, 0.4);
  }

  .main-title {
    margin: 0;
    font-family: 'Cinzel', 'Black Han Sans', serif;
    font-size: clamp(38px, 6vw, 64px);
    font-weight: 900;
    background: linear-gradient(135deg, #ffffff 20%, #fef08a 60%, #eab308 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 4px;
    filter: drop-shadow(0 4px 20px rgba(234, 179, 8, 0.3));
  }

  .tagline {
    margin: 8px 0 0 0;
    color: #94a3b8;
    font-size: clamp(14px, 2vw, 17px);
    font-weight: 400;
    letter-spacing: 1px;
  }

  .login-panel {
    box-sizing: border-box;
    width: min(440px, 100%);
    padding: 32px 28px;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .login-panel:hover {
    border-color: rgba(251, 191, 36, 0.5);
    transform: translateY(-2px);
  }

  .google-signin {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    min-height: 44px;
  }

  .google-signin.connecting {
    pointer-events: none;
    opacity: 0.6;
  }

  .connecting-label {
    color: #cbd5e1;
    font-size: 14px;
  }

  .kicked-message {
    margin-bottom: 20px;
    padding: 12px 14px;
    background: rgba(236, 201, 75, 0.15);
    border: 1px solid #ecc94b;
    border-radius: 8px;
    color: #ecc94b;
    font-size: 13px;
    text-align: center;
  }

  .error-message {
    margin-bottom: 16px;
    padding: 10px 14px;
    background: rgba(245, 101, 101, 0.2);
    border: 1px solid #fc8181;
    border-radius: 8px;
    color: #fc8181;
    font-size: 13px;
    text-align: center;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    width: 100%;
    margin-top: 8px;
  }

  .feature-card {
    padding: 16px 14px;
    background: rgba(30, 41, 59, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(168, 85, 247, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .feature-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .feature-title {
    margin: 0 0 6px 0;
    color: #f1f5f9;
    font-size: 14px;
    font-weight: 700;
  }

  .feature-desc {
    margin: 0;
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.5;
  }

  .login-footer {
    margin-top: 12px;
    color: #64748b;
    font-size: 12px;
    text-align: center;
  }

  .login-footer a {
    color: #94a3b8;
    text-decoration: underline;
  }

  .login-footer a:hover {
    color: #fbbf24;
  }

  @media (max-width: 600px) {
    .login-container {
      padding-top: 64px;
    }

    .main-title {
      font-size: 34px;
    }

    .features-grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .feature-card {
      padding: 12px 10px;
    }

    .feature-title {
      font-size: 13px;
    }

    .feature-desc {
      font-size: 11px;
    }
  }
</style>
