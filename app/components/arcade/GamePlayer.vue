<script setup lang="ts">
import type { ArcadeGame } from '@/data/games'

const props = defineProps<{
  game: ArcadeGame
  defer?: boolean
  fullscreen?: boolean
}>()

const route = useRoute()
const iframeRef = ref<HTMLIFrameElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)

const aspect = computed(() => props.game.embed.aspectRatio || '16/9')
const minHeight = computed(() => props.game.embed.minHeight ?? 520)

// Mount iframe only when started (prevents autostart)
const started = ref(!props.defer)

function start() {
  started.value = true
}
function stop() {
  started.value = false
}

// Send message to the game iframe
function send(payload: any) {
  iframeRef.value?.contentWindow?.postMessage(payload, '*')
}

// Best-effort fullscreen (iOS Safari may ignore it)
function requestFullscreen() {
  const el = wrapRef.value
  if (!el) return
  const anyEl = el as any
  if (anyEl.requestFullscreen) anyEl.requestFullscreen()
  else if (anyEl.webkitRequestFullscreen) anyEl.webkitRequestFullscreen()
}

const emit = defineEmits<{
  (e: 'score', payload: { score: number; raw?: any }): void
}>()

function onMessage(e: MessageEvent) {
  // safer: accept only same-origin
  if (e.origin !== window.location.origin) return
  const data = e.data
  if (!data || typeof data !== 'object') return
  if ((data as any).type === 'SCORE' && typeof (data as any).score === 'number') {
    emit('score', { score: (data as any).score, raw: data })
  }
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))

const src = computed(() => {
  // default: autostart=0 to prevent instant start
  const autostart =
      route.query.autostart ? `autostart=${encodeURIComponent(String(route.query.autostart))}` : `autostart=0`
  const qs = [autostart].filter(Boolean).join('&')
  return qs
      ? `${props.game.sourceUrl}${props.game.sourceUrl.includes('?') ? '&' : '?'}${qs}`
      : props.game.sourceUrl
})

defineExpose({ start, stop, send, requestFullscreen })
</script>

<template>
  <div class="relative" :class="fullscreen ? 'h-full' : ''">
    <div
        ref="wrapRef"
        class="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl"
        :class="fullscreen ? 'h-full' : ''"
        :style="fullscreen ? { height: '100%', minHeight: '100%' } : { minHeight: minHeight + 'px' }"
    >
      <div class="relative w-full" :style="fullscreen ? { height: '100%' } : { aspectRatio: aspect }">
        <iframe
            v-if="started"
            ref="iframeRef"
            class="absolute inset-0 h-full w-full"
            :src="src"
            title="Game"
            allow="autoplay; fullscreen; gamepad"
            allowfullscreen
            loading="eager"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
        />
        <div v-else class="absolute inset-0 grid place-items-center text-sm opacity-70">
          Ready to play
        </div>
      </div>
    </div>
  </div>
</template>
