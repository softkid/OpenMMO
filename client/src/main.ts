import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { startVersionPolling } from './lib/network/versionCheck'

startVersionPolling()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
